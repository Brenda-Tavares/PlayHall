'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { locale, languages, changeLocale, theme } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(l => l.code === locale) || languages[0];
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px', fontSize: '13px',
          background: isDark ? '#1e293b' : '#e2e8f0',
          color: isDark ? '#f1f5f9' : '#1e293b',
          border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}
      >
        <span style={{ fontWeight: '700', fontSize: '14px' }}>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <span style={{ opacity: 0.5, fontSize: '10px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '4px',
          minWidth: '180px', maxHeight: '300px', overflow: 'auto', zIndex: 200,
          background: isDark ? '#1e293b' : '#ffffff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { changeLocale(lang.code); setIsOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 14px',
                background: lang.code === locale ? '#6366f1' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: lang.code === locale ? '#ffffff' : (isDark ? '#f1f5f9' : '#1e293b'),
                fontSize: '13px'
              }}
            >
              <span style={{ fontWeight: '700', fontSize: '14px', width: '22px' }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}