import { useEffect, useState } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Trash2, Star,
  BarChart3, Search, Minus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import type { StockWatchlist, WatchlistItem } from '@/types';

// Simulated stock data (in a real app, this would come from a market data API)
const STOCK_DATA: Record<string, { price: number; change: number; changePct: number; name: string }> = {
  AAPL: { price: 178.45, change: 2.32, changePct: 1.32, name: 'Apple Inc.' },
  GOOGL: { price: 142.78, change: -0.89, changePct: -0.62, name: 'Alphabet Inc.' },
  MSFT: { price: 378.91, change: 4.12, changePct: 1.10, name: 'Microsoft Corp.' },
  AMZN: { price: 145.24, change: 1.67, changePct: 1.16, name: 'Amazon.com Inc.' },
  TSLA: { price: 248.50, change: -5.23, changePct: -2.06, name: 'Tesla Inc.' },
  NVDA: { price: 721.28, change: 15.67, changePct: 2.22, name: 'NVIDIA Corp.' },
  META: { price: 485.72, change: 3.45, changePct: 0.72, name: 'Meta Platforms Inc.' },
  NFLX: { price: 612.89, change: -2.14, changePct: -0.35, name: 'Netflix Inc.' },
  AMD: { price: 165.43, change: 4.21, changePct: 2.61, name: 'Advanced Micro Devices' },
  INTC: { price: 42.18, change: -0.32, changePct: -0.75, name: 'Intel Corp.' },
  JPM: { price: 198.76, change: 1.89, changePct: 0.96, name: 'JPMorgan Chase' },
  V: { price: 275.43, change: 0.78, changePct: 0.28, name: 'Visa Inc.' },
};

