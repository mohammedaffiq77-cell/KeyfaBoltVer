import { useEffect, useState } from 'react';
import {
  Globe, Cpu, Zap, Activity, DollarSign, Clock,
  TrendingUp, TrendingDown, BarChart3, Brain, Server
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type ProviderStat = {
  name: string;
  model: string;
  calls: number;
  avgLatency: number;
  successRate: number;
  cost: number;
  trend: 'up' | 'down' | 'flat';
  color: string;
};

export function AIWorldView() {
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalMemories, setTotalMemories] = useState(0);

  useEffect(() => {
    (async () => {
      const [convRes, msgRes, memRes] = await Promise.all([
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('memories').select('id', { count: 'exact', head: true }),
      ]);
      setTotalConversations(convRes.count || 0);
      setTotalMessages(msgRes.count || 0);
      setTotalMemories(memRes.count || 0);
    })();
  }, []);

  const providers: ProviderStat[] = [
    { name: 'OpenAI', model: 'GPT-4 Turbo', calls: 1247, avgLatency: 1.8, successRate: 99.2, cost: 12.45, trend: 'up', color: '#10a37f' },
    { name: 'Anthropic', model: 'Claude 3.5 Sonnet', calls: 892, avgLatency: 2.1, successRate: 98.8, cost: 8.92, trend: 'up', color: '#d4a574' },
    { name: 'Google', model: 'Gemini 1.5 Pro', calls: 445, avgLatency: 1.5, successRate: 97.5, cost: 3.21, trend: 'flat', color: '#4285f4' },
    { name: 'Mistral', model: 'Mistral Large', calls: 178, avgLatency: 1.2, successRate: 96.8, cost: 1.87, trend: 'down', color: '#ff7000' },
  ];

  const totalCost = providers.reduce((sum, p) => sum + p.cost, 0);
  const totalCalls = providers.reduce((sum, p) => sum + p.calls, 0);
  const avgLatency = (providers.reduce((sum, p) => sum + p.avgLatency, 0) / providers.length).toFixed(1);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-white text-xl font-bold">AI World</h2>
        <p className="text-slate-400 text-sm mt-1">Provider analytics, model performance, and usage insights</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard icon={Activity} label="Total Calls" value={totalCalls.toLocaleString()} accent="primary" sub="across all providers" />
        <OverviewCard icon={DollarSign} label="Total Cost" value={`$${totalCost.toFixed(2)}`} accent="success" sub="this month" />
        <OverviewCard icon={Clock} label="Avg Latency" value={`${avgLatency}s`} accent="warning" sub="response time" />
        <OverviewCard icon={Brain} label="Knowledge Base" value={`${totalMemories}`} accent="accent" sub="memories stored" />
      </div>

      {/* Provider breakdown */}
      <div className="card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-primary-400" />
          Provider Performance
        </h3>
        <div className="space-y-3">
          {providers.map((provider) => (
            <div key={provider.name} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-all">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${provider.color}20` }}>
                <Cpu className="w-5 h-5" style={{ color: provider.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium">{provider.name}</h4>
                  <span className="badge bg-slate-700/50 text-slate-400">{provider.model}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span>{provider.calls.toLocaleString()} calls</span>
                  <span>{provider.avgLatency}s avg</span>
                  <span className={cn('flex items-center gap-1', provider.successRate >= 98 ? 'text-success-400' : 'text-warning-400')}>
                    {provider.successRate}% success
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-mono font-medium">${provider.cost.toFixed(2)}</p>
                <div className="flex items-center gap-1 justify-end">
                  {provider.trend === 'up' && <TrendingUp className="w-3 h-3 text-success-400" />}
                  {provider.trend === 'down' && <TrendingDown className="w-3 h-3 text-error-400" />}
                  {provider.trend === 'flat' && <BarChart3 className="w-3 h-3 text-slate-500" />}
                  <span className={cn('text-xs', provider.trend === 'up' ? 'text-success-400' : provider.trend === 'down' ? 'text-error-400' : 'text-slate-500')}>
                    {provider.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage chart placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning-400" />
            Usage by Workspace
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Personal', pct: 45, color: '#3b82f6' },
              { name: 'Research', pct: 28, color: '#8b5cf6' },
              { name: 'Coding', pct: 18, color: '#10b981' },
              { name: 'College', pct: 9, color: '#f59e0b' },
            ].map((ws) => (
              <div key={ws.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-300 text-sm">{ws.name}</span>
                  <span className="text-slate-500 text-xs font-mono">{ws.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ws.pct}%`, backgroundColor: ws.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent-400" />
            System Activity
          </h3>
          <div className="space-y-3">
            <ActivityRow label="Conversations" value={totalConversations} icon={Activity} />
            <ActivityRow label="Messages Exchanged" value={totalMessages} icon={Zap} />
            <ActivityRow label="Memories Stored" value={totalMemories} icon={Brain} />
            <ActivityRow label="Active Workspaces" value={4} icon={Server} />
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, sub, accent }: {
  icon: typeof Globe; label: string; value: string; sub: string;
  accent: 'primary' | 'success' | 'warning' | 'accent';
}) {
  const colors = {
    primary: 'text-primary-400 bg-primary-500/10',
    success: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    accent: 'text-accent-400 bg-accent-500/10',
  };
  return (
    <div className="card p-5">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colors[accent])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
      <p className="text-slate-500 text-xs mt-1">{sub}</p>
    </div>
  );
}

function ActivityRow({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Globe }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-slate-300 text-sm">{label}</span>
      </div>
      <span className="text-white font-mono font-medium">{value.toLocaleString()}</span>
    </div>
  );
}
