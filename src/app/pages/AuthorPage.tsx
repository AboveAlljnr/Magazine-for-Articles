import { ArrowLeft, BookOpen } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';

interface Article {
  id: number; title: string; slug: string; excerpt: string; body: string[];
  image: string; category: string; subcategory: string; author: string;
  authorBio: string; date: string; readTime: string;
}

interface AuthorPageProps {
  authorName: string;
  onBack: () => void;
  onArticleClick: (article: any) => void;
  savedIds: Set<number>;
  onToggleSave: (article: any) => void;
  onAuthorClick: (name: string) => void;
  allArticles: Article[];
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
  const authorArticles = allArticles.filter((a) => a.author === authorName);
  const bio = authorArticles[0]?.authorBio ?? '';
  const categories = [...new Set(authorArticles.map((a) => a.category))];

  return (
    <div className="min-h-screen bg-background">
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
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm tracking-widest text-primary">UBUNTU ESSENCE</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Author hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-14 pb-14 border-b border-border">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-medium flex-shrink-0">
            {authorName.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl text-foreground mb-2">{authorName}</h1>
            {bio && (
              <p className="text-muted-foreground leading-relaxed max-w-xl mb-4">{bio}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                {authorArticles.length} article{authorArticles.length !== 1 ? 's' : ''}
              </span>
              {categories.map((cat) => (
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
            {authorArticles.map((article) => (
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
          <p className="text-muted-foreground">No articles found.</p>
        )}
      </div>
    </div>
  );
}
