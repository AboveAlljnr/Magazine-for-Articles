import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, Search, BookOpen, User, LogOut, ChevronDown,
  Bookmark, Sun, Moon, LayoutDashboard,
} from 'lucide-react';
import { ArticleCard } from './components/ArticleCard';
import { FeaturedArticle } from './components/FeaturedArticle';
import { CategoryNav } from './components/CategoryNav';
import { SearchOverlay } from './components/SearchOverlay';
import { MobileSidebar } from './components/MobileSidebar';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthorPage } from './pages/AuthorPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { GalleryPage } from './pages/GalleryPage';
import { getArticles, getCategories, getAllSubcategories, getBookmarks, addBookmark, removeBookmark, subscribeToNewsletter, getAllArticles } from '../lib/api';

const PAGE_TRANSITION = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25, ease: 'easeOut' } };

/* ── User menu ──────────────────────────────────────────────────── */

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
          <button onClick={() => { setOpen(false); onGoToProfile(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
            <User className="w-3.5 h-3.5" /> My Profile
          </button>
          <button onClick={() => { setOpen(false); onGoToReadingList(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
            <Bookmark className="w-3.5 h-3.5" /> Reading List
            {savedCount > 0 && <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5">{savedCount}</span>}
          </button>
          {user.isAdmin && (
            <button onClick={() => { setOpen(false); onGoToAdmin(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
            </button>
          )}
          <div className="border-t border-border mt-1 pt-1">
            <button onClick={() => { setOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors">
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
            onChange={(e) => setEmail(e.target.value)}
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

/* ── App ────────────────────────────────────────────────────────── */

type AppView = 'main' | 'article' | 'profile' | 'author' | 'admin' | 'gallery';

interface AppProps {
  user?: { id: string; name: string; isAdmin?: boolean } | null;
  onLogout?: () => void;
  onGoToLogin?: () => void;
  showSignInPrompt?: boolean;
  onDismissSignInPrompt?: () => void;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function toComponentArticle(row: any) {
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
    date: formatDate(row.published_at),
    readTime: `${row.read_time_minutes} min read`,
    featured: row.featured,
  };
}

export default function App({ user, onLogout, onGoToLogin, showSignInPrompt, onDismissSignInPrompt }: AppProps) {
  const [appView, setAppView] = useState<AppView>('main');
  const [prevView, setPrevView] = useState<AppView>('main');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [profileTab, setProfileTab] = useState<'profile' | 'reading-list' | 'preferences'>('profile');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [adminArticles, setAdminArticles] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ name: string; slug: string }[]>([]);
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, { name: string; slug: string }[]>>({});
  const [loading, setLoading] = useState(true);

  // Map DB rows to component shape whenever articles change
  const mappedArticles = articles.map(toComponentArticle);

  // Fetch categories and subcategories once
  useEffect(() => {
    getCategories().then((cats) => setDbCategories(cats)).catch(() => {});
    getAllSubcategories().then((subs) => {
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
    const cat = dbCategories.find((c) => c.name === activeCategory);
    getArticles({
      categorySlug: cat?.slug,
      subcategorySlug: activeSubcategory !== 'All' ? Object.values(subcategoryMap).flat().find(s => s.name === activeSubcategory)?.slug : undefined,
    })
      .then((data) => setArticles(data as any[]))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeSubcategory, dbCategories]);

  // Fetch bookmarks
  useEffect(() => {
    if (!user?.id) return;
    getBookmarks(user.id).then((data) => {
      setSavedIds(new Set(data.map((b: any) => b.article_id)));
    }).catch(() => {});
  }, [user]);

  // Fetch all articles for admin view
  function refreshAdminArticles() {
    if (!user) return;
    setAdminLoading(true);
    getAllArticles()
      .then((data) => setAdminArticles(data as any[]))
      .catch(() => setAdminArticles([]))
      .finally(() => setAdminLoading(false));
  }

  useEffect(() => {
    if (appView === 'admin' && user) {
      refreshAdminArticles();
    }
  }, [appView, user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  function navigate(view: AppView) {
    setPrevView(appView);
    setAppView(view);
  }

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    setActiveSubcategory('All');
  }

  function handleArticleClick(article: any) {
    setSelectedArticle(article);
    navigate('article');
  }

  function handleAuthorClick(name: string) {
    setSelectedAuthor(name);
    navigate('author');
  }

  async function handleToggleSave(article: any) {
    if (!user?.id) return;
    const already = savedIds.has(article.id);
    if (already) {
      await removeBookmark(user.id, article.id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(article.id); return n; });
    } else {
      await addBookmark(user.id, article.id);
      setSavedIds((prev) => { const n = new Set(prev); n.add(article.id); return n; });
    }
  }

  const dbSubcategories = activeCategory !== 'All' ? subcategoryMap[activeCategory] ?? [] : [];

  const featuredArticle = mappedArticles.find((a: any) => a.featured);

  const savedArticles = mappedArticles.filter((a: any) => savedIds.has(a.id));

  const sectionTitle =
    activeSubcategory !== 'All'
      ? `${activeCategory} — ${activeSubcategory}`
      : activeCategory === 'All'
      ? 'Latest Stories'
      : `${activeCategory} Stories`;

  /* ── Sub-views ── */

  if (appView === 'article' && selectedArticle) {
    const related = mappedArticles.filter((a: any) => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 3);
    return (
      <ArticleDetailPage
        article={selectedArticle}
        onBack={() => setAppView(prevView)}
        saved={savedIds.has(selectedArticle.id)}
        onToggleSave={() => handleToggleSave(selectedArticle)}
        relatedArticles={related}
        onArticleClick={handleArticleClick}
        onAuthorClick={handleAuthorClick}
        userName={user?.name}
        userId={user?.id}
      />
    );
  }

  if (appView === 'profile') {
    return (
      <motion.div key="profile" {...PAGE_TRANSITION}>
        <ProfilePage
          user={user ?? { id: '', name: 'Reader' }}
          savedArticles={savedArticles}
          onBack={() => setAppView('main')}
          onArticleClick={handleArticleClick}
          onLogout={onLogout ?? (() => {})}
          defaultTab={profileTab}
        />
      </motion.div>
    );
  }

  if (appView === 'author') {
    return (
      <motion.div key="author" {...PAGE_TRANSITION}>
        <AuthorPage
          authorName={selectedAuthor}
          onBack={() => setAppView('main')}
          onArticleClick={handleArticleClick}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          onAuthorClick={handleAuthorClick}
          allArticles={mappedArticles}
        />
      </motion.div>
    );
  }

  if (appView === 'gallery') {
    return (
      <motion.div key="gallery" {...PAGE_TRANSITION}>
        <GalleryPage
          onBack={() => setAppView('main')}
          onImageClick={(slug) => {
            const article = mappedArticles.find((a: any) => a.slug === slug);
            if (article) { setSelectedArticle(article); setAppView('article'); }
          }}
        />
      </motion.div>
    );
  }

  if (appView === 'admin') {
    return (
      <motion.div key="admin" {...PAGE_TRANSITION}>
        <AdminDashboard
          onBack={() => setAppView('main')}
          savedCount={savedIds.size}
          articles={adminArticles}
          loading={adminLoading}
          onRefresh={refreshAdminArticles}
        />
      </motion.div>
    );
  }

  /* ── Main magazine view ── */
  return (
    <motion.div key="main" {...PAGE_TRANSITION} className="min-h-screen bg-background">
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
              <p className="text-xs text-muted-foreground mt-1">Save articles, bookmark stories, and personalize your reading experience.</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={onGoToLogin} className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  Sign In
                </button>
                <button onClick={onDismissSignInPrompt} className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  Maybe later
                </button>
              </div>
            </div>
            <button onClick={onDismissSignInPrompt} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {searchOpen && (
        <SearchOverlay articles={mappedArticles} onClose={() => setSearchOpen(false)} onArticleClick={handleArticleClick} />
      )}
      {menuOpen && (
        <MobileSidebar
          activeCategory={activeCategory}
          categories={dbCategories.map((c) => c.name)}
          onCategoryChange={handleCategoryChange}
          onClose={() => setMenuOpen(false)}
          onGoToProfile={() => { setProfileTab('profile'); navigate('profile'); }}
          onGoToReadingList={() => { setProfileTab('reading-list'); navigate('profile'); }}
          onGoToAdmin={user?.isAdmin ? () => navigate('admin') : undefined}
          onGoToGallery={() => navigate('gallery')}
          user={user}
          savedCount={savedIds.size}
        />
      )}

      {/* Header */}
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMenuOpen(true)}>
              <Menu className="w-6 h-6 text-foreground" />
            </button>

            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-2xl tracking-tight text-primary">UBUNTU ESSENCE</h1>
            </div>

            <div className="flex items-center gap-1">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
              </button>

              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => navigate('gallery')}>
                Gallery
              </button>

              <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setSearchOpen(true)}>
                <Search className="w-5 h-5 text-foreground" />
              </button>

              {user && onLogout ? (
                <UserMenu
                  user={user}
                  onLogout={onLogout}
                  onGoToProfile={() => { setProfileTab('profile'); navigate('profile'); }}
                  onGoToReadingList={() => { setProfileTab('reading-list'); navigate('profile'); }}
                  onGoToAdmin={() => navigate('admin')}
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

      {/* Category Navigation */}
      <CategoryNav
        categories={['All', ...dbCategories.map((c) => c.name)]}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        subcategories={dbSubcategories.map((s) => s.name)}
        activeSubcategory={activeSubcategory}
        onSubcategoryChange={setActiveSubcategory}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
              <button onClick={() => navigate('profile')} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Bookmark className="w-3.5 h-3.5" />
                {savedIds.size} saved
              </button>
            )}
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mappedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={handleArticleClick}
                  saved={savedIds.has(article.id)}
                  onToggleSave={handleToggleSave}
                  onAuthorClick={handleAuthorClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No articles found in this section.</p>
            </div>
          )}
        </section>
        </>)}

        {/* Newsletter */}
        <NewsletterSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="mb-4 text-foreground">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mission</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-foreground">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-foreground">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Archives</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Topics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Authors</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 Ubuntu Essence. Celebrating African culture and community.
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