export function StocksView() {
  const [watchlists, setWatchlists] = useState<StockWatchlist[]>([]);
  const [activeList, setActiveList] = useState<StockWatchlist | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddList, setShowAddList] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [newStock, setNewStock] = useState({ symbol: '', company_name: '', notes: '' });

  useEffect(() => { loadWatchlists(); }, []);
  useEffect(() => { if (activeList) loadItems(activeList.id); }, [activeList?.id]);

  async function loadWatchlists() {
    setLoading(true);
    const { data } = await supabase.from('stock_watchlists').select('*').order('created_at', { ascending: false });
    setWatchlists(data || []);
    setLoading(false);
  }

  async function loadItems(listId: string) {
    const { data } = await supabase.from('watchlist_items').select('*').eq('watchlist_id', listId).order('created_at', { ascending: false });
    setItems(data || []);
  }

  async function addList() {
    if (!newList.name.trim()) return;
    const { data } = await supabase.from('stock_watchlists').insert({
      name: newList.name,
      description: newList.description || null,
    }).select().single();
    setNewList({ name: '', description: '' });
    setShowAddList(false);
    await loadWatchlists();
    if (data) setActiveList(data);
  }

  async function addStock() {
    if (!newStock.symbol.trim() || !activeList) return;
    const symbol = newStock.symbol.toUpperCase();
    const stockInfo = STOCK_DATA[symbol];
    await supabase.from('watchlist_items').insert({
      watchlist_id: activeList.id,
      symbol,
      company_name: newStock.company_name || stockInfo?.name || null,
      notes: newStock.notes || null,
    });
    setNewStock({ symbol: '', company_name: '', notes: '' });
    setShowAddStock(false);
    await loadItems(activeList.id);
  }

  async function deleteList(id: string) {
    await supabase.from('stock_watchlists').delete().eq('id', id);
    if (activeList?.id === id) setActiveList(null);
    await loadWatchlists();
  }

  async function deleteItem(id: string) {
    await supabase.from('watchlist_items').delete().eq('id', id);
    if (activeList) await loadItems(activeList.id);
  }

  const marketStats = {
    gainers: Object.values(STOCK_DATA).filter((s) => s.change > 0).length,
    losers: Object.values(STOCK_DATA).filter((s) => s.change < 0).length,
    avgChange: (Object.values(STOCK_DATA).reduce((sum, s) => sum + s.changePct, 0) / Object.keys(STOCK_DATA).length).toFixed(2),
  };

  return (
    <div className="flex h-full">
      {/* Watchlist sidebar */}
      <div className="w-64 border-r border-slate-800/60 flex flex-col bg-slate-950/50 shrink-0">
        <div className="p-4 border-b border-slate-800/60">
          <button onClick={() => setShowAddList(true)} className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            New Watchlist
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">{[...Array(2)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-slate-800/40 animate-pulse" />)}</div>
          ) : watchlists.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No watchlists yet</p>
          ) : (
            watchlists.map((list) => (
              <div
                key={list.id}
                onClick={() => setActiveList(list)}
                className={cn(
                  'group p-3 rounded-lg cursor-pointer mb-1 transition-all',
                  activeList?.id === list.id ? 'bg-blue-500/15 border border-blue-500/30' : 'hover:bg-slate-800/50 border border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <BarChart3 className={cn('w-4 h-4 shrink-0', activeList?.id === list.id ? 'text-blue-400' : 'text-slate-500')} />
                    <p className="text-sm font-medium text-slate-200 truncate">{list.name}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteListId(list.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-error-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {list.description && <p className="text-xs text-slate-500 mt-1 truncate ml-6">{list.description}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto">
        {/* Market overview */}
        <div className="p-6 border-b border-slate-800/60">
          <h2 className="text-white text-xl font-bold mb-4">Market Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Gainers</p>
              <p className="text-success-400 text-2xl font-bold mt-1">{marketStats.gainers}</p>
              <div className="flex items-center gap-1 text-success-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3" /> stocks up
              </div>
            </div>
            <div className="card p-4">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Losers</p>
              <p className="text-error-400 text-2xl font-bold mt-1">{marketStats.losers}</p>
              <div className="flex items-center gap-1 text-error-400 text-xs mt-1">
                <TrendingDown className="w-3 h-3" /> stocks down
              </div>
            </div>
            <div className="card p-4">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Avg Change</p>
              <p className={cn('text-2xl font-bold mt-1', parseFloat(marketStats.avgChange) >= 0 ? 'text-success-400' : 'text-error-400')}>
                {parseFloat(marketStats.avgChange) >= 0 ? '+' : ''}{marketStats.avgChange}%
              </p>
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                <Minus className="w-3 h-3" /> across tracked
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist detail */}
        <div className="p-6">
          {activeList ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{activeList.name}</h3>
                  {activeList.description && <p className="text-slate-400 text-sm">{activeList.description}</p>}
                </div>
                <button onClick={() => setShowAddStock(true)} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Stock
                </button>
              </div>

              {items.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No stocks in this watchlist" description="Add ticker symbols to track their performance." action={<button onClick={() => setShowAddStock(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Stock</button>} />
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const data = STOCK_DATA[item.symbol];
                    return (
                      <div key={item.id} className="card p-4 flex items-center gap-4 group hover:bg-slate-800/40 transition-all">
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-sm">{item.symbol.slice(0, 2)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium">{item.symbol}</h4>
                          <p className="text-slate-500 text-xs truncate">{item.company_name || data?.name || 'Unknown'}</p>
                        </div>
                        {data ? (
                          <>
                            <div className="text-right">
                              <p className="text-white font-mono font-medium">${data.price.toFixed(2)}</p>
                              <p className={cn('text-xs font-mono flex items-center gap-1 justify-end', data.change >= 0 ? 'text-success-400' : 'text-error-400')}>
                                {data.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePct >= 0 ? '+' : ''}{data.changePct.toFixed(2)}%)
                              </p>
                            </div>
                          </>
                        ) : (
                          <span className="badge bg-slate-800 text-slate-500">No data</span>
                        )}
                        <button onClick={() => setDeleteItemId(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-error-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <EmptyState icon={BarChart3} title="No watchlist selected" description="Create a watchlist to start tracking stocks." action={<button onClick={() => setShowAddList(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Watchlist</button>} />
          )}
        </div>
      </div>

      <Modal open={showAddList} onClose={() => setShowAddList(false)} title="New Watchlist" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Name</label>
            <input value={newList.name} onChange={(e) => setNewList({ ...newList, name: e.target.value })} className="input-field" placeholder="e.g. Tech Stocks" autoFocus />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Description</label>
            <input value={newList.description} onChange={(e) => setNewList({ ...newList, description: e.target.value })} className="input-field" placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddList(false)} className="btn-ghost">Cancel</button>
            <button onClick={addList} className="btn-primary">Create Watchlist</button>
          </div>
        </div>
      </Modal>

      <Modal open={showAddStock} onClose={() => setShowAddStock(false)} title="Add Stock" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Symbol</label>
            <input value={newStock.symbol} onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })} className="input-field" placeholder="e.g. AAPL" autoFocus />
            {newStock.symbol && STOCK_DATA[newStock.symbol] && (
              <p className="text-slate-500 text-xs mt-1">Recognized: {STOCK_DATA[newStock.symbol].name}</p>
            )}
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Company Name</label>
            <input value={newStock.company_name} onChange={(e) => setNewStock({ ...newStock, company_name: e.target.value })} className="input-field" placeholder="Auto-filled if known" />
          </div>
          <div>
            <label className="text-slate-400 text-sm font-medium block mb-1.5">Notes</label>
            <input value={newStock.notes} onChange={(e) => setNewStock({ ...newStock, notes: e.target.value })} className="input-field" placeholder="Why are you watching this?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddStock(false)} className="btn-ghost">Cancel</button>
            <button onClick={addStock} className="btn-primary">Add Stock</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteListId} onClose={() => setDeleteListId(null)} onConfirm={() => deleteListId && deleteList(deleteListId)} title="Delete watchlist" message="This watchlist and all its stocks will be permanently deleted." />
      <ConfirmDialog open={!!deleteItemId} onClose={() => setDeleteItemId(null)} onConfirm={() => deleteItemId && deleteItem(deleteItemId)} title="Remove stock" message="This stock will be removed from your watchlist." confirmLabel="Remove" />
    </div>
  );
}
