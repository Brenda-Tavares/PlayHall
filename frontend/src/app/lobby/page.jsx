'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

const COUNTRIES = [
  { code: 'BR', name: 'Brasil', code2: 'BR' },
  { code: 'US', name: 'United States', code2: 'US' },
  { code: 'GB', name: 'United Kingdom', code2: 'GB' },
  { code: 'ES', name: 'Espanha', code2: 'ES' },
  { code: 'PT', name: 'Portugal', code2: 'PT' },
  { code: 'FR', name: 'Franca', code2: 'FR' },
  { code: 'DE', name: 'Alemanha', code2: 'DE' },
  { code: 'IT', name: 'Italia', code2: 'IT' },
  { code: 'CN', name: 'China', code2: 'CN' },
  { code: 'JP', name: 'Japao', code2: 'JP' },
  { code: 'KR', name: 'Coreia do Sul', code2: 'KR' },
  { code: 'AR', name: 'Argentina', code2: 'AR' },
  { code: 'MX', name: 'Mexico', code2: 'MX' },
  { code: 'CA', name: 'Canada', code2: 'CA' },
  { code: 'AU', name: 'Australia', code2: 'AU' },
  { code: 'ZZ', name: 'International', code2: 'INT' }
];

const GAMES = [
  { id: 'pictionary', name: 'Pictionary' },
  { id: 'charadas', name: 'Charades' },
  { id: 'trivia', name: 'Trivia' },
  { id: 'uno', name: 'Uno' },
  { id: 'jogo-da-velha', name: 'Tic-Tac-Toe' },
  { id: 'conecta-4', name: 'Connect 4' },
  { id: 'memory', name: 'Memory' },
  { id: 'cartas-falantes', name: 'Talking Cards' },
  { id: 'stop', name: 'Stop!' },
  { id: 'caca-palavras', name: 'Word Search' },
  { id: 'ludo', name: 'Ludo' },
  { id: 'xadrez', name: 'Chess' },
  { id: 'damas', name: 'Checkers' },
  { id: 'batalha-naval', name: 'Battleship' },
  { id: 'jogo-do-milhao', name: 'Millionaire' },
  { id: 'among-us', name: 'Among Us' }
];

