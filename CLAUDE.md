# 🍼 육아정보 — Claude Code 전용 세팅

## 프로젝트 개요

**서비스명:** 육아정보  
**서비스 URL:** https://baby-info-app-taupe.vercel.app  
**목적:** 광고 없는 AI 큐레이션 기반 신뢰할 수 있는 육아 정보 허브  
**타겟:** 임신 중인 예비맘, 신생아~3개월 육아 중인 부모  
**운영자:** 1인 (하루 1회 대시보드 확인)

---

## 이 프로젝트의 독립성 원칙

- 이 프로젝트는 운영자의 다른 업무(회사 업무, Obsidian 볼트 등)와 **완전히 분리**
- 별도 디렉토리, 별도 환경변수, 별도 Git 레포 사용
- Claude Code는 이 CLAUDE.md가 있는 디렉토리 안에서만 작업
- 다른 프로젝트 파일, Obsidian 볼트, 회사 업무 파일에는 **절대 접근하지 않는다**

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
│       ├── admin/article/        ← 글 삭제 (DELETE)
│       ├── admin/login/          ← 어드민 로그인
│       └── vote/                 ← 도움됐나요 투표 (POST)
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
│   ├── supabase.ts               ← DB 클라이언트 (anon + service role)
│   ├── search.ts                 ← 검색 + 동의어 처리 + 인기 태그
│   ├── sleep-sounds.ts           ← Web Audio API 소리 생성 (14종)
│   ├── checklist-data.ts         ← 출산 준비물 데이터 (112개 품목)
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

## DB 스키마 현황

### articles 테이블
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  week_range TEXT,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  quality_score INTEGER,
  review_notes TEXT,
  is_published BOOLEAN DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,      -- 마이그레이션 005
  not_helpful_count INTEGER NOT NULL DEFAULT 0,  -- 마이그레이션 005
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### pipeline_logs 테이블
```sql
CREATE TABLE pipeline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  topic TEXT,
  status TEXT,           -- 'passed' | 'failed'
  score INTEGER,
  title TEXT,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 콘텐츠 카테고리 구조

### 카테고리 slug 매핑
| 표시명 | slug |
|--------|------|
| 임신초기 | pregnancy-early |
| 임신중기 | pregnancy-mid |
| 임신말기 | pregnancy-late |
| 출산준비 | birth-prep |
| 신생아초기 | newborn-early |
| 신생아중기 | newborn-mid |
| 신생아말기 | newborn-late |

### 토픽 (8개)
건강/증상관리, 준비물/용품, 수면/생활패턴, 먹이기/수유, 목욕/위생, 발달/성장, 병원/의료, 심리/감정

---

## 콘텐츠 파이프라인

### 흐름
```
1. 기존 글 현황 조회 (카테고리×토픽 커버리지)
2. 글이 적은 조합 우선 선택 (최대 10개/일)
3. GPT-4o-mini로 글 생성 (기존 글 제목+요약+태그 컨텍스트 전달 → 중복 방지)
4. 품질 검수 (85점 미만 → 최대 2회 재시도)
5. 통과 시 DB 저장, 결과 로그 기록
```

### 브랜드 정책 (generate.ts 시스템 프롬프트 포함)
- 한국에서 실제 구매 가능하고 인지도 높은 브랜드만 언급
- 쿠팡·네이버쇼핑 등 국내 채널 유통 기준
- 국내 인지도가 낮거나 한국 미판매 브랜드 언급 금지

### GitHub Actions 스케줄
```yaml
schedule:
  - cron: '0 21 * * *'  # UTC 21:00 = KST 06:00
```

---

## 검색 시스템

### 동의어 처리 (lib/search.ts)
- 임신말기 ↔ 임신 말기, 출산준비 ↔ 출산 준비 등 15쌍 양방향 처리
- 공백 제거 후 비교 (병원 ↔ 병 원)
- `getSearchTerms(query)`: 원본 + 공백제거 + 동의어 변형 반환

### 인기 태그 필터링
- `getPopularTags()`: 실제 글 제목/요약에 등장하는 태그만 노출
- 공백 정규화 후 비교

---

## 사용자 도구

### 임신 주차 계산기 (PregnancyCalculator.tsx)
- 3가지 입력 모드: 출산 예정일 / 마지막 생리일 / 주차 직접 입력
- localStorage 저장 키: `pregnancy-calculator-v1`
- 주차별 데이터: lib/pregnancy-data.ts (주요 주차 + 삼분기별 기본값)

### 출산 준비물 체크리스트 (checklist/page.tsx)
- 112개 품목, 출산전·조리원·출산후 필터
- localStorage 저장 (체크 상태 유지)

### 아빠용 체크리스트 (checklist/dad/page.tsx)
- 출생신고·지원금·예방접종 등 출산 직후 아빠 할 일

### 백색소음기 (sleep/page.tsx)
- Web Audio API 기반, 14종 소리 (백색/핑크/갈색소음, 자연소리, 자장가 등)
- 자동 종료 타이머: 15/30/60/90분
- 소리 파일 없음 — 모두 Web Audio API로 실시간 생성

### 도움됐나요 투표 (FeedbackButtons.tsx)
- Supabase helpful_count / not_helpful_count 컬럼에 저장
- localStorage 중복 투표 방지 (키: `vote-v1-{articleId}`)

---

## 어드민 대시보드 (admin/page.tsx)

- 비밀번호 인증 (ADMIN_PASSWORD 환경변수)
- 전체 콘텐츠 수 / 오늘 생성 수 / 통과율
- 카테고리별 현황
- 파이프라인 로그: 제목 클릭 → 글 이동, 삭제 버튼
- 수동 콘텐츠 생성 (카테고리 + 토픽 + 힌트)

---

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ADMIN_PASSWORD=
```

※ ANTHROPIC_API_KEY는 사용하지 않음 (OpenAI만 사용)

---

## Claude Code 작업 원칙

1. **항상 이 CLAUDE.md를 먼저 읽고 작업 시작**
2. **환경변수는 .env.local에서만 읽기, 하드코딩 금지**
3. **DB 스키마 변경 시 supabase/migrations/ 에 마이그레이션 파일 추가**
4. **파이프라인 스크립트 실행 전 항상 dry-run 옵션 제공**
5. **의료/건강 정보는 보수적으로 작성 — 틀린 정보로 인한 위험 최우선 방지**
6. **브랜드 언급 시 국내 구매 가능 여부 반드시 확인**
7. **콘텐츠 삭제 대신 UPDATE로 수정 (ID/slug 유지)**
