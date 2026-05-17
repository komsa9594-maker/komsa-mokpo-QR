/**
 * KOMSA MTIS Open API - 운항 일정 정보 헬퍼
 * API No. 35 - /api/oprt-schd-info
 */

const KOMSA_BASE = 'https://mtisopenapi.komsa.or.kr';

export type SailSchedule = {
  rlvt_ymd: string;         // 출항일자 (ex: 20240101)
  sail_tm: string;          // 출항시각 (ex: 1030)
  psnshp_nm: string;        // 여객선명
  psnshp_cd: string;        // 여객선코드
  oport_nm: string;         // 출항지명
  dest_nm: string;          // 도착지명
  lcns_seawy_nm: string;    // 면허항로명
  nvg_se_cd: string;        // 운항구분코드 (1:정상, 2:증선, 3:증회, 4:비운항, 5:통제, 6:대기/지연)
  nvg_se_nm: string;        // 운항구분명
  nvg_stts_nm: string;      // 운항상태명
  cntrl_rsn_cd: string;     // 통제사유코드
  cntrl_rsn_nm: string;     // 통제사유명
  nnavi_rsn_cd: string;     // 비운항사유코드
  nnavi_rsn_nm: string;     // 비운항사유명
  cnls_etc_rsn: string;     // 결항기타사유
};

/** 날짜를 YYYYMMDD 형식으로 반환 (KST 기준) */
function toDateString(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10).replace(/-/g, '');
}

/** 내일 날짜 (KST 기준) */
function getTomorrow(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return toDateString(now);
}

/** 오늘 날짜 (KST 기준) */
function getToday(): string {
  return toDateString(new Date());
}

/**
 * 특정 선박의 오늘 운항 일정을 가져옵니다.
 * 오늘 데이터가 없으면 내일 데이터를 반환합니다.
 */
export async function fetchShipSchedule(shipName: string): Promise<SailSchedule[] | null> {
  const apiKey = process.env.KOMSA_API_KEY;
  if (!apiKey) {
    console.warn('[KOMSA] API 키가 설정되지 않았습니다.');
    return null;
  }

  const today = getToday();
  const tomorrow = getTomorrow();

  // 오늘 일정 먼저 조회
  const schedules = await fetchScheduleByDate(shipName, today, apiKey);
  if (schedules && schedules.length > 0) return schedules;

  // 오늘 데이터가 없으면 내일 조회
  return fetchScheduleByDate(shipName, tomorrow, apiKey);
}

async function fetchScheduleByDate(
  shipName: string,
  date: string,
  apiKey: string
): Promise<SailSchedule[] | null> {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: '1',
    numOfRows: '20',
    rlvtYmd: date,
    psnshpNm: shipName,
  });

  const url = `${KOMSA_BASE}/eopt/api/oprt-schd-info?${params.toString()}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store', // 캐시 없이 항상 최신 데이터 조회
    });

    if (!res.ok) {
      console.error(`[KOMSA] API 오류: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    // 오류 코드 체크 - KOMSA 성공 코드는 '200' (NORMAL_SERVICE)
    const header = data?.response?.header;
    if (!header) return null;
    
    if (header.resultMsg === 'NOT_FOUND_DATA' || header.resultCode === '153') {
      // 해당 날짜에 데이터 없음 (정상적인 상황)
      return [];
    }
    
    if (header.resultMsg !== 'NORMAL_SERVICE') {
      console.warn(`[KOMSA] API 오류: ${header.resultCode} - ${header.resultMsg}`);
      return null;
    }

    // 다양한 응답 구조 처리
    const body = data?.response?.body;
    let items = null;
    if (body?.items?.item) {
      items = Array.isArray(body.items.item) ? body.items.item : [body.items.item];
    } else if (Array.isArray(data)) {
      items = data;
    } else if (data?.list && Array.isArray(data.list)) {
      items = data.list;
    }

    if (items) {
      // 출항 시각(sail_tm) 기준으로 오름차순 정렬
      return items.sort((a: any, b: any) => {
        const timeA = parseInt(a.sail_tm || '0', 10);
        const timeB = parseInt(b.sail_tm || '0', 10);
        return timeA - timeB;
      });
    }

    return null;
  } catch (e) {
    console.error('[KOMSA] 네트워크 오류:', e);
    return null;
  }
}

/** 운항 구분 코드를 한국어 레이블 + 색상으로 변환 */
export function getStatusInfo(schedule: SailSchedule | null | undefined): {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  reason?: string;
} {
  if (!schedule) {
    return {
      label: '정보 준비 중',
      emoji: '⏳',
      color: '#64748b',
      bgColor: '#f1f5f9',
    };
  }

  const code = schedule.nvg_se_cd;
  const labelText = schedule.nvg_stts_nm || schedule.nvg_se_nm || '';
  const reason =
    schedule.cntrl_rsn_nm ||
    schedule.nnavi_rsn_nm ||
    schedule.cnls_etc_rsn ||
    undefined;

  // 1. 키워드 기반 정상 판별
  const isHealthy = 
    labelText.includes('정상') || 
    labelText.includes('완료') || 
    labelText.includes('운항중') || 
    labelText.includes('증선') || 
    labelText.includes('증회') ||
    ['1', '2', '3'].includes(code || '');

  if (isHealthy) {
    return { 
      label: '정상 운항', 
      emoji: '🟢', 
      color: '#16a34a', 
      bgColor: '#dcfce7', 
      reason: undefined 
    };
  }

  // 2. 비정상 상태 처리
  switch (code) {
    case '4': // 비운항
      return { label: '비운항', emoji: '🔴', color: '#991b1b', bgColor: '#fee2e2', reason };
    case '5': // 통제
      return { label: '운항 통제', emoji: '⛔', color: '#991b1b', bgColor: '#fee2e2', reason };
    case '6': // 대기/지연 (위의 Healthy 체크를 통과하지 못한 진짜 지연)
      return { label: '대기 / 지연', emoji: '🟡', color: '#92400e', bgColor: '#fef9c3', reason };
    default:
      return { label: labelText || '정보 준비 중', emoji: '⏳', color: '#64748b', bgColor: '#f1f5f9', reason };
  }
}

/** 출항시각 포맷 (1030 → 10:30, 100 → 01:30 아님 01:00) */
export function formatTime(sail_tm: string): string {
  if (!sail_tm) return '';
  const padded = sail_tm.padStart(4, '0');
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
}

/** 기준일자 포맷 (20260320 → 3월 20일) */
export function formatDate(rlvt_ymd: string): string {
  if (!rlvt_ymd || rlvt_ymd.length !== 8) return '';
  const month = parseInt(rlvt_ymd.slice(4, 6), 10);
  const day = parseInt(rlvt_ymd.slice(6, 8), 10);
  return `${month}월 ${day}일`;
}
