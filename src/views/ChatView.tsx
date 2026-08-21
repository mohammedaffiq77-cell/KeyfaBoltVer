import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Plus, MessageSquare, Pin, Star, Archive, Trash2, Search,
  Send, Sparkles, MoreHorizontal, Bot, User, Edit2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatRelativeTime, formatTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Conversation, Message, Workspace } from '@/types';

export function ChatView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWs, setSelectedWs] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    supabase.from('workspaces').select('*').then(({ data }) => setWorkspaces(data || []));
  }, []);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id);
    else setMessages([]);
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    setLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('is_archived', false)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    setConversations(data || []);
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function createConversation() {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: 'New Conversation',
        workspace_id: selectedWs || null,
      })
      .select()
      .single();
    if (data) {
      await loadConversations();
      setActiveConv(data);
      setInput('');
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeConv || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConv.id,
      role: 'user',
      content,
      model: null,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      role: 'user',
      content,
    });

    // Simulate AI response
    const aiResponse = generateSimulatedResponse(content);
    await new Promise((r) => setTimeout(r, 800));

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConv.id,
      role: 'assistant',
      content: aiResponse,
      model: 'keyfa-internal',
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      role: 'assistant',
      content: aiResponse,
      model: 'keyfa-internal',
    });

    if (activeConv.title === 'New Conversation') {
      const newTitle = content.slice(0, 40) + (content.length > 40 ? '...' : '');
      await supabase.from('conversations').update({ title: newTitle, updated_at: new Date().toISOString() }).eq('id', activeConv.id);
      setActiveConv({ ...activeConv, title: newTitle });
    }

    await loadConversations();
    setSending(false);
  }

  async function deleteConversation(id: string) {
    await supabase.from('conversations').delete().eq('id', id);
    if (activeConv?.id === id) setActiveConv(null);
    await loadConversations();
  }

  async function togglePin(conv: Conversation) {
    await supabase.from('conversations').update({ is_pinned: !conv.is_pinned }).eq('id', conv.id);
    await loadConversations();
  }

  async function toggleFav(conv: Conversation) {
    await supabase.from('conversations').update({ is_favorite: !conv.is_favorite }).eq('id', conv.id);
    await loadConversations();
  }

  const filteredConvs = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [input, activeConv, sending]);

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-72 border-r border-slate-800/60 flex flex-col bg-slate-950/50 shrink-0">
        <div className="p-4 border-b border-slate-800/60">
          <button onClick={createConversation} className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
          <div className="mt-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={selectedWs}
            onChange={(e) => setSelectedWs(e.target.value)}
            className="input-field mt-2"
          >
            <option value="">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No conversations found</p>
          ) : (
            filteredConvs.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={cn(
                  'group p-3 rounded-lg cursor-pointer mb-1 transition-all',
                  activeConv?.id === conv.id
                    ? 'bg-blue-500/15 border border-blue-500/30'
                    : 'hover:bg-slate-800/50 border border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={cn('w-4 h-4 shrink-0', activeConv?.id === conv.id ? 'text-blue-400' : 'text-slate-500')} />
                    <p className="text-sm font-medium text-slate-200 truncate">{conv.title}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); togglePin(conv); }} className="p-1 rounded text-slate-500 hover:text-blue-400">
                      <Pin className={cn('w-3.5 h-3.5', conv.is_pinned && 'fill-blue-400 text-blue-400')} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(conv.id); }} className="p-1 rounded text-slate-500 hover:text-error-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-6">
                  {conv.is_pinned && <Pin className="w-3 h-3 text-blue-400 fill-blue-400" />}
                  {conv.is_favorite && <Star className="w-3 h-3 text-warning-400 fill-warning-400" />}
                  <p className="text-xs text-slate-500">{formatRelativeTime(conv.updated_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="h-14 border-b border-slate-800/60 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold truncate">{activeConv.title}</h3>
              </div>
              <button onClick={() => toggleFav(activeConv)} className="btn-ghost">
                <Star className={cn('w-4 h-4', activeConv.is_favorite && 'fill-warning-400 text-warning-400')} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-slate-300 font-semibold text-lg">Start a conversation</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-md">Type a message below to begin chatting with your AI assistant.</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {sending && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex items-center gap-1.5 pt-3">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/60 p-4 shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl p-2 focus-within:border-blue-500/40 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="flex-1 bg-transparent outline-none resize-none text-slate-200 placeholder-slate-500 px-2 py-2 max-h-32"
                    style={{ minHeight: '40px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="p-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not- text-white transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="No conversation selected"
              description="Select a conversation from the list or create a new one to start chatting with your AI."
              action={
                <button onClick={createConversation} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Conversation
                </button>
              }
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteConversation(deleteId)}
        title="Delete conversation"
        message="This will permanently delete the conversation and all its messages. This cannot be undone."
      />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        isUser ? 'bg-cyan-500/15' : 'bg-blue-500/15'
      )}>
        {isUser ? <User className="w-4 h-4 text-cyan-400" /> : <Bot className="w-4 h-4 text-blue-400" />}
      </div>
      <div className={cn('max-w-[80%]', isUser && 'text-right')}>
        <div className={cn(
          'inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-cyan-500/15 text-slate-200 rounded-tr-md'
            : 'bg-slate-800/60 text-slate-200 rounded-tl-md'
        )}>
          <div className="prose-chat text-left whitespace-pre-wrap">{message.content}</div>
        </div>
        <p className="text-slate-600 text-xs mt-1 px-1">{formatTime(message.created_at)}</p>
      </div>
    </div>
  );
}

function generateSimulatedResponse(input: string): string {
  const responses = [
    `I understand you're asking about "${input.slice(0, 60)}". Let me help you with that.\n\nBased on my analysis, here are a few key points to consider:\n\n1. This is a simulated response in the KEYFA demo environment\n2. In production, this would connect to your configured AI provider\n3. The response would be context-aware, drawing from your memories and workspace\n\nWould you like me to elaborate on any of these points?`,
    `That's an interesting question. Here's what I think:\n\n${input.slice(0, 80)}\n\nThis touches on several interconnected areas. In the full KEYFA system, I would:\n\n- Search your memory store for relevant context\n- Check your active tasks and goals for alignment\n- Provide a response tailored to your current workspace\n\nLet me know if you'd like to dive deeper.`,
    `Great point. Let me break this down:\n\n• **Context**: I can see you're working within the KEYFA environment\n• **Analysis**: Your question relates to "${input.slice(0, 50)}..."\n• **Suggestion**: Consider exploring the Research workspace for deeper investigation\n\nThis is a simulated response. Connect an AI provider in Settings to enable full intelligence.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
