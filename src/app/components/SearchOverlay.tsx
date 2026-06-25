import { useEffect, useRef, useState } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';

interface Article { id: number; title: string; excerpt: string; image: string; category: string; subcategory: string; author: string; date?: string; }

interface SearchOverlayProps {
  articles: Article[];
  onClose: () => void;
  onArticleClick: (article: Article) => void;
}

export function SearchOverlay({ articles, onClose, onArticleClick }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const results = query.trim().length < 2
    ? []
    : articles.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.subcategory.toLowerCase().includes(q)
        );
      });

  const trending = articles.slice(0, 5);

  function handleArticleClick(article: Article) {
    onArticleClick(article);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-background border-b border-border shadow-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Search input */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-5 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, authors, topics…"
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
            >
              Cancel
            </button>
          </div>

          <div className="py-6">
            {query.trim().length >= 2 ? (
              /* Results */
              results.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-1">
                    {results.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleClick(article)}
                        className="group w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-primary uppercase tracking-wide">{article.category}</span>
                            <span className="text-border text-xs">·</span>
                            <span className="text-xs text-muted-foreground">{article.subcategory}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{article.author}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-foreground mb-1">No results for "{query}"</p>
                  <p className="text-sm text-muted-foreground">Try a different search term.</p>
                </div>
              )
            ) : (
              /* Trending */
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Trending now
                </p>
                <div className="space-y-1">
                  {trending.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="group w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {article.category} · {article.author}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
