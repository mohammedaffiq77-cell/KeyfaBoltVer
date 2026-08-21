import { useEffect, useState } from 'react';
import {
  Plus, Search, Trash2, Star, Archive, ExternalLink,
  FileText, Globe, BookOpen, Newspaper, Link2, ChevronRight, Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ResearchProject, ResearchSource } from '@/types';

export function ResearchView() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', tags: '' });
  const [newSource, setNewSource] = useState({ title: '', publisher: '', author: '', url: '', source_type: 'website', reliability: 'medium', publication_date: '', ai_summary: '' });

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (activeProject) loadSources(activeProject.id); }, [activeProject?.id]);

  async function loadProjects() {
    setLoading(true);
    const { data } = await supabase.from('research_projects').select('*').eq('is_archived', false).order('is_favorite', { ascending: false }).order('updated_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function loadSources(projectId: string) {
    const { data } = await supabase.from('research_sources').select('*').eq('project_id', projectId).eq('is_archived', false).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    setSources(data || []);
  }

  async function addProject() {
    if (!newProject.name.trim()) return;
    const tags = newProject.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const { data } = await supabase.from('research_projects').insert({
      name: newProject.name,
      description: newProject.description || null,
      tags,
    }).select().single();
    setNewProject({ name: '', description: '', tags: '' });
    setShowAddProject(false);
    await loadProjects();
    if (data) setActiveProject(data);
  }

  async function addSource() {
    if (!newSource.title.trim() || !activeProject) return;
    await supabase.from('research_sources').insert({
      project_id: activeProject.id,
      title: newSource.title,
      publisher: newSource.publisher || null,
      author: newSource.author || null,
      url: newSource.url || null,
      source_type: newSource.source_type,
      reliability: newSource.reliability,
      publication_date: newSource.publication_date || null,
      ai_summary: newSource.ai_summary || null,
    });
    setNewSource({ title: '', publisher: '', author: '', url: '', source_type: 'website', reliability: 'medium', publication_date: '', ai_summary: '' });
    setShowAddSource(false);
    await loadSources(activeProject.id);
  }

  async function deleteProject(id: string) {
    await supabase.from('research_projects').delete().eq('id', id);
    if (activeProject?.id === id) setActiveProject(null);
    await loadProjects();
  }

  async function deleteSource(id: string) {
    await supabase.from('research_sources').delete().eq('id', id);
    if (activeProject) await loadSources(activeProject.id);
  }

  async function toggleProjectFav(project: ResearchProject) {
    await supabase.from('research_projects').update({ is_favorite: !project.is_favorite }).eq('id', project.id);
    await loadProjects();
  }

  async function toggleSourcePin(source: ResearchSource) {
    await supabase.from('research_sources').update({ is_pinned: !source.is_pinned }).eq('id', source.id);
    if (activeProject) await loadSources(activeProject.id);
  }

  const sourceTypeIcons: Record<string, typeof FileText> = {
    website: Globe,
    article: Newspaper,
    paper: FileText,
    book: BookOpen,
    video: FileText,
    other: Link2,
  };

  const reliabilityColors: Record<string, string> = {
    high: 'bg-success-500/15 text-success-400',
    medium: 'bg-warning-500/15 text-warning-400',
    low: 'bg-error-500/15 text-error-400',
  };

  return (
    <div className="flex h-full">
      {/* Project list */}
      <div className="w-72 border-r border-slate-800/60 flex flex-col bg-slate-950/50 shrink-0">
        <div className="p-4 border-b border-slate-800/60">
          <button onClick={() => setShowAddProject(true)} className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-slate-800/40 animate-pulse" />)}</div>
          ) : projects.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No research projects yet</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={cn(
                  'group p-3 rounded-lg cursor-pointer mb-1 transition-all',
                  activeProject?.id === project.id ? 'bg-blue-500/15 border border-blue-500/30' : 'hover:bg-slate-800/50 border border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Search className={cn('w-4 h-4 shrink-0', activeProject?.id === project.id ? 'text-blue-400' : 'text-slate-500')} />
                    <p className="text-sm font-medium text-slate-200 truncate">{project.name}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); toggleProjectFav(project); }} className="p-1 rounded text-slate-500 hover:text-warning-400">
                      <Star className={cn('w-3.5 h-3.5', project.is_favorite && 'fill-warning-400 text-warning-400')} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteProjectId(project.id); }} className="p-1 rounded text-slate-500 hover:text-error-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {project.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="badge bg-slate-800 text-slate-400 text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sources area */}
      <div className="flex-1 overflow-y-auto">
        {activeProject ? (
          <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold">{activeProject.name}</h2>
                {activeProject.description && <p className="text-slate-400 text-sm mt-1">{activeProject.description}</p>}
              </div>
              <button onClick={() => setShowAddSource(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Source
              </button>
            </div>

            {sources.length === 0 ? (
              <EmptyState icon={FileText} title="No sources yet" description="Add sources like articles, papers, and websites to build your research library." action={<button onClick={() => setShowAddSource(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Source</button>} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((source) => {
                  const Icon = sourceTypeIcons[source.source_type] || FileText;
                  return (
                    <div key={source.id} className="card p-5 group hover:border-slate-700 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">{source.title}</h4>
                            {source.publisher && <p className="text-slate-500 text-xs truncate">{source.publisher}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleSourcePin(source)} className="p-1 rounded text-slate-500 hover:text-blue-400">
                            <Star className={cn('w-3.5 h-3.5', source.is_pinned && 'fill-blue-400 text-blue-400')} />
                          </button>
                          <button onClick={() => setDeleteSourceId(source.id)} className="p-1 rounded text-slate-500 hover:text-error-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {source.ai_summary && <p className="text-slate-400 text-sm mb-3 line-clamp-3">{source.ai_summary}</p>}
                      <div className="flex items-center gap-3 text-xs">
                        <span className={cn('badge capitalize', reliabilityColors[source.reliability])}>{source.reliability} reliability</span>
                        <span className="badge bg-slate-800 text-slate-400 capitalize">{source.source_type}</span>
                        {source.publication_date && <span className="text-slate-500">{formatDate(source.publication_date)}</span>}
                        {source.url && (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 ml-auto">
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <EmptyState icon={Search} title="No project selected" description="Select a research project or create a new one to start collecting sources." action={<button onClick={() => setShowAddProject(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Project</button>} />
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Modal open={showAddProject} onClose={() => setShowAddProject(false)} title="New Research Project" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Name</label>
            <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="input-field" placeholder="e.g. AI Safety Research" autoFocus />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Description</label>
            <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="input-field" rows={3} placeholder="What are you investigating?" />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Tags (comma-separated)</label>
            <input value={newProject.tags} onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })} className="input-field" placeholder="e.g. AI, safety, alignment" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddProject(false)} className="btn-ghost">Cancel</button>
            <button onClick={addProject} className="btn-primary">Create Project</button>
          </div>
        </div>
      </Modal>

      {/* Add Source Modal */}
      <Modal open={showAddSource} onClose={() => setShowAddSource(false)} title="Add Source" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Title</label>
            <input value={newSource.title} onChange={(e) => setNewSource({ ...newSource, title: e.target.value })} className="input-field" placeholder="Source title" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Publisher</label>
              <input value={newSource.publisher} onChange={(e) => setNewSource({ ...newSource, publisher: e.target.value })} className="input-field" placeholder="e.g. Nature, arXiv" />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Author</label>
              <input value={newSource.author} onChange={(e) => setNewSource({ ...newSource, author: e.target.value })} className="input-field" placeholder="Author name" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">URL</label>
            <input value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Type</label>
              <select value={newSource.source_type} onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })} className="input-field">
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="paper">Paper</option>
                <option value="book">Book</option>
                <option value="video">Video</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Reliability</label>
              <select value={newSource.reliability} onChange={(e) => setNewSource({ ...newSource, reliability: e.target.value })} className="input-field">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium block mb-1.5">Published</label>
              <input type="date" value={newSource.publication_date} onChange={(e) => setNewSource({ ...newSource, publication_date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Summary</label>
            <textarea value={newSource.ai_summary} onChange={(e) => setNewSource({ ...newSource, ai_summary: e.target.value })} className="input-field" rows={3} placeholder="Key takeaways or summary..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddSource(false)} className="btn-ghost">Cancel</button>
            <button onClick={addSource} className="btn-primary">Add Source</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteProjectId} onClose={() => setDeleteProjectId(null)} onConfirm={() => deleteProjectId && deleteProject(deleteProjectId)} title="Delete project" message="This project and all its sources will be permanently deleted." />
      <ConfirmDialog open={!!deleteSourceId} onClose={() => setDeleteSourceId(null)} onConfirm={() => deleteSourceId && deleteSource(deleteSourceId)} title="Delete source" message="This source will be permanently deleted." />
    </div>
  );
}
