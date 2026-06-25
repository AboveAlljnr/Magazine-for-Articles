import { useState } from 'react';
import { ArrowLeft, User, BookOpen, Settings, Camera } from 'lucide-react';
import { updateProfile } from '../../lib/api';

const categoryOptions = ['Culture', 'Fashion', 'Heritage', 'Arts', 'Travel', 'Lifestyle'];

interface ProfilePageProps {
  user: { id: string; name: string; email?: string };
  savedArticles: any[];
  onBack: () => void;
  onArticleClick: (article: any) => void;
  onLogout: () => void;
}

type Tab = 'profile' | 'reading-list' | 'preferences';

export function ProfilePage({
  user,
  savedArticles,
  onBack,
  onArticleClick,
  onLogout,
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? '');
  const [saved, setSaved] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Culture', 'Heritage']);
  const [newsletter, setNewsletter] = useState(true);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile(user.id, { display_name: name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'reading-list', label: 'Reading List', icon: BookOpen },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex-1" />
          <h1 className="text-base text-foreground">My Account</h1>
          <div className="flex-1" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Profile hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium">
              {name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl text-foreground">{name}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{email || 'No email set'}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'reading-list' && savedArticles.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {savedArticles.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="max-w-md space-y-5">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">New password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm"
              >
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>

            <div className="pt-8 border-t border-border mt-8">
              <h3 className="text-base text-foreground mb-1">Danger zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Signing out will return you to the login screen.
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="px-5 py-2.5 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/5 transition-colors"
              >
                Sign out
              </button>
            </div>
          </form>
        )}

        {activeTab === 'reading-list' && (
          <div>
            {savedArticles.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground mb-2">No saved articles yet</p>
                <p className="text-sm text-muted-foreground">
                  Tap the bookmark icon on any article to save it here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onArticleClick(article)}
                    className="group w-full flex gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/20 transition-all text-left"
                  >
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-primary mb-1">
                        {article.category} · {article.subcategory}
                      </p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{article.author}</span>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="max-w-md space-y-8">
            <div>
              <h3 className="text-base text-foreground mb-1">Reading interests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We will surface more stories from these categories.
              </p>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-base text-foreground mb-4">Email preferences</h3>
              <div className="space-y-3">
                {[
                  { label: 'Weekly digest', desc: 'Top stories curated every Friday', value: newsletter, onChange: setNewsletter },
                  { label: 'Breaking stories', desc: 'Immediate alerts for major features', value: false, onChange: () => {} },
                  { label: 'Author updates', desc: 'When authors you follow publish', value: true, onChange: () => {} },
                ].map(({ label, desc, value, onChange }) => (
                  <div key={label} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => onChange(!value)}
                      className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                        value ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm">
              Save preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
