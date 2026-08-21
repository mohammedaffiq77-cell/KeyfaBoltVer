import { useEffect, useState } from 'react';
import {
  CheckCircle2, Circle, Plus, Trash2, Calendar, Target, Flame,
  BookOpen, Flag, TrendingUp, ChevronRight, Edit2, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Task, Goal, Habit, JournalEntry } from '@/types';

type Tab = 'tasks' | 'goals' | 'habits' | 'journal';

function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'urgent': return 'bg-error-500/15 text-error-400';
    case 'high': return 'bg-warning-500/15 text-warning-400';
    case 'medium': return 'bg-primary-500/15 text-primary-400';
    default: return 'bg-slate-700/50 text-slate-400';
  }
}

export function LifeView() {
  const [tab, setTab] = useState<Tab>('tasks');

  const tabs: { key: Tab; label: string; icon: typeof CheckCircle2 }[] = [
    { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'habits', label: 'Habits', icon: Flame },
    { key: 'journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center gap-1 mb-6 border-b border-slate-800/60">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                tab === t.key
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'tasks' && <TasksTab />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'habits' && <HabitsTab />}
      {tab === 'journal' && <JournalTab />}
    </div>
  );
}

// ===== TASKS =====
function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '', category: '' });

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').order('is_completed').order('due_date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  async function addTask() {
    if (!newTask.title.trim()) return;
    await supabase.from('tasks').insert({
      title: newTask.title,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      category: newTask.category || null,
    });
    setNewTask({ title: '', priority: 'medium', due_date: '', category: '' });
    setShowAdd(false);
    await loadTasks();
  }

  async function toggleTask(task: Task) {
    await supabase.from('tasks').update({ is_completed: !task.is_completed, updated_at: new Date().toISOString() }).eq('id', task.id);
    await loadTasks();
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    await loadTasks();
  }

  const filtered = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.is_completed : t.is_completed
  );

  const priorityColors: Record<string, string> = {
    urgent: 'border-l-error-500',
    high: 'border-l-warning-500',
    medium: 'border-l-primary-500',
    low: 'border-l-slate-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                filter === f ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-slate-800/40 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No tasks" description="Create your first task to start organizing your day." action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Task</button>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={cn('card p-3 flex items-center gap-3 border-l-4 group hover:bg-slate-800/40 transition-all', priorityColors[task.priority])}
            >
              <button onClick={() => toggleTask(task)} className="shrink-0">
                {task.is_completed ? <CheckCircle2 className="w-5 h-5 text-success-400" /> : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', task.is_completed ? 'text-slate-500 line-through' : 'text-slate-200')}>{task.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {task.due_date && <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(task.due_date)}</span>}
                  {task.category && <span className="text-xs text-slate-500">{task.category}</span>}
                  <span className={cn('badge', priorityBadgeClass(task.priority))}>{task.priority}</span>
                </div>
              </div>
              <button onClick={() => setDeleteId(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-error-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Task" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Title</label>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="input-field" placeholder="What needs to be done?" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Due Date</label>
              <input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Category</label>
            <input value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} className="input-field" placeholder="e.g. Work, Personal, Health" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={addTask} className="btn-primary">Add Task</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteTask(deleteId)} title="Delete task" message="This task will be permanently deleted." />
    </div>
  );
}