export default function Lobby() {
  const { user, logout, token, isAuthenticated, loading } = useAuth();
  const { t, theme, changeTheme } = useLanguage();
  const router = useRouter();
  
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ region: 'all', game: 'all', country: 'all' });

  const [newRoom, setNewRoom] = useState({
    name: '',
    gameType: 'pictionary',
    region: 'international',
    country: 'ZZ',
    maxPlayers: 8,
    password: '',
    isPublic: true
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (token) fetchRooms();
  }, [token, filter]);

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.region !== 'all') params.set('region', filter.region);
      if (filter.game !== 'all') params.set('game', filter.game);
      if (filter.country !== 'all') params.set('country', filter.country);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) { console.error('Failed to fetch rooms:', err); }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newRoom.name || undefined,
          password: newRoom.password || undefined,
          gameType: newRoom.gameType,
          region: newRoom.region,
          country: newRoom.country,
          maxPlayers: newRoom.maxPlayers,
          isPublic: newRoom.isPublic
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');
      router.push(`/room/${data.room.id}`);
    } catch (err) { setError(err.message); } 
    finally { setCreating(false); }
  };

  const handleJoinRoom = async (room, password = '') => {
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: password || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresPassword) { setSelectedRoom(room); setShowJoinModal(true); return; }
        throw new Error(data.error || 'Failed to join room');
      }
      router.push(`/room/${room.id}`);
    } catch (err) { setError(err.message); } 
    finally { setJoining(false); }
  };

  if (loading || !isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: theme === 'dark' ? '#0f172a' : '#f8fafc'
      }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
      color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        background: theme === 'dark' ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>
          PlayHall
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageSelector />
          <button onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')} style={{ 
            width: '36px', height: '36px', borderRadius: '50%', border: 'none', 
            background: theme === 'dark' ? '#1e293b' : '#e2e8f0',
            color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px'
          }}>
            {theme === 'dark' ? 'L' : 'D'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '600', opacity: 0.8 }}>{user?.username}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '14px' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, borderRadius: '8px', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700' }}>{t('lobby.title','Game Lobby')}</h2>
          <button onClick={() => setShowCreateModal(true)} style={{ 
            padding: '14px 28px', background: '#6366f1', color: 'white', border: 'none', 
            borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' 
          }}>
            + Criar Sala
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select value={filter.country} onChange={(e) => setFilter({ ...filter, country: e.target.value })} style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', minWidth: '160px' }}>
            <option value="all">Todos os Paises</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code2} - {c.name}</option>)}
          </select>
          <select value={filter.region} onChange={(e) => setFilter({ ...filter, region: e.target.value })} style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
            <option value="all">Todas as Regioes</option>
            <option value="international">Internacional</option>
            <option value="national">Nacional</option>
          </select>
          <select value={filter.game} onChange={(e) => setFilter({ ...filter, game: e.target.value })} style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', minWidth: '180px' }}>
            <option value="all">Todos os Jogos</option>
            {GAMES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button onClick={fetchRooms} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: theme === 'dark' ? '#334155' : '#cbd5e1', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', cursor: 'pointer', fontSize: '16px' }}>
            Atualizar
          </button>
        </div>

        {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' }}>{error}</div>}

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: theme === 'dark' ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.5)', borderRadius: '16px', border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` }}>
            <p style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>[  ]</p>
            <p style={{ opacity: 0.7, fontSize: '18px' }}>Nenhuma sala disponivel</p>
            <p style={{ opacity: 0.5, fontSize: '14px', marginTop: '8px' }}>Seja o primeiro a criar uma sala!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {rooms.map(room => {
              const country = COUNTRIES.find(c => c.code === room.country);
              return (
                <div key={room.id} onClick={() => handleJoinRoom(room)} style={{
                  background: theme === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                  borderRadius: '12px', padding: '20px', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '18px' }}>{room.name}</h3>
                    {room.hasPassword && <span style={{ fontSize: '14px', opacity: 0.5 }}>[Priv]</span>}
                  </div>
                  <p style={{ opacity: 0.7, marginBottom: '16px', fontSize: '14px' }}>{GAMES.find(g => g.id === room.gameType)?.name || room.gameType}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', opacity: 0.6 }}>{room.playerCount}/{room.maxPlayers} jogadores</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1' }}>{country?.code2 || 'INT'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Criar Nova Sala</h3>
            </div>
            <form onSubmit={handleCreateRoom} style={{ padding: '20px' }}>
              {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' }}>{error}</div>}
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>Nome da Sala</label>
                <input type="text" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} placeholder="Opcional - sera gerado automaticamente" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>Jogo</label>
                <select value={newRoom.gameType} onChange={(e) => setNewRoom({ ...newRoom, gameType: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                  {GAMES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>Regiao</label>
                  <select value={newRoom.region} onChange={(e) => setNewRoom({ ...newRoom, region: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    <option value="international">Internacional</option>
                    <option value="national">Nacional</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>Pais</label>
                  <select value={newRoom.country} onChange={(e) => setNewRoom({ ...newRoom, country: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code2} - {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>Maximo de Jogadores</label>
                <input type="number" value={newRoom.maxPlayers} onChange={(e) => setNewRoom({ ...newRoom, maxPlayers: parseInt(e.target.value) })} min={2} max={20} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>Senha (Opcional)</label>
                <input type="password" value={newRoom.password} onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value, isPublic: !e.target.value })} placeholder="Para sala privada" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', background: theme === 'dark' ? '#334155' : '#e2e8f0', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={creating} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
                  {creating ? 'Criando...' : 'Criar Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Password Modal */}
      {showJoinModal && selectedRoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowJoinModal(false)}>
          <div style={{ background: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '350px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>Sala Privada - Digite a Senha</h3>
            <input type="password" value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} placeholder="Senha da sala" autoFocus style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowJoinModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: theme === 'dark' ? '#334155' : '#e2e8f0', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleJoinRoom(selectedRoom, roomPassword)} disabled={joining} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: joining ? 'not-allowed' : 'pointer' }}>
                {joining ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}