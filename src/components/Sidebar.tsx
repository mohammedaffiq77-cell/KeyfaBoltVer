import { LayoutDashboard, MessageSquare, Calendar, Search, Code2, TrendingUp, Globe, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewKey = 'dashboard' | 'chat' | 'life' | 'research' | 'coding' | 'stocks' | 'ai-world' | 'settings';

const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'life', label: 'Life', icon: Calendar },
  { key: 'research', label: 'Research', icon: Search },
  { key: 'coding', label: 'Coding', icon: Code2 },
  { key: 'stocks', label: 'Stocks', icon: TrendingUp },
  { key: 'ai-world', label: 'AI World', icon: Globe },
  { key: 'settings', label: 'Settings', icon: Settings },
];

type Props = {
  activeView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  collapsed: boolean;
};

export function Sidebar({ activeView, onViewChange, collapsed }: Props) {
  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-950 border-r border-slate-800/60 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800/60 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-lg leading-none tracking-tight">KEYFA</h1>
            <p className="text-slate-500 text-[10px] mt-1 tracking-widest uppercase">AI OS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-200 group relative',
                active
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
              )}
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', active && 'scale-110')} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/60 shrink-0">
          <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900 p-3 border border-slate-700/50">
            <p className="text-slate-300 text-xs font-medium leading-snug">Personal AI Operating System</p>
            <p className="text-slate-500 text-[10px] mt-1">v1.0 · Unified Intelligence</p>
          </div>
        </div>
      )}
    </aside>
  );
}
