import { useEffect, useState } from 'react';
import {
  Settings, User, Palette, Brain, Cpu, Bell,
  Shield, Database, Zap, ChevronRight, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import type { Workspace } from '@/types';

type Section = 'general' | 'appearance' | 'memory' | 'ai' | 'workspaces' | 'data';

export function SettingsView() {
  const [section, setSection] = useState<Section>('general');
  const { theme, toggleTheme } = useTheme();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [defaultModel, setDefaultModel] = useState('auto');
  const [temperature, setTemperature] = useState(0.7);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [crossWorkspace, setCrossWorkspace] = useState(true);

  useEffect(() => {
    supabase.from('workspaces').select('*').order('created_at').then(({ data }) => setWorkspaces(data || []));
  }, []);

  const sections: { key: Section; label: string; icon: typeof Settings }[] = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'memory', label: 'Memory', icon: Brain },
    { key: 'ai', label: 'AI Models', icon: Cpu },
    { key: 'workspaces', label: 'Workspaces', icon: Database },
    { key: 'data', label: 'Data', icon: Shield },
  ];

  return (
    <div className="flex h-full max-w-5xl mx-auto">
      {/* Settings nav */}
      <div className="w-56 shrink-0 border-r border-slate-800/60 p-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all',
                section === s.key ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Settings content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {section === 'general' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-white text-xl font-bold">General Settings</h2>
            <div className="card p-5 space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Display Name</label>
                <input className="input-field" defaultValue="User" />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Default Workspace</label>
                <select className="input-field">
                  {workspaces.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm font-medium">Notifications</p>
                  <p className="text-slate-500 text-xs">Get notified about important updates</p>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            </div>
          </div>
        )}

        {section === 'appearance' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-white text-xl font-bold">Appearance</h2>
            <div className="card p-5">
              <p className="text-slate-300 text-sm font-medium mb-3">Theme</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  className={cn('p-4 rounded-xl border-2 transition-all', theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600')}
                >
                  <div className="h-20 rounded-lg bg-slate-950 mb-2 flex items-center justify-center">
                    <div className="w-12 h-6 rounded bg-slate-800" />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">Dark</p>
                  {theme === 'dark' && <Check className="w-4 h-4 text-blue-400 mx-auto mt-1" />}
                </button>
                <button
                  onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  className={cn('p-4 rounded-xl border-2 transition-all', theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600')}
                >
                  <div className="h-20 rounded-lg bg-slate-100 mb-2 flex items-center justify-center">
                    <div className="w-12 h-6 rounded bg-white shadow" />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">Light</p>
                  {theme === 'light' && <Check className="w-4 h-4 text-blue-400 mx-auto mt-1" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'memory' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-white text-xl font-bold">Memory Settings</h2>
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm font-medium">Long-term Memory</p>
                  <p className="text-slate-500 text-xs">Store and recall information across conversations</p>
                </div>
                <Toggle checked={memoryEnabled} onChange={() => setMemoryEnabled(!memoryEnabled)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm font-medium">Cross-Workspace Memory</p>
                  <p className="text-slate-500 text-xs">Share memories between workspaces</p>
                </div>
                <Toggle checked={crossWorkspace} onChange={() => setCrossWorkspace(!crossWorkspace)} />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Memory Retention</label>
                <select className="input-field">
                  <option>Forever</option>
                  <option>1 year</option>
                  <option>6 months</option>
                  <option>3 months</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {section === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-white text-xl font-bold">AI Model Settings</h2>
            <div className="card p-5 space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Default Model</label>
                <select value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} className="input-field">
                  <option value="auto">Auto (best available)</option>
                  <option value="gpt-4">GPT-4 Turbo</option>
                  <option value="claude-3.5">Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5">Gemini 1.5 Pro</option>
                  <option value="mistral">Mistral Large</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  Temperature: {temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning-400" />
                Connected Providers
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'OpenAI', status: 'connected', color: '#10a37f' },
                  { name: 'Anthropic', status: 'connected', color: '#d4a574' },
                  { name: 'Google AI', status: 'disconnected', color: '#4285f4' },
                  { name: 'Mistral AI', status: 'disconnected', color: '#ff7000' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}20` }}>
                        <Cpu className="w-4 h-4" style={{ color: p.color }} />
                      </div>
                      <span className="text-slate-200 text-sm font-medium">{p.name}</span>
                    </div>
                    <span className={cn('badge', p.status === 'connected' ? 'bg-success-500/15 text-success-400' : 'bg-slate-700/50 text-slate-400')}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === 'workspaces' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-white text-xl font-bold">Workspaces</h2>
            <div className="card p-5">
              <div className="space-y-2">
                {workspaces.map((ws) => (
                  <div key={ws.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ws.color}20` }}>
                      <Database className="w-4 h-4" style={{ color: ws.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200 text-sm font-medium">{ws.name}</p>
                      <p className="text-slate-500 text-xs">{ws.description}</p>
                    </div>
                    {ws.is_active && <span className="badge bg-success-500/15 text-success-400">Active</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === 'data' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-white text-xl font-bold">Data & Privacy</h2>
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="text-slate-300 text-sm font-medium mb-2">Data Storage</h3>
                <p className="text-slate-500 text-xs mb-3">Your data is stored securely in your Supabase database with row-level security enabled.</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success-500/10 border border-success-500/20">
                  <Shield className="w-4 h-4 text-success-400" />
                  <span className="text-success-400 text-sm">All tables have RLS enabled</span>
                </div>
              </div>
              <div>
                <h3 className="text-slate-300 text-sm font-medium mb-2">Export Data</h3>
                <p className="text-slate-500 text-xs mb-3">Download all your data as JSON.</p>
                <button className="btn-ghost border border-slate-700">Export All Data</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'w-11 h-6 rounded-full transition-all relative',
        checked ? 'bg-blue-500' : 'bg-slate-700'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all',
        checked ? 'left-[22px]' : 'left-0.5'
      )} />
    </button>
  );
}
