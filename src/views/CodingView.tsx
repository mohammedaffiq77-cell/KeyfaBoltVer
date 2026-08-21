import { useEffect, useState } from 'react';
import {
  Plus, Code2, Trash2, Star, Github, ExternalLink,
  FileCode, Layers, Clock, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CodingProject } from '@/types';

export function CodingView() {
  const [projects, setProjects] = useState<CodingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<CodingProject | null>(null);
  const [newProject, setNewProject] = useState({
    name: '', description: '', language: '', framework: '', repo_url: '',
    architecture_notes: '', conventions: '', status: 'active'
  });

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    setLoading(true);
    const { data } = await supabase.from('coding_projects').select('*').order('is_favorite', { ascending: false }).order('updated_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function addProject() {
    if (!newProject.name.trim()) return;
    await supabase.from('coding_projects').insert({
      name: newProject.name,
      description: newProject.description || null,
      language: newProject.language || null,
      framework: newProject.framework || null,
      repo_url: newProject.repo_url || null,
      architecture_notes: newProject.architecture_notes || null,
      conventions: newProject.conventions || null,
      status: newProject.status,
    });
    setNewProject({ name: '', description: '', language: '', framework: '', repo_url: '', architecture_notes: '', conventions: '', status: 'active' });
    setShowAdd(false);
    await loadProjects();
  }

  async function deleteProject(id: string) {
    await supabase.from('coding_projects').delete().eq('id', id);
    if (selectedProject?.id === id) setSelectedProject(null);
    await loadProjects();
  }

  async function toggleFav(project: CodingProject) {
    await supabase.from('coding_projects').update({ is_favorite: !project.is_favorite }).eq('id', project.id);
    await loadProjects();
  }

  const statusColors: Record<string, string> = {
    active: 'bg-success-500/15 text-success-400',
    paused: 'bg-warning-500/15 text-warning-400',
    completed: 'bg-primary-500/15 text-primary-400',
    archived: 'bg-slate-700/50 text-slate-400',
  };

  const langColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Rust: '#dea584',
    Go: '#00add8',
    Java: '#ed8b00',
    'C++': '#00599c',
    Ruby: '#cc342d',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-bold">Coding Projects</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your software projects with AI context</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-800/40 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No coding projects"
          description="Add your software projects to give your AI assistant context about your codebase."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="card p-5 group cursor-pointer hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${langColors[project.language || ''] || '#64748b'}20` }}>
                    <Code2 className="w-5 h-5" style={{ color: langColors[project.language || ''] || '#94a3b8' }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold truncate">{project.name}</h4>
                    {project.language && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {project.language}{project.framework ? ` · ${project.framework}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(project); }} className="p-1 rounded text-slate-500 hover:text-warning-400">
                    <Star className={cn('w-4 h-4', project.is_favorite && 'fill-warning-400 text-warning-400')} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }} className="p-1 rounded text-slate-500 hover:text-error-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {project.description && <p className="text-slate-400 text-sm line-clamp-2 mb-3">{project.description}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('badge capitalize', statusColors[project.status])}>{project.status}</span>
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="badge bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1">
                    <Github className="w-3 h-3" /> Repo
                  </a>
                )}
                <span className="text-slate-500 text-xs ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />{formatRelativeTime(project.updated_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project detail modal */}
      <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.name || ''} size="lg">
        {selectedProject && (
          <div className="space-y-4">
            {selectedProject.description && (
              <div>
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Description</h4>
                <p className="text-slate-200 text-sm">{selectedProject.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Language</h4>
                <p className="text-slate-200 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4" style={{ color: langColors[selectedProject.language || ''] || '#94a3b8' }} />
                  {selectedProject.language || '—'}
                </p>
              </div>
              <div>
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Framework</h4>
                <p className="text-slate-200 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  {selectedProject.framework || '—'}
                </p>
              </div>
            </div>
            {selectedProject.architecture_notes && (
              <div>
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Architecture Notes</h4>
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{selectedProject.architecture_notes}</p>
              </div>
            )}
            {selectedProject.conventions && (
              <div>
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Conventions</h4>
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{selectedProject.conventions}</p>
              </div>
            )}
            {selectedProject.repo_url && (
              <a href={selectedProject.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline text-sm">
                <Github className="w-4 h-4" /> {selectedProject.repo_url} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Add project modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Coding Project" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Name</label>
            <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="input-field" placeholder="Project name" autoFocus />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Description</label>
            <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="input-field" rows={2} placeholder="What does this project do?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Language</label>
              <input value={newProject.language} onChange={(e) => setNewProject({ ...newProject, language: e.target.value })} className="input-field" placeholder="e.g. TypeScript" />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Framework</label>
              <input value={newProject.framework} onChange={(e) => setNewProject({ ...newProject, framework: e.target.value })} className="input-field" placeholder="e.g. React" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Repository URL</label>
            <input value={newProject.repo_url} onChange={(e) => setNewProject({ ...newProject, repo_url: e.target.value })} className="input-field" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Architecture Notes</label>
            <textarea value={newProject.architecture_notes} onChange={(e) => setNewProject({ ...newProject, architecture_notes: e.target.value })} className="input-field" rows={3} placeholder="Key architectural decisions..." />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Conventions</label>
            <textarea value={newProject.conventions} onChange={(e) => setNewProject({ ...newProject, conventions: e.target.value })} className="input-field" rows={3} placeholder="Coding conventions..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={addProject} className="btn-primary">Create Project</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteProject(deleteId)} title="Delete project" message="This coding project will be permanently deleted." />
    </div>
  );
}
