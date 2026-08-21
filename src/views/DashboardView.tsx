import { useEffect, useState } from 'react';
import {
  Sparkles, TrendingUp, CheckCircle2, Clock, Target, Flame,
  Brain, MessageSquare, FileText, Activity, ArrowRight, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { Task, Conversation, Habit, Memory, Goal } from '@/types';

type Stats = {
  tasksToday: number;
  tasksCompleted: number;
  activeConversations: number;
  habitsToday: number;
  habitsCompleted: number;
  memories: number;
  activeGoals: number;
  streak: number;
};

export function DashboardView() {
  const [stats, setStats] = useState<Stats>({
    tasksToday: 0, tasksCompleted: 0, activeConversations: 0,
    habitsToday: 0, habitsCompleted: 0, memories: 0, activeGoals: 0, streak: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const [tasksRes, convRes, habitsRes, memRes, goalsRes, habitLogsRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('conversations').select('*').eq('is_archived', false).order('updated_at', { ascending: false }).limit(5),
      supabase.from('habits').select('*').order('updated_at', { ascending: false }),
      supabase.from('memories').select('*').eq('is_archived', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('goals').select('*').eq('status', 'active').order('updated_at', { ascending: false }),
      supabase.from('habit_logs').select('*').eq('log_date', today),
    ]);

    const tasks = tasksRes.data || [];
    const conversations = convRes.data || [];
    const habitList = habitsRes.data || [];
    const memories = memRes.data || [];
    const goals = goalsRes.data || [];
    const logs = habitLogsRes.data || [];

    setRecentTasks(tasks.slice(0, 5));
    setRecentConversations(conversations);
    setRecentMemories(memories);
    setActiveGoals(goals);
    setHabits(habitList);

    const tasksToday = tasks.filter((t) => t.due_date === today).length;
    const tasksCompleted = tasks.filter((t) => t.is_completed).length;
    const habitsCompleted = logs.filter((l) => l.completed).length;
    const bestStreak = habitList.reduce((max, h) => Math.max(max, h.streak), 0);

    setStats({
      tasksToday,
      tasksCompleted,
      activeConversations: conversations.length,
      habitsToday: habitList.length,
      habitsCompleted,
      memories: memories.length,
      activeGoals: goals.length,
      streak: bestStreak,
    });
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)'
        }} />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back to KEYFA</h1>
          <p className="text-blue-100 text-base max-w-2xl">
            Your unified AI operating system. Everything is connected — your conversations, tasks, research, and knowledge work together.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Tasks Done" value={loading ? '—' : `${stats.tasksCompleted}`} accent="success" sub={`${stats.tasksToday} due today`} />
        <StatCard icon={MessageSquare} label="Active Chats" value={loading ? '—' : `${stats.activeConversations}`} accent="primary" sub="conversations" />
        <StatCard icon={Flame} label="Best Streak" value={loading ? '—' : `${stats.streak} days`} accent="warning" sub={`${stats.habitsCompleted}/${stats.habitsToday} today`} />
        <StatCard icon={Target} label="Active Goals" value={loading ? '—' : `${stats.activeGoals}`} accent="accent" sub="in progress" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - tasks & habits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent tasks */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-400" />
                Recent Tasks
              </h3>
              <button className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {recentTasks.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No tasks yet. Create one from the Life workspace.</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/40 transition-all">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      task.is_completed ? 'bg-success-500 border-success-500' : 'border-slate-600'
                    }`}>
                      {task.is_completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm flex-1 ${task.is_completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {task.title}
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits today */}
          <div className="card p-5">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-warning-400" />
              Habits Today
            </h3>
            {habits.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No habits tracked yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {habits.slice(0, 6).map((habit) => (
                  <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-800/60">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{habit.name}</p>
                      <p className="text-slate-500 text-xs">{habit.streak} day streak</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - conversations, memories, goals */}
        <div className="space-y-6">
          {/* Recent conversations */}
          <div className="card p-5">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary-400" />
              Recent Conversations
            </h3>
            {recentConversations.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {recentConversations.map((conv) => (
                  <div key={conv.id} className="p-2.5 rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer">
                    <p className="text-slate-200 text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatRelativeTime(conv.updated_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active goals */}
          <div className="card p-5">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-accent-400" />
              Active Goals
            </h3>
            {activeGoals.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No active goals.</p>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 4).map((goal) => (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-slate-200 text-sm font-medium truncate">{goal.title}</p>
                      <span className="text-slate-400 text-xs font-mono">{goal.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent memories */}
          <div className="card p-5">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary-400" />
              Recent Memories
            </h3>
            {recentMemories.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No memories stored yet.</p>
            ) : (
              <div className="space-y-2">
                {recentMemories.map((mem) => (
                  <div key={mem.id} className="p-2.5 rounded-lg hover:bg-slate-800/40 transition-all">
                    <p className="text-slate-200 text-sm font-medium truncate">{mem.title}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{mem.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: typeof Zap; label: string; value: string; sub: string;
  accent: 'primary' | 'success' | 'warning' | 'accent';
}) {
  const colors = {
    primary: 'text-primary-400 bg-primary-500/10',
    success: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    accent: 'text-accent-400 bg-accent-500/10',
  };
  return (
    <div className="card p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
      <p className="text-slate-500 text-xs mt-1">{sub}</p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    urgent: 'bg-error-500/15 text-error-400',
    high: 'bg-warning-500/15 text-warning-400',
    medium: 'bg-primary-500/15 text-primary-400',
    low: 'bg-slate-700/50 text-slate-400',
  };
  return <span className={`badge ${styles[priority] || styles.low}`}>{priority}</span>;
}
