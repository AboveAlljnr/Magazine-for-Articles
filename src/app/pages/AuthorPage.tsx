import { ArrowLeft, BookOpen } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { Avatar } from '../components/Avatar';
import type { MappedArticle } from '../lib/article-types';
import logoUrl from '../components/logo.jpg';

interface AuthorPageProps {
  authorName: string;
  onBack: () => void;
  onArticleClick: (article: MappedArticle) => void;
  savedIds: Set<number>;
  onToggleSave: (article: MappedArticle) => void;
  onAuthorClick: (name: string) => void;
  allArticles: MappedArticle[];
}

export function AuthorPage({
  authorName,
  onBack,
  onArticleClick,
  savedIds,
  onToggleSave,
  onAuthorClick,
  allArticles,
}: AuthorPageProps) {
  const authorArticles = allArticles.filter(a => a.author === authorName);
  const bio = authorArticles[0]?.authorBio ?? '';
  const avatar = authorArticles[0]?.authorAvatar ?? null;
  const categories = [...new Set(authorArticles.map(a => a.category))];

  return (
    <div className="heritage-background min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <img
              src={logoUrl}
              alt="Ubuntu Essence"
              className="w-5 h-5 object-contain mix-blend-multiply dark:invert dark:mix-blend-screen"
            />
            <span className="text-sm tracking-widest text-primary" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>UBUNTU ESSENCE</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Author hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-14 pb-14 border-b border-border">
          <Avatar
            name={authorName}
            src={avatar}
            size="xl"
            className="ring-4 ring-primary/20"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl text-foreground mb-2">{authorName}</h1>
            {bio && (
              <p className="text-muted-foreground leading-relaxed max-w-xl mb-4">{bio}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                {authorArticles.length} article{authorArticles.length !== 1 ? 's' : ''}
              </span>
              {categories.map(cat => (
                <span key={cat} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Articles by this author */}
        <h2 className="text-2xl text-foreground mb-8">Stories by {authorName}</h2>
        {authorArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={onArticleClick}
                saved={savedIds.has(article.id)}
                onToggleSave={onToggleSave}
                onAuthorClick={onAuthorClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground">No articles found for this author.</p>
          </div>
        )}
      </div>
    </div>
  );
}
