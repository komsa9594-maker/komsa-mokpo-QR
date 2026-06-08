'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', label: '中文(简体)', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' }
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ko');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 설정된 언어 쿠키 확인
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = decodeURIComponent(match[1]).split('/');
      if (parts.length > 2 && parts[2]) {
        setCurrentLang(parts[2]);
      }
    }
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const setLanguage = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    // 구글 번역 쿠키 설정 (한국어에서 타겟 언어로)
    const domain = window.location.hostname;
    
    // 이전 쿠키 삭제 (구글 번역기 충돌 방지)
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;

    if (langCode !== 'ko') {
      const cookieValue = `/ko/${langCode}`;
      // 서브도메인 간 공유를 위해 도메인 설정 가능하면 설정
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;
    }

    setCurrentLang(langCode);
    setIsOpen(false);
    
    // 새로고침하여 번역 적용
    window.location.reload();
  };

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #e2e8f0',
          padding: '6px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          color: '#334155',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          outline: 'none',
        }}
      >
        <Globe size={16} color="#0284c7" />
        <span style={{ marginRight: '2px' }}>{activeLang.flag} {activeLang.label}</span>
        <ChevronDown size={14} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '115%',
          right: 0,
          width: '160px',
          maxHeight: '300px',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 10000,
          padding: '8px 0',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ padding: '0 14px 6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Language / 언어 선택
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: currentLang === lang.code ? '#f0f9ff' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                color: currentLang === lang.code ? '#0284c7' : '#334155',
                fontWeight: currentLang === lang.code ? 800 : 500,
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => {
                if (currentLang !== lang.code) e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (currentLang !== lang.code) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>{lang.flag} {lang.label}</span>
              {currentLang === lang.code && <Check size={16} strokeWidth={3} />}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '8px', paddingLeft: '14px', paddingRight: '14px', fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.3 }}>
            * Powered by Google Translate
          </div>
        </div>
      )}
    </div>
  );
}
