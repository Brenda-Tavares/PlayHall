'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, guestLogin, isAuthenticated } = useAuth();
  const { t, theme, changeTheme } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/lobby');
  }, [isAuthenticated, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/lobby');
    } catch (err) { setError(t('auth.loginError','Login failed')); } 
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      router.push('/lobby');
    } catch (err) { setError(t('auth.registerError','Registration failed')); } 
    finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      await guestLogin();
      router.push('/lobby');
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative'
    }}>
      {/* Header */}
      <header style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 10 }}>
        <LanguageSelector />
        <button onClick={() => changeTheme(isDark ? 'light' : 'dark')} style={{ 
          width: '36px', height: '36px', borderRadius: '50%', border: 'none', 
          background: isDark ? '#1e293b' : '#e2e8f0',
          color: isDark ? '#f1f5f9' : '#1e293b',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700'
        }}>
          {isDark ? 'L' : 'D'}
        </button>
      </header>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '72px', fontWeight: '900',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          PlayHall
        </h1>
        <p style={{
          fontSize: '18px', color: isDark ? '#94a3b8' : '#475569',
          maxWidth: '480px'
        }}>
          Jogando com amigos de todo o mundo. Chat, voz e muitos jogos em um so lugar.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: '20px', padding: '36px', maxWidth: '400px', width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {!showLogin && !showRegister ? (
          <>
            <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '22px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
              Bem-vindo
            </h2>
            
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', color: '#ef4444', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button onClick={handleGuest} disabled={loading} style={{
              width: '100%', padding: '15px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: '700', fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>
              {loading ? 'Aguarde...' : 'Jogar como Visitante'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: isDark ? '#334155' : '#e2e8f0' }} />
              <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '13px' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: isDark ? '#334155' : '#e2e8f0' }} />
            </div>

            <button onClick={() => setShowLogin(true)} style={{
              width: '100%', padding: '14px', marginBottom: '10px',
              background: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#f1f5f9' : '#1e293b',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
            }}>
              Entrar
            </button>
            
            <button onClick={() => setShowRegister(true)} style={{
              width: '100%', padding: '14px',
              background: 'transparent',
              color: isDark ? '#94a3b8' : '#64748b',
              border: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '14px'
            }}>
              Criar Conta
            </button>
          </>
        ) : showLogin ? (
          <>
            <h2 style={{ marginBottom: '24px', textAlign: 'center', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>Entrar</h2>
            {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }}>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? 'Aguarde...' : 'Entrar'}
              </button>
            </form>
            <button onClick={() => { setShowLogin(false); setError(''); }} style={{ width: '100%', padding: '12px', marginTop: '12px', background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: '14px' }}>
              Voltar
            </button>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '24px', textAlign: 'center', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>Criar Conta</h2>
            {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }}>Nome</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }}>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? 'Aguarde...' : 'Criar Conta'}
              </button>
            </form>
            <button onClick={() => { setShowRegister(false); setError(''); }} style={{ width: '100%', padding: '12px', marginTop: '12px', background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: '14px' }}>
              Voltar
            </button>
          </>
        )}
      </div>

      {/* Features */}
      <div style={{ marginTop: '40px', display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ title: 'Salas', desc: 'Publicas e Privadas' }, { title: 'Voz', desc: 'Communicacao em tempo real' }, { title: 'Jogos', desc: 'Mais de 15 jogos' }].map((f, i) => (
          <div key={i} style={{ textAlign: 'center', maxWidth: '160px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.7 }}>{['[ ]', '[ ]', '[ ]'][i]}</div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: isDark ? '#f1f5f9' : '#1e293b' }}>{f.title}</h3>
            <p style={{ fontSize: '13px', opacity: isDark ? 0.6 : 0.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}