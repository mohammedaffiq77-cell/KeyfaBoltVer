/*
# KEYFA Core Schema — Workspaces, Conversations, Memory, Life, Research, Coding, Stocks

## Overview
Creates the foundational tables for the KEYFA Personal AI Operating System.
This is a single-tenant app (no sign-in), so all policies use `TO anon, authenticated`.

## New Tables
1. `workspaces` — isolated environments (Personal, College, Research, Programming, etc.)
2. `conversations` — chat containers belonging to a workspace
3. `messages` — individual messages within conversations
4. `memories` — long-term knowledge entries with type, importance, confidence
5. `tasks` — life workspace tasks with priority, due date, category, links
6. `goals` — long-term objectives with milestones and progress
7. `habits` — recurring habit tracking with streak data
8. `habit_logs` — per-day completion records for habits
9. `journal_entries` — personal journal with mood, markdown content, links
10. `research_projects` — research workspace projects with sessions
11. `research_sources` — source cards collected during research
12. `coding_projects` — coding workspace projects with language, framework
13. `stock_watchlists` — user-created watchlists
14. `watchlist_items` — ticker symbols within watchlists

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` since this is a single-tenant app with intentionally shared data.
*/

-- WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Circle',
  color text NOT NULL DEFAULT '#3b82f6',
  description text,
  preferred_model text DEFAULT 'auto',
  temperature real DEFAULT 0.7,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ws_select" ON workspaces;
CREATE POLICY "ws_select" ON workspaces FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ws_insert" ON workspaces;
CREATE POLICY "ws_insert" ON workspaces FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ws_update" ON workspaces;
CREATE POLICY "ws_update" ON workspaces FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ws_delete" ON workspaces;
CREATE POLICY "ws_delete" ON workspaces FOR DELETE TO anon, authenticated USING (true);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'New Conversation',
  status text NOT NULL DEFAULT 'active',
  is_pinned boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conv_select" ON conversations;
CREATE POLICY "conv_select" ON conversations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "conv_insert" ON conversations;
CREATE POLICY "conv_insert" ON conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "conv_update" ON conversations;
CREATE POLICY "conv_update" ON conversations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "conv_delete" ON conversations;
CREATE POLICY "conv_delete" ON conversations FOR DELETE TO anon, authenticated USING (true);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL DEFAULT '',
  model text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msg_select" ON messages;
CREATE POLICY "msg_select" ON messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "msg_insert" ON messages;
CREATE POLICY "msg_insert" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "msg_update" ON messages;
CREATE POLICY "msg_update" ON messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "msg_delete" ON messages;
CREATE POLICY "msg_delete" ON messages FOR DELETE TO anon, authenticated USING (true);

-- MEMORIES
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'knowledge',
  title text NOT NULL,
  content text NOT NULL,
  importance int DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  confidence int DEFAULT 5 CHECK (confidence >= 1 AND confidence <= 10),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  source_refs jsonb DEFAULT '[]'::jsonb,
  related_memories jsonb DEFAULT '[]'::jsonb,
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mem_select" ON memories;
CREATE POLICY "mem_select" ON memories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "mem_insert" ON memories;
CREATE POLICY "mem_insert" ON memories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mem_update" ON memories;
CREATE POLICY "mem_update" ON memories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "mem_delete" ON memories;
CREATE POLICY "mem_delete" ON memories FOR DELETE TO anon, authenticated USING (true);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date date,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  category text,
  linked_workspace text,
  linked_resource_id uuid,
  is_completed boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "task_select" ON tasks;
CREATE POLICY "task_select" ON tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "task_insert" ON tasks;
CREATE POLICY "task_insert" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "task_update" ON tasks;
CREATE POLICY "task_update" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "task_delete" ON tasks;
CREATE POLICY "task_delete" ON tasks FOR DELETE TO anon, authenticated USING (true);

-- GOALS
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  milestones jsonb DEFAULT '[]'::jsonb,
  deadline date,
  progress int DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text DEFAULT 'active' CHECK (status IN ('active','completed','paused','abandoned')),
  linked_tasks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "goal_select" ON goals;
CREATE POLICY "goal_select" ON goals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "goal_insert" ON goals;
CREATE POLICY "goal_insert" ON goals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "goal_update" ON goals;
CREATE POLICY "goal_update" ON goals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "goal_delete" ON goals;
CREATE POLICY "goal_delete" ON goals FOR DELETE TO anon, authenticated USING (true);

-- HABITS
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  schedule text NOT NULL DEFAULT 'daily',
  streak int DEFAULT 0,
  best_streak int DEFAULT 0,
  total_completions int DEFAULT 0,
  color text DEFAULT '#10b981',
  icon text DEFAULT 'CheckCircle',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hab_select" ON habits;
CREATE POLICY "hab_select" ON habits FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "hab_insert" ON habits;
CREATE POLICY "hab_insert" ON habits FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "hab_update" ON habits;
CREATE POLICY "hab_update" ON habits FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "hab_delete" ON habits;
CREATE POLICY "hab_delete" ON habits FOR DELETE TO anon, authenticated USING (true);

