-- 파이프라인 실행 로그 테이블 (관리자 대시보드용)
CREATE TABLE pipeline_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date      DATE        NOT NULL DEFAULT CURRENT_DATE,
  category      TEXT        NOT NULL,
  topic         TEXT        NOT NULL,
  attempt       INTEGER     NOT NULL DEFAULT 1,
  status        TEXT        NOT NULL,  -- 'passed' | 'failed' | 'skipped'
  quality_score INTEGER,
  article_id    UUID        REFERENCES articles(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pipeline_logs ADD CONSTRAINT pipeline_logs_status_check CHECK (
  status IN ('passed', 'failed', 'skipped')
);

CREATE INDEX pipeline_logs_run_date_idx ON pipeline_logs (run_date DESC);
CREATE INDEX pipeline_logs_status_idx ON pipeline_logs (status);