// ===== GOALS =====
function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    setLoading(true);
    const { data } = await supabase.from('goals').select('*').order('status').order('updated_at', { ascending: false });
    setGoals(data || []);
    setLoading(false);
  }

  async function addGoal() {
    if (!newGoal.title.trim()) return;
    await supabase.from('goals').insert({
      title: newGoal.title,
      description: newGoal.description || null,
      deadline: newGoal.deadline || null,
    });
    setNewGoal({ title: '', description: '', deadline: '' });
    setShowAdd(false);
    await loadGoals();
  }

  async function updateProgress(goal: Goal, delta: number) {
    const progress = Math.max(0, Math.min(100, goal.progress + delta));
    const status = progress >= 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status;
    await supabase.from('goals').update({ progress, status, updated_at: new Date().toISOString() }).eq('id', goal.id);
    await loadGoals();
  }

  async function deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id);
    await loadGoals();
  }

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-slate-800/40 animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-300 font-medium">Your Goals</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Set long-term objectives and track your progress over time." action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Goal</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="card p-5 group hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate">{goal.title}</h4>
                  {goal.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{goal.description}</p>}
                </div>
                <button onClick={() => setDeleteId(goal.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-error-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs font-medium">{goal.progress}% complete</span>
                {goal.deadline && <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(goal.deadline)}</span>}
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style={{ width: `${goal.progress}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateProgress(goal, -10)} className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400 hover:text-white transition-all">-10%</button>
                <button onClick={() => updateProgress(goal, 10)} className="px-2 py-1 rounded text-xs bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-all">+10%</button>
                <span className={cn('badge ml-auto', goal.status === 'active' ? 'bg-primary-500/15 text-primary-400' : goal.status === 'completed' ? 'bg-success-500/15 text-success-400' : 'bg-slate-700/50 text-slate-400')}>{goal.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Goal" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Title</label>
            <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="input-field" placeholder="What do you want to achieve?" autoFocus />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Description</label>
            <textarea value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} className="input-field" rows={3} placeholder="Describe your goal..." />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Deadline</label>
            <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={addGoal} className="btn-primary">Create Goal</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteGoal(deleteId)} title="Delete goal" message="This goal will be permanently deleted." />
    </div>
  );
}

// ===== HABITS =====
function HabitsTab() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', schedule: 'daily', color: '#10b981' });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadHabits(); }, []);

  async function loadHabits() {
    setLoading(true);
    const { data } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
    setHabits(data || []);
    setLoading(false);
  }

  async function addHabit() {
    if (!newHabit.name.trim()) return;
    await supabase.from('habits').insert({
      name: newHabit.name,
      description: newHabit.description || null,
      schedule: newHabit.schedule,
      color: newHabit.color,
    });
    setNewHabit({ name: '', description: '', schedule: 'daily', color: '#10b981' });
    setShowAdd(false);
    await loadHabits();
  }

  async function toggleHabitToday(habit: Habit) {
    const { data: existing } = await supabase.from('habit_logs').select('*').eq('habit_id', habit.id).eq('log_date', today).maybeSingle();
    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id);
      await supabase.from('habits').update({
        streak: Math.max(0, habit.streak - 1),
        total_completions: Math.max(0, habit.total_completions - 1),
        updated_at: new Date().toISOString()
      }).eq('id', habit.id);
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habit.id, log_date: today, completed: true });
      const newStreak = habit.streak + 1;
      await supabase.from('habits').update({
        streak: newStreak,
        best_streak: Math.max(habit.best_streak, newStreak),
        total_completions: habit.total_completions + 1,
        updated_at: new Date().toISOString()
      }).eq('id', habit.id);
    }
    await loadHabits();
  }

  async function deleteHabit(id: string) {
    await supabase.from('habits').delete().eq('id', id);
    await loadHabits();
  }

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-slate-800/40 animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-300 font-medium">Your Habits</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState icon={Flame} title="No habits tracked" description="Build consistency by tracking daily habits and streaks." action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Habit</button>} />
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="card p-4 flex items-center gap-4 group hover:bg-slate-800/40 transition-all">
              <button
                onClick={() => toggleHabitToday(habit)}
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105"
                style={{ backgroundColor: `${habit.color}20`, border: `2px solid ${habit.color}40` }}
              >
                <Flame className="w-6 h-6" style={{ color: habit.color }} />
              </button>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{habit.name}</h4>
                {habit.description && <p className="text-slate-500 text-sm truncate">{habit.description}</p>}
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Flame className="w-3 h-3 text-warning-400" />{habit.streak} day streak</span>
                  <span className="text-xs text-slate-400">Best: {habit.best_streak}</span>
                  <span className="text-xs text-slate-400">{habit.total_completions} total</span>
                </div>
              </div>
              <span className="badge bg-slate-800 text-slate-400 capitalize">{habit.schedule}</span>
              <button onClick={() => setDeleteId(habit.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-error-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Habit" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Name</label>
            <input value={newHabit.name} onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })} className="input-field" placeholder="e.g. Morning Meditation" autoFocus />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Description</label>
            <input value={newHabit.description} onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} className="input-field" placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Schedule</label>
              <select value={newHabit.schedule} onChange={(e) => setNewHabit({ ...newHabit, schedule: e.target.value })} className="input-field">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Color</label>
              <input type="color" value={newHabit.color} onChange={(e) => setNewHabit({ ...newHabit, color: e.target.value })} className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={addHabit} className="btn-primary">Create Habit</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteHabit(deleteId)} title="Delete habit" message="This habit and all its logs will be permanently deleted." />
    </div>
  );
}

// ===== JOURNAL =====
function JournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral' });

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    setLoading(true);
    const { data } = await supabase.from('journal_entries').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }

  async function addEntry() {
    if (!newEntry.content.trim()) return;
    await supabase.from('journal_entries').insert({
      title: newEntry.title || null,
      content: newEntry.content,
      mood: newEntry.mood,
    });
    setNewEntry({ title: '', content: '', mood: 'neutral' });
    setShowAdd(false);
    await loadEntries();
  }

  async function deleteEntry(id: string) {
    await supabase.from('journal_entries').delete().eq('id', id);
    await loadEntries();
  }

  const moodColors: Record<string, string> = {
    great: 'bg-success-500/15 text-success-400',
    good: 'bg-primary-500/15 text-primary-400',
    neutral: 'bg-slate-700/50 text-slate-400',
    bad: 'bg-warning-500/15 text-warning-400',
    terrible: 'bg-error-500/15 text-error-400',
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-slate-800/40 animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-300 font-medium">Journal Entries</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={BookOpen} title="No journal entries" description="Write your thoughts, reflections, and daily experiences." action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Entry</button>} />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="card p-5 group hover:bg-slate-800/40 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold">{entry.title || 'Untitled'}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">{formatRelativeTime(entry.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.mood && <span className={cn('badge capitalize', moodColors[entry.mood] || moodColors.neutral)}>{entry.mood}</span>}
                  <button onClick={() => setDeleteId(entry.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-error-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap line-clamp-4">{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Journal Entry" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Title (optional)</label>
            <input value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} className="input-field" placeholder="Give your entry a title" autoFocus />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Mood</label>
            <div className="flex items-center gap-2">
              {['great', 'good', 'neutral', 'bad', 'terrible'].map((m) => (
                <button
                  key={m}
                  onClick={() => setNewEntry({ ...newEntry, mood: m })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                    newEntry.mood === m ? moodColors[m] : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Content</label>
            <textarea value={newEntry.content} onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })} className="input-field" rows={8} placeholder="Write your thoughts..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={addEntry} className="btn-primary">Save Entry</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteEntry(deleteId)} title="Delete entry" message="This journal entry will be permanently deleted." />
    </div>
  );
}
