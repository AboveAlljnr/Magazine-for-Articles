import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, Search, BookOpen, User, LogOut, ChevronDown,
  Bookmark, Sun, Moon, LayoutDashboard, BookMarked,
} from 'lucide-react';
import { ArticleCard } from './components/ArticleCard';
import { FeaturedArticle } from './components/FeaturedArticle';
import { CategoryNav } from './components/CategoryNav';
import { SearchOverlay } from './components/SearchOverlay';
import { MobileSidebar } from './components/MobileSidebar';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthorPage } from './pages/AuthorPage';
import { NotesPage } from './pages/NotesPage';
import { StaticPage } from './components/StaticPage';
import { privacyPage, termsPage, cookiesPage, aboutPage, contactPage } from './lib/legal-content';
import { applySeo, DEFAULT_TITLE } from './lib/seo';
import type { MappedArticle } from './lib/article-types';
import logoUrl from './components/logo.jpg';
import {
  getArticles, getCategories, getAllSubcategories, getBookmarks,
  addBookmark, removeBookmark, subscribeToNewsletter, getAllArticles, getArticleBySlug,
  incrementArticleViews,
} from '../lib/api';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));

function LazyLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const PT = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

/* ── Helpers ────────────────────────────────────────────────────── */

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function toComponentArticle(row: any): MappedArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body || [],
    image: row.image_url,
    category: row.categories?.name || '',
    subcategory: row.subcategories?.name || '',
    author: row.authors?.name || '',
    authorBio: row.authors?.bio || '',
    authorAvatar: row.authors?.avatar_url || null,
    date: formatDate(row.published_at),
    readTime: `${row.read_time_minutes} min read`,
    featured: row.featured,
    views: row.views || 0,
  };
}

/* ── Route wrapper: Article Detail ─────────────────────────────── */

interface ArticleWrapperProps {
  mappedArticles: MappedArticle[];
  savedIds: Set<number>;
  onToggleSave: (a: MappedArticle) => Promise<void>;
  onAuthorClick: (name: string) => void;
  onArticleClick: (a: MappedArticle) => void;
  user?: { id: string; name: string } | null;
}

function ArticlePageWrapper({
  mappedArticles, savedIds, onToggleSave, onAuthorClick, onArticleClick, user,
}: ArticleWrapperProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<MappedArticle | null>(null);
  const [fetching, setFetching] = useState(true);
  const countedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!slug) { navigate('/'); return; }
    const found = mappedArticles.find(a => a.slug === slug);
    if (found) {
      setArticle(found);
      setFetching(false);
    } else {
      setFetching(true);
      getArticleBySlug(slug)
        .then(data => setArticle(toComponentArticle(data)))
        .catch(() => navigate('/'))
        .finally(() => setFetching(false));
    }
  }, [slug]);

  // Best-effort view counter: once per article per session
  useEffect(() => {
    if (!article) return;
    if (countedRef.current.has(article.id)) return;
    countedRef.current.add(article.id);
    incrementArticleViews(article.id);
  }, [article]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
          <div className="h-4 w-24 bg-muted rounded mb-10" />
          <div className="h-3 w-32 bg-muted rounded mb-5" />
          <div className="h-10 w-3/4 bg-muted rounded mb-6" />
          <div className="h-5 w-full bg-muted rounded mb-2" />
          <div className="h-5 w-5/6 bg-muted rounded mb-8" />
          <div className="aspect-[16/9] bg-muted rounded-xl mb-12" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (!article) return null;

  const related = mappedArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <ArticleDetailPage
      article={article}
      onBack={() => navigate('/')}
      saved={savedIds.has(article.id)}
      onToggleSave={() => onToggleSave(article)}
      relatedArticles={related}
      onArticleClick={onArticleClick}
      onAuthorClick={onAuthorClick}
      userName={user?.name}
      userId={user?.id}
    />
  );
}

/* ── Route wrapper: Author Page ─────────────────────────────────── */

interface AuthorWrapperProps {
  mappedArticles: MappedArticle[];
  savedIds: Set<number>;
  onToggleSave: (a: MappedArticle) => Promise<void>;
  onArticleClick: (a: MappedArticle) => void;
}

