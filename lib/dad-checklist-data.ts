export type BadgeColor = 'red' | 'green' | 'blue' | 'gray'

export type DadItem = {
  id: string
  text: string
  sub?: string
  badge?: { text: string; color: BadgeColor }
}

export type DayGroup = {
  label: string
  items: DadItem[]
}

export type DadSection = {
  id: string
  emoji: string
  title: string
  days: DayGroup[]
}

export const DAD_CHECKLIST: DadSection[] = [
  {
    id: 's0',
    emoji: '🏥',
    title: '입원 중 (5박 6일)',
    days: [
      {
        label: 'D+0 · 수술 당일',
        items: [
          {
            id: 'd001',
            text: 'B형간염 1차 예방접종 완료 확인',
            sub: '출생 후 24시간 이내 병원에서 접종 — 완료 여부 직접 확인하고 기록지 받기',
            badge: { text: '병원 진행', color: 'blue' },
          },
          {
            id: 'd002',
            text: '신생아 선천성대사이상 검사 동의서 서명',
            sub: '입원 중 병원에서 진행, 서명 필요',
            badge: { text: '병원', color: 'blue' },
          },
          {
            id: 'd003',
            text: '출생증명서 발급 요청',
            sub: '출생신고·지원금 신청에 필요 — 여러 장 받아두기 (최소 3장 이상)',
            badge: { text: '필수', color: 'red' },
          },
        ],
      },
      {
        label: 'D+1~2',
        items: [
          {
            id: 'd004',
            text: 'BCG 예방접종 예약',
            sub: '생후 4주 이내 접종 필요, 피내법은 예약제 — 지금 바로 보건소 or 소아과 예약',
            badge: { text: '4주 이내 필수', color: 'red' },
          },
          {
            id: 'd005',
            text: '신생아 청각검사 결과지 수령',
            sub: '입원 중 병원에서 진행, 결과지 챙기기',
          },
          {
            id: 'd006',
            text: '조리원 이동 준비물 점검',
            sub: '산모 짐, 신생아 기저귀·옷 등 조리원 요청 리스트 확인',
          },
        ],
      },
      {
        label: '퇴원 당일',
        items: [
          {
            id: 'd007',
            text: '카시트 장착 확인',
            sub: '신생아 카시트 미리 장착 테스트, 조리원 이동 차량 준비',
            badge: { text: '없으면 퇴원 불가', color: 'red' },
          },
        ],
      },
    ],
  },
  {
    id: 's1',
    emoji: '📋',
    title: '출생신고 & 지원금 신청',
    days: [
      {
        label: '출생 후 — 생후 1개월 이내',
        items: [
          {
            id: 'd101',
            text: '출생신고',
            sub: '준비물: 출생증명서 원본, 신분증 → 주소지 동 행정복지센터 방문 or 정부24 온라인',
            badge: { text: '1개월 이내', color: 'red' },
          },
          {
            id: 'd102',
            text: '행복출산 원스톱 서비스 신청 (출생신고 동시에)',
            sub: '첫만남이용권·부모급여·아동수당 한 번에 신청 가능 — 절대 놓치지 말 것',
            badge: { text: '한번에 처리', color: 'green' },
          },
        ],
      },
      {
        label: '출생신고 직후 ~ 60일 이내 ⚠️ 놓치면 소급 불가',
        items: [
          {
            id: 'd103',
            text: '부모급여 신청',
            sub: '60일 이내 신청 시 출생월부터 소급지급 / 60일 초과 시 신청한 달부터만 지급 (수백만원 손해)',
            badge: { text: '0세 월 100만원', color: 'green' },
          },
          {
            id: 'd104',
            text: '첫만남이용권 신청',
            sub: '바우처로 지급, 출생일로부터 1년 사용 가능. 행복출산 원스톱으로 동시 신청 가능',
            badge: { text: '첫째 200만 / 둘째 300만', color: 'green' },
          },
          {
            id: 'd105',
            text: '아동수당 신청',
            sub: '만 8세 미만 전원 지급, 부모급여와 중복 수령 가능',
            badge: { text: '월 10만원', color: 'green' },
          },
        ],
      },
      {
        label: '출생일 기준 3개월 이내',
        items: [
          {
            id: 'd106',
            text: '지자체 탄생축하 지원 신청',
            sub: '동 행정복지센터 또는 정부24. 거주 지자체 혜택 확인 후 3개월 이내 신청',
            badge: { text: '지자체 특화', color: 'gray' },
          },
        ],
      },
      {
        label: '출생일 기준 12개월 이내',
        items: [
          {
            id: 'd107',
            text: '지자체 출산지원금 신청',
            sub: '1년 이상 거주 요건 확인. 동 행정복지센터 또는 정부24',
            badge: { text: '지자체별 상이', color: 'green' },
          },
          {
            id: 'd108',
            text: '경기도 출산축하금 신청 (경기도 거주 시)',
            sub: '온라인 신청 불가 — 반드시 관할 행정복지센터 방문 신청',
            badge: { text: '50만원 지역화폐', color: 'green' },
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    emoji: '💉',
    title: '예방접종 스케줄',
    days: [
      {
        label: '생후 4주 이내',
        items: [
          {
            id: 'd201',
            text: 'BCG (결핵, 불주사) 접종',
            sub: '피내법은 보건소 예약제 — 입원 중에 예약 잡아둘 것',
            badge: { text: '4주 이내 필수', color: 'red' },
          },
        ],
      },
      {
        label: '생후 1개월',
        items: [
          {
            id: 'd202',
            text: 'B형간염 2차 접종',
            sub: '소아과 방문',
          },
        ],
      },
      {
        label: '생후 2개월',
        items: [
          {
            id: 'd203',
            text: 'DTaP · IPV · Hib · 폐렴구균 · 로타바이러스 1차',
            sub: '한 번 방문으로 여러 백신 동시 접종 가능',
          },
        ],
      },
      {
        label: '생후 4개월',
        items: [
          {
            id: 'd204',
            text: 'DTaP · IPV · Hib · 폐렴구균 · 로타바이러스 2차',
          },
        ],
      },
      {
        label: '생후 6개월',
        items: [
          {
            id: 'd205',
            text: 'DTaP · IPV · Hib · 폐렴구균 · 로타바이러스 3차 + B형간염 3차',
          },
        ],
      },
    ],
  },
  {
    id: 's3',
    emoji: '🏠',
    title: '조리원 이후 & 기타',
    days: [
      {
        label: '되도록 빠르게',
        items: [
          {
            id: 'd301',
            text: '건강보험 피부양자 등재 (아기)',
            sub: '직장건강보험 가입자라면 회사 인사팀에 신생아 피부양자 추가 신청',
          },
          {
            id: 'd302',
            text: '국민행복카드 발급 확인',
            sub: '첫만남이용권·부모급여 바우처 수령에 필요 — 미발급 시 미리 발급',
          },
          {
            id: 'd303',
            text: '전기요금 출산 가정 할인 신청',
            sub: '한전 고객센터(123) 또는 한전 앱 — 출생일로부터 3년 이내 영아 있으면 30% 할인',
            badge: { text: '최대 월 16,000원', color: 'green' },
          },
          {
            id: 'd304',
            text: '육아휴직 신청 (해당 시)',
            sub: '고용24(work24.go.kr)에서 신청. 배우자 출산휴가 먼저 사용',
          },
          {
            id: 'd305',
            text: '무주택 가구 — 지자체 전월세 대출이자 지원 확인',
            sub: '기준 중위소득 150% 이하 무주택 출산가구 대상. 거주 지자체 혜택 확인',
            badge: { text: '해당 시', color: 'green' },
          },
        ],
      },
    ],
  },
]
