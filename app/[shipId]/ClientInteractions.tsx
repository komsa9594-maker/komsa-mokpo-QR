'use client';
// Vercel Deploy Trigger [2026.03.21.1330]

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Anchor, BatteryCharging, BookOpen, Bus, CalendarClock, CheckSquare, ChevronRight, ClipboardCheck, ExternalLink, Glasses, Heart, Info, MapPin, Navigation, Volume2, VolumeX, Zap } from 'lucide-react';
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

// 🚢 여객 만족도 설문조사 바텀 시트 팝업 위젯
export function SurveyPopup({ shipName, shipId }: { shipName: string; shipId: string }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [helpful, setHelpful] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const labels = ["", "많이 아쉬워요", "조금 아쉬워요", "보통이에요", "만족해요", "매우 만족해요"];

  useEffect(() => {
    setMounted(true);
    const key = "ksvy_seen_until_v2";
    const hideUntil = localStorage.getItem(key);
    const isSnoozed = hideUntil && Date.now() < parseInt(hideUntil, 10);

    if (!isSnoozed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000); // 4초 뒤 노출
      return () => clearTimeout(timer);
    }
  }, []);

  const snooze = () => {
    try {
      const key = "ksvy_seen_until_v2";
      const snoozeTime = Date.now() + 24 * 3600e3; // 24시간
      localStorage.setItem(key, snoozeTime.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const handleSkip = () => {
    snooze();
    closePopup();
  };

  const handleSubmit = async () => {
    if (!satisfaction) return;
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      satisfaction,
      helpful,
      comment: comment.trim() || null,
      ship: shipName || null,
      easy_to_find: null,
      checked: null
    };

    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('passenger_survey')
        .insert([payload]);

      if (error) throw error;

      snooze();
      setIsSuccess(true);
      setTimeout(closePopup, 1900);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* 백드롭 */}
      <div 
        className={`ksvy-back ${isOpen ? 'show' : ''}`}
        onClick={handleSkip}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(16,42,58,.45)', zIndex: 9998,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity .25s', backdropFilter: 'blur(2px)'
        }}
      />

      {/* 바텀 시트 */}
      <div 
        className={`ksvy ${isOpen ? 'show' : ''}`}
        role="dialog" aria-modal="true"
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: '#fff', borderRadius: '22px 22px 0 0',
          boxShadow: '0 -10px 40px rgba(16,42,58,.25)',
          maxWidth: '480px', margin: '0 auto', padding: '8px 20px 22px',
          transform: isOpen ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform .32s cubic-bezier(.2,.9,.3,1)',
          fontFamily: "'Pretendard',-apple-system,'Malgun Gothic',sans-serif",
          color: '#102a3a'
        }}
      >
        <div style={{ width: '42px', height: '5px', borderRadius: '3px', background: '#d7e2ea', margin: '8px auto 12px' }} />
        <button 
          onClick={handleSkip} 
          aria-label="닫기"
          style={{
            position: 'absolute', top: '14px', right: '16px', border: 'none', background: '#f1f6f9',
            width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', color: '#5b7081',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#2e9e6b,#26b07a)', color: '#fff',
              fontSize: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', animation: 'ksvyPop .45s cubic-bezier(.2,1.3,.5,1)'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>감사합니다!</h3>
            <p style={{ color: '#5b7081', fontSize: '14px', margin: '6px 0 0' }}>
              여러분의 의견이 더 안전한 바닷길을 만듭니다.
            </p>
          </div>
        ) : (
          <div className="ksvy-body">
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 4px', letterSpacing: '-.02em' }}>
              서비스가 도움이 되셨나요?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#5b7081', margin: '0 0 16px' }}>
              {shipName && <span style={{ color: '#1f7a8c', fontWeight: 700 }}>{shipName}</span>} 이용 고객님, 잠깐이면 됩니다. 익명으로 처리됩니다.
            </p>

            {/* 별점 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '4px 0 6px' }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setSatisfaction(val)}
                  style={{
                    border: 'none', background: 'none', fontSize: '42px',
                    color: satisfaction && val <= satisfaction ? '#f6a609' : '#cdd9e1',
                    cursor: 'pointer', padding: '2px', transition: 'transform .12s, color .12s'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#5b7081', minHeight: '20px', marginBottom: '6px', textAlign: 'center' }}>
              {satisfaction ? labels[satisfaction] : "별을 눌러 평가해 주세요"}
            </div>

            {/* 별점을 누르면 열리는 추가 문항 */}
            <div 
              style={{
                maxHeight: satisfaction ? '260px' : '0',
                opacity: satisfaction ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height .35s ease, opacity .35s ease'
              }}
            >
              <div style={{ fontSize: '14.5px', fontWeight: 700, margin: '14px 0 8px' }}>
                필요한 안전정보를 쉽게 확인하셨나요?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'yes', label: '네, 쉬웠어요' },
                  { key: 'ok', label: '보통이에요' },
                  { key: 'no', label: '아쉬웠어요' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setHelpful(item.key)}
                    style={{
                      flex: 1, padding: '11px 4px', border: '1.5px solid #dbe6ed',
                      borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', minHeight: '46px',
                      background: helpful === item.key ? '#1f7a8c' : '#fff',
                      color: helpful === item.key ? '#fff' : '#5b7081',
                      borderColor: helpful === item.key ? '#1f7a8c' : '#dbe6ed',
                      transition: '.14s'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <textarea
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="개선 의견이 있다면 남겨주세요 (선택)"
                style={{
                  width: '100%', marginTop: '12px', border: '1.5px solid #dbe6ed',
                  borderRadius: '12px', padding: '11px', fontFamily: 'inherit',
                  fontSize: '14.5px', resize: 'none', height: '64px',
                  color: '#102a3a', boxSizing: 'border-box'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{
                background: '#fdecec', color: '#b23b2a', border: '1px solid #f3c4bd',
                borderRadius: '10px', padding: '9px 12px', fontSize: '13px',
                marginTop: '10px', fontWeight: 600
              }}>
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!satisfaction || submitting}
              style={{
                width: '100%', marginTop: '16px', border: 'none', borderRadius: '14px',
                padding: '15px', fontSize: '17px', fontWeight: 800, color: '#fff',
                background: 'linear-gradient(135deg,#143b5e,#1f7a8c)',
                cursor: !satisfaction || submitting ? 'not-allowed' : 'pointer',
                opacity: !satisfaction || submitting ? 0.45 : 1,
                fontFamily: 'inherit', transition: '.14s'
              }}
            >
              {submitting ? "제출 중…" : "제출하기"}
            </button>

            <button 
              onClick={handleSkip}
              style={{
                display: 'block', width: '100%', marginTop: '10px', border: 'none',
                background: 'none', color: '#9aa9b4', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit', padding: '6px'
              }}
            >
              다음에 할게요 · 오늘 그만 보기
            </button>

            <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#9aa9b4', marginTop: '12px', lineHeight: 1.5 }}>
              개인을 식별할 수 있는 정보는 수집하지 않습니다.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ksvyPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

// 🔊 교통약자를 위한 TTS(음성 안내) 버튼
export function TtsButton({ ttsData }: { ttsData: {
  shipName: string;
  statusLabel: string;
  schedules: { time: string; from: string; to: string; status: string }[];
} }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const buildScript = useCallback(() => {
    const lines: string[] = [];
    lines.push(`안녕하세요. ${ttsData.shipName} 여객선 안전정보 페이지입니다.`);
    lines.push(`현재 운항 상태는 ${ttsData.statusLabel} 입니다.`);

    if (ttsData.schedules && ttsData.schedules.length > 0) {
      lines.push(`오늘의 운항 스케줄을 안내해 드리겠습니다.`);
      ttsData.schedules.forEach((s, i) => {
        lines.push(`${i + 1}번째 항차. ${s.time} 출발. ${s.from}에서 ${s.to}행. 상태는 ${s.status} 입니다.`);
      });
    } else {
      lines.push(`현재 등록된 운항 스케줄 정보가 없습니다.`);
    }

    lines.push(`이 페이지에서는 출항 전 점검표 확인, 운항관리규정 열람, 여객선 안전정보 조회 등의 메뉴를 이용하실 수 있습니다.`);
    lines.push(`안전한 바닷길, 한국해양교통안전공단이 함께합니다.`);

    return lines.join(' ');
  }, [ttsData]);

  const handleToggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = buildScript();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = 0.95;
    utter.pitch = 1.0;

    // 한국어 음성 선택
    const voices = synth.getVoices();
    const koVoice = voices.find(v => v.lang.startsWith('ko'));
    if (koVoice) utter.voice = koVoice;

    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    utterRef.current = utter;
    synth.cancel();
    synth.speak(utter);
    setIsSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleToggle}
      aria-label={isSpeaking ? "음성 안내 정지" : "음성 안내 듣기"}
      title={isSpeaking ? "음성 안내 정지" : "교통약자를 위한 음성 안내"}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '20px',
        zIndex: 9990,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isSpeaking
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #0284c7, #0369a1)',
        color: '#ffffff',
        boxShadow: isSpeaking
          ? '0 6px 24px rgba(239, 68, 68, 0.5)'
          : '0 6px 24px rgba(2, 132, 199, 0.45)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: isSpeaking ? 'ttsPulse 1.5s infinite' : 'none'
      }}
    >
      {isSpeaking ? <VolumeX size={26} strokeWidth={2.5} /> : <Volume2 size={26} strokeWidth={2.5} />}

      <style>{`
        @keyframes ttsPulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 6px 32px rgba(239, 68, 68, 0.8), 0 0 0 8px rgba(239, 68, 68, 0.15); }
        }
      `}</style>
    </button>
  );
}