function AuthorPageWrapper({ mappedArticles, savedIds, onToggleSave, onArticleClick }: AuthorWrapperProps) {
  const { authorName } = useParams<{ authorName: string }>();
  const navigate = useNavigate();
  const name = authorName ? decodeURIComponent(authorName) : '';

  return (
    <motion.div key={name} {...PT}>
      <AuthorPage
        authorName={name}
        onBack={() => navigate('/')}
        onArticleClick={onArticleClick}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        onAuthorClick={n => navigate(`/authors/${encodeURIComponent(n)}`)}
        allArticles={mappedArticles}
      />
    </motion.div>
  );
}

/* ── Route wrapper: Admin Dashboard ────────────────────────────── */

function AdminPageWrapper({ savedCount }: { savedCount: number }) {
  const navigate = useNavigate();
  const [adminArticles, setAdminArticles] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  function refresh() {
    setAdminLoading(true);
    getAllArticles()
      .then(data => setAdminArticles(data as any[]))
      .catch(() => setAdminArticles([]))
      .finally(() => setAdminLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  return (
    <motion.div key="admin" {...PT}>
      <AdminDashboard
        onBack={() => navigate('/')}
        savedCount={savedCount}
        articles={adminArticles}
        loading={adminLoading}
        onRefresh={refresh}
      />
    </motion.div>
  );
}

/* ── UserMenu ───────────────────────────────────────────────────── */

interface UserMenuProps {
  user: { id: string; name: string; isAdmin?: boolean };
  onLogout: () => void;
  onGoToProfile: () => void;
  onGoToReadingList: () => void;
  onGoToAdmin: () => void;
  savedCount: number;
}

function UserMenu({ user, onLogout, onGoToProfile, onGoToReadingList, onGoToAdmin, savedCount }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs text-primary-foreground font-medium">{user.name.charAt(0)}</span>
        </div>
        <span className="hidden sm:block text-sm text-foreground">{user.name}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-1 z-50">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm text-foreground truncate font-medium">{user.name}</p>
          </div>
          <button
            onClick={() => { setOpen(false); onGoToProfile(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <User className="w-3.5 h-3.5" /> My Profile
          </button>
          <button
            onClick={() => { setOpen(false); onGoToReadingList(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" /> Reading List
            {savedCount > 0 && (
              <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5">{savedCount}</span>
            )}
          </button>
          {user.isAdmin && (
            <button
              onClick={() => { setOpen(false); onGoToAdmin(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
            </button>
          )}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Newsletter ─────────────────────────────────────────────────── */

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <section className="mt-20 py-16 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl mb-4 text-foreground">Join Our Community</h3>
        <p className="text-muted-foreground mb-8">
          Subscribe to Ubuntu Essence for weekly stories celebrating African culture, heritage, and the spirit of togetherness.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {status === 'loading' ? '…' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && <p className="text-sm text-primary mt-3">Thanks for subscribing!</p>}
        {status === 'error' && <p className="text-sm text-destructive mt-3">Something went wrong. Try again.</p>}
      </div>
    </section>
  );
}

/* ── Empty State ────────────────────────────────────────────────── */

function EmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <BookMarked className="w-9 h-9 text-muted-foreground/40" />
      </div>
      <h3 className="text-xl text-foreground mb-2">No stories yet</h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        {category !== 'All'
          ? `We haven't published any "${category}" stories yet. Check back soon or explore another category.`
          : 'No stories have been published yet. Check back soon.'}
      </p>
    </div>
  );
}

/* ── App ────────────────────────────────────────────────────────── */

interface AppProps {
  user?: { id: string; name: string; isAdmin?: boolean } | null;
  onLogout?: () => void;
  onGoToLogin?: () => void;
  showSignInPrompt?: boolean;
  onDismissSignInPrompt?: () => void;
}

export default function App({ user, onLogout, onGoToLogin, showSignInPrompt, onDismissSignInPrompt }: AppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileTab, setProfileTab] = useState<'profile' | 'reading-list' | 'preferences'>('profile');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<{ name: string; slug: string }[]>([]);
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, { name: string; slug: string }[]>>({});
  const [loading, setLoading] = useState(true);

  const mappedArticles: MappedArticle[] = articles.map(toComponentArticle);

  // Close overlays on navigation
  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Fetch categories and subcategories once
  useEffect(() => {
    getCategories().then(cats => setDbCategories(cats)).catch(() => {});
    getAllSubcategories().then(subs => {
      const map: Record<string, { name: string; slug: string }[]> = {};
      for (const sub of subs as any[]) {
        const catName = (sub as any).categories?.name || '';
        if (!map[catName]) map[catName] = [];
        map[catName].push({ name: sub.name, slug: sub.slug });
      }
      setSubcategoryMap(map);
    }).catch(() => {});
  }, []);

  // Fetch articles when filters change
  useEffect(() => {
    setLoading(true);
    const cat = dbCategories.find(c => c.name === activeCategory);
    getArticles({
      categorySlug: cat?.slug,
      subcategorySlug:
        activeSubcategory !== 'All'
          ? Object.values(subcategoryMap).flat().find(s => s.name === activeSubcategory)?.slug
          : undefined,
    })
      .then(data => setArticles(data as any[]))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeSubcategory, dbCategories]);

  // Fetch bookmarks when user changes
  useEffect(() => {
    if (!user?.id) return;
    getBookmarks(user.id)
      .then(data => setSavedIds(new Set(data.map((b: any) => b.article_id))))
      .catch(() => {});
  }, [user]);

  // Sync dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Category-aware titles on the home page
  useEffect(() => {
    if (location.pathname === '/') {
      applySeo({
        title:
          activeCategory === 'All'
            ? DEFAULT_TITLE
            : `${activeCategory} Stories | Ubuntu Essence`,
      });
    }
  }, [activeCategory, location.pathname]);

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    setActiveSubcategory('All');
  }

  function handleArticleClick(article: MappedArticle) {
    navigate(`/articles/${article.slug}`);
  }

  function handleAuthorClick(name: string) {
    navigate(`/authors/${encodeURIComponent(name)}`);
  }

  async function handleToggleSave(article: MappedArticle) {
    if (!user?.id) return;
    const already = savedIds.has(article.id);
    if (already) {
      await removeBookmark(user.id, article.id);
      setSavedIds(prev => { const n = new Set(prev); n.delete(article.id); return n; });
    } else {
      await addBookmark(user.id, article.id);
      setSavedIds(prev => { const n = new Set(prev); n.add(article.id); return n; });
    }
  }

  const dbSubcategories = activeCategory !== 'All' ? subcategoryMap[activeCategory] ?? [] : [];
  const featuredArticle = mappedArticles.find(a => a.featured);
  const savedArticles = mappedArticles.filter(a => savedIds.has(a.id));
  const sectionTitle =
    activeSubcategory !== 'All'
      ? `${activeCategory} — ${activeSubcategory}`
      : activeCategory === 'All'
      ? 'Latest Stories'
      : `${activeCategory} Stories`;

  return (
    <>
      {/* Global overlays */}
      {searchOpen && (
        <SearchOverlay
          articles={mappedArticles}
          onClose={() => setSearchOpen(false)}
          onArticleClick={handleArticleClick}
        />
      )}
      {menuOpen && (
        <MobileSidebar
          activeCategory={activeCategory}
          categories={dbCategories.map(c => c.name)}
          onCategoryChange={handleCategoryChange}
          onClose={() => setMenuOpen(false)}
          onGoToProfile={() => { setProfileTab('profile'); navigate('/profile'); }}
          onGoToReadingList={() => { setProfileTab('reading-list'); navigate('/profile'); }}
          onGoToAdmin={user?.isAdmin ? () => navigate('/admin') : undefined}
          onGoToGallery={() => navigate('/gallery')}
          onGoToNotes={() => navigate('/notes')}
          user={user}
          savedCount={savedIds.size}
        />
      )}

      <Routes>
        {/* ── Main magazine ── */}
        <Route
          path="/"
          element={
            <motion.div key="main" {...PT} className="min-h-screen bg-background">
              {/* Sign-in nudge */}
              <AnimatePresence>
                {showSignInPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm bg-card border border-border rounded-xl shadow-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">Sign in to Ubuntu Essence</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Save articles, bookmark stories, and personalize your reading experience.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={onGoToLogin}
                          className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={onDismissSignInPrompt}
                          className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Maybe later
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={onDismissSignInPrompt}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMenuOpen(true)}>
                      <Menu className="w-6 h-6 text-foreground" />
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={logoUrl}
                        alt="Ubuntu Essence"
                        className="w-8 h-8 sm:w-9 sm:h-9 object-contain mix-blend-multiply dark:invert dark:mix-blend-screen"
                      />
                      <span
                        className="text-sm sm:text-lg xl:text-xl tracking-tight text-primary font-semibold"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                      >
                        UBUNTU ESSENCE
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Toggle dark mode"
                      >
                        {darkMode ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
                      </button>

                      <button
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => navigate('/notes')}
                      >
                        <span className="hidden sm:inline">Notes</span>
                        <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h8M8 14h5M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z" />
                        </svg>
                      </button>

                      <button
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => navigate('/gallery')}
                      >
                        <span className="hidden sm:inline">Gallery</span>
                        <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>

                      <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setSearchOpen(true)}>
                        <Search className="w-5 h-5 text-foreground" />
                      </button>

                      {user && onLogout ? (
                        <UserMenu
                          user={user}
                          onLogout={onLogout}
                          onGoToProfile={() => { setProfileTab('profile'); navigate('/profile'); }}
                          onGoToReadingList={() => { setProfileTab('reading-list'); navigate('/profile'); }}
                          onGoToAdmin={() => navigate('/admin')}
                          savedCount={savedIds.size}
                        />
                      ) : (
                        <button onClick={onGoToLogin} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <User className="w-5 h-5 text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Category Nav */}
              <div className="hidden sm:block">
                <CategoryNav
                  categories={['All', ...dbCategories.map(c => c.name)]}
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                  subcategories={dbSubcategories.map(s => s.name)}
                  activeSubcategory={activeSubcategory}
                  onSubcategoryChange={setActiveSubcategory}
                />
              </div>

              {/* Main content */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Loading stories">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[4/3] rounded-lg bg-muted mb-4" />
                        <div className="space-y-2.5">
                          <div className="h-3 w-24 bg-muted rounded" />
                          <div className="h-5 w-3/4 bg-muted rounded" />
                          <div className="h-4 w-full bg-muted rounded" />
                          <div className="h-4 w-2/3 bg-muted rounded" />
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-7 h-7 rounded-full bg-muted" />
                            <div className="h-3 w-24 bg-muted rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {activeCategory === 'All' && featuredArticle && (
                      <FeaturedArticle
                        article={featuredArticle}
                        onClick={handleArticleClick}
                        saved={savedIds.has(featuredArticle.id)}
                        onToggleSave={() => handleToggleSave(featuredArticle)}
                        onAuthorClick={handleAuthorClick}
                      />
                    )}

                    <section className={activeCategory === 'All' && featuredArticle ? 'mt-16' : ''}>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl tracking-tight">{sectionTitle}</h2>
                        {savedIds.size > 0 && (
                          <button
                            onClick={() => { setProfileTab('reading-list'); navigate('/profile'); }}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            {savedIds.size} saved
                          </button>
                        )}
                      </div>

                      {articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {mappedArticles.map((article, index) => (
                            <motion.div
                              key={article.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.5), ease: 'easeOut' }}
                            >
                              <ArticleCard
                                article={article}
                                onClick={handleArticleClick}
                                saved={savedIds.has(article.id)}
                                onToggleSave={handleToggleSave}
                                onAuthorClick={handleAuthorClick}
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState category={activeCategory} />
                      )}
                    </section>
                  </>
                )}

                <NewsletterSection />
              </main>

              {/* Footer */}
              <footer className="border-t border-border mt-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                      <h4 className="mb-4 text-foreground">About</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><button onClick={() => navigate('/about')} className="hover:text-primary transition-colors">Our Story</button></li>
                        <li><button onClick={() => navigate('/about')} className="hover:text-primary transition-colors">Mission</button></li>
                        <li><button onClick={() => navigate('/contact')} className="hover:text-primary transition-colors">Contact</button></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-4 text-foreground">Explore</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {dbCategories.slice(0, 5).map(cat => (
                          <li key={cat.slug}>
                            <button
                              onClick={() => { handleCategoryChange(cat.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="hover:text-primary transition-colors text-left"
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                        <li><button onClick={() => navigate('/gallery')} className="hover:text-primary transition-colors">Gallery</button></li>
                        <li><button onClick={() => navigate('/notes')} className="hover:text-primary transition-colors">Notes</button></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-4 text-foreground">Connect</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">X</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-4 text-foreground">Legal</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy</button></li>
                        <li><button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button></li>
                        <li><button onClick={() => navigate('/cookies')} className="hover:text-primary transition-colors">Cookies</button></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    © 2026 Ubuntu Essence. Celebrating African culture and community.
                  </div>
                </div>
              </footer>
            </motion.div>
          }
        />

        {/* ── Article detail ── */}
        <Route
          path="/articles/:slug"
          element={
            <ArticlePageWrapper
              mappedArticles={mappedArticles}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onAuthorClick={handleAuthorClick}
              onArticleClick={handleArticleClick}
              user={user}
            />
          }
        />

        {/* ── Author page ── */}
        <Route
          path="/authors/:authorName"
          element={
            <AuthorPageWrapper
              mappedArticles={mappedArticles}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onArticleClick={handleArticleClick}
            />
          }
        />

        {/* ── Gallery ── */}
        <Route
          path="/gallery"
          element={
            <Suspense fallback={<LazyLoader />}>
              <motion.div key="gallery" {...PT}>
                <GalleryPage
                  onBack={() => navigate('/')}
                  onImageClick={slug => {
                    const article = mappedArticles.find(a => a.slug === slug);
                    if (article) navigate(`/articles/${article.slug}`);
                    else navigate('/');
                  }}
                />
              </motion.div>
            </Suspense>
          }
        />

        {/* ── Notes ── */}
        <Route
          path="/notes"
          element={
            <motion.div key="notes" {...PT}>
              <NotesPage onBack={() => navigate('/')} />
            </motion.div>
          }
        />

        {/* ── Profile ── */}
        <Route
          path="/profile"
          element={
            <motion.div key="profile" {...PT}>
              <ProfilePage
                user={user ?? { id: '', name: 'Reader' }}
                savedArticles={savedArticles}
                onBack={() => navigate('/')}
                onArticleClick={handleArticleClick}
                onLogout={onLogout ?? (() => {})}
                defaultTab={profileTab}
              />
            </motion.div>
          }
        />

        {/* ── Admin ── */}
        <Route path="/admin" element={<Suspense fallback={<LazyLoader />}><AdminPageWrapper savedCount={savedIds.size} /></Suspense>} />

        {/* ── Static pages ── */}
        <Route path="/privacy"  element={<motion.div key="privacy"  {...PT}><StaticPage title={privacyPage.title}  sections={privacyPage.sections}  onBack={() => navigate('/')} /></motion.div>} />
        <Route path="/terms"    element={<motion.div key="terms"    {...PT}><StaticPage title={termsPage.title}    sections={termsPage.sections}    onBack={() => navigate('/')} /></motion.div>} />
        <Route path="/cookies"  element={<motion.div key="cookies"  {...PT}><StaticPage title={cookiesPage.title}  sections={cookiesPage.sections}  onBack={() => navigate('/')} /></motion.div>} />
        <Route path="/about"    element={<motion.div key="about"    {...PT}><StaticPage title={aboutPage.title}    sections={aboutPage.sections}    onBack={() => navigate('/')} /></motion.div>} />
        <Route path="/contact"  element={<motion.div key="contact"  {...PT}><StaticPage title={contactPage.title}  sections={contactPage.sections}  onBack={() => navigate('/')} /></motion.div>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
