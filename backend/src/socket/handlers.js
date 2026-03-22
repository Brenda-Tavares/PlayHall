import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import { logger } from '../utils/logger.js';
import { sanitizeMessage } from '../utils/helpers.js';
import * as gameHandlers from './gameHandlers.js';

const connectedUsers = new Map();
const userRooms = new Map();

export const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.userId);
        if (user) {
          socket.user = user;
        }
      }
      
      socket.guestId = socket.handshake.auth.guestId || `guest-${Date.now()}`;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString() || socket.guestId;
    connectedUsers.set(userId, socket.id);
    
    logger.info(`User connected: ${userId}`);

    if (socket.user) {
      socket.user.status = 'online';
      socket.user.save();
    }

    socket.on('room:join', async (data) => {
      try {
        const { roomId } = data;
        const room = await Room.findById(roomId);

        if (!room) {
          socket.emit('room:error', { error: 'Room not found' });
          return;
        }

        const player = room.players.find(
          p => p.user?.toString() === socket.user?._id?.toString()
        );

        if (!player && !socket.user) {
          socket.emit('room:error', { error: 'Authentication required' });
          return;
        }

        if (room.isFull() && !room.hasPlayer(socket.user?._id)) {
          socket.emit('room:error', { error: 'Room is full' });
          return;
        }

        socket.join(`room:${roomId}`);
        
        const playerData = {
          userId: socket.user?._id,
          username: socket.user?.username || `Guest-${socket.guestId}`,
          avatar: socket.user?.avatar,
          socketId: socket.id
        };

        socket.to(`room:${roomId}`).emit('room:player-joined', playerData);

        socket.emit('room:joined', {
          room: room.toPublicJSON(),
          players: room.players.map(p => ({
            userId: p.user,
            username: p.user === room.host ? 'Host' : 'Player',
            isReady: p.isReady,
            role: p.role
          }))
        });

        const currentRoomUsers = userRooms.get(roomId) || new Set();
        currentRoomUsers.add(socket.user?._id?.toString() || socket.guestId);
        userRooms.set(roomId, currentRoomUsers);

      } catch (error) {
        logger.error('Room join error:', error);
        socket.emit('room:error', { error: 'Failed to join room' });
      }
    });

    socket.on('room:leave', async (data) => {
      try {
        const { roomId } = data;
        await handleRoomLeave(socket, roomId, io);
      } catch (error) {
        logger.error('Room leave error:', error);
      }
    });

    socket.on('chat:message', async (data) => {
      try {
        const { roomId, message } = data;
        const room = await Room.findById(roomId);

        if (!room) return;

        const cleanMessage = sanitizeMessage(message);
        if (!cleanMessage) return;

        const chatMessage = {
          user: socket.user?._id,
          username: socket.user?.username || `Guest-${socket.guestId}`,
          message: cleanMessage,
          timestamp: new Date()
        };

        if (room.chatHistory.length > 100) {
          room.chatHistory.shift();
        }
        room.chatHistory.push(chatMessage);
        await room.save();

        io.to(`room:${roomId}`).emit('chat:message', chatMessage);
      } catch (error) {
        logger.error('Chat message error:', error);
      }
    });

    socket.on('chat:typing', (data) => {
      const { roomId, isTyping } = data;
      socket.to(`room:${roomId}`).emit('chat:typing', {
        userId: socket.user?._id || socket.guestId,
        username: socket.user?.username || `Guest-${socket.guestId}`,
        isTyping
      });
    });

    socket.on('voice:join', async (data) => {
      const { roomId } = data;
      socket.join(`voice:${roomId}`);
      
      socket.to(`room:${roomId}`).emit('voice:user-joined', {
        userId: socket.user?._id || socket.guestId,
        username: socket.user?.username || `Guest-${socket.guestId}`
      });
    });

    socket.on('voice:leave', (data) => {
      const { roomId } = data;
      socket.leave(`voice:${roomId}`);
      
      socket.to(`room:${roomId}`).emit('voice:user-left', {
        userId: socket.user?._id || socket.guestId
      });
    });

    socket.on('voice:toggle-mute', (data) => {
      const { roomId, isMuted } = data;
      socket.to(`room:${roomId}`).emit('voice:mute-changed', {
        userId: socket.user?._id || socket.guestId,
        isMuted
      });
    });

    socket.on('voice:signal', (data) => {
      const { targetSocketId, signal, from } = data;
      io.to(targetSocketId).emit('voice:signal', {
        signal,
        from: socket.user?._id || socket.guestId
      });
    });

    socket.on('player:ready', async (data) => {
      try {
        const { roomId, isReady } = data;
        const room = await Room.findById(roomId);

        if (!room) return;

        const player = room.players.find(
          p => p.user?.toString() === socket.user?._id?.toString()
        );

        if (player) {
          player.isReady = isReady;
          await room.save();
        }

        io.to(`room:${roomId}`).emit('player:ready-changed', {
          userId: socket.user?._id,
          isReady
        });
      } catch (error) {
        logger.error('Player ready error:', error);
      }
    });

    Object.entries(gameHandlers).forEach(([name, handler]) => {
      socket.on(`game:${name}`, async (data, callback) => {
        try {
          await handler(socket, data, io, callback);
        } catch (error) {
          logger.error(`Game handler error (${name}):`, error);
          socket.emit('game:error', { error: 'Game action failed' });
        }
      });
    });

    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${userId}`);
      
      for (const [roomId] of userRooms) {
        await handleRoomLeave(socket, roomId, io);
      }

      connectedUsers.delete(userId);
      
      if (socket.user) {
        socket.user.status = 'offline';
        socket.user.lastSeen = new Date();
        await socket.user.save();
      }
    });
  });
};

async function handleRoomLeave(socket, roomId, io) {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(
      p => p.user?.toString() === socket.user?._id?.toString()
    );

    if (playerIndex === -1) {
      socket.leave(`room:${roomId}`);
      socket.leave(`voice:${roomId}`);
      return;
    }

    const player = room.players[playerIndex];
    const wasHost = player.role === 'host';

    room.players.splice(playerIndex, 1);

    if (wasHost && room.players.length > 0) {
      room.players[0].role = 'host';
    }

    if (room.players.length === 0) {
      await Room.findByIdAndDelete(roomId);
      logger.info(`Room ${roomId} deleted (empty)`);
    } else {
      await room.save();
    }

    socket.leave(`room:${roomId}`);
    socket.leave(`voice:${roomId}`);

    io.to(`room:${roomId}`).emit('room:player-left', {
      userId: socket.user?._id,
      username: socket.user?.username || `Guest-${socket.guestId}`,
      newHost: wasHost && room.players.length > 0 ? room.players[0].user : null
    });

    const currentRoomUsers = userRooms.get(roomId);
    if (currentRoomUsers) {
      currentRoomUsers.delete(socket.user?._id?.toString() || socket.guestId);
      if (currentRoomUsers.size === 0) {
        userRooms.delete(roomId);
      }
    }

  } catch (error) {
    logger.error('Room leave handler error:', error);
  }
}
