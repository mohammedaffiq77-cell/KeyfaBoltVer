import { useState } from 'react';
import { Sidebar, type ViewKey } from '@/components/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { DashboardView } from '@/views/DashboardView';
import { ChatView } from '@/views/ChatView';
import { LifeView } from '@/views/LifeView';
import { ResearchView } from '@/views/ResearchView';
import { CodingView } from '@/views/CodingView';
import { StocksView } from '@/views/StocksView';
import { AIWorldView } from '@/views/AIWorldView';
import { SettingsView } from '@/views/SettingsView';

const VIEW_META: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your unified AI command center' },
  chat: { title: 'Chat', subtitle: 'AI conversations across workspaces' },
  life: { title: 'Life', subtitle: 'Tasks, goals, habits, and journal' },
  research: { title: 'Research', subtitle: 'Knowledge acquisition and sources' },
  coding: { title: 'Coding', subtitle: 'Project management with AI context' },
  stocks: { title: 'Stocks', subtitle: 'Market tracking and watchlists' },
  'ai-world': { title: 'AI World', subtitle: 'Provider analytics and insights' },
  settings: { title: 'Settings', subtitle: 'Configure your KEYFA experience' },
};

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const meta = VIEW_META[activeView];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-hidden">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'chat' && <ChatView />}
          {activeView === 'life' && <LifeView />}
          {activeView === 'research' && <ResearchView />}
          {activeView === 'coding' && <CodingView />}
          {activeView === 'stocks' && <StocksView />}
          {activeView === 'ai-world' && <AIWorldView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
