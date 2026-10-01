import { Link } from 'react-router';
import { Clock, Bookmark, BookmarkCheck, MessageCircle } from 'lucide-react';
import type { MappedArticle } from '../lib/article-types';
import { Avatar } from './Avatar';
import { StoryVisual } from './StoryVisual';

interface ArticleCardProps {
  article: MappedArticle;
  onClick: (article: MappedArticle) => void;
  saved: boolean;
  onToggleSave: (article: MappedArticle) => void;
  onAuthorClick: (name: string) => void;
}

export function ArticleCard({ article, onClick, saved, onToggleSave, onAuthorClick }: ArticleCardProps) {
  return (
    <article className="journal-card group">
      <div className="aspect-[4/3] overflow-hidden mb-5 border border-border relative">
        <Link to={`/articles/${article.slug}`} tabIndex={-1} aria-hidden="true">
        <StoryVisual image={article.image} title={article.title} category={article.category} />
        </Link>
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(article); }}
          aria-label={saved ? "Remove saved story" : "Save story"}
          aria-pressed={saved}
          className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            saved
              ? 'bg-primary text-primary-foreground'
              : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-background hover:text-primary opacity-100'
          }`}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.excerpt}</p>

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
        <Link to={`/articles/${article.slug}`} className="editorial-text-link inline-flex items-center gap-3 py-3" aria-label={`Read ${article.title}`}>Read story <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
