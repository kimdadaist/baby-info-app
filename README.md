# 🍼 육아정보 — 임신부터 신생아까지 믿을 수 있는 육아 정보

광고 없는 AI 큐레이션 기반 육아 정보 허브. 임신 초기부터 신생아 3개월까지 시기별 맞춤 정보를 제공합니다.

**서비스 URL:** https://baby-info-app-taupe.vercel.app

---

## 주요 기능

### 콘텐츠
- **카테고리별 정보**: 임신초기·중기·말기, 출산준비, 신생아초기·중기·말기 × 8개 토픽
- **AI 검수 파이프라인**: GPT-4o-mini로 생성 → 품질 검수 (85점 이상만 게시)
- **검색**: 키워드 검색 + 동의어 처리 (임신말기 ↔ 임신 말기 등)
- **브랜드 가이드**: 국내 구매 가능한 육아용품 브랜드 정보

### 사용자 도구
- **임신 주차 계산기**: 출산 예정일 / 마지막 생리일 / 주차 직접 입력 → 주차별 체크포인트 안내
- **출산 준비물 체크리스트**: 112개 품목, 출산전·조리원·출산후 필터, localStorage 저장
- **아빠용 체크리스트**: 출생신고·지원금·예방접종 등 출산 직후 아빠 할 일
- **백색소음기**: Web Audio API 기반 14종 소리 (백색/핑크/갈색소음, 자연소리, 자장가 등), 자동 종료 타이머

### 관리
- **어드민 대시보드**: 콘텐츠 통계, 파이프라인 로그 확인, 수동 콘텐츠 생성·삭제

---

## 기술 스택

| 역할 | 도구 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| DB | Supabase (PostgreSQL) |
| 배포 | Vercel |
| 콘텐츠 AI | OpenAI API (gpt-4o-mini) |
| 스케줄러 | GitHub Actions (매일 KST 06:00) |
| 스타일 | Tailwind CSS |

---

## 디렉토리 구조

```
/baby-info-app/
├── app/
│   ├── page.tsx                  ← 메인 (검색 + 카테고리 + 계산기)
│   ├── article/[id]/page.tsx     ← 글 상세
│   ├── category/[slug]/page.tsx  ← 카테고리 목록
│   ├── sleep/page.tsx            ← 백색소음기
│   ├── checklist/page.tsx        ← 출산 준비물 체크리스트
│   ├── checklist/dad/page.tsx    ← 아빠용 체크리스트
│   ├── admin/page.tsx            ← 관리자 대시보드
│   └── api/
│       ├── admin/generate/       ← 수동 콘텐츠 생성
│       ├── admin/article/        ← 글 삭제
│       ├── admin/login/          ← 어드민 로그인
│       └── vote/                 ← 도움됐나요 투표
├── components/
│   ├── SearchBar.tsx             ← 검색창 (추천 태그 포함)
│   ├── ArticleCard.tsx
│   ├── PregnancyCalculator.tsx   ← 임신 주차 계산기
│   ├── SleepSoundPlayer.tsx      ← 백색소음기 플레이어
│   ├── ChecklistClient.tsx       ← 출산 준비물 체크리스트
│   ├── DadChecklistClient.tsx    ← 아빠용 체크리스트
│   ├── AdminGenerateForm.tsx     ← 어드민 수동 생성 폼
│   ├── DeleteArticleButton.tsx   ← 글 삭제 버튼
│   ├── FeedbackButtons.tsx       ← 도움됐나요 버튼
│   └── ConfirmDialog.tsx         ← 확인 다이얼로그
├── lib/
│   ├── supabase.ts               ← DB 클라이언트
│   ├── search.ts                 ← 검색 + 동의어 처리
│   ├── sleep-sounds.ts           ← Web Audio API 소리 생성
│   ├── checklist-data.ts         ← 출산 준비물 데이터
│   ├── dad-checklist-data.ts     ← 아빠용 체크리스트 데이터
│   └── pregnancy-data.ts         ← 임신 주차별 체크포인트 데이터
├── pipeline/
│   ├── generate.ts               ← GPT 콘텐츠 생성
│   ├── review.ts                 ← 품질 검수
│   └── save.ts                   ← DB 저장
├── scripts/
│   ├── run-pipeline.ts           ← 일일 자동 파이프라인
│   ├── generate-brand-articles.ts← 브랜드 가이드 일괄 생성
│   └── update-brand-articles.ts  ← 브랜드 글 일괄 업데이트
├── supabase/migrations/          ← DB 스키마 히스토리
└── .github/workflows/
    └── daily-content.yml         ← 매일 자동 실행
```

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 키 값 입력

# 개발 서버
npm run dev

# 콘텐츠 파이프라인 (dry-run)
npm run pipeline:dry

# 콘텐츠 파이프라인 (실제 저장)
npm run pipeline
```

---

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ADMIN_PASSWORD=
```

---

## 콘텐츠 파이프라인

매일 KST 06:00 GitHub Actions로 자동 실행.

1. 기존 글 현황 조회 (카테고리×토픽 커버리지)
2. 글이 적은 조합 우선 선택 (최대 10개/일)
3. GPT-4o-mini로 글 생성 (기존 글 제목+요약+태그 컨텍스트 전달 → 중복 방지)
4. 품질 검수 (85점 미만 → 최대 2회 재시도)
5. 통과 시 DB 저장, 결과 로그 기록

**브랜드 가이드 원칙:** 국내(쿠팡·네이버쇼핑 등)에서 실제 구매 가능하고 인지도 높은 브랜드만 언급

---

## 어드민

URL: `/admin` (비밀번호 인증)

- 전체 콘텐츠 수 / 오늘 생성 수 / 통과율 확인
- 카테고리별 현황
- 파이프라인 로그 (제목 클릭 → 글 이동, 삭제 버튼)
- 수동 콘텐츠 생성 (카테고리 + 토픽 + 힌트 입력)
