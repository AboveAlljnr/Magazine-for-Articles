import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Upload, Trash2, ChevronUp, ChevronDown, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { createArticle, updateArticle, getCategories, getAllSubcategories, getAuthors, getArticleImages, createArticleImage, updateArticleImage, deleteArticleImage } from '../../lib/api';
import type { Category, Subcategory, Author, ArticleImage } from '../../lib/types';
import { RichEditor } from '../components/RichEditor';
import { ImageUpload } from '../components/ImageUpload';
import { ArticlePreview } from '../components/ArticlePreview';
import { supabase } from '../../lib/supabase';

interface ArticleEditorProps {
  article?: any;
  onClose: () => void;
  onSaved: () => void;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function ArticleEditor({ article, onClose, onSaved }: ArticleEditorProps) {
  const isEdit = !!article;
  const articleId = article?.id;

  const DRAFT_KEY = 'ubuntu-essence:draft';
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [bodyParagraphs, setBodyParagraphs] = useState<string[]>(Array.isArray(article?.body) ? article.body : []);
  const [imageUrl, setImageUrl] = useState(article?.image_url || '');
  const [categoryId, setCategoryId] = useState<number>(article?.category_id || 0);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(article?.subcategory_id || null);
  const [authorId, setAuthorId] = useState<number>(article?.author_id || 0);
  const [readTime, setReadTime] = useState(article?.read_time_minutes || 5);
  const [readTimeManuallySet, setReadTimeManuallySet] = useState(false);
  const [published, setPublished] = useState(article?.published || false);
  const [featured, setFeatured] = useState(article?.featured || false);
  const [publishDate, setPublishDate] = useState<Date | undefined>(article?.published_at ? new Date(article.published_at) : undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Gallery
  const [galleryImages, setGalleryImages] = useState<ArticleImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [slugTouched, setSlugTouched] = useState(false);

  // Restore autosaved draft when creating a new article
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d.title && !(Array.isArray(d.bodyParagraphs) && d.bodyParagraphs.some((p: string) => p.trim()))) return;
      setTitle(d.title || '');
      setSlug(d.slug || '');
      setSlugTouched(!!d.slugTouched);
      setExcerpt(d.excerpt || '');
      setBodyParagraphs(Array.isArray(d.bodyParagraphs) ? d.bodyParagraphs : []);
      setImageUrl(d.imageUrl || '');
      setCategoryId(d.categoryId || 0);
      setSubcategoryId(d.subcategoryId || null);
      setAuthorId(d.authorId || 0);
      setReadTime(d.readTime || 5);
      setReadTimeManuallySet(!!d.readTimeManuallySet);
      setPublished(!!d.published);
      setFeatured(!!d.featured);
      if (d.publishDate) setPublishDate(new Date(d.publishDate));
      setDraftRestored(true);
    } catch { /* ignore corrupt draft */ }
  }, []);

  // Debounced autosave for new articles
  useEffect(() => {
    if (isEdit) return;
    const hasContent = title.trim() || bodyParagraphs.some(p => p.trim());
    if (!hasContent) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          title, slug, excerpt, bodyParagraphs, imageUrl,
          categoryId, subcategoryId, authorId, readTime,
          readTimeManuallySet, slugTouched, published, featured,
          publishDate: publishDate ? publishDate.toISOString() : null,
        }));
        setDraftSavedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      } catch { /* storage unavailable */ }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, slug, excerpt, bodyParagraphs, imageUrl, categoryId, subcategoryId, authorId, readTime, readTimeManuallySet, slugTouched, published, featured, publishDate, isEdit]);

  useEffect(() => {
    if (!slugTouched && !isEdit) setSlug(slugify(title));
  }, [title, slugTouched, isEdit]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getAuthors().then(setAuthors).catch(() => {});
    getAllSubcategories().then((subs) => setAllSubcategories(subs as any)).catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryId) {
      setSubcategories(allSubcategories.filter((s: any) => s.category_id === categoryId));
      const currentSub = allSubcategories.find((s: any) => s.id === subcategoryId);
      if (currentSub && (currentSub as any).category_id !== categoryId) setSubcategoryId(null);
    } else {
      setSubcategories([]);
    }
  }, [categoryId, allSubcategories]);

  // Load gallery images when editing
  useEffect(() => {
    if (articleId) {
      setGalleryLoading(true);
      getArticleImages(articleId).then(setGalleryImages).catch(() => {}).finally(() => setGalleryLoading(false));
    }
  }, [articleId]);

  // Auto-calculate read time from body paragraphs
  useEffect(() => {
    if (readTimeManuallySet) return;
    const words = bodyParagraphs.join(' ').split(/\s+/).filter(Boolean).length;
    const estimated = Math.max(1, Math.round(words / 200));
    setReadTime(estimated);
  }, [bodyParagraphs, readTimeManuallySet]);

  const [previewOpen, setPreviewOpen] = useState(false);

  async function handleSave() {
    if (!title.trim() || !categoryId || !authorId) return;
    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        slug: slug || slugify(title),
        excerpt: excerpt.trim(),
        body: bodyParagraphs,
        category_id: categoryId,
        subcategory_id: subcategoryId || null,
        author_id: authorId,
        image_url: imageUrl.trim(),
        read_time_minutes: readTime,
        published,
        featured,
        published_at: publishDate ? publishDate.toISOString() : published ? new Date().toISOString() : null,
      };

      if (isEdit) {
        await updateArticle(article.id, payload);
      } else {
        const result = await createArticle(payload);
        // If creating new article, upload gallery images with the new article_id
        if (galleryImages.length > 0) {
          for (const img of galleryImages) {
            await createArticleImage({
              article_id: result.id,
              image_url: img.image_url,
              caption: img.caption,
              alt_text: img.alt_text,
              sort_order: img.sort_order,
            });
          }
        }
      }
      localStorage.removeItem(DRAFT_KEY);
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  }

  // Gallery handlers
  async function handleUploadGallery(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const ext = file.name.split('.').pop() || 'png';
        const path = `articles/gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { data, error } = await supabase.storage
          .from('article-images')
          .upload(path, file, { contentType: file.type });

        if (error) {
          console.error('Upload error:', error.message);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(data.path);

        const newImg = {
          id: -Date.now(), // temporary id
          article_id: articleId || 0,
          image_url: publicUrl,
          caption: '',
          alt_text: title.trim() || 'Article image',
          sort_order: galleryImages.length + 1,
          created_at: new Date().toISOString(),
        };

        setGalleryImages((prev) => [...prev, newImg]);

        // If editing existing article, persist immediately
        if (articleId) {
          await createArticleImage({
            article_id: articleId,
            image_url: publicUrl,
            caption: '',
            alt_text: title.trim() || 'Article image',
            sort_order: galleryImages.length + 1,
          }).catch(console.error);
        }
      }
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleDeleteGalleryImage(id: number) {
    // If it's a persisted image (positive id), delete from DB
    if (id > 0) {
      await deleteArticleImage(id).catch(console.error);
    }
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function handleUpdateGalleryCaption(id: number, caption: string) {
    setGalleryImages((prev) => prev.map((img) => img.id === id ? { ...img, caption } : img));
    if (id > 0) {
      await updateArticleImage(id, { caption }).catch(console.error);
    }
  }

  function handleMoveGalleryImage(id: number, direction: 'up' | 'down') {
    setGalleryImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;

      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      next.forEach((img, i) => {
        img.sort_order = i + 1;
        if (img.id > 0) {
          updateArticleImage(img.id, { sort_order: i + 1 }).catch(console.error);
        }
      });
      return next;
    });
  }

  const previewArticle = {
    title,
    excerpt,
    body: bodyParagraphs,
    image: imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200',
    category: categories.find((c) => c.id === categoryId)?.name || '',
    subcategory: (subcategories.find((s) => s.id === subcategoryId) || allSubcategories.find((s) => s.id === subcategoryId))?.name || '',
    author: authors.find((a) => a.id === authorId)?.name || '',
    authorBio: authors.find((a) => a.id === authorId)?.bio || '',
    readTime: readTime === 1 ? '1 min read' : `${readTime} min read`,
    date: publishDate ? format(publishDate, 'MMM d, yyyy') : undefined,
    galleryImages: galleryImages.map((img) => ({ image_url: img.image_url, caption: img.caption })),
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl mx-4 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-foreground">{isEdit ? 'Edit Article' : 'New Article'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Article title" />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Slug</label>
            <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary" placeholder="article-slug" />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Brief summary" />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Body</label>
            <RichEditor value={bodyParagraphs} onChange={setBodyParagraphs} />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Cover Image</label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Image Gallery */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Image Gallery</label>
            <p className="text-xs text-muted-foreground mb-3">Additional images that appear in the article gallery.</p>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={(e) => handleUploadGallery(e.target.files)}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 mb-4"
            >
              {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingGallery ? 'Uploading…' : 'Upload Images'}
            </button>

            {galleryLoading && <p className="text-xs text-muted-foreground">Loading gallery…</p>}

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((img, i) => (
                  <div key={img.id} className="relative group border border-border rounded-lg overflow-hidden bg-card">
                    <img src={img.image_url} alt={img.caption || ''} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-60 sm:opacity-0 sm:group-hover:opacity-100">
                      {i > 0 && (
                        <button onClick={() => handleMoveGalleryImage(img.id, 'up')} className="p-2 rounded bg-white/80 text-foreground hover:bg-white"><ChevronUp className="w-3.5 h-3.5" /></button>
                      )}
                      {i < galleryImages.length - 1 && (
                        <button onClick={() => handleMoveGalleryImage(img.id, 'down')} className="p-2 rounded bg-white/80 text-foreground hover:bg-white"><ChevronDown className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={() => handleDeleteGalleryImage(img.id)} className="p-2 rounded bg-red-500/80 text-white hover:bg-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) => handleUpdateGalleryCaption(img.id, e.target.value)}
                      placeholder="Caption…"
                      className="w-full px-2 py-1.5 text-xs border-t border-border bg-transparent text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category + Author */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value={0}>Select category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Author</label>
              <select value={authorId} onChange={(e) => setAuthorId(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value={0}>Select author</option>
                {authors.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            </div>
          </div>

          {/* Subcategory + Read time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Subcategory</label>
              <select value={subcategoryId ?? 0} onChange={(e) => setSubcategoryId(Number(e.target.value) || null)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" disabled={!categoryId}>
                <option value={0}>None</option>
                {subcategories.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">
                Read time (min)
                {!readTimeManuallySet && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">auto</span>
                )}
              </label>
              <input type="number" min={1} max={60} value={readTime} onChange={(e) => { setReadTimeManuallySet(true); setReadTime(Math.max(1, Number(e.target.value))); }} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          {/* Published + Featured + Schedule */}
          <div className="flex items-center gap-6 flex-wrap">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
              <span className="text-sm text-foreground">Published</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
              <span className="text-sm text-foreground">Featured</span>
            </label>
            <div className="relative">
              <button type="button" onClick={() => setShowDatePicker(!showDatePicker)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Calendar className="w-4 h-4" />
                {publishDate ? format(publishDate, 'MMM d, yyyy') : 'Set date'}
              </button>
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-3">
                  <style dangerouslySetInnerHTML={{__html: `
                    .rdp { --rdp-cell-size: 36px; --rdp-accent-color: #b8652f; --rdp-background-color: rgba(184,101,47,0.1); font-size: 13px; }
                    .rdp-month { margin: 0; }
                    .rdp-nav { height: 28px; }
                    .rdp-head_cell { font-size: 11px; font-weight: 500; color: #6b5346; text-transform: uppercase; }
                    .rdp-day { border-radius: 6px; }
                    .rdp-day:hover { background: rgba(184,101,47,0.1); }
                    .rdp-day_selected, .rdp-day_selected:hover { background: #b8652f; color: #fff; font-weight: 500; }
                    .rdp-day_today { font-weight: 600; }
                    .rdp-button:hover { background: transparent; }
                  `}} />
                  <DayPicker mode="single" selected={publishDate} onSelect={(d) => { setPublishDate(d); setShowDatePicker(false); }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
          {!isEdit && (draftSavedAt || draftRestored) && (
            <span className="mr-auto text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {draftSavedAt ? `Draft saved ${draftSavedAt}` : 'Draft restored from earlier session'}
            </span>
          )}
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button onClick={() => setPreviewOpen(true)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
            <Eye className="w-4 h-4" />Preview
          </button>
          <button onClick={handleSave} disabled={saving || !title.trim() || !categoryId || !authorId} className="px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">
            {saving ? 'Saving…' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </div>
    </div>
      {previewOpen && (
        <ArticlePreview article={previewArticle} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}