-- ============================================================
--  The Jackson Portfolio — Supabase Schema Migration
--  Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── 1. Add new columns to client_requests ──────────────────
ALTER TABLE client_requests
  ADD COLUMN IF NOT EXISTS quoted_deadline timestamptz DEFAULT NULL;

-- ── 2. project_messages table ──────────────────────────────
CREATE TABLE IF NOT EXISTS project_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    uuid NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
  sender_role   text NOT NULL CHECK (sender_role IN ('admin', 'client')),
  sender_name   text NOT NULL,
  message       text NOT NULL,
  is_checkpoint boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_messages_request_id ON project_messages(request_id);

-- ── 3. portfolio_projects table ────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  category    text NOT NULL DEFAULT '',
  year        text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags        text[] NOT NULL DEFAULT '{}',
  images      text[] NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'delivered' CHECK (status IN ('delivered', 'in_progress', 'archived')),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 4. Row Level Security ──────────────────────────────────

-- client_requests: owners can read their own rows; admins can do everything
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners read own requests" ON client_requests;
CREATE POLICY "owners read own requests" ON client_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "service role bypass" ON client_requests;
CREATE POLICY "service role bypass" ON client_requests
  USING (auth.role() = 'service_role');

-- project_messages: clients can read+insert their own request's messages; admins full access
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients read own messages" ON project_messages;
CREATE POLICY "clients read own messages" ON project_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_requests cr
      WHERE cr.id = project_messages.request_id
        AND cr.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "clients insert own messages" ON project_messages;
CREATE POLICY "clients insert own messages" ON project_messages
  FOR INSERT WITH CHECK (
    sender_role = 'client' AND
    EXISTS (
      SELECT 1 FROM client_requests cr
      WHERE cr.id = project_messages.request_id
        AND cr.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "service role messages" ON project_messages;
CREATE POLICY "service role messages" ON project_messages
  USING (auth.role() = 'service_role');

-- portfolio_projects: public read, service role write
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read projects" ON portfolio_projects;
CREATE POLICY "public read projects" ON portfolio_projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role projects" ON portfolio_projects;
CREATE POLICY "service role projects" ON portfolio_projects
  USING (auth.role() = 'service_role');

-- ── 5. Realtime ─────────────────────────────────────────────
-- Enable realtime on these tables in:
-- Supabase Dashboard → Database → Replication → Tables
-- Toggle ON: client_requests, project_messages, portfolio_projects

-- ── 6. Storage bucket for portfolio images ─────────────────
-- Run this separately or via Dashboard → Storage → New bucket:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('portfolio-images', 'portfolio-images', true)
-- ON CONFLICT DO NOTHING;
--
-- Then add policy (Dashboard → Storage → portfolio-images → Policies):
-- SELECT: true (public)
-- INSERT: auth.role() = 'authenticated'  (or service_role only for tighter security)
