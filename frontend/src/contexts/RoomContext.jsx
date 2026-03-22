'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [voiceUsers, setVoiceUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('chat:message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    newSocket.on('chat:typing', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.some(u => u.userId === userId) 
            ? prev 
            : [...prev, { userId, username }];
        }
        return prev.filter(u => u.userId !== userId);
      });
    });

    newSocket.on('room:player-joined', (player) => {
      setPlayers(prev => {
        if (prev.some(p => p.userId === player.userId)) return prev;
        return [...prev, player];
      });
    });

    newSocket.on('room:player-left', ({ userId, username, newHost }) => {
      setPlayers(prev => prev.filter(p => p.userId !== userId));
      if (newHost) {
        setPlayers(prev => prev.map(p => ({
          ...p,
          role: p.userId === newHost ? 'host' : p.role
        })));
      }
    });

    newSocket.on('voice:user-joined', ({ userId, username }) => {
      setVoiceUsers(prev => {
        if (prev.some(u => u.userId === userId)) return prev;
        return [...prev, { userId, username, isMuted: true }];
      });
    });

    newSocket.on('voice:user-left', ({ userId }) => {
      setVoiceUsers(prev => prev.filter(u => u.userId !== userId));
    });

    newSocket.on('voice:mute-changed', ({ userId, isMuted }) => {
      setVoiceUsers(prev => prev.map(u => 
        u.userId === userId ? { ...u, isMuted } : u
      ));
    });

    newSocket.on('game:started', ({ gameType, state }) => {
      setGameState({ type: gameType, ...state });
    });

    newSocket.on('game:update', ({ state }) => {
      setGameState(prev => ({ ...prev, ...state }));
    });

    newSocket.on('game:ended', ({ winner, scores }) => {
      setGameState(null);
    });

    newSocket.on('player:ready-changed', ({ userId, isReady }) => {
      setPlayers(prev => prev.map(p => 
        p.userId === userId ? { ...p, isReady } : p
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinRoom = useCallback(async (roomId, password = null) => {
    if (!socket) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to join room');
    }

    setCurrentRoom(data.room);
    setChatMessages(data.room.chatHistory || []);
    socket.emit('room:join', { roomId });
  }, [socket, token]);

  const leaveRoom = useCallback(async () => {
    if (!currentRoom || !socket) return;

    socket.emit('room:leave', { roomId: currentRoom.id });
    socket.emit('voice:leave', { roomId: currentRoom.id });

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${currentRoom.id}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    setCurrentRoom(null);
    setPlayers([]);
    setChatMessages([]);
    setVoiceUsers([]);
    setGameState(null);
  }, [currentRoom, socket, token]);

  const sendMessage = useCallback((message) => {
    if (!socket || !currentRoom) return;
    socket.emit('chat:message', { roomId: currentRoom.id, message });
  }, [socket, currentRoom]);

  const sendTyping = useCallback((isTyping) => {
    if (!socket || !currentRoom) return;
    socket.emit('chat:typing', { roomId: currentRoom.id, isTyping });
  }, [socket, currentRoom]);

  const joinVoice = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit('voice:join', { roomId: currentRoom.id });
    setIsMuted(true);
  }, [socket, currentRoom]);

  const leaveVoice = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit('voice:leave', { roomId: currentRoom.id });
    setIsMuted(true);
  }, [socket, currentRoom]);

  const toggleMute = useCallback(() => {
    if (!socket || !currentRoom) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    socket.emit('voice:toggle-mute', { roomId: currentRoom.id, isMuted: newMuted });
  }, [socket, currentRoom, isMuted]);

  const sendVoiceSignal = useCallback((targetSocketId, signal) => {
    if (!socket) return;
    socket.emit('voice:signal', { targetSocketId, signal });
  }, [socket]);

  const setReady = useCallback((isReady) => {
    if (!socket || !currentRoom) return;
    socket.emit('player:ready', { roomId: currentRoom.id, isReady });
  }, [socket, currentRoom]);

  const startGame = useCallback(async () => {
    if (!socket || !currentRoom) return;

    return new Promise((resolve, reject) => {
      socket.emit('game:start', { roomId: currentRoom.id }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, [socket, currentRoom]);

  const sendGameAction = useCallback((action, payload) => {
    if (!socket || !currentRoom) return;

    return new Promise((resolve, reject) => {
      socket.emit('game:action', { roomId: currentRoom.id, action, payload }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, [socket, currentRoom]);

  const value = {
    socket,
    currentRoom,
    players,
    chatMessages,
    voiceUsers,
    isMuted,
    gameState,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    joinVoice,
    leaveVoice,
    toggleMute,
    sendVoiceSignal,
    setReady,
    startGame,
    sendGameAction
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
