/**
 * 기상청 해상예보 조회 (KMA Sea Forecast)
 * 각 선박의 weatherRegId를 기반으로 실시간 파고, 풍속 데이터를 가져옵니다.
 */

export type SeaWeather = {
  wf: string;        // 날씨 (맑음, 구름많음 등)
  whMin: string;     // 최소 파고 (m)
  whMax: string;     // 최대 파고 (m)
  wd: string;        // 풍향
  wsMin: string;     // 최소 풍속 (m/s)
  wsMax: string;     // 최대 풍속 (m/s)
  regName: string;   // 예보 구역명
  tm: string;        // 발표 시각
};

export async function fetchSeaWeather(regId: string): Promise<SeaWeather | null> {
  const apiKey = process.env.METEOROLOGICAL_AUTH_KEY;
  const targetReg = regId || '12A30100';
  
  // API 키가 정말 없거나 기본값이면 더미 데이터 반환
  if (!apiKey || apiKey === 'YOUR_KMA_API_KEY' || apiKey.length < 10) {
    return simulateWeather(targetReg);
  }

  // 기상청 API 허브: 단기해상예보 (fct_afs_do.php)
  // disp=1 (쉼표 구분), help=0 (도움말 제외)
  const url = `https://apihub.kma.go.kr/api/typ01/url/fct_afs_do.php?reg=${targetReg}&disp=0&help=0&authKey=${apiKey}`;

  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error('Weather API response not ok');
    
    const text = await res.text();
    
    // 데이터 라인 파싱 (# 주석 제외 및 유효 줄 찾기)
    // 공백으로 구분된 데이터를 필터링합니다.
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('{'));

    if (lines.length > 0) {
      // 공백(하나 이상)을 기준으로 컬럼 분리
      const cols = lines[0].split(/\s+/);
      
      if (cols.length >= 15) {
        // disp=0 기준 컬럼 인덱스:
        // 0:REG_ID, 1:TM_FC, 2:TM_EF, 3:MOD, 4:NE, 5:STN, 6:C, 7:MAN_ID, 8:MAN_FC, 9:W1, 10:T, 11:W2, 12:S1, 13:S2, 14:WH1, 15:WH2, 16:SKY, 17:PREP, 18:WF
        return {
          wf: cols[18] || '정보없음',
          whMin: cols[14] || '0.5',
          whMax: cols[15] || '1.5',
          wd: cols[9] || '변수',
          wsMin: cols[12] || '5',
          wsMax: cols[13] || '10',
          regName: getRegionName(targetReg),
          tm: (cols[1] ? formatKmaTime(cols[1]) : '방금') + ' 발표'
        };
      }
    }

    // 만약 활용 신청 대기 중이거나 데이터가 비어 있으면 시뮬레이션 결과 반환
    return simulateWeather(targetReg);
  } catch (e) {
    console.error('[Weather] API Fetch Error:', e);
    return simulateWeather(targetReg);
  }
}

/** KMA 시간 형식 변환 (202603271200 -> 12:00) */
function formatKmaTime(tm: string): string {
  if (tm.length < 12) return tm;
  return `${tm.slice(8, 10)}:${tm.slice(10, 12)}`;
}

/** 구역 코드 매핑 */
function getRegionName(regId: string): string {
  const regNames: Record<string, string> = {
    '12A30100': '서해남부앞바다',
    '22A30103': '전남북부서해앞바다',
    '22A30104': '전남중부서해앞바다',
    '22A30105': '전남남부서해앞바다',
    '12A30211': '서해남부먼바다',
  };
  return regNames[regId] || '해상';
}

/** 
 * API 키가 없거나 연동 전일 때 하단에 띄워줄 테스트용 데이터 
 * (현실적인 수치를 위해 랜덤성을 약간 부여)
 */
function simulateWeather(regId: string): SeaWeather {
  const regNames: Record<string, string> = {
    '12A30100': '서해남부앞바다',
    '22A30103': '전남북부서해앞바다',
    '22A30104': '전남중부서해앞바다',
    '22A30105': '전남남부서해앞바다',
    '12A30211': '서해남부북쪽안쪽먼바다',
  };

  const name = regNames[regId] || '서해남부앞바다';
  const hours = new Date().getHours();
  
  // 시간에 따라 약간씩 다른 날씨 반환
  const wfList = ['맑음', '구름많음', '흐림', '흐리고 한때 비'];
  const wf = wfList[hours % 4];
  
  return {
    wf,
    whMin: (0.5 + Math.random() * 0.5).toFixed(1),
    whMax: (1.5 + Math.random() * 0.5).toFixed(1),
    wd: '북서-북',
    wsMin: '7',
    wsMax: '12',
    regName: name,
    tm: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 발표'
  };
}
