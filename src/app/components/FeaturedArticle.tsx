import { Clock, Bookmark, BookmarkCheck } from 'lucide-react';

interface Article { id: number; title: string; excerpt: string; image: string; category: string; subcategory: string; author: string; authorBio: string; date: string; readTime: string; }

interface FeaturedArticleProps {
  article: Article;
  onClick: (article: Article) => void;
  saved: boolean;
  onToggleSave: (article: Article) => void;
  onAuthorClick: (name: string) => void;
}

export function FeaturedArticle({ article, onClick, saved, onToggleSave, onAuthorClick }: FeaturedArticleProps) {
  return (
    <article className="group cursor-pointer" onClick={() => onClick(article)}>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-lg border border-border relative">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-3 py-1 rounded-full">
              Editor's Pick
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(article); }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
              saved
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-background hover:text-primary'
            }`}
          >
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="uppercase tracking-wider text-primary">{article.category}</span>
            <span>·</span>
            <span className="text-muted-foreground/70 text-xs uppercase tracking-wide">{article.subcategory}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground group-hover:text-primary transition-colors">
            {article.title}
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={(e) => { e.stopPropagation(); onAuthorClick(article.author); }}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium hover:opacity-80 transition-opacity"
            >
              {article.author.charAt(0)}
            </button>
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onAuthorClick(article.author); }}
                className="text-sm text-foreground hover:text-primary transition-colors block text-left"
              >
                {article.author}
              </button>
              <p className="text-xs text-muted-foreground">{article.date}</p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onClick(article); }}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Read Article
          </button>
        </div>
      </div>
    </article>
  );
}
