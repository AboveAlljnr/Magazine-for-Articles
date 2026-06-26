import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { createArticle, updateArticle, getCategories, getAllSubcategories, getAuthors } from '../../lib/api';
import type { Category, Subcategory, Author } from '../../lib/types';
import { RichEditor } from '../components/RichEditor';
import { ImageUpload } from '../components/ImageUpload';

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

  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [bodyParagraphs, setBodyParagraphs] = useState<string[]>(
    Array.isArray(article?.body) ? article.body : []
  );
  const [imageUrl, setImageUrl] = useState(article?.image_url || '');
  const [categoryId, setCategoryId] = useState<number>(article?.category_id || 0);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(article?.subcategory_id || null);
  const [authorId, setAuthorId] = useState<number>(article?.author_id || 0);
  const [readTime, setReadTime] = useState(article?.read_time_minutes || 5);
  const [published, setPublished] = useState(article?.published || false);
  const [featured, setFeatured] = useState(article?.featured || false);
  const [publishDate, setPublishDate] = useState<Date | undefined>(
    article?.published_at ? new Date(article.published_at) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [slugTouched, setSlugTouched] = useState(false);
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
        await createArticle(payload);
      }
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl mx-4 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-foreground">
            {isEdit ? 'Edit Article' : 'New Article'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="article-slug"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Brief summary of the article"
            />
          </div>

          {/* Body — Rich Text Editor */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Body</label>
            <RichEditor value={bodyParagraphs} onChange={setBodyParagraphs} />
          </div>

          {/* Image URL — Upload component */}
          <div>
            <label className="block text-sm text-foreground mb-1.5">Image</label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Category + Author row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={0}>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={0}>Select author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory + Read time row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Subcategory</label>
              <select
                value={subcategoryId ?? 0}
                onChange={(e) => setSubcategoryId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!categoryId}
              >
                <option value={0}>None</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Read time (min)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={readTime}
                onChange={(e) => setReadTime(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Published + Featured + Schedule */}
          <div className="flex items-center gap-6 flex-wrap">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-foreground">Published</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-foreground">Featured</span>
            </label>

            {/* Date picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
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
                  <DayPicker
                    mode="single"
                    selected={publishDate}
                    onSelect={(d) => { setPublishDate(d); setShowDatePicker(false); }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !categoryId || !authorId}
            className="px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? 'Saving…' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </div>
    </div>
  );
}