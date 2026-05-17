import { prisma } from './lib/db';
import ShipSearchList from './ShipSearchList';
import styles from './[shipId]/page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // 실시간 정보 보장

export default async function Home() {
  // 1. 데이터베이스에서 모든 선박 데이터 조회
  const ships = await prisma.ship.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      urlSlug: true
    }
  });

  // 2. 글로벌 방문자 통계 및 공지사항 조회
  const config = await prisma.systemConfig.findUnique({
    where: { id: 'global' }
  });

  // 누적 방문자 통계 업데이트
  let visitorCount = config?.totalVisitors || 0;
  try {
    const updated = await prisma.systemConfig.upsert({
      where: { id: 'global' },
      create: { id: 'global', totalVisitors: 1 },
      update: { totalVisitors: { increment: 1 } }
    });
    visitorCount = updated.totalVisitors;
  } catch (e) {
    console.error('글로벌 방문자 수 카운트 증가 실패:', e);
  }

  return (
    <div className={styles.container} style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      paddingBottom: '4rem'
    }}>
      
      {/* 🏛️ 최상단 공식 헤더 */}
      <header style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        paddingTop: '2.5rem', paddingBottom: '1.5rem', gap: '0.6rem',
        textAlign: 'center'
      }}>
        {/* 공단 공식 로고 */}
        <div style={{ marginBottom: '0.4rem' }}>
          <img
            src="/komsa_official_logo.png"
            alt="공단 로고"
            style={{ width: '150px', height: 'auto' }}
          />
        </div>

        {/* 대타이틀 */}
        <h1 style={{ 
          fontSize: '1.6rem', 
          fontWeight: 900, 
          color: '#0f172a',
          margin: '0.5rem 0 0.2rem 0',
          letterSpacing: '-1px'
        }}>
          목포여객선 안전정보 QR 포털
        </h1>
        
        {/* 소타이틀 및 안내 문구 */}
        <p style={{ 
          fontSize: '0.88rem', 
          color: '#64748b', 
          fontWeight: 700,
          maxWidth: '420px',
          lineHeight: '1.5',
          margin: '0 1rem',
          wordBreak: 'keep-all'
        }}>
          🚢 여객선 이름, 기항지(목적지), 또는 항로명을 검색하시면 실시간 운항 정보와 필수 안전 정보를 바로 확인하실 수 있습니다.
        </p>
      </header>

      {/* 🔍 실시간 검색 영역 */}
      <ShipSearchList initialShips={ships} />

      {/* 🏢 푸터 영역 */}
      <footer style={{
        marginTop: '4rem',
        textAlign: 'center',
        padding: '1.5rem 1rem',
        borderTop: '1px solid #e2e8f0',
        width: '100%',
        maxWidth: '640px',
        margin: '4rem auto 0 auto'
      }}>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, margin: 0 }}>
          한국해양교통안전공단(KOMSA) 목포운항관리센터
        </p>
        <p style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, marginTop: '4px' }}>
          누적 포털 방문 횟수: {visitorCount.toLocaleString()}회
        </p>
      </footer>
    </div>
  );
}
