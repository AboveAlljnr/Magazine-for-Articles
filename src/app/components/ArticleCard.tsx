import { Clock, Bookmark, BookmarkCheck } from 'lucide-react';

interface Article { id: number; title: string; excerpt: string; image: string; category: string; subcategory: string; author: string; authorBio: string; date: string; readTime: string; }

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  saved: boolean;
  onToggleSave: (article: Article) => void;
  onAuthorClick: (name: string) => void;
}

export function ArticleCard({ article, onClick, saved, onToggleSave, onAuthorClick }: ArticleCardProps) {
  return (
    <article className="group cursor-pointer" onClick={() => onClick(article)}>
      <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 border border-border relative">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(article); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            saved
              ? 'bg-primary text-primary-foreground'
              : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-background hover:text-primary opacity-60 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="uppercase tracking-wider text-primary">{article.category}</span>
          <span>·</span>
          <span className="text-muted-foreground/70">{article.subcategory}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>

        <h3 className="text-xl text-foreground group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAuthorClick(article.author); }}
            className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
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
      </div>
    </article>
  );
}
