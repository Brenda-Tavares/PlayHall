'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RoomPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const { t, theme, changeTheme } = useLanguage();
  const {
    currentRoom, players, chatMessages, voiceUsers, isMuted, gameState,
    joinRoom, leaveRoom, sendMessage, sendTyping, joinVoice, leaveVoice, toggleMute, setReady, startGame
  } = useRoom();
  
  const router = useRouter();
  const params = useParams();
  const chatEndRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (params.id && token && !currentRoom) {
      joinRoom(params.id).catch(err => {
        setError(err.message);
        router.push('/lobby');
      });
    }
  }, [params.id, token, currentRoom, joinRoom, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
    sendTyping(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    sendTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => sendTyping(false), 2000));
  };

  const handleLeave = async () => {
    await leaveRoom();
    router.push('/lobby');
  };

  const handleToggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    setReady(newReady);
  };

  const handleStartGame = async () => {
    setStarting(true);
    setError('');
    try {
      await startGame();
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  const isHost = players.some(p => p.role === 'host' && p.userId === user?._id);
  const allReady = players.length >= 2 && players.every(p => p.isReady || p.role === 'host');
  const inVoice = voiceUsers.some(v => v.userId === user?._id);

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
      color: isDark ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header */}
      <header style={{
        padding: '14px 24px',
        background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottom: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
            {currentRoom?.name || 'Sala'}
          </h1>
          <span style={{ 
            padding: '4px 10px', background: '#6366f1', color: 'white', 
            borderRadius: '12px', fontSize: '11px', fontWeight: '600'
          }}>
            {currentRoom?.gameType || 'Jogo'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => changeTheme(isDark ? 'light' : 'dark')} style={{
            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
            background: isDark ? '#1e293b' : '#e2e8f0', color: isDark ? '#f1f5f9' : '#1e293b',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700'
          }}>
            {isDark ? 'L' : 'D'}
          </button>
          <button onClick={handleLeave} style={{
            padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none',
            borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
          }}>
            Sair
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px', background: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)',
          borderRight: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#cbd5e1'}` }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: isDark ? '#94a3b8' : '#64748b' }}>JOGADORES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {players.map((player, i) => (
                <div key={player.userId || i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                  background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: '8px'
                }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white' }}>
                    {player.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500', flex: 1 }}>{player.username || 'Desconhecido'}</span>
                  {player.role === 'host' && <span style={{ fontSize: '9px', background: '#6366f1', color: 'white', padding: '2px 5px', borderRadius: '4px' }}>HOST</span>}
                  {voiceUsers.some(v => v.userId === player.userId) && <span style={{ fontSize: '9px', background: '#10b981', color: 'white', padding: '2px 5px', borderRadius: '4px' }}>VOZ</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Voice */}
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: isDark ? '#94a3b8' : '#64748b' }}>VOZ</h3>
            {inVoice ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={toggleMute} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: isMuted ? '#ef4444' : '#10b981', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                  {isMuted ? 'Mudo' : 'Ativo'}
                </button>
                <button onClick={leaveVoice} style={{ padding: '10px 12px', borderRadius: '6px', border: 'none', background: isDark ? '#475569' : '#94a3b8', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                  X
                </button>
              </div>
            ) : (
              <button onClick={joinVoice} style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Entrar na Voz
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gameState ? (
              <GameBoard gameState={gameState} userId={user?._id} theme={theme} />
            ) : (
              <div style={{
                background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
                padding: '40px', borderRadius: '16px', maxWidth: '450px', width: '100%',
                textAlign: 'center', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
              }}>
                <h2 style={{ marginBottom: '12px', fontSize: '22px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {isDark ? '#f1f5f9' : '#1e293b'}
                </h2>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '20px' }}>
                  {players.length < 2 ? `Aguardando jogadores... (${players.length}/2)` : 'Pronto para comecar!'}
                </p>
                {error && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
                {!isHost && players.length >= 2 && (
                  <button onClick={handleToggleReady} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: isReady ? '#10b981' : (isDark ? '#475569' : '#cbd5e1'), color: isReady ? 'white' : (isDark ? '#f1f5f9' : '#1e293b'), fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                    {isReady ? 'Pronto!' : 'Marcar Pronto'}
                  </button>
                )}
                {isHost && (
                  <button onClick={handleStartGame} disabled={starting || players.length < 2} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: players.length < 2 ? '#6366f180' : '#6366f1', color: 'white', fontWeight: '700', fontSize: '14px', cursor: players.length < 2 ? 'not-allowed' : 'pointer' }}>
                    {starting ? 'Iniciando...' : 'Iniciar Jogo'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Chat */}
          <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', height: '250px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? '#334155' : '#cbd5e1'}` }}>
              <button onClick={() => setActiveTab('chat')} style={{ padding: '10px 20px', border: 'none', background: 'transparent', color: activeTab === 'chat' ? '#6366f1' : (isDark ? '#94a3b8' : '#64748b'), fontWeight: '600', fontSize: '13px', borderBottom: activeTab === 'chat' ? '2px solid #6366f1' : 'none' }}>
                Chat
              </button>
              <button onClick={() => setActiveTab('players')} style={{ padding: '10px 20px', border: 'none', background: 'transparent', color: activeTab === 'players' ? '#6366f1' : (isDark ? '#94a3b8' : '#64748b'), fontWeight: '600', fontSize: '13px', borderBottom: activeTab === 'players' ? '2px solid #6366f1' : 'none' }}>
                Jogadores ({players.length})
              </button>
            </div>
            {activeTab === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.user === user?._id ? 'flex-end' : 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', opacity: 0.6, marginBottom: '1px' }}>{msg.username}</span>
                      <div style={{ padding: '8px 12px', borderRadius: '12px', maxWidth: '70%', background: msg.user === user?._id ? '#6366f1' : (isDark ? '#334155' : '#e2e8f0'), color: msg.user === user?._id ? 'white' : (isDark ? '#f1f5f9' : '#1e293b'), fontSize: '13px' }}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '10px', borderTop: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, display: 'flex', gap: '8px' }}>
                  <input type="text" value={message} onChange={handleTyping} placeholder="Digite uma mensagem..." style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '13px', outline: 'none' }} />
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '20px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    Enviar
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'players' && (
              <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                {players.map((player, i) => (
                  <div key={player.userId || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: isDark ? '#1e293b' : '#f1f5f9', borderRadius: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '13px' }}>
                      {player.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{player.username || 'Desconhecido'}{player.userId === user?._id && <span style={{ opacity: 0.6, fontSize: '12px' }}> (voce)</span>}</div>
                      <div style={{ fontSize: '11px', opacity: 0.6 }}>{player.role === 'host' ? 'Anfitriao' : 'Jogador'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function GameBoard({ gameState, userId, theme }) {
  const { sendGameAction } = useRoom();
  const [input, setInput] = useState('');

  const handleGuess = async () => {
    if (!input.trim()) return;
    try {
      await sendGameAction('guess', { guess: input });
      setInput('');
    } catch (err) { console.error(err); }
  };

  switch (gameState.type) {
    case 'jogo-da-velha':
      return (
        <div style={{ background: theme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', padding: '24px', borderRadius: '16px', border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>Jogo da Velha</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxWidth: '250px', margin: '0 auto' }}>
            {(gameState.board || Array(9).fill(null)).map((cell, i) => (
              <button key={i} onClick={() => !cell && sendGameAction('move', { row: Math.floor(i / 3), col: i % 3 })} style={{
                aspectRatio: '1', fontSize: '36px', fontWeight: '700',
                background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                borderRadius: '8px', cursor: cell ? 'default' : 'pointer',
                color: cell === 'X' ? '#6366f1' : cell === 'O' ? '#8b5cf6' : 'inherit'
              }}>
                {cell || ''}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div style={{ background: theme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '16px', border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
          <h2 style={{ marginBottom: '12px' }}>{gameState.type}</h2>
          <p style={{ opacity: 0.6 }}>Jogo em desenvolvimento...</p>
        </div>
      );
  }
}