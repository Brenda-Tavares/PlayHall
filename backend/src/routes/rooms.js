import express from 'express';
import bcrypt from 'bcryptjs';
import Room from '../models/Room.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { generateRoomCode, validateUsername } from '../utils/helpers.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { region, game, country, page = 1, limit = 20 } = req.query;

    const query = { isPublic: true };

    if (region) {
      query.region = region;
    }

    if (game) {
      query.gameType = game;
    }

    if (country) {
      query.country = country;
    }

    query['currentGame.state'] = { $in: ['waiting', 'finished'] };

    const rooms = await Room.find(query)
      .populate('host', 'username avatar')
      .select('-chatHistory -passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, password, region, gameType, maxPlayers, voiceEnabled, settings } = req.body;

    const roomName = name?.trim() || `Room-${generateRoomCode()}`;
    
    if (roomName.length > 50) {
      return res.status(400).json({ error: 'Room name too long' });
    }

    const validGameTypes = [
      'pictionary', 'charadas', 'quebra-cabeca',
      'ludo', 'damas', 'xadrez', 'batalha-naval', 'jogo-da-velha', 'conecta-4', 'reversi',
      'cartas-falantes', 'story-cards', 'uno', 'memory',
      'stop', 'trivia', 'caca-palavras', 'jogo-do-milhao', 'among-us'
    ];

    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid game type' });
    }

    const room = new Room({
      name: roomName,
      hasPassword: !!password,
      passwordHash: password ? await bcrypt.hash(password, 10) : null,
      region: region || 'international',
      gameType,
      host: req.user._id,
      players: [{
        user: req.user._id,
        role: 'host',
        isReady: true
      }],
      maxPlayers: Math.min(Math.max(maxPlayers || 8, 2), 20),
      voiceEnabled: voiceEnabled !== false,
      settings: {
        allowSpectators: settings?.allowSpectators || false,
        autoStart: settings?.autoStart || false,
        turnTimeLimit: settings?.turnTimeLimit || 60
      }
    });

    req.user.currentRoom = room._id;
    await req.user.save();

    await room.save();

    res.status(201).json({
      room: room.toPublicJSON(),
      joinToken: password ? null : room._id.toString()
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('host', 'username avatar')
      .populate('players.user', 'username avatar status');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isPlayer = room.players.some(
      p => p.user?._id.toString() === req.user._id.toString()
    );

    const publicRoom = room.toPublicJSON();
    
    if (!isPlayer) {
      delete publicRoom.chatHistory;
    }

    res.json({ 
      room: publicRoom,
      isPlayer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

router.post('/:roomId/join', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.hasPlayer(req.user._id)) {
      return res.status(400).json({ error: 'Already in room' });
    }

    if (room.isFull()) {
      return res.status(400).json({ error: 'Room is full' });
    }

    if (room.hasPassword) {
      if (!password) {
        return res.status(403).json({ error: 'Password required', requiresPassword: true });
      }
      const isMatch = await bcrypt.compare(password, room.passwordHash);
      if (!isMatch) {
        return res.status(403).json({ error: 'Invalid password' });
      }
    }

    room.players.push({
      user: req.user._id,
      role: 'player',
      isReady: false
    });

    req.user.currentRoom = room._id;
    await req.user.save();
    await room.save();

    res.json({ room: room.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

router.post('/:roomId/leave', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const playerIndex = room.players.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (playerIndex === -1) {
      return res.status(400).json({ error: 'Not in room' });
    }

    if (room.players[playerIndex].role === 'host') {
      if (room.players.length > 1) {
        const newHost = room.players.find(
          (p, i) => i !== playerIndex && p.user.toString() !== req.user._id.toString()
        );
        if (newHost) {
          newHost.role = 'host';
        }
      } else {
        await Room.findByIdAndDelete(room._id);
        req.user.currentRoom = null;
        await req.user.save();
        return res.json({ message: 'Room deleted (you were the only player)' });
      }
    }

    room.players.splice(playerIndex, 1);
    
    req.user.currentRoom = null;
    await req.user.save();
    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

router.patch('/:roomId', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isHost = room.players.some(
      p => p.user.toString() === req.user._id.toString() && p.role === 'host'
    );

    if (!isHost) {
      return res.status(403).json({ error: 'Only host can modify room' });
    }

    const { name, password, settings } = req.body;

    if (name) room.name = name.trim();
    if (typeof password === 'string') {
      room.hasPassword = password.length > 0;
      room.passwordHash = room.hasPassword ? await bcrypt.hash(password, 10) : null;
    }
    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }

    await room.save();
    res.json({ room: room.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});

router.delete('/:roomId', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isHost = room.players.some(
      p => p.user.toString() === req.user._id.toString() && p.role === 'host'
    );

    if (!isHost) {
      return res.status(403).json({ error: 'Only host can delete room' });
    }

    for (const player of room.players) {
      await User.findByIdAndUpdate(player.user, { currentRoom: null });
    }

    await Room.findByIdAndDelete(room._id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;
