'use client';
// Vercel Deploy Trigger [2026.03.21.1330]

import React, { useEffect, useState } from 'react';
import { Anchor, BatteryCharging, BookOpen, Bus, CalendarClock, CheckSquare, ChevronRight, ClipboardCheck, ExternalLink, Glasses, Heart, Info, MapPin, Navigation, Zap } from 'lucide-react';
import styles from './page.module.css';

export function NoticePopup({ message, announcements = [] }: { message?: string | null; announcements?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For fullscreen lightbox

  useEffect(() => {
    setMounted(true);
    const hasNotices = (announcements && announcements.length > 0) || (message && message.trim() !== '');
    if (hasNotices) {
      const hideUntil = localStorage.getItem('hide_notice_until');
      let newestDate = 0;
      if (announcements && announcements.length > 0) {
        newestDate = Math.max(...announcements.map((a: any) => new Date(a.createdAt).getTime()));
      }
      
      const savedHideTime = hideUntil ? parseInt(hideUntil, 10) : 0;
      const isExpired = new Date().getTime() > savedHideTime;
      
      const lastDismissedTime = localStorage.getItem('last_dismissed_time') ? parseInt(localStorage.getItem('last_dismissed_time')!, 10) : 0;
      const hasNewNotice = newestDate > lastDismissedTime;

      if (isExpired || hasNewNotice) {
        setIsOpen(true);
      }
    }
  }, [message, announcements]);

  const closePopup = (hideForToday: boolean) => {
    const now = new Date().getTime();
    localStorage.setItem('last_dismissed_time', now.toString());
    
    if (hideForToday) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      localStorage.setItem('hide_notice_until', tomorrow.getTime().toString());
    }
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  // Compile active notices
  const items = [...announcements];
  if (items.length === 0 && message && message.trim() !== '') {
    items.push({
      id: 'legacy',
      title: '알림 메시지',
      content: message,
      imageUrl: null,
      createdAt: new Date()
    });
  }

  if (items.length === 0) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', zIndex: 10000, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', padding: '1.25rem'
        }}
      >
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '28px', 
            padding: '2.2rem 1.5rem 1.5rem 1.5rem', 
            maxWidth: '420px', 
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ 
            position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', 
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', 
            padding: '8px 24px', borderRadius: '30px', fontWeight: 900, 
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)', whiteSpace: 'nowrap',
            fontSize: '0.95rem', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span>🔔</span> 공지사항 및 시간표 안내
          </div>
          
          {/* Scrollable notices container */}
          <div style={{ 
            overflowY: 'auto', 
            flex: 1, 
            margin: '1rem 0 1.5rem 0',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {items.map((ann, idx) => (
              <div 
                key={ann.id} 
                style={{ 
                  borderBottom: idx < items.length - 1 ? '1px dashed #e2e8f0' : 'none',
                  paddingBottom: idx < items.length - 1 ? '1.5rem' : '0'
                }}
              >
                <div style={{ 
                  fontSize: '1.15rem', 
                  color: '#1e293b', 
                  fontWeight: 900, 
                  lineHeight: 1.4, 
                  marginBottom: '0.6rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px'
                }}>
                  <span style={{ color: '#8b5cf6' }}>•</span>
                  <span>{ann.title}</span>
                </div>
                
                <div style={{ 
                  fontSize: '0.92rem', 
                  color: '#475569', 
                  fontWeight: 600, 
                  lineHeight: 1.6, 
                  whiteSpace: 'pre-wrap',
                  marginBottom: ann.imageUrl ? '0.8rem' : '0'
                }}>
                  {ann.content}
                </div>

                {ann.imageUrl && (
                  <div style={{ position: 'relative', marginTop: '0.8rem', cursor: 'zoom-in' }} onClick={() => setSelectedImage(ann.imageUrl)}>
                    <img 
                      src={ann.imageUrl} 
                      alt={ann.title} 
                      style={{ 
                        width: '100%', 
                        maxHeight: '220px', 
                        objectFit: 'cover', 
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }} 
                    />
                    <div style={{ 
                      position: 'absolute', bottom: '10px', right: '10px', 
                      background: 'rgba(15, 23, 42, 0.75)', color: 'white', 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', 
                      fontWeight: 800, backdropFilter: 'blur(4px)' 
                    }}>
                      🔍 크게보기
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <button
              onClick={() => closePopup(true)}
              style={{
                flex: 1, padding: '0.9rem', borderRadius: '16px',
                background: '#f1f5f9', color: '#64748b', 
                fontWeight: 800, fontSize: '0.9rem',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              오늘 하루 보지 않기
            </button>
            <button
              onClick={() => closePopup(false)}
              style={{
                flex: 1, padding: '0.9rem', borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', 
                fontWeight: 800, fontSize: '1rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for full screen image view */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', zIndex: 20000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <img 
            src={selectedImage} 
            alt="시간표 크게보기" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90vh', 
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }} 
          />
          <div style={{ 
            position: 'absolute', top: '20px', right: '20px', 
            background: 'rgba(255,255,255,0.2)', color: 'white', 
            padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', 
            fontWeight: 800, border: '1px solid rgba(255,255,255,0.3)' 
          }}>
            터치하여 닫기 ✕
          </div>
        </div>
      )}
    </>
  );
}

export function Tracker({ shipId }: { shipId: string }) {
  useEffect(() => {
    fetch('/api/stats/visit', { method: 'POST', body: JSON.stringify({ shipId }), headers: { 'Content-Type': 'application/json' } });
  }, [shipId]);
  return null;
}

export function FavoriteButton({ shipId, shipName }: { shipId: string; shipName?: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('komsa_favorites') || '[]');
    setIsFavorite(favorites.includes(shipId));
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, [shipId]);

  const toggleFavorite = async () => {
    const favorites = JSON.parse(localStorage.getItem('komsa_favorites') || '[]');
    let newFavorites;
    let action: 'add' | 'remove';

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== shipId);
      action = 'remove';
      setShowGuide(false);
    } else {
      newFavorites = [...favorites, shipId];
      action = 'add';
      setShowGuide(true);
    }

    localStorage.setItem('komsa_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);

    try {
      await fetch('/api/stats/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipId, action })
      });
    } catch (e) {
      console.error('[즐겨찾기] 통계 서버 전송 실패:', e);
    }
  };

  return (
    <>
      <button 
        onClick={toggleFavorite}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          color: isFavorite ? '#ef4444' : '#64748b',
          boxShadow: isFavorite ? '0 4px 15px rgba(239, 68, 68, 0.25)' : '0 4px 10px rgba(0,0,0,0.03)',
          flexShrink: 0
        }}
      >
        <Heart 
          fill={isFavorite ? '#ef4444' : 'none'} 
          size={22} 
          strokeWidth={isFavorite ? 0.5 : 2.5} 
          style={{ filter: isFavorite ? 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4))' : 'none' }}
        />
      </button>

      {/* 어르신을 위한 쉬운 안내 팝업 */}
      {showGuide && typeof window !== 'undefined' && require('react-dom').createPortal(
        <div 
          onClick={() => setShowGuide(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', padding: '1.5rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '28px',
              padding: '2.5rem 1.5rem',
              maxWidth: '360px', width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              textAlign: 'center',
              color: '#333',
              position: 'relative',
              animation: 'fadeInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>❤️</div>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#e11d48', marginBottom: '0.8rem', letterSpacing: '-1px' }}>
              '이 배 찜하기' 완료!
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 800, marginBottom: '2rem', lineHeight: 1.5 }}>
              바탕화면에 설치해두시면<br/>더욱 편하게 보실 수 있습니다.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '1.5rem 1.2rem', marginBottom: '2rem', textAlign: 'left', border: '2px solid #e2e8f0' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
                📱 내 폰 바탕화면에 추가하는 법:
              </p>
              
              {isIOS ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>①</span>
                    <span>화면 밑의 <b>사각형 화살표 (↑)</b> 터치</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>②</span>
                    <span><b>'홈 화면에 추가'</b> 터치 끝!</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>①</span>
                    <span>화면 구석의 <b>점 세개 (⋮)</b> 터치</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>②</span>
                    <span><b>'홈 화면에 추가'</b> 터치 끝!</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              style={{
                width: '100%', padding: '1.2rem', borderRadius: '18px',
                background: '#e11d48', color: '#fff', 
                fontWeight: 900, fontSize: '1.25rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 15px rgba(225, 29, 72, 0.4)'
              }}
            >
              내용을 확인했습니다
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function ActionButton({ 
  shipId, linkId, url, title, iconName, primary = false, description, guideText, isFree = false
}: { 
  shipId: string; 
  linkId?: string; 
  url: string; 
  title: string; 
  iconName: string; 
  primary?: boolean;
  description?: string;
  guideText?: string;
  isFree?: boolean;
}) {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!url || url === 'tracking-only') {
      e.preventDefault();
      setShowPopup(true);
      return;
    }
    fetch('/api/stats/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipId, linkId, title }) });
  };

  const getIcon = () => {
    if(iconName === 'ClipboardCheck') return <ClipboardCheck size={28} strokeWidth={2.5} />;
    if(iconName === 'BookOpen') return <BookOpen size={28} strokeWidth={2.5} />;
    if(iconName === 'Info') return <Info size={28} strokeWidth={2.5} />;
    if(iconName === 'BatteryCharging') return <BatteryCharging size={28} strokeWidth={2.5} />;
    if(iconName === 'Glasses') return <Glasses size={28} strokeWidth={2.5} />;
    if(iconName === 'MapPin') return <MapPin size={28} strokeWidth={2.5} />;
    if(iconName === 'Anchor') return <Anchor size={28} strokeWidth={2.5} />;
    if(iconName === 'ExternalLink') return <ExternalLink size={26} strokeWidth={2.5} />;
    
    if (iconName && iconName !== 'ChevronRight') {
      return <span style={{ fontSize: '26px', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{iconName}</span>;
    }
    
    return <ChevronRight size={26} strokeWidth={2.5} />;
  };

  return (
    <>
      <a 
        href={url && url !== 'tracking-only' ? url : '#'} 
        target={url && url !== 'tracking-only' ? "_blank" : undefined}
        rel="noopener noreferrer" 
        onClick={handleClick}
        className={`${styles.actionItem} ${primary ? styles.actionItemPrimary : ''}`}
        style={{ padding: description ? 'clamp(1rem, 4vw, 1.4rem)' : 'clamp(1rem, 3.5vw, 1.2rem) clamp(1rem, 4vw, 1.4rem)', textDecoration: 'none' }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', width: '100%', position: 'relative' }}>
          {/* 🌟 명시적 아이콘 영역 (고정 크기) */}
          <div className={styles.iconBox}>
            {getIcon()}
          </div>
          
          {/* 📝 텍스트 + 우측 컨테이너 (정렬 유지) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '56px', gap: '5px', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.actionTitle} style={{ lineHeight: 1.2 }}>{title}</span>
              {guideText && (
                <span className={styles.actionGuide}>
                  {guideText} <ChevronRight size={14} strokeWidth={3} />
                </span>
              )}
            </div>
            
            {description && (
              <span className={styles.actionDesc}>
                {description}
              </span>
            )}
            
            {isFree && (
              <span className={styles.freeBadge} style={{ alignSelf: 'flex-start' }}>무료</span>
            )}
            
            {/* 우측 네비게이션 화살표 */}
            {!guideText && !description && (
              <ChevronRight size={18} style={{ position: 'absolute', right: '0rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: '#1e293b' }} />
            )}
          </div>
        </div>
      </a>

      {showPopup && (
        <div 
          onClick={(e) => { e.preventDefault(); setShowPopup(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', padding: '1.5rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '24px', padding: '2.5rem 1.5rem', maxWidth: '340px', width: '100%',
              border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              textAlign: 'center', animation: 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>🚧</div>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>서비스 안내</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', wordBreak: 'keep-all' }}>
              해당 선박의 <b>{title}</b> 정보가 아직 등록되지 않았거나, 시스템 연결 오류를 <b>해결 중</b>입니다.<br/><br/>
              최대한 빠르게 안전 정보를 확인하실 수 있도록 조치하겠습니다.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                width: '100%', padding: '1rem', borderRadius: '14px',
                background: 'linear-gradient(135deg, #00d4ff, #0077ff)', color: '#fff', fontWeight: 800,
                border: 'none', cursor: 'pointer', fontSize: '1.05rem',
                boxShadow: '0 8px 20px rgba(0, 212, 255, 0.3)'
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
