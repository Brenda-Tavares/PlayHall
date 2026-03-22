import express from 'express';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      isGuest: false
    })
    .select('username avatar status lastSeen')
    .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/friends', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username avatar status lastSeen');

    res.json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

router.post('/friends/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.isGuest) {
      return res.status(400).json({ error: 'Cannot add guest users as friends' });
    }

    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    if (targetUser.friendRequests.some(r => r.from.toString() === req.user._id.toString())) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    targetUser.friendRequests.push({ from: req.user._id });
    await targetUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

router.post('/friends/accept/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestIndex = req.user.friendRequests.findIndex(
      r => r._id.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    const request = req.user.friendRequests[requestIndex];
    const fromUser = await User.findById(request.from);

    if (!fromUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user.friends.push(fromUser._id);
    fromUser.friends.push(req.user._id);

    req.user.friendRequests.splice(requestIndex, 1);

    await req.user.save();
    await fromUser.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

router.delete('/friends/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    req.user.friends = req.user.friends.filter(id => id.toString() !== userId);
    await req.user.save();

    const otherUser = await User.findById(userId);
    if (otherUser) {
      otherUser.friends = otherUser.friends.filter(id => id.toString() !== req.user._id.toString());
      await otherUser.save();
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const { username, avatar, settings } = req.body;

    if (username && username !== req.user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      req.user.username = username;
    }

    if (avatar !== undefined) {
      req.user.avatar = avatar;
    }

    if (settings) {
      req.user.settings = { ...req.user.settings, ...settings };
    }

    await req.user.save();
    res.json({ user: req.user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/:userId', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username avatar stats achievements status');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
