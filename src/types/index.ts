export type Workspace = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  preferred_model: string | null;
  temperature: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  workspace_id: string | null;
  title: string;
  status: string;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  model: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Memory = {
  id: string;
  type: string;
  title: string;
  content: string;
  importance: number;
  confidence: number;
  workspace_id: string | null;
  source_refs: unknown[];
  related_memories: unknown[];
  is_pinned: boolean;
  is_archived: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  category: string | null;
  linked_workspace: string | null;
  linked_resource_id: string | null;
  is_completed: boolean;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
  updated_at: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  milestones: { id: string; title: string; done: boolean }[];
  deadline: string | null;
  progress: number;
  status: string;
  linked_tasks: unknown[];
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  name: string;
  description: string | null;
  schedule: string;
  streak: number;
  best_streak: number;
  total_completions: number;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  linked_conversations: unknown[];
  linked_research: unknown[];
  linked_events: unknown[];
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type ResearchProject = {
  id: string;
  name: string;
  description: string | null;
  workspace_id: string | null;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type ResearchSource = {
  id: string;
  project_id: string;
  title: string;
  publisher: string | null;
  author: string | null;
  publication_date: string | null;
  source_type: string;
  reliability: string;
  url: string | null;
  ai_summary: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
};

export type CodingProject = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  framework: string | null;
  repo_url: string | null;
  architecture_notes: string | null;
  conventions: string | null;
  status: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type StockWatchlist = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type WatchlistItem = {
  id: string;
  watchlist_id: string;
  symbol: string;
  company_name: string | null;
  notes: string | null;
  created_at: string;
};
