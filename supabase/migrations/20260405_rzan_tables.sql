-- ============================================================
-- rzan-english: 5 new tables
-- ============================================================

-- 1. rzan_profile — single row per student
CREATE TABLE IF NOT EXISTS rzan_profile (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  level           INT  NOT NULL DEFAULT 1,
  points          INT  NOT NULL DEFAULT 0,
  streak_days     INT  NOT NULL DEFAULT 0,
  last_active     DATE,
  diagnostic_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. rzan_sessions — name-only login tokens
CREATE TABLE IF NOT EXISTS rzan_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES rzan_profile(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- 3. rzan_vocabulary — words + spaced repetition
CREATE TABLE IF NOT EXISTS rzan_vocabulary (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES rzan_profile(id) ON DELETE CASCADE,
  word             TEXT NOT NULL,
  definition       TEXT NOT NULL,
  example_sentence TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  next_review      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_count     INT NOT NULL DEFAULT 0,
  correct_count    INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. rzan_writing_journal — writing workshop entries
CREATE TABLE IF NOT EXISTS rzan_writing_journal (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES rzan_profile(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL DEFAULT '',
  genre        TEXT NOT NULL DEFAULT 'story' CHECK (genre IN ('story','poem','dialogue','description','other')),
  word_count   INT NOT NULL DEFAULT 0,
  ai_feedback  TEXT,
  points_earned INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER writing_journal_updated_at
  BEFORE UPDATE ON rzan_writing_journal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. rzan_missions — daily missions
CREATE TABLE IF NOT EXISTS rzan_missions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES rzan_profile(id) ON DELETE CASCADE,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type         TEXT NOT NULL CHECK (type IN ('vocabulary','reading','writing','chat')),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  points_reward INT NOT NULL DEFAULT 10,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, mission_date, type)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE rzan_profile        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rzan_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rzan_vocabulary     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rzan_writing_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE rzan_missions       ENABLE ROW LEVEL SECURITY;

-- Service role (server-side) can do everything; anon can read via session check
-- Using permissive policies for now — tighten post-auth implementation
CREATE POLICY "service_all" ON rzan_profile        FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all" ON rzan_sessions       FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all" ON rzan_vocabulary     FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all" ON rzan_writing_journal FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all" ON rzan_missions       FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Anon: allow reading profile + session-gated tables via API routes only
CREATE POLICY "anon_read_profile" ON rzan_profile FOR SELECT TO anon USING (TRUE);
