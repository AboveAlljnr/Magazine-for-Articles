import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Bookmark, BookmarkCheck, Share2, Facebook, Link, List, Eye, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { CommentsSection } from '../components/CommentsSection';
import { SeriesChapters } from '../components/SeriesChapters';
import { ReadNext } from '../components/ReadNext';
import { Avatar } from '../components/Avatar';
import { applySeo, resetSeo } from '../lib/seo';
import { optimizedImage } from '../../lib/image';
import { likeArticle } from '../../lib/api';
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

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${count}`;
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
  const [progress, setProgress] = useState(0);
  const [resumePct, setResumePct] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes);

  const [textSize, setTextSize] = useState(() => {
    try { const saved = localStorage.getItem('ue:reading-size'); return ['standard', 'large', 'extra'].includes(saved || '') ? saved! : 'standard'; }
    catch { return 'standard'; }
  });
  useEffect(() => {
    try { localStorage.setItem('ue:reading-size', textSize); } catch { /* Optional preference storage. */ }
  }, [textSize]);

  const progressKey = `ue:progress:${article.slug}`;
  const likeKey = `ue:liked:${article.id}`;

  useEffect(() => {
    setLikeCount(article.likes);
    try {
      setLiked(localStorage.getItem(likeKey) === '1');
    } catch { /* ignore */ }
  }, [article.likes, likeKey]);

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikeCount(c => c + 1);
    try { localStorage.setItem(likeKey, '1'); } catch { /* ignore */ }
    likeArticle(article.id).catch(() => {
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
      try { localStorage.removeItem(likeKey); } catch { /* ignore */ }
    });
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    setProgress(0); setScrolled(false); setShareOpen(false); setResumePct(0);
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setProgress(pct);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(progressKey, String(pct));
        } catch { /* ignore */ }
      }, 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [article.id, progressKey]);

  useEffect(() => {
    try {
      const stored = parseFloat(localStorage.getItem(progressKey) || '');
      if (!Number.isNaN(stored) && stored > 0.05 && stored < 0.95) setResumePct(stored);
    } catch { /* ignore */ }
  }, [progressKey]);

  useEffect(() => {
    const published = article.date ? new Date(article.date) : null;
    applySeo({
      title: `${article.title} | Ubuntu Essence`,
      description: article.excerpt,
      image: article.image,
      url: window.location.href,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        ...(article.image ? { image: [article.image] } : {}),
        ...(published && !Number.isNaN(published.getTime())
          ? { datePublished: published.toISOString() }
          : {}),
        author: { '@type': 'Person', name: article.author },
        publisher: { '@type': 'Organization', name: 'Ubuntu Essence' },
        mainEntityOfPage: window.location.href,
      },
    });
    return () => resetSeo();
  }, [article]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShareOpen(false);
  }

  function openShare(url: string) {
    setShareOpen(false);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  }

  function shareUrl() {
    return encodeURIComponent(window.location.href);
  }

  function scrollToParagraph(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resumeToSaved() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: resumePct * max, behavior: 'smooth' });
    setResumePct(0);
  }

  const toc = article.body
    .map((paragraph, i) => {
      if (paragraph.startsWith('#')) {
        const label = paragraph.replace(/^#+\s/, '');
        return { id: `para-${i}`, label };
      }
      return null;
    })
    .filter(Boolean) as { id: string, label: string }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="article-reader heritage-background min-h-screen bg-background"
    >
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-muted pointer-events-none">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

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
          <button aria-label={saved ? "Remove saved story" : "Save story"} onClick={onToggleSave} className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
            {saved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Resume reading chip */}
      {resumePct > 0 && progress < resumePct - 0.03 && (
        <button
          onClick={resumeToSaved}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm shadow-lg hover:opacity-90 transition-opacity"
        >
          Resume at {Math.round(resumePct * 100)}%
        </button>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />Back to stories
        </button>

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs mb-5">
          <span className="uppercase tracking-widest text-primary">{article.category}</span>
          <span className="text-border">·</span>
          <span className="uppercase tracking-widest text-muted-foreground">{article.subcategory}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl leading-tight break-words text-foreground mb-6">{article.title}</h1>

        <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-5">
          {article.excerpt}
        </p>

        {/* Author + meta */}
        <div className="flex flex-wrap gap-4 items-center justify-between py-5 border-y border-border mb-10">
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
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{article.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                {article.views > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(article.views)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                aria-label="Share story" aria-expanded={shareOpen} onClick={() => setShareOpen(!shareOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50"
                  style={{ left: 0, right: 'auto', minWidth: '10rem' }}>
                  <button
                    onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(article.title + '\n' + window.location.origin + window.location.pathname)}`)}
                    className="w-full min-h-11 flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >WhatsApp</button>
                  <button
                    onClick={() => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${shareUrl()}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg> X
                  </button>
                  <button
                    onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl()}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
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
              onClick={handleLike}
              className={`p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label={liked ? 'You liked this article' : 'Like this article'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-xs tabular-nums">{likeCount > 0 ? likeCount : ''}</span>
            </button>
            <button
              aria-label={saved ? "Remove saved story" : "Save story"} onClick={onToggleSave}
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hero image */}
        {article.image?.trim() && <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border mb-12">
          <img
            src={optimizedImage(article.image, 1600)}
            alt={article.title}
            loading="eager"
            decoding="async"
            className="article-hero-photo w-full h-full object-cover"
          />
        </div>}

        {/* Table of contents */}
        {toc.length >= 3 && (
          <details className="mb-12 rounded-xl border border-border bg-muted/40 group">
            <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-medium text-foreground select-none">
              <span className="flex items-center gap-2">
                <List className="w-4 h-4 text-primary" />Contents
              </span>
              <span className="text-muted-foreground text-xs group-open:hidden">Show</span>
            </summary>
            <nav className="px-5 pb-4 pt-1">
              <ol className="space-y-2.5">
                {toc.map(entry => (
                  <li key={entry.id}>
                    <button
                      onClick={() => scrollToParagraph(entry.id)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left leading-snug"
                    >
                      {entry.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        )}

        <fieldset className="reading-controls border-y border-border py-4 mb-8">
          <legend className="text-xs text-muted-foreground px-2">Reading comfort</legend>
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm">Text size</span><div className="flex gap-2" role="group" aria-label="Article text size">
            {[['standard', 'Standard'], ['large', 'Large'], ['extra', 'Extra large']].map(([value, label]) => <button key={value} type="button" aria-pressed={textSize === value} onClick={() => setTextSize(value)} className={`px-3 py-2 border rounded-lg text-sm ${textSize === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary'}`}>{label}</button>)}
          </div></div>
        </fieldset>

        {/* Body */}
        <div className="article-prose space-y-7" data-reading-size={textSize}>
          {article.body.map((paragraph, i) => {
            const source = paragraph.match(/^Originally published on Substack: (https:\/\/mikaylascribes\.substack\.com\/p\/[a-z0-9-]+)$/);
            if (source) {
              return <p key={i} className="text-sm text-muted-foreground border-t border-border pt-6">Originally published on <a href={source[1]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Mikayla’s Substack</a>.</p>;
            }
            if (paragraph.startsWith('# ')) {
              return <h2 key={i} id={`para-${i}`} className="text-3xl font-bold text-foreground mt-10 mb-4">{paragraph.replace(/^#\s/, '')}</h2>;
            }
            if (paragraph.startsWith('## ')) {
              return <h3 key={i} id={`para-${i}`} className="text-2xl font-bold text-foreground mt-8 mb-3">{paragraph.replace(/^##\s/, '')}</h3>;
            }
            if (paragraph.startsWith('> ')) {
              return (
                <blockquote key={i} id={`para-${i}`} className="my-10 border-l-4 border-primary pl-6 py-2 text-xl leading-relaxed text-foreground italic">
                  {paragraph.replace(/^>\s/, '')}
                </blockquote>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <div key={i} id={`para-${i}`} className="flex gap-3 text-[1.05rem] leading-[1.85] text-foreground/90">
                  <span className="text-primary mt-1">•</span>
                  <span>{paragraph.replace(/^-\s/, '')}</span>
                </div>
              );
            }
            return (
              <p key={i} id={`para-${i}`} className="text-[1.05rem] leading-[1.85] text-foreground/90">{paragraph}</p>
            );
          })}
        </div>

        <SeriesChapters articleSlug={article.slug} />
        <ReadNext article={article} />

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


      </div>
    </motion.div>
  );
}
