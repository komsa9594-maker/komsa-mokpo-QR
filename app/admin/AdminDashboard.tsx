'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { Search, Ship as ShipIcon, ChevronRight, LayoutDashboard, PlusCircle, MessageSquare, Anchor, BarChart3, PieChart, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import ShipDashboard from './ShipDashboard';
import { addShip, deleteShip } from './actions';

export default function AdminDashboard({ ships, config, allClickEvents, announcements, urlOrigin }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipId, setSelectedShipId] = useState<string | null>('global'); // Default to global stats
  const [isAddingShip, setIsAddingShip] = useState(false);
  
  // Safety Features State
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null); // Ship to delete
  const [undoToast, setUndoToast] = useState<any>(null); // Last deleted ship data for restore

  // Auto-hide undo toast after 5s
  useEffect(() => {
    if (undoToast) {
       const timer = setTimeout(() => setUndoToast(null), 5000);
       return () => clearTimeout(timer);
    }
  }, [undoToast]);

  const filteredShips = ships.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedShip = ships.find((s: any) => s.id === selectedShipId);

  const handleDeleteRequest = (e: React.MouseEvent, ship: any) => {
    e.stopPropagation();
    setDeleteConfirm(ship);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const shipToUndo = { ...deleteConfirm };
    await deleteShip(deleteConfirm.id);
    setUndoToast(shipToUndo);
    setDeleteConfirm(null);
    if (selectedShipId === shipToUndo.id) setSelectedShipId('global');
  };

  const handleRestore = async () => {
    if (!undoToast) return;
    const formData = new FormData();
    formData.append('name', undoToast.name);
    formData.append('slug', undoToast.urlSlug);
    await addShip(formData);
    setUndoToast(null);
  };

  // Stats calculation utility (KST)
  const calculateStats = (shipList: any[]) => {
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    
    let todayCount = 0; let yesterdayCount = 0; let weekCount = 0;
    let totalAccumulated = 0;
    
    const chartDataMap: Record<string, {count:number, fullDate:string}> = {};
    for(let i=6; i>=0; i--) {
      const d = new Date(kstNow.getTime() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      chartDataMap[dateKey] = { count: 0, fullDate: dateKey };
    }

    shipList.forEach((ship: any) => {
      totalAccumulated += ship.visits.length;
      ship.visits.forEach((v: any) => {
        const kst = new Date(v.createdAt.getTime() + 9 * 60 * 60 * 1000);
        const diffDiff = kstNow.getTime() - kst.getTime();
        const diffDays = Math.floor(diffDiff / 86400000);
        
        if(diffDays === 0) todayCount++;
        if(diffDays === 1) yesterdayCount++;
        if(diffDays <= 7) weekCount++;

        const dp = kst.toISOString().split('T')[0];
        if(chartDataMap[dp]) chartDataMap[dp].count++;
      });
    });

    const chart = Object.keys(chartDataMap).sort().map(k => ({
      date: k.slice(5).replace('-','/'), 
      fullDate: k,
      count: chartDataMap[k].count
    }));
    
    const maxVisit = Math.max(...chart.map(c=>c.count), 1);

    // Click Statistics
    const shipIds = new Set(shipList.map(s => s.id));
    const filteredClicks = allClickEvents.filter((c: any) => shipIds.has(c.shipId));
    
    const rankMap: Record<string, number> = {};
    filteredClicks.forEach((c: any) => { rankMap[c.title] = (rankMap[c.title] || 0) + 1; });
    
    shipList.forEach((ship: any) => {
      ship.links.filter((l: any) => l.url !== 'tracking-only').forEach((l: any) => {
        if(l.clicks > 0) rankMap[l.title] = (rankMap[l.title]||0) + l.clicks;
      });
    });

    const rank = Object.keys(rankMap)
      .map(title => ({ title, clicks: rankMap[title] }))
      .sort((a,b) => b.clicks - a.clicks)
      .slice(0, 10);

    const totalClicks = rank.reduce((acc, r) => acc + r.clicks, 0);
    const maxClick = rank.length > 0 ? rank[0].clicks : 1;

    // Favorited Statistics
    const totalFavorites = shipList.reduce((acc, s) => acc + (s.favoriteCount || 0), 0);
    const shipFavoriteRank = shipList
      .map(s => ({ name: s.name, favorites: s.favoriteCount || 0 }))
      .filter(s => s.favorites > 0)
      .sort((a, b) => b.favorites - a.favorites)
      .slice(0, 10);

    // Ship Activity Rank (only for global)
    const shipRank = shipList.map(s => ({ name: s.name, visits: s.visits.length }))
      .sort((a,b) => b.visits - a.visits)
      .slice(0, 10);

    return {
      today: todayCount, yesterday: yesterdayCount, week: weekCount, total: totalAccumulated, maxVisit,
      chart, totalClicks, maxClick, rank, shipRank, totalFavorites, shipFavoriteRank
    };
  };

  const selectedStats = isAddingShip ? null : (selectedShipId === 'global' ? calculateStats(ships) : calculateStats([selectedShip]));

  return (
    <div className={styles.main}>
      <div className={styles.dashboardLayout}>
        {/* Top Selection Bar */}
        <section className={styles.sidebar}>
          <div className={styles.sidebarTitle} style={{ cursor: 'pointer' }} onClick={() => { setSelectedShipId('global'); setIsAddingShip(false); }}>
             <Anchor size={18} color="#238299" /> 관리 센터 (기본 홈)
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button 
              className={`${styles.shipItem} ${selectedShipId === 'global' && !isAddingShip ? styles.active : ''}`}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: (selectedShipId === 'global' && !isAddingShip) ? '#238299' : '#f1f5f9', color: (selectedShipId === 'global' && !isAddingShip) ? 'white' : '#1e293b' }}
              onClick={() => {
                setSelectedShipId('global');
                setIsAddingShip(false);
              }}
            >
              <BarChart3 size={16} />
              종합 통계 홈
            </button>
            
            <button 
              className={`${styles.shipItem} ${isAddingShip ? styles.active : ''}`}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: isAddingShip ? '#238299' : '#e0f2fe', color: isAddingShip ? 'white' : '#0369a1', borderColor: 'transparent' }}
              onClick={() => {
                setSelectedShipId(null);
                setIsAddingShip(true);
              }}
            >
              <PlusCircle size={16} />
              배 추가 등록
            </button>
          </div>

          <div className={styles.searchBox} style={{ width: '100%', marginBottom: '1rem' }}>
            <Search className={styles.searchIcon} size={16} />
            <input 
              type="text" 
              placeholder="찾으시는 선박 명칭..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className={styles.shipList}>
            {filteredShips.map((ship: any) => (
              <button 
                key={ship.id}
                className={`${styles.shipItem} ${selectedShipId === ship.id ? styles.active : ''}`}
                onClick={() => {
                  setSelectedShipId(ship.id);
                  setIsAddingShip(false);
                }}
              >
                <ShipIcon size={14} className={styles.shipItemIcon} />
                <span>{ship.name}</span>
                <span className={styles.shipItemDelete} onClick={(e) => handleDeleteRequest(e, ship)}>
                   <Trash2 size={14} />
                </span>
              </button>
            ))}
            {filteredShips.length === 0 && (
              <p style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>검색 결과가 없습니다.</p>
            )}
          </div>
        </section>

        {/* Content Area (Bottom) */}
        <main className={styles.dashboardContent}>
          {/* Deletion Confirmation Modal */}
          {deleteConfirm && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalIcon}><AlertCircle size={32} /></div>
                <div className={styles.modalTitle}>선박 페이지 삭제</div>
                <div className={styles.modalDesc}>
                  <strong>[{deleteConfirm.name}]</strong> 선박의 모든 데이터(방문 기록, 링크 등)가 삭제됩니다. 계속하시겠습니까?
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>취소</button>
                  <button className={styles.confirmBtn} onClick={executeDelete}>네, 삭제합니다</button>
                </div>
              </div>
            </div>
          )}

          {/* Undo Toast */}
          {undoToast && (
            <div className={styles.undoToast}>
              <span style={{ fontSize: '0.9rem' }}>방금 <strong>[{undoToast.name}]</strong> 선박을 삭제했습니다.</span>
              <button className={styles.undoBtn} onClick={handleRestore}>
                <RotateCcw size={14} style={{ marginRight: '0.4rem' }} /> 되돌릴래요!
              </button>
            </div>
          )}
          {isAddingShip && (
            <div className={styles.chartCard} style={{ animation: 'fadeIn 0.3s', maxWidth: '800px' }}>
              <div className={styles.chartHeader}><PlusCircle size={18} /> 새로운 선박 페이지 만들기</div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>선박 이름을 입력하고 등록하면 해당 선박 전용 QR 접속 페이지가 즉시 생성됩니다.</p>
              <form action={async (formData) => {
                await addShip(formData);
                setIsAddingShip(false);
                window.location.reload();
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>선박 명칭</label>
                  <input type="text" name="name" placeholder="예: 코스모스 1호" className={styles.editInput} style={{ width: '100%' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>URL 주소 (영문 고유 아이디)</label>
                  <input type="text" name="slug" placeholder="예: cosmos" className={styles.editInput} style={{ width: '100%' }} required />
                </div>
                <button type="submit" className={styles.editSave} style={{ fontSize: '1rem', padding: '1rem' }}>선박 등록하기</button>
              </form>
            </div>
          )}

          {selectedShipId === 'global' && !isAddingShip && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>목포센터 운항관리 종합 통계</h2>
              <ShipDashboard 
                ship={{ name: '전체 선박' }} // Special case for ShipDashboard to show global view
                config={config} 
                overallStats={selectedStats} 
                announcements={announcements}
                urlOrigin={urlOrigin} 
                isGlobal={true}
              />
            </div>
          )}

          {selectedShip && !isAddingShip && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>{selectedShip.name} <span style={{fontSize:'1.1rem', color:'#94a3b8', fontWeight:500}}>관리 정보</span></h2>
              <ShipDashboard 
                ship={selectedShip} 
                config={config} 
                overallStats={selectedStats} 
                announcements={announcements}
                urlOrigin={urlOrigin} 
                onBack={() => setSelectedShipId('global')}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
