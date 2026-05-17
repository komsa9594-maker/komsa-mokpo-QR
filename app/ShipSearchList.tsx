'use client';

import React, { useState } from 'react';
import { Search, Compass, MapPin, Navigation, Star, ShieldAlert } from 'lucide-react';
import { getShipRouteInfo } from './lib/shipRoutes';

export default function ShipSearchList({ initialShips }: { initialShips: any[] }) {
  const [query, setQuery] = useState('');

  // 1. 선박 데이터에 항로/기항지 정적 정보 추가
  const shipsWithRoutes = initialShips.map(ship => {
    const routeInfo = getShipRouteInfo(ship.name);
    return {
      ...ship,
      route: routeInfo.route,
      ports: routeInfo.ports
    };
  });

  // 2. 검색 필터링 로직
  const filteredShips = shipsWithRoutes.filter(ship => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return true;

    // 선박명 매칭
    const nameMatch = ship.name.toLowerCase().includes(cleanQuery);
    // 항로 매칭
    const routeMatch = ship.route.toLowerCase().includes(cleanQuery);
    // 기항지 매칭
    const portMatch = ship.ports.some((port: string) => port.toLowerCase().includes(cleanQuery));

    return nameMatch || routeMatch || portMatch;
  });

  // 주요 선박 (목포 대표 대형 여객선)
  const popularShips = shipsWithRoutes.filter(ship => 
    ['퀸메리', '퀸제누비아', '퀸제누비아2', '산타모니카', '핑크돌핀호', '동양골드'].includes(ship.name)
  );

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* 🔍 검색 바 영역 */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div style={{
          position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
          color: '#94a3b8', display: 'flex', alignItems: 'center'
        }}>
          <Search size={22} />
        </div>
        <input
          type="text"
          placeholder="선박명, 목적지, 또는 항로명 검색 (예: 제주, 홍도)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.2rem',
            fontSize: '1.05rem', fontWeight: 700,
            border: 'none', borderRadius: '24px',
            background: '#ffffff', color: '#1e293b',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            outline: 'none', transition: 'all 0.3s ease',
            borderBottom: '2px solid transparent'
          }}
          className="search-input"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)',
              border: 'none', background: '#f1f5f9', color: '#64748b',
              width: '24px', height: '24px', borderRadius: '50%',
              fontSize: '12px', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ⭐ 자주 찾는 주요 여객선 (검색어가 없을 때만 노출) */}
      {!query && popularShips.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{
            fontSize: '0.9rem', color: '#64748b', fontWeight: 800,
            marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Star size={16} color="#eab308" fill="#eab308" /> 자주 찾는 주요 여객선
          </h3>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {popularShips.map((ship) => (
              <a
                key={ship.id}
                href={`/${encodeURIComponent(ship.urlSlug)}`}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e911 0%, #3b82f611 100%)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  color: '#0284c7', padding: '10px 18px', borderRadius: '16px',
                  fontSize: '0.9rem', fontWeight: 800, textDecoration: 'none',
                  transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.05)';
                }}
              >
                🚢 {ship.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 🚢 검색 결과 리스트 */}
      <div>
        <h3 style={{
          fontSize: '0.9rem', color: '#64748b', fontWeight: 800,
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Compass size={16} color="#0284c7" /> 
          {query ? `검색 결과 (${filteredShips.length}대)` : `전체 여객선 (${shipsWithRoutes.length}대)`}
        </h3>

        {filteredShips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {filteredShips.map((ship) => (
              <a
                key={ship.id}
                href={`/${encodeURIComponent(ship.urlSlug)}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.2rem 1.5rem', background: '#ffffff', borderRadius: '24px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)',
                  textDecoration: 'none', color: 'inherit',
                  border: '1px solid #f1f5f9', transition: 'all 0.3s ease'
                }}
                className="ship-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '16px',
                    background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#16a34a'
                  }}>
                    🚢
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 900, color: '#1e293b' }}>
                      {ship.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <span style={{
                        fontSize: '0.78rem', color: '#0284c7', fontWeight: 800,
                        background: '#e0f2fe', padding: '3px 8px', borderRadius: '8px',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Navigation size={10} /> {ship.route}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontWeight: 800, fontSize: '0.85rem' }}>
                  바로가기 <span style={{ fontSize: '1.1rem', color: '#0284c7' }}>➔</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem', background: '#ffffff',
            borderRadius: '24px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.02)',
            color: '#64748b', border: '1px dashed #e2e8f0'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <h4 style={{ fontWeight: 800, margin: '0 0 0.5rem 0', color: '#334155' }}>검색 결과가 없습니다</h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>선박 이름이나 목적지(예: 제주, 홍도 등)를 정확히 입력하셨는지 확인해 주세요.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .search-input:focus {
          box-shadow: 0 10px 35px rgba(2, 132, 199, 0.12) !important;
          border-bottom: 2px solid #0284c7 !important;
        }
      `}</style>
    </div>
  );
}
