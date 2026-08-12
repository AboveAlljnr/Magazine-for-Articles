import { Clock, Bookmark, BookmarkCheck, MessageCircle } from 'lucide-react';
import type { MappedArticle } from '../lib/article-types';
import { Avatar } from './Avatar';
import { optimizedImage } from '../../lib/image';

interface ArticleCardProps {
  article: MappedArticle;
  onClick: (article: MappedArticle) => void;
  saved: boolean;
  onToggleSave: (article: MappedArticle) => void;
  onAuthorClick: (name: string) => void;
}

export function ArticleCard({ article, onClick, saved, onToggleSave, onAuthorClick }: ArticleCardProps) {
  return (
    <article className="group cursor-pointer" onClick={() => onClick(article)}>
      <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 border border-border relative">
        <img
          src={optimizedImage(article.image, 600)}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(article); }}
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
          {article.comments > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {article.comments}
              </span>
            </>
          )}
        </div>

        <h3 className="text-xl text-foreground group-hover:text-primary transition-colors leading-snug">
          {article.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>

        <div className="flex items-center gap-3 pt-2">
          <Avatar
            name={article.author}
            src={article.authorAvatar}
            size="xs"
            onClick={e => { e.stopPropagation(); onAuthorClick(article.author); }}
          />
          <div>
            <button
              onClick={e => { e.stopPropagation(); onAuthorClick(article.author); }}
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
