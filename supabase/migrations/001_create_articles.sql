-- articles 테이블
CREATE TABLE articles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT        NOT NULL,
  week_range      TEXT,
  topic           TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  summary         TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  tags            TEXT[]      DEFAULT '{}',
  quality_score   INTEGER     CHECK (quality_score BETWEEN 0 AND 100),
  review_notes    TEXT,
  is_published    BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 카테고리 유효값 제약
ALTER TABLE articles ADD CONSTRAINT articles_category_check CHECK (
  category IN (
    '임신초기', '임신중기', '임신말기', '출산준비',
    '신생아초기', '신생아중기', '신생아말기'
  )
);

-- 주제 유효값 제약
ALTER TABLE articles ADD CONSTRAINT articles_topic_check CHECK (
  topic IN (
    '건강/증상관리', '준비물/용품', '수면/생활패턴', '먹이기/수유',
    '목욕/위생', '발달/성장', '병원/의료', '심리/감정'
  )
);

-- 전문 검색용 IMMUTABLE 래퍼 함수
-- GIN 인덱스는 IMMUTABLE 함수만 허용하므로 래퍼로 감쌈
CREATE OR REPLACE FUNCTION articles_search_vector(title TEXT, content TEXT, tags TEXT[])
RETURNS tsvector
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT to_tsvector('simple',
    coalesce(title, '') || ' ' ||
    coalesce(content, '') || ' ' ||
    coalesce(array_to_string(tags, ' '), '')
  );
$$;

-- 전문 검색 인덱스
CREATE INDEX articles_search_idx ON articles
  USING gin(articles_search_vector(title, content, tags));

-- 카테고리/주제 조회용 인덱스
CREATE INDEX articles_category_idx ON articles (category);
CREATE INDEX articles_topic_idx ON articles (topic);
CREATE INDEX articles_published_idx ON articles (is_published, created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
