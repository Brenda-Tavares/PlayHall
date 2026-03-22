'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('playhall_token');
    const savedUser = localStorage.getItem('playhall_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    localStorage.setItem('playhall_token', data.token);
    localStorage.setItem('playhall_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    
    return data.user;
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    localStorage.setItem('playhall_token', data.token);
    localStorage.setItem('playhall_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    
    return data.user;
  };

  const guestLogin = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/guest`, {
      method: 'POST'
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Guest login failed');
    }
    
    localStorage.setItem('playhall_token', data.token);
    localStorage.setItem('playhall_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    
    return data.user;
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.log('Logout error:', e);
    }
    
    localStorage.removeItem('playhall_token');
    localStorage.removeItem('playhall_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('playhall_user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    guestLogin,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
