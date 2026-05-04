export type WeekInfo = {
  milestone?: string       // 이 주차의 핵심 이벤트
  tips: string[]           // 일반 팁/안내
  checkup?: string         // 이번 주 전후 검사/병원 방문
  caution?: string         // 주의사항
}

// 의학적으로 중요한 주차에만 상세 데이터
const WEEK_DATA: Record<number, WeekInfo> = {
  4: {
    milestone: '임신 초기 확인 시기',
    tips: ['소변 임신테스트가 양성으로 나오기 시작하는 시기예요', '엽산 복용을 시작하거나 계속 유지해 주세요 (신경관 결손 예방)'],
    checkup: '산부인과 첫 방문 예약 (6~7주 목표)',
    caution: '과격한 운동, 음주, 흡연은 즉시 중단해 주세요',
  },
  5: {
    milestone: '심장박동 확인 시기',
    tips: ['초음파로 태낭과 난황낭이 보이기 시작해요', '입덧이 시작되는 경우가 많아요 — 소량씩 자주 드세요'],
    checkup: '산부인과 방문 — 심장박동 확인 초음파',
  },
  6: {
    tips: ['태아 심장박동이 초음파로 확인돼요', '입덧이 심해지는 시기, 냄새에 예민해질 수 있어요'],
    checkup: '첫 산전 혈액검사 (혈액형, 빈혈, 감염 등)',
  },
  8: {
    tips: ['태아가 콩알만 해졌어요 (약 1.6cm)', '피로감이 심할 수 있으니 충분히 쉬어 주세요'],
    checkup: '기본 산전 혈액검사, 소변검사',
  },
  11: {
    milestone: '1차 기형아 검사 시기',
    tips: ['NT 초음파(목덜미 투명대 검사)를 받을 수 있는 마지막 시기예요', '혈액검사와 함께 다운증후군 등 선별검사 가능'],
    checkup: '1차 기형아 검사 (11~13주 사이 — 미루지 마세요)',
  },
  12: {
    milestone: '입덧 완화 시작',
    tips: ['입덧이 줄어들기 시작하는 시기예요', '태반이 거의 완성되어 안정기에 접어들어요'],
    checkup: '1차 기형아 검사 마감 시기 (13주 이전)',
  },
  13: {
    milestone: '2분기(임신중기) 시작!',
    tips: ['입덧이 크게 줄어들고 활동하기 편해지는 시기예요', '태아 성별이 초음파로 보이기 시작해요 (아직 불확실)'],
  },
  16: {
    tips: ['태동을 처음 느끼는 임산부도 있어요 (처음엔 방귀 같은 느낌)'],
    checkup: '양수검사 가능 시기 (원할 경우), 2차 기형아 혈액검사',
  },
  18: {
    milestone: '정밀 초음파 준비',
    tips: ['태아 주요 장기와 구조를 확인하는 정밀 초음파를 받을 시기예요', '태동이 확실하게 느껴지기 시작해요'],
    checkup: '정밀 초음파 예약 (18~20주)',
  },
  20: {
    milestone: '정밀 초음파',
    tips: ['태아 심장, 뇌, 척추, 사지 등 주요 구조 확인', '태반 위치(전치태반 여부)도 이때 확인해요'],
    checkup: '정밀 초음파 — 이 시기를 넘기지 마세요',
  },
  24: {
    milestone: '임신성 당뇨 검사',
    tips: ['임신성 당뇨는 증상이 없어도 발생할 수 있어요', '검사 전 공복이 필요 없는 50g 선별검사예요'],
    checkup: '임신성 당뇨 검사 (24~28주 사이)',
    caution: '임신성 당뇨가 있으면 식이조절과 추가 관리가 필요해요',
  },
  28: {
    milestone: '3분기(임신말기) 시작!',
    tips: ['태아가 빠르게 자라면서 허리·골반 통증이 생길 수 있어요', '태동 횟수를 체크하는 습관을 시작하세요 (2시간에 10회 이상)'],
    caution: '조기진통 증상(규칙적인 배뭉침, 출혈)이 있으면 즉시 병원으로',
  },
  32: {
    tips: ['태아 머리가 아래쪽으로 내려오는 시기예요', '2차 정밀 초음파로 태아 성장과 위치 확인'],
    checkup: '2차 정밀 초음파 (32~34주)',
  },
  35: {
    milestone: '출산 준비 시작',
    tips: ['GBS(B군 연쇄상구균) 검사를 받아요', '출산가방 챙기기, 입원 서류 준비 시작할 시기예요'],
    checkup: 'GBS 검사, 골반 내진 시작',
  },
  36: {
    tips: ['매주 산부인과 방문이 시작돼요', '모유수유 교육, 출산교실 참여 추천'],
    checkup: '주 1회 산전 검진 시작',
  },
  37: {
    milestone: '만삭!',
    tips: ['37주부터 만삭이에요 — 언제 진통이 와도 정상이에요', '진통 패턴 익히기: 규칙적 10분 간격 수축이 시작되면 병원으로'],
    caution: '이슬(분홍빛 점액), 양수 파수, 규칙적 진통 — 3가지 중 하나라도 있으면 병원',
  },
  38: {
    tips: ['태아가 골반 아래로 내려와 숨쉬기가 조금 편해질 수 있어요', '출산가방 최종 점검 완료!'],
    caution: '단독 외출 시 연락처를 꼭 공유해 두세요',
  },
  40: {
    milestone: '출산 예정일',
    tips: ['예정일이 지나도 42주까지는 정상 범위예요 — 너무 걱정 마세요', '의사와 유도분만 시기를 상의하게 될 수 있어요'],
    checkup: '태동 모니터링 강화, 병원 방문 주기 증가',
  },
}

