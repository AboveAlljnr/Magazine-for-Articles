import { X, Clock } from 'lucide-react';

interface ArticlePreviewData {
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  category: string;
  subcategory: string;
  author: string;
  authorBio: string;
  readTime: string;
  date?: string;
  galleryImages?: { image_url: string; caption: string }[];
}

interface ArticlePreviewProps {
  article: ArticlePreviewData;
  onClose: () => void;
}

export function ArticlePreview({ article, onClose }: ArticlePreviewProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Preview</span>
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />Close
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
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
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm text-foreground">{article.author}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {article.date && <span>{article.date}</span>}
                {article.date && <span>·</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border mb-12">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Gallery images inline */}
        {article.galleryImages && article.galleryImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
            {article.galleryImages.map((img, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-border">
                <img src={img.image_url} alt={img.caption || ''} className="w-full h-40 object-cover" />
                {img.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 pt-6">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

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

        {/* Author bio */}
        <div className="flex gap-5 p-6 rounded-xl bg-muted/40 border border-border">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium flex-shrink-0">
            {article.author.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground mb-1">{article.author}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.authorBio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
