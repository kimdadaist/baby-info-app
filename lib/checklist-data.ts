export type Timing = '출산전' | '조리원' | '출산후'

export type ChecklistItem = {
  id: string
  category: string
  name: string
  timing: Timing[]
  tip?: string
}

export const CHECKLIST: ChecklistItem[] = [
  // 기본 의류
  { id: 'c01', category: '기본 의류', name: '배냇저고리', timing: ['출산전'], tip: '선물 확인 후 구매' },
  { id: 'c02', category: '기본 의류', name: '배냇+모자세트', timing: ['출산전'], tip: '태열이 있으니 무조건 얇은것으로 구매' },
  { id: 'c03', category: '기본 의류', name: '바디슈트(실내용)', timing: ['출산전'] },
  { id: 'c04', category: '기본 의류', name: '우주복 (외출용)', timing: ['출산후'] },
  { id: 'c05', category: '기본 의류', name: '손싸개', timing: ['출산전'], tip: '손톱이 날카로워서 긁히므로 50일 전까지 손을 싸놓음' },
  { id: 'c06', category: '기본 의류', name: '발싸개 (양말)', timing: ['출산전'], tip: '발이 차가울 때, 잘 때 보통 신겨놓음' },
  { id: 'c07', category: '기본 의류', name: '신생아 모자', timing: ['출산전'], tip: '딸꾹질 할 때 씌우기도 하는데 1개면 충분' },
  { id: 'c08', category: '기본 의류', name: '스와들업', timing: ['조리원'], tip: '아기 잘 때 모로반사로 놀라기 때문에 속싸개로 싸매는데, 스와들업은 지퍼형식이라 속싸개보다 입히고 유지하는데 편리함. 짧게 쓰기 때문에 2~3개만 구입 추천. 신생아 태열로 메쉬재질 or 하프(상체만) 추천' },
  { id: 'c09', category: '기본 의류', name: '거즈손수건', timing: ['출산전'], tip: '얼굴, 예민한곳' },
  { id: 'c10', category: '기본 의류', name: '엠보손수건', timing: ['출산전'], tip: '엉덩이, 몸 닦을 때' },
  { id: 'c11', category: '기본 의류', name: '기저귀', timing: ['조리원'], tip: '조리원에서 사이즈 물어보고 주문하기. 신생아는 1~2단계 정도' },
  { id: 'c12', category: '기본 의류', name: '천기저귀', timing: ['출산전'], tip: '속싸개, 담요, 목욕가운, 유모차 덮개 등 다용도' },
  { id: 'c13', category: '기본 의류', name: '건티슈', timing: ['출산전'], tip: '레이온 건티슈' },
  { id: 'c14', category: '기본 의류', name: '턱받이', timing: ['출산후'], tip: '3개월 이후 부터 사용' },

  // 분유 용품
  { id: 'f01', category: '분유 용품', name: '젖병', timing: ['조리원'], tip: '신생아 기준 2~3시간에 1번씩 먹기때문에 8개정도 사두면 편리. 닥터브라운 - 배앓이 방지 젖병으로 유명. 2개 구매 후 아이랑 잘 맞으면 추가 구매' },
  { id: 'f02', category: '분유 용품', name: '젖꼭지', timing: ['조리원'], tip: '아기 개월수에 따라 단계를 올려야 함. 신생아는 SS부터 준비하는게 좋음. 조리원에서 쓰던 젖병 추천' },
  { id: 'f03', category: '분유 용품', name: '젖병 솔', timing: ['출산전'], tip: '젖병 뿐만아니라 세척기 깔대기 청소 등에도 필요' },
  { id: 'f04', category: '분유 용품', name: '젖병 집게', timing: ['출산전'] },
  { id: 'f05', category: '분유 용품', name: '젖병 소독기', timing: ['출산전'], tip: 'UV 소독기(유팡, 스펙트라) or 열탕소독기(필립스) 중 선택. UV 소독기는 이유식 먹일 때 식기 소독에도 사용' },
  { id: 'f06', category: '분유 용품', name: '분유포트', timing: ['출산전'], tip: '100도로 끓인 물을 45도로 식혀서 사용해야 함. 뜨거운 물을 식혀서 유지할 수 있는 것으로 추천' },
  { id: 'f07', category: '분유 용품', name: '분유제조기', timing: ['출산전'], tip: '물+분유 넣어놓고 버튼 > 분유 완성. 분유 수유시 추천. 단점은 잦은 부품 세척' },
  { id: 'f08', category: '분유 용품', name: '젖병세척기', timing: ['출산전'], tip: '계속 기능이 업그레이드 되기 때문에 최신 제품 추천' },
  { id: 'f09', category: '분유 용품', name: '분유', timing: ['조리원'], tip: '조리원 분유를 이어서 쓰는 경우가 많음' },
  { id: 'f10', category: '분유 용품', name: '쪽쪽이', timing: ['출산후'], tip: '생후 30일 이후 사용 권장. 하나 구매 후 아기가 잘 물면 추가 구매' },
  { id: 'f11', category: '분유 용품', name: '치발기', timing: ['출산후'], tip: '출산 후 사도 됨 (3개월부터 사용)' },
  { id: 'f12', category: '분유 용품', name: '이앓이 방지 치발기', timing: ['출산후'], tip: '이앓이 때 치발기 얼려놓고 사용' },
  { id: 'f13', category: '분유 용품', name: '과즙망', timing: ['출산후'], tip: '이앓이 불편함을 줄이기 위한 방법. 과즙망에 분유를 얼려서 사용하기도 함' },
  { id: 'f14', category: '분유 용품', name: '비타민D + 유산균', timing: ['출산전'] },

  // 수유 용품
  { id: 'n01', category: '수유 용품', name: '수유쿠션', timing: ['출산전'], tip: '분유는 필요없음 / 모유수유 시 추천' },
  { id: 'n02', category: '수유 용품', name: '수유시트', timing: ['출산전'], tip: '아기 수유할 때 자세 잡아주는 시트. 메쉬 소재로 추천' },
  { id: 'n03', category: '수유 용품', name: '역류방지쿠션', timing: ['조리원'], tip: '쿠션 각도가 아이 기도를 막히게 할 수 있기 때문에 잘 골라야 함' },
  { id: 'n04', category: '수유 용품', name: '수유등', timing: ['조리원'], tip: '새벽 수유 시 사용. 버튼 말고 터치로 켜지는 등으로 구입 추천 (새벽에 정신없음)' },
  { id: 'n05', category: '수유 용품', name: '백색소음기', timing: ['조리원'] },

  // 산모용품
  { id: 'm01', category: '산모용품', name: '맘스 안심팬티', timing: ['출산전'], tip: '출산 후 한달간은 오로가 많이 나와서 착용 필요 (대형 생리대도 가능)' },
  { id: 'm02', category: '산모용품', name: '수면 양말', timing: ['출산전'] },
  { id: 'm03', category: '산모용품', name: '비데 티슈', timing: ['출산전'] },
  { id: 'm04', category: '산모용품', name: '종아리 마사지기', timing: ['출산전'] },
  { id: 'm05', category: '산모용품', name: '유축 깔대기', timing: ['출산전'], tip: '조리원꺼 확인 후 구매' },
  { id: 'm06', category: '산모용품', name: '손목 보호대', timing: ['출산전'], tip: '출산 후 관절이 약해져서 착용 필수. 예방용으로 출산 후 미리미리 차고 다니기' },
  { id: 'm07', category: '산모용품', name: '복대 (허리보호대)', timing: ['출산전'], tip: '허리가 안 아파도 예방용으로 미리 착용' },
  { id: 'm08', category: '산모용품', name: '종아리압박밴드', timing: ['출산전'] },
  { id: 'm09', category: '산모용품', name: '양배추가슴팩', timing: ['출산전'], tip: '단유용 쿨링 팩' },

  // 침구류
  { id: 'b01', category: '침구류', name: '신생아침대', timing: ['출산전'], tip: '사용기간이 짧으니 당근하기. 나눔도 있다함' },
  { id: 'b02', category: '침구류', name: '아기침대', timing: ['조리원'], tip: '프리미엄 사이즈 기준 외경 110X165 / 내경 90x150' },
  { id: 'b03', category: '침구류', name: '침대 패드 (토퍼)', timing: ['조리원'] },
  { id: 'b04', category: '침구류', name: '방수패드', timing: ['출산전'], tip: '건조기 가능으로 구매. 침대, 기저귀갈이대에도 깔아두기' },
  { id: 'b05', category: '침구류', name: '냉감패드', timing: ['출산전'] },
  { id: 'b06', category: '침구류', name: '블랭킷', timing: ['출산후'], tip: '신생아는 질식사 위험이 있어서 이불을 사용하지 않음. 천기저귀/겉싸개로 대체 가능' },
  { id: 'b07', category: '침구류', name: '짱구 두상 베개', timing: ['출산후'], tip: '신생아때는 사용 추천 안함. 라라스베개, 신생아 두상베개 (7개월 이후 추천)' },
  { id: 'b08', category: '침구류', name: '라라스베개', timing: ['출산후'], tip: '옆잠베개. 태어난 후 상황에 따라 구입' },
  { id: 'b09', category: '침구류', name: '좁쌀이불', timing: ['출산후'], tip: '양쪽에 좁쌀이 있어서 모로반사 방지템. 신생아가 잠을 자주 깰 때 사용' },
  { id: 'b10', category: '침구류', name: '원형러그', timing: ['출산후'] },
  { id: 'b11', category: '침구류', name: '땀패드', timing: ['출산후'], tip: '손수건으로 대체 가능' },

  // 세탁/세정
  { id: 'w01', category: '세탁/세정', name: '유아세탁세제', timing: ['출산전'], tip: '핫딜 자주 있으니 맘카페 알림 등록 후 구매. 안전성 및 유해성분 확인 뒤 엄마옷+아기옷 같은 세제로 사용 추천' },
  { id: 'w02', category: '세탁/세정', name: '유아섬유유연제', timing: ['출산전'], tip: '신생아의 경우 유연제는 잘 안 씀' },
  { id: 'w03', category: '세탁/세정', name: '얼룩제거제', timing: ['출산전'] },
  { id: 'w04', category: '세탁/세정', name: '젖병세정제', timing: ['출산전'], tip: '젖병은 무조건 찬물로 씻어야 함 (단백질 성분)' },
  { id: 'w05', category: '세탁/세정', name: '아기세탁망', timing: ['출산전'], tip: '무형광 세탁망, 사이즈별 준비. 손싸개, 모자 등을 넣고 돌리는 용도' },
  { id: 'w06', category: '세탁/세정', name: '세탁조클리너', timing: ['출산전'], tip: '세탁기에 어른용 세제가 남아 있는 경우가 있어서, 세탁조클리너로 청소 추천' },

  // 목욕 용품
  { id: 'ba01', category: '목욕 용품', name: '아기 욕조', timing: ['출산전'], tip: '온다베이비 플러스' },
  { id: 'ba02', category: '목욕 용품', name: '아기 수전', timing: ['출산전'], tip: '세면대에서 아기 대변 후 씻기기 편리' },
  { id: 'ba03', category: '목욕 용품', name: '아기 비데', timing: ['출산전'], tip: '세면대에서 아기 대변 후 씻기기 편리. 설치가능한지 확인 필요' },
  { id: 'ba04', category: '목욕 용품', name: '수전', timing: [] },
  { id: 'ba05', category: '목욕 용품', name: '바디워시/샴푸', timing: ['출산전'] },
  { id: 'ba06', category: '목욕 용품', name: '엉덩이 클렌저', timing: ['출산전'], tip: '아기 응가가 생식기쪽까지 퍼지는 경우가 많음. 성분이 좋은 제품으로 구입' },
  { id: 'ba07', category: '목욕 용품', name: '로션/크림', timing: ['출산전'], tip: '태열,아토피 방지로 보습에 신경. 에스테라 아토베리어365 크림 (의사 선생님 추천)' },
  { id: 'ba08', category: '목욕 용품', name: '비판텐 연고', timing: ['조리원'], tip: '기저귀 발진/습진/침독나면 구매' },
  { id: 'ba09', category: '목욕 용품', name: '란시노/라놀린 크림', timing: ['출산후'], tip: '유두보호크림. 아기 피부, 입술 틀 때 등 다양하게 바를 수 있음. 태열에도 효과가 있다고 함' },
  { id: 'ba10', category: '목욕 용품', name: '아기욕조 세정제', timing: ['조리원'], tip: '목욕하고 욕조 정리할 때, 세정제 한번 뿌리고 헹구고 말리기' },
  { id: 'ba11', category: '목욕 용품', name: '탕온계', timing: ['출산전'], tip: '목욕물은 보통 38도 정도로 맞춤' },
  { id: 'ba12', category: '목욕 용품', name: '구강티슈', timing: ['출산후'], tip: '분유 먹으면 혀에 백태가 끼는데 관리용. 이 나올때 조그만 이 닦아주는 용' },
  { id: 'ba13', category: '목욕 용품', name: '손가락 칫솔', timing: ['출산후'], tip: '이 나올 때, 손가락 넣어서 닦아주는 용도' },

  // 위생 용품
  { id: 'h01', category: '위생 용품', name: '체온계', timing: ['출산전'], tip: '핫딜 4-5만원대, 맘카페 알림 등록 후 구매' },
  { id: 'h02', category: '위생 용품', name: '온/습도계', timing: ['출산전'], tip: '방 온도 22~24도 정도 유지, 습도 50~60% 유지. 보통 아이방과 거실 (1+1 기준)' },
  { id: 'h03', category: '위생 용품', name: '신생아 손톱관리', timing: ['출산전'], tip: '손톱깍기 대신 트리머를 쓰기도 함 / 개인 취향' },
  { id: 'h04', category: '위생 용품', name: '신생아 면봉', timing: ['출산전'], tip: '코딱지 빼거나, 약 바를 때 활용 (점착면봉 1통만 있어도 될 듯)' },
  { id: 'h05', category: '위생 용품', name: '코튼볼 (소독)', timing: ['출산전'], tip: '신생아 배꼽 소독용으로 필요' },
  { id: 'h06', category: '위생 용품', name: '소독 티슈', timing: ['출산전'] },
  { id: 'h07', category: '위생 용품', name: '소독 스프레이', timing: [] },
  { id: 'h08', category: '위생 용품', name: '콧물 흡입기', timing: ['출산후'], tip: '중고 금지 품목(의약품). 초딩때까지 사용 가능하니 구매' },
  { id: 'h09', category: '위생 용품', name: '아기타올', timing: [], tip: '엠보 손수건/천기저귀로 대체 가능' },

  // 외출 용품
  { id: 'o01', category: '외출 용품', name: '유모차', timing: ['출산후'], tip: '생활패턴에 따라 차이가 커서 확인 후 구매' },
  { id: 'o02', category: '외출 용품', name: '유모차라이너', timing: ['출산후'], tip: '유모차 쓸때 머리가 덜렁거림 / 잡아주는 용도. 세탁 가능한 제품 추천' },
  { id: 'o03', category: '외출 용품', name: '휴대용기저귀패드', timing: ['출산후'], tip: '공공장소 기저귀갈이대에서 사용' },
  { id: 'o04', category: '외출 용품', name: '아기띠', timing: ['출산후'], tip: '매쉬로 되어있는 것으로 사용 / 올인원으로 사면 나눠살 필요 없음. 포그내 (아기띠/힙시트겸용)' },
  { id: 'o05', category: '외출 용품', name: '신생아 바구니카시트', timing: ['출산전'], tip: '조리원에서 집으로 갈 때 활용. 사용시기가 짧으니 당근 또는 네이버 대여 추천' },
  { id: 'o06', category: '외출 용품', name: '카시트', timing: ['출산후'], tip: '최소 100일 이후 권장. 안전과 직결되는 거니 좋은걸로 구매' },

  // 기타 용품
  { id: 'e01', category: '기타 용품', name: '기저귀갈이대', timing: ['출산전'], tip: '엄마 허리 보호 및 수납장으로 활용. 뒤집기 시작하면 위험하니 처분 > 당근 추천' },
  { id: 'e02', category: '기타 용품', name: '베이비캠', timing: ['출산전'], tip: '핫딜 노리기' },
  { id: 'e03', category: '기타 용품', name: '신생아달력', timing: ['출산전'] },
  { id: 'e04', category: '기타 용품', name: '하이체어', timing: ['출산전'], tip: '뉴본세트로 사면 신생아때부터 쓸 수 있음' },
  { id: 'e05', category: '기타 용품', name: '범보의자', timing: ['출산후'], tip: '100일쯤 필요. 범보형, 소프트 의자형. 당근에 제품 많이 나옴' },
  { id: 'e06', category: '기타 용품', name: '기저귀쓰레기통', timing: ['출산전'], tip: '사이즈는 가급적 큰걸로 추천. 분유먹을 때는 냄새가 약함, 이유식때가 진짜' },
  { id: 'e07', category: '기타 용품', name: '매직캔 리필봉투', timing: ['출산후'] },
  { id: 'e08', category: '기타 용품', name: '문스토퍼', timing: ['출산후'], tip: '위험 방지용 스토퍼 필수' },
  { id: 'e09', category: '기타 용품', name: '층간소음매트 (아기매트)', timing: ['조리원'], tip: '뒤집기 시작할 때부터 깔아두는 것 필수' },

  // 장난감
  { id: 't01', category: '장난감', name: '초점책', timing: ['출산전'], tip: '조리원 때부터 사용가능한 장난감 / 사용시기 짧음. 초점책 이후에는 병풍책 구입' },
  { id: 't02', category: '장난감', name: '애착인형', timing: ['출산후'] },
  { id: 't03', category: '장난감', name: '모빌', timing: ['출산후'], tip: '국민템. 처음에는 흑백 / 색을 구분하면 그때 색깔모빌' },
  { id: 't04', category: '장난감', name: '아기체육관', timing: ['출산후'], tip: '3개월쯤부터 구매 추천' },
  { id: 't05', category: '장난감', name: '고리', timing: ['출산후'], tip: '고리를 군데군데 걸어두는게 좋음. 아기체육관, 유모차 등등' },
  { id: 't06', category: '장난감', name: '튤립 사운드북', timing: ['출산후'] },
  { id: 't07', category: '장난감', name: '딸랑이', timing: ['출산후'], tip: '신체발달, 두뇌자극, 소근육 발달 등에 활용. 세척 가능한 것으로 추천' },
  { id: 't08', category: '장난감', name: '흡착딸랑이', timing: ['출산후'], tip: '이유식 할 때, 이유식 식판에 붙여놓는 용도' },
  { id: 't09', category: '장난감', name: '헝겊책', timing: ['출산후'], tip: '만졌을 때 바스락 소리나는 것으로. ex) 코야' },
  { id: 't10', category: '장난감', name: '소프트 블럭', timing: ['출산후'], tip: '물고 빠는게 많은 시기에, 치발기 소재로 열탕 가능한 것을 추천. 한번 사면 유아기때까지 사용 가능' },
  { id: 't11', category: '장난감', name: '스태킹 블록', timing: ['출산후'], tip: '컵쌓기/숫자놀이/촉감/모래 놀이 등에 사용' },
  { id: 't12', category: '장난감', name: '국민애벌레', timing: ['출산후'], tip: '세탁 가능한 제품으로 구매' },
  { id: 't13', category: '장난감', name: '꼬꼬맘', timing: ['출산후'], tip: '터미타임용 장난감' },
  { id: 't14', category: '장난감', name: '아기병풍', timing: ['출산후'], tip: '터미타임 할 때 앞에 놔두면 고개를 들어올리면서 봄' },
  { id: 't15', category: '장난감', name: '에듀테이블', timing: ['출산후'], tip: '보행기 겸용 추천 / 짧게 써서 당근 추천' },
  { id: 't16', category: '장난감', name: '아기 목튜브', timing: ['출산후'], tip: '아기 수영용 목튜브 / 짧게 써서 당근 추천' },
]

export const CATEGORIES = Array.from(new Set(CHECKLIST.map((i) => i.category)))

export type TimingFilter = '전체' | '출산전' | '조리원' | '출산후'
