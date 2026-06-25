import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowLeft, LayoutDashboard, FileText, Users, Tag, Mail,
  Search, ChevronUp, ChevronDown, Star, StarOff, Send, Menu, X,
} from 'lucide-react';


/* ── Mock data ──────────────────────────────────────────────────── */

const monthlyReaders = [
  { month: 'Jun', readers: 3200 }, { month: 'Jul', readers: 4100 },
  { month: 'Aug', readers: 3800 }, { month: 'Sep', readers: 5200 },
  { month: 'Oct', readers: 6100 }, { month: 'Nov', readers: 5700 },
  { month: 'Dec', readers: 7400 }, { month: 'Jan', readers: 6900 },
  { month: 'Feb', readers: 8200 }, { month: 'Mar', readers: 9100 },
  { month: 'Apr', readers: 8700 }, { month: 'May', readers: 11300 },
];

const mockSubscribers = [
  { name: 'Amina Diallo', email: 'amina@example.com', joined: 'Jan 12, 2026', plan: 'Free' },
  { name: 'Kofi Asante', email: 'kofi@example.com', joined: 'Feb 3, 2026', plan: 'Premium' },
  { name: 'Ngozi Obi', email: 'ngozi@example.com', joined: 'Feb 18, 2026', plan: 'Free' },
  { name: 'Tendai Moyo', email: 'tendai@example.com', joined: 'Mar 5, 2026', plan: 'Premium' },
  { name: 'Fatou Sow', email: 'fatou@example.com', joined: 'Mar 22, 2026', plan: 'Free' },
  { name: 'Seun Adeyemi', email: 'seun@example.com', joined: 'Apr 1, 2026', plan: 'Premium' },
  { name: 'Zainab Hassan', email: 'zainab@example.com', joined: 'Apr 14, 2026', plan: 'Free' },
  { name: 'Ade Mensah', email: 'ade@example.com', joined: 'Apr 30, 2026', plan: 'Premium' },
  { name: 'Chiamaka Eze', email: 'chiamaka@example.com', joined: 'May 9, 2026', plan: 'Free' },
  { name: 'Yaw Boateng', email: 'yaw@example.com', joined: 'May 20, 2026', plan: 'Premium' },
];

const PIE_COLORS = ['#b8652f', '#d4a574', '#8b3a1a', '#e07a3f', '#cc7722', '#a0522d'];

/* ── Helpers ────────────────────────────────────────────────────── */

