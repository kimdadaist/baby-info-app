ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_idx ON articles (slug);
