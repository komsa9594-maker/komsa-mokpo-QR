import { prisma } from '../lib/db';
import styles from './admin.module.css';
import AdminDashboard from './AdminDashboard';
import { login, logout } from './actions';
import { cookies, headers } from 'next/headers';
import { LogOut, ShieldCheck, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin-auth')?.value === 'true';

  if (!isAuthenticated) {
    return (
      <div className={styles.layout} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background:'white', padding:'3rem', borderRadius:'16px', textAlign:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', maxWidth:'400px', width:'100%' }}>
          <ShieldCheck size={48} color="#238299" style={{marginBottom:'1rem'}} />
          <h2 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '2rem', fontWeight: 800 }}>QR 링크 관리자</h2>
          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" name="id" placeholder="아이디" style={{padding:'1rem', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'1rem'}} required />
            <input type="password" name="password" placeholder="비밀번호" style={{padding:'1rem', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'1rem'}} required />
            <button type="submit" style={{padding:'1rem', borderRadius:'8px', border:'none', background:'#238299', color:'white', fontSize:'1.1rem', fontWeight:700, cursor:'pointer', marginTop:'1rem'}}>로그인</button>
          </form>
        </div>
      </div>
    );
  }

  let config = null;
  let ships: any[] = [];
  let allClickEvents: any[] = [];
  let announcements: any[] = [];
  let surveys: any[] = [];
  let dbError = null;

  try {
    config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    ships = await prisma.ship.findMany({ 
      include: { 
        links: true, 
        visits: { select: { createdAt: true } } 
      },
      orderBy: { createdAt: 'desc' } 
    });
    allClickEvents = await prisma.clickEvent.findMany();
    announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    surveys = await prisma.passengerSurvey.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (e: any) {
    console.error('DB 로딩 오류:', e);
    dbError = e.message || '데이터베이스 연결에 실패했습니다.';
  }
  
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const urlOrigin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

  if (dbError) {
    return (
      <div className={styles.layout} style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#e11d48' }}>⚠️ 데이터베이스 연결 오류</h2>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>{dbError}</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Vercel의 환경 변수(DATABASE_URL) 설정을 다시 확인해 주세요.</p>
        <form action={logout} style={{ marginTop: '2rem' }}>
          <button type="submit" className={styles.previewBtn} style={{background:'#1a6e83', color:'white', border:'none'}}>로그아웃 후 다시 시도</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Settings size={22} /> QR 링크 관리 대시보드
        </div>
        <form action={logout}>
          <button type="submit" className={styles.previewBtn} style={{background:'#1a6e83', color:'white', border:'none'}}><LogOut size={16}/> 로그아웃</button>
        </form>
      </header>

      <AdminDashboard 
        ships={ships} 
        config={config} 
        allClickEvents={allClickEvents} 
        announcements={announcements}
        surveys={surveys}
        urlOrigin={urlOrigin} 
      />
    </div>
  );
}
