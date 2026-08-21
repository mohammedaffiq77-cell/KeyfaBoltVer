import { PanelLeftClose, PanelLeft, Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  subtitle?: string;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
};

export function TopBar({ title, subtitle, onToggleSidebar, sidebarCollapsed }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
        >
          {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
        <div>
          <h2 className="text-white font-semibold text-lg leading-none">{title}</h2>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/60 text-slate-500 text-sm w-64">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search across KEYFA..."
            className="bg-transparent outline-none flex-1 placeholder-slate-600 text-slate-300"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">⌘K</kbd>
        </div>
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all'
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold ml-1">
          U
        </div>
      </div>
    </header>
  );
}
