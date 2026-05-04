# 🍼 육아 정보 웹앱 프로젝트 — Claude Code 전용 세팅

## 프로젝트 개요

**서비스명:** (미정 — 추후 확정)
**목적:** 광고 없는, AI 큐레이션 기반의 신뢰할 수 있는 육아 정보 허브
**타겟:** 임신 중인 예비맘, 신생아~3개월 육아 중인 부모
**운영자:** 1인 (하루 1회 대시보드 확인만)

---

## 이 프로젝트의 독립성 원칙

- 이 프로젝트는 운영자의 다른 업무(회사 업무, Obsidian 볼트 등)와 **완전히 분리**되어 운영된다
- 별도 디렉토리, 별도 환경변수, 별도 Git 레포를 사용한다
- Claude Code는 이 CLAUDE.md가 있는 디렉토리 안에서만 작업한다
- 다른 프로젝트 파일, Obsidian 볼트, 회사 업무 파일에는 **절대 접근하지 않는다**

---

## 기술 스택

| 역할 | 도구 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | 풀스택, Vercel 최적화 |
| DB | Supabase (무료 플랜) | PostgreSQL, 검색 지원 |
| 배포 | Vercel (무료 플랜) | Next.js 최적화, 자동 배포 |
| 콘텐츠 생성 | OpenAI API (gpt-4o-mini) | 생성+검수 동시 |
| 스케줄러 | GitHub Actions | 무료, 매일 자동 실행 |
| 스타일 | Tailwind CSS | 빠른 UI 개발 |
| 서버 비용 목표 | 월 $0 ~ $10 이하 | |

---

## 디렉토리 구조

```
/baby-info-app/
├── CLAUDE.md                  ← 이 파일 (Claude Code 기준점)
├── .env.local                 ← 환경변수 (Git 제외)
├── .env.example               ← 환경변수 템플릿
├── app/                       ← Next.js App Router
│   ├── page.tsx               ← 메인 검색 페이지
│   ├── article/[id]/page.tsx  ← 콘텐츠 상세 페이지
│   ├── category/[slug]/page.tsx ← 카테고리 페이지
│   └── admin/page.tsx         ← 관리자 대시보드
├── components/                ← UI 컴포넌트
├── lib/
│   ├── supabase.ts            ← DB 클라이언트
│   ├── claude.ts              ← Claude API 클라이언트
│   └── search.ts              ← 검색 로직
├── pipeline/                  ← 콘텐츠 자동화 파이프라인
│   ├── generate.ts            ← 콘텐츠 생성
│   ├── review.ts              ← AI 검수
│   ├── evaluate.ts            ← 점수 평가
│   └── save.ts                ← DB 저장
├── scripts/
│   └── run-pipeline.ts        ← 파이프라인 실행 진입점
└── .github/
    └── workflows/
        └── daily-content.yml  ← 매일 자동 실행 스케줄러
```

---

## 콘텐츠 카테고리 구조

### 시간축
```
임신초기    (1~12주)
임신중기    (13~27주)
임신말기    (28~40주)
출산준비    (출산 D-4주 ~ D-Day)
신생아초기  (0~4주)
신생아중기  (1~2개월)
신생아말기  (2~3개월)
```

### 주제축
```
건강/증상관리
준비물/용품
수면/생활패턴
먹이기/수유
목욕/위생
발달/성장
병원/의료
심리/감정
```

---

## 콘텐츠 파이프라인 상세

### 파이프라인 흐름
```
1. GENERATE  — Claude API로 콘텐츠 초안 생성
2. REVIEW    — Claude API로 정확성/신뢰도 검수
3. EVALUATE  — 점수 산정 (100점 만점)
4. DECISION  — 85점 이상: DB 저장 / 미달: 재생성 (최대 2회)
5. SAVE      — Supabase에 구조화된 형태로 저장
6. LOG       — 결과 로그 기록
```

