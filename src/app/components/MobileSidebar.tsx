import { useEffect } from 'react';
import { X, BookOpen, User, Bookmark, Home, LayoutDashboard, Image, PenLine } from 'lucide-react';

import logoUrl from './logo.jpg';

interface MobileSidebarProps {
  activeCategory: string;
  categories: string[];
  onCategoryChange: (cat: string) => void;
  onClose: () => void;
  onGoToProfile?: () => void;
  onGoToReadingList?: () => void;
  onGoToAdmin?: () => void;
  onGoToGallery?: () => void;
  onGoToNotes?: () => void;
  user?: { name: string; isAdmin?: boolean } | null;
  savedCount: number;
}

export function MobileSidebar({
  activeCategory,
  categories,
  onCategoryChange,
  onClose,
  onGoToProfile,
  onGoToReadingList,
  onGoToAdmin,
  onGoToGallery,
  onGoToNotes,
  user,
  savedCount,
}: MobileSidebarProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleCategoryClick(cat: string) {
    onCategoryChange(cat);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar panel */}
      <div className="relative w-72 max-w-[85vw] bg-background h-full flex flex-col shadow-2xl border-r border-border">
        {/* Header */}
        <div
          className="p-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #8b3a1a 0%, #b8652f 100%)' }}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={logoUrl}
              alt="Ubuntu Essence"
              className="w-6 h-6 object-contain invert mix-blend-screen"
            />
            <span className="text-base tracking-widest text-white font-medium">UBUNTU ESSENCE</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground px-3 mb-1">Browse</p>
          </div>

          <button
            onClick={() => handleCategoryClick('All')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              activeCategory === 'All'
                ? 'text-primary bg-primary/5'
                : 'text-foreground hover:bg-muted/50'
            }`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            Home
          </button>

          <button
            onClick={() => { onGoToGallery?.(); onClose(); }}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Image className="w-4 h-4 flex-shrink-0" />
            Gallery
          </button>

          <button
            onClick={() => { onGoToNotes?.(); onClose(); }}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <PenLine className="w-4 h-4 flex-shrink-0" />
            Notes
          </button>

          <div className="mt-2 mb-1 px-6">
            <div className="h-px bg-border" />
          </div>

          <div className="px-3 mt-3 mb-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground px-3">Categories</p>
          </div>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                activeCategory === cat
                  ? 'text-primary bg-primary/5 border-r-2 border-primary'
                  : 'text-foreground hover:bg-muted/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
              {cat}
            </button>
          ))}

          {user && (
            <>
              <div className="mt-4 mb-1 px-6">
                <div className="h-px bg-border" />
              </div>
              <div className="px-3 mt-3 mb-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground px-3">Account</p>
              </div>
              <button
                onClick={() => { onGoToProfile?.(); onClose(); }}
                className="w-full flex items-center gap-3 px-6 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                My Profile
              </button>
              <button
                onClick={() => { (onGoToReadingList ?? onGoToProfile)?.(); onClose(); }}
                className="w-full flex items-center gap-3 px-6 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <Bookmark className="w-4 h-4 flex-shrink-0" />
                Reading List
                {savedCount > 0 && (
                  <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5">
                    {savedCount}
                  </span>
                )}
              </button>
              {user?.isAdmin && onGoToAdmin && (
                <button
                  onClick={() => { onGoToAdmin(); onClose(); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  Admin Dashboard
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">View profile</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Ubuntu Essence
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