function getCategoryData(articles: any[]) {
  const counts: Record<string, number> = {};
  articles.forEach((a: any) => { counts[a.category] = (counts[a.category] ?? 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getSubcategoryData(articles: any[]) {
  const counts: Record<string, number> = {};
  articles.forEach((a: any) => { counts[`${a.category} / ${a.subcategory}`] = (counts[`${a.category} / ${a.subcategory}`] ?? 0) + 1; });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

function getUniqueAuthors(articles: any[]) {
  const map: Record<string, { bio: string; articles: any[]; categories: string[] }> = {};
  articles.forEach((a: any) => {
    if (!map[a.author]) map[a.author] = { bio: a.authorBio, articles: [], categories: [] };
    map[a.author].articles.push(a);
    if (!map[a.author].categories.includes(a.category)) map[a.author].categories.push(a.category);
  });
  return map;
}

/* ── Sub-components ─────────────────────────────────────────────── */

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl text-foreground font-medium">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/* ── Sections ────────────────────────────────────────────────────── */

function Overview({ savedCount, articles }: { savedCount: number; articles: any[] }) {
  const categoryData = getCategoryData(articles);
  const uniqueAuthors = Object.keys(getUniqueAuthors(articles));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={articles.length} sub="18 published" />
        <StatCard label="Contributors" value={uniqueAuthors.length} sub="unique authors" />
        <StatCard label="Bookmarked" value={savedCount} sub="by readers" />
        <StatCard label="Subscribers" value="1,247" sub="+12% this month" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base text-foreground mb-6">Monthly Readership</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyReaders}>
              <defs>
                <linearGradient id="readerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b8652f" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#b8652f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,101,47,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b5346' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b5346' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fdfaf6', border: '1px solid rgba(184,101,47,0.2)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#2d1810' }}
              />
              <Area type="monotone" dataKey="readers" stroke="#b8652f" strokeWidth={2} fill="url(#readerGrad)" />
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
              <Tooltip
                contentStyle={{ background: '#fdfaf6', border: '1px solid rgba(184,101,47,0.2)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" fill="#b8652f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

type SortKey = 'title' | 'category' | 'author' | 'date';

function ArticlesTable({ articles }: { articles: any[] }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [featured, setFeatured] = useState<Set<number>>(new Set([0]));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = articles
    .filter((a) => {
      const q = query.toLowerCase();
      return !q || a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  return (
    <div className="space-y-4">
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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {(['title', 'category', 'author', 'date'] as SortKey[]).map((k) => (
                  <th key={k} className="text-left px-4 py-3">
                    <button
                      onClick={() => toggleSort(k)}
                      className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {k} <SortIcon k={k} />
                    </button>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Read time</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Featured</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article, i) => (
                <tr key={article.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="font-medium text-foreground line-clamp-1">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{article.subcategory}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{article.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{article.author}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{article.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{article.readTime}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setFeatured((prev) => {
                        const next = new Set(prev);
                        next.has(article.id) ? next.delete(article.id) : next.add(article.id);
                        return next;
                      })}
                      className={`transition-colors ${featured.has(article.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      {featured.has(article.id) ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
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

function AuthorsSection({ onFilterAuthor, articles }: { onFilterAuthor: (name: string) => void; articles: any[] }) {
  const authorsMap = getUniqueAuthors(articles);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Object.entries(authorsMap).map(([name, data]) => (
        <div key={name} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              {name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground">{data.articles.length} article{data.articles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{data.bio}</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {data.categories.map((cat) => (
              <span key={cat} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{cat}</span>
            ))}
          </div>
          <button
            onClick={() => onFilterAuthor(name)}
            className="text-xs text-primary hover:underline"
          >
            View articles →
          </button>
        </div>
      ))}
    </div>
  );
}

function CategoriesSection({ articles }: { articles: any[] }) {
  const categoryData = getCategoryData(articles);
  const subcategoryData = getSubcategoryData(articles);

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base text-foreground mb-6">Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#fdfaf6', border: '1px solid rgba(184,101,47,0.2)', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#6b5346' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base text-foreground mb-4">Subcategory Breakdown</h3>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {subcategoryData.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{name}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscribersSection() {
  const [sent, setSent] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base text-foreground">Subscriber list</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{mockSubscribers.length} subscribers shown · 1,247 total</p>
        </div>
        <button
          onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
        >
          <Send className="w-3.5 h-3.5" />
          {sent ? 'Newsletter sent!' : 'Send newsletter'}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Joined</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Plan</th>
            </tr>
          </thead>
          <tbody>
            {mockSubscribers.map((sub, i) => (
              <tr key={sub.email} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium">
                      {sub.name.charAt(0)}
                    </div>
                    <span className="text-foreground">{sub.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{sub.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{sub.joined}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sub.plan === 'Premium' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {sub.plan}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────────── */

type Section = 'overview' | 'articles' | 'authors' | 'categories' | 'subscribers';

interface AdminDashboardProps {
  onBack: () => void;
  savedCount: number;
  articles: any[];
}

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
];

export function AdminDashboard({ onBack, savedCount, articles }: AdminDashboardProps) {
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');

  function handleFilterAuthor(name: string) {
    setAuthorFilter(name);
    setSection('articles');
  }

  const sectionTitles: Record<Section, string> = {
    overview: 'Overview',
    articles: authorFilter ? `Articles by ${authorFilter}` : 'All Articles',
    authors: 'Contributors',
    categories: 'Categories',
    subscribers: 'Subscribers',
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Ubuntu Essence</p>
            <p className="text-sm font-medium text-foreground mt-0.5">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); if (id !== 'articles') setAuthorFilter(''); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                section === id
                  ? 'text-primary bg-primary/5 border-r-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Back to magazine */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to magazine
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-medium text-foreground">{sectionTitles[section]}</h1>
        </header>

        {/* Section content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {section === 'overview' && <Overview savedCount={savedCount} articles={articles} />}
          {section === 'articles' && <ArticlesTable articles={articles} />}
          {section === 'authors' && <AuthorsSection onFilterAuthor={handleFilterAuthor} articles={articles} />}
          {section === 'categories' && <CategoriesSection articles={articles} />}
          {section === 'subscribers' && <SubscribersSection />}
        </main>
      </div>
    </div>
  );
}