### 평가 기준 (각 20점)
```
- 정확성:   의학적/과학적으로 신뢰할 수 있는가
- 완성도:   내용이 충분하고 구체적인가
- 실용성:   실제 육아에 바로 적용 가능한가
- 안전성:   잘못된 정보로 위험을 줄 수 있는가 (역점수)
- 가독성:   이해하기 쉽고 구조화되어 있는가
```

### 콘텐츠 스키마 (Supabase)
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,         -- 임신초기, 신생아초기 등
  week_range TEXT,                -- '1~12주', '0~4주' 등
  topic TEXT NOT NULL,            -- 건강, 준비물 등
  title TEXT NOT NULL,
  summary TEXT NOT NULL,          -- 2~3줄 요약
  content TEXT NOT NULL,          -- 본문 (마크다운)
  tags TEXT[],                    -- 검색 태그
  quality_score INTEGER,          -- 최종 점수
  review_notes TEXT,              -- AI 검수 노트
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 검색 인덱스
CREATE INDEX articles_search_idx ON articles
USING gin(to_tsvector('simple', title || ' ' || content || ' ' || array_to_string(tags, ' ')));
```

---

## 자동화 스케줄

### GitHub Actions — 매일 오전 6시 실행
```yaml
# .github/workflows/daily-content.yml
schedule:
  - cron: '0 21 * * *'  # UTC 21:00 = KST 06:00

실행 내용:
  - 카테고리별 미완성 토픽 확인
  - 하루 10개 콘텐츠 자동 생성
  - 파이프라인 통과한 것만 DB 저장
  - 실패 로그는 관리자 대시보드에 기록
```

---

## 관리자 대시보드 기능

운영자가 하루 한 번 확인할 내용:
```
- 오늘 생성된 콘텐츠 수
- 파이프라인 통과율
- 85점 미달로 저장 안 된 콘텐츠 목록
- 수동 검토 필요 플래그 목록
- 전체 콘텐츠 현황 (카테고리별)
```

---

## 웹앱 주요 기능 (1차 MVP)

### 메인 페이지
- 키워드 검색창 (중앙)
- 카테고리 빠른 접근 (임신 주차별, 신생아 월령별)
- 인기 검색어

### 검색 결과
- 관련도 순 정렬
- 카테고리 필터
- 광고 없음 (명시)

### 콘텐츠 상세
- 제목, 요약, 본문
- 관련 태그
- 같은 카테고리 다른 글
- "이 정보가 도움이 됐나요?" 피드백 버튼

---

## 환경변수 목록

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...         # 관리자 대시보드 접근용
```

---

## Claude Code 작업 원칙

1. **항상 이 CLAUDE.md를 먼저 읽고 작업 시작**
2. **작업 전 현재 디렉토리 구조 확인**
3. **환경변수는 .env.local에서만 읽기, 하드코딩 금지**
4. **DB 스키마 변경 시 마이그레이션 파일 생성**
5. **파이프라인 실행 전 항상 dry-run 옵션 제공**
6. **의료/건강 정보는 보수적으로 작성 (틀린 정보 위험)**
7. **콘텐츠 생성 실패 시 에러 로그 남기고 계속 진행**

---

## 1차 MVP 완료 기준

- [ ] Supabase DB 스키마 생성 완료
- [ ] 콘텐츠 파이프라인 작동 확인
- [ ] 콘텐츠 200개 이상 DB 저장 완료
- [ ] 웹앱 검색 기능 작동
- [ ] 카테고리 페이지 작동
- [ ] 관리자 대시보드 작동
- [ ] Vercel 배포 완료
- [ ] GitHub Actions 스케줄러 작동 확인

---

## 작업 시작 명령어

Claude Code 세션 시작 시 아래 순서로 진행:

```
1. CLAUDE.md 확인 완료
2. 현재 완료된 체크리스트 항목 확인
3. 다음 작업 항목 제안
4. 승인 후 작업 시작
```