// 분기별 기본 팁 (특정 주차 데이터 없을 때)
const TRIMESTER_DEFAULTS: Record<'first' | 'second' | 'third', WeekInfo> = {
  first: {
    tips: ['엽산 섭취를 꾸준히 해주세요', '과로를 피하고 충분히 쉬어 주세요', '카페인은 하루 200mg 이하로 제한해요'],
    caution: '복통, 출혈이 있으면 즉시 병원으로',
  },
  second: {
    tips: ['가장 활동하기 편한 시기예요', '태동을 처음 느끼면 날짜를 기록해두세요', '철분제 복용을 시작하거나 유지해 주세요'],
  },
  third: {
    tips: ['숙면이 어려워질 수 있어요 — 왼쪽으로 누워 자는 게 좋아요', '출산교실, 모유수유 교육 참여를 추천해요', '태동이 갑자기 줄어들면 즉시 병원으로'],
    caution: '조기진통 증상에 주의하세요',
  },
}

export function getWeekInfo(week: number): WeekInfo {
  // 가장 가까운 데이터가 있는 주차 탐색 (해당 주 ±2 범위)
  for (let delta = 0; delta <= 2; delta++) {
    if (WEEK_DATA[week - delta]) return WEEK_DATA[week - delta]
    if (delta > 0 && WEEK_DATA[week + delta]) return WEEK_DATA[week + delta]
  }
  // 분기 기본값
  if (week <= 12) return TRIMESTER_DEFAULTS.first
  if (week <= 27) return TRIMESTER_DEFAULTS.second
  return TRIMESTER_DEFAULTS.third
}

export function getCategory(week: number): { name: string; slug: string } | null {
  if (week <= 12) return { name: '임신초기', slug: 'pregnancy-early' }
  if (week <= 27) return { name: '임신중기', slug: 'pregnancy-mid' }
  if (week <= 40) return { name: '임신말기', slug: 'pregnancy-late' }
  return null
}

export function getTrimesterLabel(week: number): string {
  if (week <= 12) return '1분기'
  if (week <= 27) return '2분기'
  return '3분기'
}
