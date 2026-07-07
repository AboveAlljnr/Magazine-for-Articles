import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Bookmark, BookmarkCheck, Share2, Facebook, Link } from 'lucide-react';
import { motion } from 'motion/react';
import { CommentsSection } from '../components/CommentsSection';
import { Avatar } from '../components/Avatar';
import type { MappedArticle } from '../lib/article-types';

interface ArticleDetailPageProps {
  article: MappedArticle;
  onBack: () => void;
  saved: boolean;
  onToggleSave: () => void;
  relatedArticles: MappedArticle[];
  onArticleClick: (article: MappedArticle) => void;
  onAuthorClick: (name: string) => void;
  userName?: string;
  userId?: string;
}

export function ArticleDetailPage({
  article,
  onBack,
  saved,
  onToggleSave,
  relatedArticles,
  onArticleClick,
  onAuthorClick,
  userName,
  userId,
}: ArticleDetailPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShareOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen bg-background"
    >
      {/* Sticky mini-header */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <p className="text-sm text-foreground line-clamp-1 flex-1 text-center">{article.title}</p>
          <button onClick={onToggleSave} className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
            {saved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />Back to stories
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-5">
          <span className="uppercase tracking-widest text-primary">{article.category}</span>
          <span className="text-border">·</span>
          <span className="uppercase tracking-widest text-muted-foreground">{article.subcategory}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl leading-tight text-foreground mb-6">{article.title}</h1>

        <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-5">
          {article.excerpt}
        </p>

        {/* Author + meta */}
        <div className="flex items-center justify-between py-5 border-y border-border mb-10">
          <div className="flex items-center gap-3">
            <Avatar
              name={article.author}
              src={article.authorAvatar}
              size="md"
              onClick={() => onAuthorClick(article.author)}
            />
            <div>
              <button
                onClick={() => onAuthorClick(article.author)}
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {article.author}
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{article.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShareOpen(!shareOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg> X
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                  </button>
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Link className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onToggleSave}
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hero image */}
        <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border mb-12">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Body */}
        <div className="space-y-7">
          {article.body.map((paragraph, i) => {
            const isPullQuote = i === 2 && paragraph.length < 300;
            if (isPullQuote) {
              return (
                <blockquote key={i} className="my-10 border-l-4 border-primary pl-6 py-2 text-xl leading-relaxed text-foreground italic">
                  {paragraph}
                </blockquote>
              );
            }
            return (
              <p key={i} className="text-[1.05rem] leading-[1.85] text-foreground/90">{paragraph}</p>
            );
          })}
        </div>

        {/* Decorative divider */}
        <div className="my-14 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 rotate-45 bg-primary/30" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Author bio card */}
        <div className="flex gap-5 p-6 rounded-xl bg-muted/40 border border-border">
          <Avatar
            name={article.author}
            src={article.authorAvatar}
            size="lg"
            onClick={() => onAuthorClick(article.author)}
          />
          <div>
            <button
              onClick={() => onAuthorClick(article.author)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors mb-1 block text-left"
            >
              {article.author}
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.authorBio}</p>
          </div>
        </div>

        {/* Comments */}
        <CommentsSection articleId={article.id} userName={userName} userId={userId} />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl text-foreground mb-8">More stories</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <button key={related.id} onClick={() => onArticleClick(related)} className="group text-left">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border mb-3">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-primary mb-1">{related.category}</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{related.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{related.author}</p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
