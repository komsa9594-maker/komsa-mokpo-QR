import { notFound } from 'next/navigation';
import { prisma } from '../lib/db';
import styles from './page.module.css';
import { Tracker, ActionButton, FavoriteButton, NoticePopup } from './ClientInteractions';
import { BandStatusButton } from './BandStatusButton';
import { ShieldCheck, Activity, MapPin, Zap, CheckSquare, Navigation, ShieldAlert } from 'lucide-react';
import { fetchShipSchedule, getStatusInfo, formatTime, formatDate } from '../lib/komsa';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // 캐시 즉시 무효화

// [Build Version: 2026.03.21.1332] - Senior Popup Update
export default async function ShipPage({ params }: { params: Promise<{ shipId: string }> }) {
  const { shipId } = await params;
  const decodedSlug = decodeURIComponent(shipId);
  const ship: any = await prisma.ship.findUnique({
    where: { urlSlug: decodedSlug },
    include: { links: true }
  });

  if (!ship) return notFound();

  const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  // KOMSA API로 운항 일정 조회
  let schedules = null;
  try {
    schedules = await fetchShipSchedule(ship.name);
  } catch (e) {
    console.error('[선박 페이지] 운항 일정 조회 실패:', e);
  }

  let mainSchedule = schedules?.[0] ?? null;
  if (schedules && schedules.length > 0) {
    // 현재 KST 시각 (HHMM)
    const kstTimeFormatter = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false });
    const kstTimeStr = kstTimeFormatter.format(new Date()).replace(':', '');
    const currentKstTime = parseInt(kstTimeStr, 10);

    // 1순위: 운항중인 항차
    const inTransit = schedules.find((s: any) => (s.nvg_stts_nm || s.nvg_se_nm || '').includes('운항중'));
    
    // 2순위: 현재 시간 이후의 가장 가까운 예정 항차
    const upcoming = schedules.find((s: any) => {
      const time = parseInt(s.sail_tm || '0', 10);
      return time >= currentKstTime && !(s.nvg_stts_nm || s.nvg_se_nm || '').includes('완료');
    });

    if (inTransit) {
      mainSchedule = inTransit;
    } else if (upcoming) {
      mainSchedule = upcoming;
    } else {
      // 다 지났으면 마지막 항차
      mainSchedule = schedules[schedules.length - 1];
    }
  }
  const statusInfo = getStatusInfo(mainSchedule);

  // KST 기준 오늘 날짜 (Vercel UTC 서버에서도 정확히 동작)
  const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
  const kstParts = kstFormatter.formatToParts(new Date());
  const kstMonth = kstParts.find(p => p.type === 'month')?.value || '';
  const kstDay = kstParts.find(p => p.type === 'day')?.value || '';
  const kstWeekday = kstParts.find(p => p.type === 'weekday')?.value || '';
  
  // 요일별 색상
  const kstDow = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(new Date());
  const dayColor = kstDow === 'Sun' ? '#ef4444' : (kstDow === 'Sat' ? '#3b82f6' : '#475569');
  
  const displayDate = (
    <>
      {kstMonth}월 {kstDay}일 <span style={{ color: dayColor, fontWeight: 900 }}>({kstWeekday})</span>
    </>
  );

  // 🌊 기상청 해상 예보 조회
  const { fetchSeaWeather } = await import('../lib/weather');
  const weather = await fetchSeaWeather(ship.weatherRegId || '12A30100');

  return (
    <div className={styles.container}>
      <NoticePopup message={config?.tomorrowWeather} announcements={announcements} />
      <Tracker shipId={ship.id} />
      
      <header className={styles.header} style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        paddingTop: '1rem', paddingBottom: '0.5rem', gap: '0.4rem' 
      }}>
        {/* 🏛️ 최상단: 공단 공식 로고 */}
        <div style={{ marginBottom: '0.4rem' }}>
          <img
            src="/komsa_official_logo.png"
            alt="공단 로고"
            style={{ width: '135px', height: 'auto' }}
          />
        </div>

        {/* 🚢 선박 이름 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <h1 className={styles.shipName} style={{ fontSize: '2.1rem', marginBottom: 0, letterSpacing: '-1.2px' }}>{ship.name}</h1>
          <FavoriteButton shipId={ship.id} />
        </div>
      </header>

      <div className={styles.statusBox} style={{ padding: '1rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#238299', fontWeight: 900 }}>
               ● 실시간 연동 중 
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
               {new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())} 업데이트
            </span>
          </div>
          
          {/* 📅 날짜와 🚢 상태 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'nowrap', width: '100%' }}>
            <div style={{ 
              fontSize: '1rem', color: '#334155', fontWeight: 900, 
              letterSpacing: '-0.5px', background: '#f8fafc',
              padding: '8px 14px', borderRadius: '15px', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              📅 {displayDate}
            </div>
            
            <div className="glowing" style={{ 
              background: statusInfo.color, color: '#fff', 
              padding: '8px 18px', borderRadius: '15px', fontWeight: 900, 
              fontSize: '1.15rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {statusInfo.emoji} {statusInfo.label}
            </div>
          </div>

          {/* 🕐 운항 정보 리스트 */}
          {schedules && schedules.length > 0 && (() => {
            const renderScheduleItem = (s: any, i: number) => {
              // nvg_stts_nm: 출항전, 운항중, 완료 / nvg_se_nm: 정상, 증선, 비운항, 통제, 대기/지연
              const isCanceled = (s.nvg_se_nm || '').match(/통제|결항|비운항|비운|휴항/) || (s.nnavi_rsn_nm || '').match(/휴항/);
              let statusTxt = isCanceled ? (s.nvg_se_nm === '비운' ? '비운항' : s.nvg_se_nm) : (s.nvg_stts_nm || s.nvg_se_nm || '정상');
              if (s.nnavi_rsn_nm?.includes('휴항')) statusTxt = '휴항';
              let statusColor = '#10b981'; // 기본: 초록
              let statusBg = '#10b98111';
              if (statusTxt.includes('출항전')) { statusColor = '#f59e0b'; statusBg = '#f59e0b18'; }
              else if (statusTxt.includes('운항중')) { statusColor = '#3b82f6'; statusBg = '#3b82f618'; }
              else if (statusTxt.includes('완료')) { statusColor = '#10b981'; statusBg = '#10b98111'; }
              else if (statusTxt.includes('통제') || statusTxt.includes('결항') || statusTxt.includes('비운') || statusTxt.includes('휴항')) { statusColor = '#ef4444'; statusBg = '#ef444418'; }
              return (
                <div key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#1e293b' }}>🕐 {formatTime(s.sail_tm)}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '6px', background: statusBg, border: `1px solid ${statusColor}44`, color: statusColor }}>{statusTxt}</span>
                  <span style={{ opacity: 0.1 }}>|</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#64748b' }}>{s.oport_nm} ➔ {s.dest_nm}</span>
                </div>
              );
            };
            return (
            <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem', padding: '1.1rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
               {schedules.slice(0, 5).map(renderScheduleItem)}
               {schedules.length > 5 && (
                 <details style={{ marginTop: '0.3rem' }}>
                   <summary style={{ cursor: 'pointer', textAlign: 'center', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem', padding: '0.4rem', borderRadius: '10px', background: '#e0f2fe' }}>
                     나머지 {schedules.length - 5}개 스케줄 더보기 ▼
                   </summary>
                   <div style={{ marginTop: '0.6rem' }}>
                     {schedules.slice(5).map((s: any, i: number) => renderScheduleItem(s, i + 5))}
                   </div>
                 </details>
               )}
            </div>
            );
          })()}

          {/* 기상청 날씨 및 안전 진단 카드 임시 제거 (사용자 요청) */}
          {statusInfo.reason && (
            <p style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', margin: '6px 0', border: '1px dashed #fee2e2', padding: '6px', borderRadius: '12px', background: '#fff5f5' }}>
              ⚠️ 사유: {statusInfo.reason}
            </p>
          )}

          {/* 밴드 이동 버튼 */}
          <div style={{ marginTop: '0.8rem' }}>
             <BandStatusButton shipId={ship.id} />
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ justifyContent: 'space-between' }}>
           <span><ShieldCheck size={18} /> 선박 필수 안전 정보</span>
           <img src="/haesooho_search.jpg" alt="조사하는 해수호" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00d4ff', marginLeft: 'auto' }} />
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ActionButton 
            shipId={ship.id} 
            linkId="core_checklist" 
            url={ship.checklistUrl || ""} 
            title="출항 전 점검표 확인" 
            description="우리 배가 안전하게 점검되었는지 최신 점검표를 직접 확인해보세요!"
            guideText="점검표 보기"
            iconName="ClipboardCheck" 
            primary={true} 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="core_regulations" 
            url={ship.regulationsUrl || ""} 
            title="운항관리규정 열람" 
            description="선박 통제 규정, 차량 적재 및 허용 기준 등을 확인할 수 있습니다."
            guideText="규정 보기"
            iconName="BookOpen" 
            primary={false} 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="core_safety" 
            url={ship.safetyInfoUrl || ""} 
            title="여객선 안전정보 조회" 
            description="선박 검사 이력과 사고 현황 등 안전 핵심 정보를 투명하게 공개합니다."
            guideText="정보 보기"
            iconName="Info" 
            primary={false} 
          />
        </div>
      </section>

      <section className={styles.section} style={{ marginTop: '2.5rem' }}>
        <h2 className={styles.sectionTitle} style={{ justifyContent: 'space-between' }}>
           <span><Activity size={18} /> 편리한 부가 서비스 안내</span>
           <img src="/komat_like.jpg" alt="최고 공단 캐릭터" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00d4ff', marginLeft: 'auto' }} />
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ship.links
            .filter((link: any) => {
              if (link.url === 'tracking-only') return false;
              const title = link.title || '';
              // 핵심 안전 정보 섹션에서 이미 다루는 항목과 유선문의 필터링
              const isCommonLink = ['운항관리규정', '안전정보', '점검표', '유선문의'].some(k => title.includes(k));
              return !isCommonLink;
            })
            .sort((a: any, b: any) => {
              const tA = (a.title || '').toLowerCase();
              const tB = (b.title || '').toLowerCase();
              // PATIS/위치가 들어간 것을 1등으로 (음수 값이 나오면 앞으로 감)
              const pA = tA.includes('patis') || tA.includes('위치');
              const pB = tB.includes('patis') || tB.includes('위치');
              if (pA && !pB) return -1;
              if (!pA && pB) return 1;
              // 그 다음 VR이 2등
              const vA = tA.includes('vr');
              const vB = tB.includes('vr');
              if (vA && !vB) return -1;
              if (!vA && vB) return 1;
              
              // 나머지 링크들은 생성 시간 순으로 (오래된 것 먼저, 새로 추가한 것은 맨 아래로)
              const timeA = new Date(a.createdAt || 0).getTime();
              const timeB = new Date(b.createdAt || 0).getTime();
              return timeA - timeB;
            })
            .map((link: any) => {
              let desc = link.description || '여객선 이용을 위한 편리한 부가 서비스입니다.';
              let guideText = link.guideText || '바로가기';
              let icon = link.icon || 'ExternalLink';
              let myUrl = link.url;
              let displayTitle = link.title || '';

              // 프리미엄 UI 및 문구 오버라이드
              if (displayTitle.includes('PATIS') || displayTitle.includes('위치')) {
                 desc = '공식 앱을 설치하고 전국 모든 여객선의 실시간 위치와 정보를 손쉽게 확인하세요.';
                 guideText = '앱 설치';
                 icon = 'MapPin';
                 displayTitle = "실시간 선박 위치 (MTIS 앱)";
                 myUrl = "https://play.google.com/store/apps/details?id=kr.or.komsa.mtis&pcampaignid=web_share";
              } 
              else if (displayTitle.includes('VR')) {
                 desc = '가상현실로 체험하는 여객선 안전 교육 콘텐츠를 시청하세요.';
                 guideText = '체험하기';
                 icon = 'Glasses';
              }
              else if (displayTitle.includes('전기차')) {
                 desc = '사전 예약을 통해 출항 전 전기차 배터리 안심 점검서비스를 무상으로 받아보세요.';
                 guideText = '안심 예약';
                 icon = 'BatteryCharging';
                 displayTitle = "전기차 배터리 안심 점검 서비스";
              }

              return (
                <ActionButton 
                  key={link.id} 
                  shipId={ship.id} 
                  linkId={link.id} 
                  url={myUrl} 
                  title={displayTitle} 
                  description={desc}
                  guideText={guideText}
                  iconName={icon} 
                />
              );
            })}
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '3.5rem', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
         <p style={{ fontWeight: 850, color: '#334155', marginBottom: '0.8rem', fontSize: '0.95rem' }}>한국해양교통안전공단 목포운항관리센터</p>
         <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>© {new Date().getFullYear()} MOKPO MARITIME SAFETY. 본 관리 시스템의 모든 권리는 공단에 있습니다.</p>
         <p style={{ marginTop: '12px', letterSpacing: '0.5px', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem' }}>🌊 세상에서 가장 안전한 바닷길을 만듭니다.</p>
      </footer>
    </div>
  );
}
