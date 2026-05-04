-- articles: 누구나 발행된 글 읽기 가능
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기 허용" ON articles
  FOR SELECT
  USING (is_published = true);

-- pipeline_logs: 읽기/쓰기 모두 service role만 (RLS 활성화만)
ALTER TABLE pipeline_logs ENABLE ROW LEVEL SECURITY;