-- HABIT LOGS
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (habit_id, log_date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hlog_select" ON habit_logs;
CREATE POLICY "hlog_select" ON habit_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "hlog_insert" ON habit_logs;
CREATE POLICY "hlog_insert" ON habit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "hlog_update" ON habit_logs;
CREATE POLICY "hlog_update" ON habit_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "hlog_delete" ON habit_logs;
CREATE POLICY "hlog_delete" ON habit_logs FOR DELETE TO anon, authenticated USING (true);

-- JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  content text NOT NULL DEFAULT '',
  mood text,
  linked_conversations jsonb DEFAULT '[]'::jsonb,
  linked_research jsonb DEFAULT '[]'::jsonb,
  linked_events jsonb DEFAULT '[]'::jsonb,
  ai_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jrnl_select" ON journal_entries;
CREATE POLICY "jrnl_select" ON journal_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "jrnl_insert" ON journal_entries;
CREATE POLICY "jrnl_insert" ON journal_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "jrnl_update" ON journal_entries;
CREATE POLICY "jrnl_update" ON journal_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "jrnl_delete" ON journal_entries;
CREATE POLICY "jrnl_delete" ON journal_entries FOR DELETE TO anon, authenticated USING (true);

-- RESEARCH PROJECTS
CREATE TABLE IF NOT EXISTS research_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  is_favorite boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rp_select" ON research_projects;
CREATE POLICY "rp_select" ON research_projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rp_insert" ON research_projects;
CREATE POLICY "rp_insert" ON research_projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rp_update" ON research_projects;
CREATE POLICY "rp_update" ON research_projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rp_delete" ON research_projects;
CREATE POLICY "rp_delete" ON research_projects FOR DELETE TO anon, authenticated USING (true);

-- RESEARCH SOURCES
CREATE TABLE IF NOT EXISTS research_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  publisher text,
  author text,
  publication_date date,
  source_type text DEFAULT 'website',
  reliability text DEFAULT 'medium' CHECK (reliability IN ('low','medium','high')),
  url text,
  ai_summary text,
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rs_select" ON research_sources;
CREATE POLICY "rs_select" ON research_sources FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rs_insert" ON research_sources;
CREATE POLICY "rs_insert" ON research_sources FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rs_update" ON research_sources;
CREATE POLICY "rs_update" ON research_sources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rs_delete" ON research_sources;
CREATE POLICY "rs_delete" ON research_sources FOR DELETE TO anon, authenticated USING (true);

-- CODING PROJECTS
CREATE TABLE IF NOT EXISTS coding_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  language text,
  framework text,
  repo_url text,
  architecture_notes text,
  conventions text,
  status text DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE coding_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cp_select" ON coding_projects;
CREATE POLICY "cp_select" ON coding_projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cp_insert" ON coding_projects;
CREATE POLICY "cp_insert" ON coding_projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cp_update" ON coding_projects;
CREATE POLICY "cp_update" ON coding_projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cp_delete" ON coding_projects;
CREATE POLICY "cp_delete" ON coding_projects FOR DELETE TO anon, authenticated USING (true);

-- STOCK WATCHLISTS
CREATE TABLE IF NOT EXISTS stock_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE stock_watchlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sw_select" ON stock_watchlists;
CREATE POLICY "sw_select" ON stock_watchlists FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sw_insert" ON stock_watchlists;
CREATE POLICY "sw_insert" ON stock_watchlists FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sw_update" ON stock_watchlists;
CREATE POLICY "sw_update" ON stock_watchlists FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sw_delete" ON stock_watchlists;
CREATE POLICY "sw_delete" ON stock_watchlists FOR DELETE TO anon, authenticated USING (true);

-- WATCHLIST ITEMS
CREATE TABLE IF NOT EXISTS watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES stock_watchlists(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  company_name text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wi_select" ON watchlist_items;
CREATE POLICY "wi_select" ON watchlist_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "wi_insert" ON watchlist_items;
CREATE POLICY "wi_insert" ON watchlist_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "wi_update" ON watchlist_items;
CREATE POLICY "wi_update" ON watchlist_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "wi_delete" ON watchlist_items;
CREATE POLICY "wi_delete" ON watchlist_items FOR DELETE TO anon, authenticated USING (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_conversations_workspace ON conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, log_date);
CREATE INDEX IF NOT EXISTS idx_research_sources_project ON research_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist ON watchlist_items(watchlist_id);

-- SEED DEFAULT WORKSPACE
INSERT INTO workspaces (name, icon, color, description, is_active)
SELECT 'Personal', 'User', '#3b82f6', 'Your personal workspace for everyday tasks and notes', true
WHERE NOT EXISTS (SELECT 1 FROM workspaces LIMIT 1);

INSERT INTO workspaces (name, icon, color, description)
SELECT 'Research', 'Search', '#8b5cf6', 'Knowledge acquisition and investigation'
WHERE NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'Research');

INSERT INTO workspaces (name, icon, color, description)
SELECT 'Coding', 'Code2', '#10b981', 'Software engineering and development'
WHERE NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'Coding');

INSERT INTO workspaces (name, icon, color, description)
SELECT 'College', 'GraduationCap', '#f59e0b', 'Academic work and assignments'
WHERE NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'College');
