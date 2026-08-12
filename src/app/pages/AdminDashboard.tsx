import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowLeft, LayoutDashboard, FileText, Users, Tag, Mail,
  Search, ChevronUp, ChevronDown, Star, StarOff, Send, Menu, X, Trash2, Plus, Pencil, Copy, MessageSquare, PenLine,
} from 'lucide-react';
import { updateArticle, deleteArticle, cloneArticle, getNewsletterSubscribers, sendNewsletter } from '../../lib/api';
import type { NewsletterSubscriber } from '../../lib/types';
import { ArticleEditor } from './ArticleEditor';
import { AdminCategories } from './AdminCategories';
import { AdminAuthors } from './AdminAuthors';
import { AdminComments } from './AdminComments';
import { AdminNotes } from './AdminNotes';


const PIE_COLORS = ['#b8652f', '#d4a574', '#8b3a1a', '#e07a3f', '#cc7722', '#a0522d'];


function getCategoryData(articles: any[]) {
  const counts: Record<string, number> = {};
  articles.forEach((a: any) => { counts[a.categories?.name] = (counts[a.categories?.name] ?? 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getSubcategoryData(articles: any[]) {
  const counts: Record<string, number> = {};
  articles.forEach((a: any) => { counts[`${a.categories?.name} / ${a.subcategories?.name}`] = (counts[`${a.categories?.name} / ${a.subcategories?.name}`] ?? 0) + 1; });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

function getUniqueAuthors(articles: any[]) {
  const map: Record<string, { bio: string; articles: any[]; categories: string[] }> = {};
  articles.forEach((a: any) => {
    const authorName = a.authors?.name || 'Unknown';
    if (!map[authorName]) map[authorName] = { bio: a.authors?.bio || '', articles: [], categories: [] };
    map[authorName].articles.push(a);
    if (a.categories?.name && !map[authorName].categories.includes(a.categories.name)) map[authorName].categories.push(a.categories.name);
  });
  return map;
}

function getPublishedByMonth(articles: any[], months = 6) {
  const now = new Date();
  const buckets: { month: string; count: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), count: 0 });
  }
  articles.forEach((a: any) => {
    if (!a.published_at) return;
    const d = new Date(a.published_at);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const bucket = buckets.find((b, idx) => {
      const start = new Date(now.getFullYear(), now.getMonth() - (months - 1) + idx, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (months - 1) + idx + 1, 0);
      return d >= start && d <= end;
    });
    if (bucket) bucket.count += 1;
  });
  return buckets;
}


function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl text-foreground font-medium">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}


function Overview({ savedCount, articles }: { savedCount: number; articles: any[] }) {
  const categoryData = getCategoryData(articles);
  const uniqueAuthors = Object.keys(getUniqueAuthors(articles));
  const publishedCount = articles.filter((a: any) => a.published).length;
  const publishedByMonth = getPublishedByMonth(articles);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    getNewsletterSubscribers().then((subs) => setSubscriberCount(subs.length)).catch(() => setSubscriberCount(0));
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={articles.length} sub={`${publishedCount} published`} />
        <StatCard label="Contributors" value={uniqueAuthors.length} sub="unique authors" />
        <StatCard label="Bookmarked" value={savedCount} sub="in your reading list" />
        <StatCard label="Subscribers" value={subscriberCount ?? '…'} sub="newsletter signups" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base text-foreground mb-6">Articles Published by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={publishedByMonth}>
              <defs>
                <linearGradient id="readerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b8652f" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#b8652f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,101,47,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b5346' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b5346' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fdfaf6', border: '1px solid rgba(184,101,47,0.2)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#2d1810' }} />
              <Area type="monotone" dataKey="count" stroke="#b8652f" strokeWidth={2} fill="url(#readerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base text-foreground mb-6">Articles by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,101,47,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b5346' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b5346' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fdfaf6', border: '1px solid rgba(184,101,47,0.2)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#b8652f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

type SortKey = 'title' | 'category' | 'author' | 'date' | 'published';

function ArticlesTable({ articles, onRefresh, onEdit }: { articles: any[]; onRefresh: () => void; onEdit: (article: any) => void }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | 'bulk' | null>(null);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => { setSelected(new Set()); }, [articles]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = articles
    .filter((a) => {
      const q = query.toLowerCase();
      const catName = a.categories?.name || '';
      const authorName = a.authors?.name || '';
      return !q || a.title.toLowerCase().includes(q) || authorName.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let av: string, bv: string;
      if (sortKey === 'category') { av = a.categories?.name || ''; bv = b.categories?.name || ''; }
      else if (sortKey === 'author') { av = a.authors?.name || ''; bv = b.authors?.name || ''; }
      else if (sortKey === 'published') { av = a.published ? '1' : '0'; bv = b.published ? '1' : '0'; }
      else if (sortKey === 'date') { av = a.published_at || a.created_at || ''; bv = b.published_at || b.created_at || ''; }
      else { av = a[sortKey] || ''; bv = b[sortKey] || ''; }
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  async function handleTogglePublished(article: any) {
    setTogglingId(article.id);
    try {
      await updateArticle(article.id, { published: !article.published, published_at: !article.published ? new Date().toISOString() : null });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  }

  async function handleToggleFeatured(article: any) {
    setTogglingId(article.id);
    try {
      await updateArticle(article.id, { featured: !article.featured });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteArticle(id);
      setDeleteConfirm(null);
      onRefresh();
    } catch (e) { console.error(e); }
  }

  async function handleClone(id: number) {
    setCloningId(id);
    try {
      await cloneArticle(id);
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setCloningId(null); }
  }

  function toggleAll() {
    if (selected.size === filtered.length && filtered.length > 0) setSelected(new Set());
    else setSelected(new Set(filtered.map(a => a.id)));
  }

  function toggleOne(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkPublish(publish: boolean) {
    const ids = [...selected];
    setBulkBusy(true);
    try {
      await Promise.all(ids.map(id => updateArticle(id, {
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
      })));
      onRefresh();
      setSelected(new Set());
    } catch (e) { console.error(e); }
    finally { setBulkBusy(false); }
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    setBulkBusy(true);
    try {
      await Promise.all(ids.map(id => deleteArticle(id)));
      setDeleteConfirm(null);
      onRefresh();
      setSelected(new Set());
    } catch (e) { console.error(e); }
    finally { setBulkBusy(false); }
  }

  return (
    <div className="space-y-4">
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-base text-foreground font-medium mb-2">
              {deleteConfirm === 'bulk' ? `Delete ${selected.size} article${selected.size !== 1 ? 's' : ''}?` : 'Delete article?'}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button
                onClick={() => deleteConfirm === 'bulk' ? handleBulkDelete() : handleDelete(deleteConfirm)}
                disabled={bulkBusy}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {bulkBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm text-foreground font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleBulkPublish(true)}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {bulkBusy ? '…' : 'Publish'}
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
            >
              {bulkBusy ? '…' : 'Unpublish'}
            </button>
            <button
              onClick={() => setDeleteConfirm('bulk')}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-60"
            >
              {bulkBusy ? '…' : 'Delete'}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} articles</span>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    aria-label="Select all articles"
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Image</th>
                {(['title', 'category', 'author', 'date'] as SortKey[]).map((k) => (
                  <th key={k} className="text-left px-4 py-3">
                    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                      {k} <SortIcon k={k} />
                    </button>
                  </th>
                ))}
                <th className="text-left px-4 py-3">
                  <button onClick={() => toggleSort('published')} className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                    Status <SortIcon k="published" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Featured</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground sticky right-0 bg-muted/30">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article, i) => (
                <tr key={article.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(article.id)}
                      onChange={() => toggleOne(article.id)}
                      aria-label={`Select ${article.title}`}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {article.image_url ? (
                      <img src={article.image_url} alt="" className="w-10 h-10 rounded object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="font-medium text-foreground line-clamp-1">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{article.subcategories?.name || ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{article.categories?.name || ''}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{article.authors?.name || ''}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(article)}
                      disabled={togglingId === article.id}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        article.published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {togglingId === article.id ? '…' : article.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleFeatured(article)}
                      disabled={togglingId === article.id}
                      className={`transition-colors ${article.featured ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      {togglingId === article.id ? <span className="text-xs">…</span> : article.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 sticky right-0 bg-card">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onEdit(article)} className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleClone(article.id)} disabled={cloningId === article.id} className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Clone">
                        {cloningId === article.id ? <span className="text-xs">…</span> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDeleteConfirm(article.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function SubscribersSection() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getNewsletterSubscribers()
      .then(setSubscribers)
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = subscribers.filter(sub => {
    const q = query.toLowerCase();
    return !q || sub.email.toLowerCase().includes(q);
  });

  async function handleSend(test = false) {
    setSending(true);
    setSendResult(null);
    try {
      const result = await sendNewsletter({ test });
      setSendResult({
        ok: true,
        message: test
          ? 'Test email sent to your inbox.'
          : result?.message || `Newsletter sent to ${result?.sent ?? 0} subscriber(s)!`,
      });
    } catch (e: any) {
      setSendResult({ ok: false, message: e?.message || 'Something went wrong.' });
    }
    setSending(false);
    setTimeout(() => setSendResult(null), 5000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base text-foreground">Subscriber list</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? 'Loading…' : `${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSend(true)}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5" />
            Send test
          </button>
          <button
            onClick={() => handleSend(false)}
            disabled={sending || subscribers.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending…' : 'Send newsletter'}
          </button>
        </div>
      </div>

      {sendResult && (
        <p className={`text-sm ${sendResult.ok ? 'text-primary' : 'text-destructive'}`}>
          {sendResult.message}
        </p>
      )}

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search subscribers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading subscribers…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-muted-foreground">{query ? 'No subscribers match your search.' : 'No subscribers yet.'}</td></tr>
            ) : (
              filtered.map((sub, i) => (
                <tr key={sub.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3 text-foreground">{sub.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


type Section = 'overview' | 'articles' | 'authors' | 'categories' | 'subscribers' | 'comments' | 'notes';

interface AdminDashboardProps {
  onBack: () => void;
  savedCount: number;
  articles: any[];
  loading?: boolean;
  onRefresh: () => void;
}

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'notes', label: 'Notes', icon: PenLine },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
];

export function AdminDashboard({ onBack, savedCount, articles, loading, onRefresh }: AdminDashboardProps) {
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [editingArticle, setEditingArticle] = useState<any | 'new' | null>(null);

  function handleFilterAuthor(name: string) {
    setAuthorFilter(name);
    setSection('articles');
  }

  const filteredArticles = authorFilter
    ? articles.filter((a: any) => (a.authors?.name || '') === authorFilter)
    : articles;

  const sectionTitles: Record<Section, string> = {
    overview: 'Overview',
    articles: authorFilter ? `Articles by ${authorFilter}` : 'All Articles',
    authors: 'Contributors',
    categories: 'Categories',
    notes: 'Notes',
    subscribers: 'Subscribers',
    comments: 'Comments',
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Ubuntu Essence</p>
            <p className="text-sm font-medium text-foreground mt-0.5">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); if (id !== 'articles') setAuthorFilter(''); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                section === id ? 'text-primary bg-primary/5 border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={onBack} className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-1">
            <ArrowLeft className="w-4 h-4" />
            Back to magazine
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 px-6 h-14 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-medium text-foreground flex-1">{sectionTitles[section]}</h1>
          {section === 'articles' && (
            <button
              onClick={() => setEditingArticle('new')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Article
            </button>
          )}
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              {section === 'overview' && <Overview savedCount={savedCount} articles={articles} />}
              {section === 'articles' && <ArticlesTable articles={filteredArticles} onRefresh={onRefresh} onEdit={(a) => setEditingArticle(a)} />}
              {section === 'authors' && <AdminAuthors />}
              {section === 'categories' && <AdminCategories />}
              {section === 'notes' && <AdminNotes />}
              {section === 'subscribers' && <SubscribersSection />}
              {section === 'comments' && <AdminComments />}
            </>
          )}
        </main>
      </div>

      {editingArticle !== null && (
        <ArticleEditor
          article={editingArticle === 'new' ? undefined : editingArticle}
          onClose={() => setEditingArticle(null)}
          onSaved={() => { setEditingArticle(null); onRefresh(); }}
        />
      )}
    </div>
  );
}