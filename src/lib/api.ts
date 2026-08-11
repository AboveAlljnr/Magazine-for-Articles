import { supabase } from './supabase';
import type { Article, Author, Category, Subcategory, Comment, Profile, NewsletterSubscriber, ArticleImage } from './types';

/* ── Auth ───────────────────────────────────────────────────────── */

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return { data };
}

export function onAuthChange(callback: (event: string, session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/* ── Profiles ────────────────────────────────────────────────────── */

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

/* ── Categories ──────────────────────────────────────────────────── */

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Category[];
}

export async function getSubcategories(categoryId: number) {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');
  if (error) throw error;
  return data as Subcategory[];
}

export async function getAllSubcategories() {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*, categories!inner(name, slug)')
    .order('name');
  if (error) throw error;
  return data as (Subcategory & { categories: Pick<Category, 'name' | 'slug'> })[];
}

/* ── Articles ────────────────────────────────────────────────────── */

export async function getArticles(opts?: {
  categorySlug?: string;
  subcategorySlug?: string;
  authorSlug?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('articles')
    .select(`
      *,
      categories!inner(name, slug),
      subcategories(name, slug),
      authors!inner(name, slug, bio, avatar_url)
    `)
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (opts?.categorySlug) {
    query = query.eq('categories.slug', opts.categorySlug);
  }
  if (opts?.subcategorySlug) {
    query = query.eq('subcategories.slug', opts.subcategorySlug);
  }
  if (opts?.authorSlug) {
    query = query.eq('authors.slug', opts.authorSlug);
  }
  if (opts?.featured) {
    query = query.eq('featured', true);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }
  if (opts?.offset) {
    query = query.range(opts.offset, opts.offset + (opts.limit ?? 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories!inner(name, slug),
      subcategories(name, slug),
      authors!inner(name, slug, bio, avatar_url)
    `)
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as any;
}

export async function getArticleById(id: number) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories!inner(name, slug),
      subcategories(name, slug),
      authors!inner(name, slug, bio, avatar_url)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as any;
}

export async function incrementArticleViews(articleId: number) {
  const { error } = await supabase
    .rpc('increment_article_views', { article_id: articleId });
  if (error) console.error('Failed to increment views', error);
}

/* ── Authors ──────────────────────────────────────────────────────── */

export async function getAuthors() {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Author[];
}

export async function getAuthorBySlug(slug: string) {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as Author;
}

export async function getAuthorArticleCount(slug: string) {
  const author = await getAuthorBySlug(slug);
  const { count, error } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('published', true)
    .eq('author_id', author.id);
  if (error) throw error;
  return count ?? 0;
}

/* ── Bookmarks ────────────────────────────────────────────────────── */

export async function getBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      article_id,
      created_at,
      articles!inner(
        *,
        categories(name, slug),
        authors(name, slug, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as any[];
}

export async function addBookmark(userId: string, articleId: number) {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, article_id: articleId });
  if (error && error.code !== '23505') throw error; // 23505 = already exists
}

export async function removeBookmark(userId: string, articleId: number) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', articleId);
  if (error) throw error;
}

export async function isBookmarked(userId: string, articleId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('article_id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

/* ── Comments ─────────────────────────────────────────────────────── */

export async function getComments(articleId: number) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!inner(display_name, avatar_url)
    `)
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as any[];
}

export async function addComment(articleId: number, userId: string, body: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ article_id: articleId, user_id: userId, body })
    .select(`
      *,
      profiles!inner(display_name, avatar_url)
    `)
    .single();
  if (error) throw error;
  return data as any;
}

export async function likeComment(commentId: number) {
  const { error } = await supabase.rpc('increment_comment_likes', { comment_id: commentId });
  if (error) throw error;
}

export async function getAllComments() {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!inner(display_name, avatar_url),
      articles!inner(title, slug)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as any[];
}

export async function adminDeleteComment(id: number) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Newsletter ──────────────────────────────────────────────────── */

export async function subscribeToNewsletter(email: string) {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email });
  if (error && error.code !== '23505') throw error; // 23505 = already subscribed
}

/* ── Search ───────────────────────────────────────────────────────── */

export async function searchArticles(query: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories!inner(name, slug),
      authors!inner(name, slug, avatar_url)
    `)
    .eq('published', true)
    .textSearch('title', query, { config: 'english' })
    .order('published_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as any[];
}

/* ── Admin: Articles ─────────────────────────────────────────────── */

export async function getAllArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories!inner(name, slug),
      subcategories(name, slug),
      authors!inner(name, slug, bio, avatar_url)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as any[];
}

export async function createArticle(article: {
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  category_id: number;
  subcategory_id?: number | null;
  author_id: number;
  image_url?: string;
  read_time_minutes?: number;
  published?: boolean;
  featured?: boolean;
  published_at?: string | null;
}) {
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateArticle(
  id: number,
  updates: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    body: string[];
    category_id: number;
    subcategory_id: number | null;
    author_id: number;
    image_url: string;
    read_time_minutes: number;
    published: boolean;
    featured: boolean;
    published_at: string | null;
  }>
) {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function deleteArticle(id: number) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function cloneArticle(id: number) {
  const original = await getArticleById(id);
  if (!original) throw new Error('Article not found');
  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: `${original.title} (copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      excerpt: original.excerpt,
      body: original.body,
      category_id: original.category_id,
      subcategory_id: original.subcategory_id,
      author_id: original.author_id,
      image_url: original.image_url,
      read_time_minutes: original.read_time_minutes,
      published: false,
      featured: false,
      published_at: null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

/* ── Admin: Categories ───────────────────────────────────────────── */

export async function createCategory(data: { name: string; slug: string }) {
  const { data: result, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Category;
}

export async function updateCategory(id: number, updates: { name?: string }) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Admin: Subcategories ────────────────────────────────────────── */

export async function createSubcategory(data: { name: string; slug: string; category_id: number }) {
  const { data: result, error } = await supabase
    .from('subcategories')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Subcategory;
}

export async function updateSubcategory(id: number, updates: { name?: string }) {
  const { data, error } = await supabase
    .from('subcategories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Subcategory;
}

export async function deleteSubcategory(id: number) {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Admin: Authors ──────────────────────────────────────────────── */

export async function createAuthor(data: { name: string; slug: string; bio?: string; avatar_url?: string }) {
  const { data: result, error } = await supabase
    .from('authors')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Author;
}

export async function updateAuthor(id: number, updates: { name?: string; bio?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from('authors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Author;
}

export async function deleteAuthor(id: number) {
  const { error } = await supabase
    .from('authors')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Admin: Newsletter Subscribers ───────────────────────────────── */

export async function getNewsletterSubscribers() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as NewsletterSubscriber[];
}

/* ── Article Images ──────────────────────────────────────────────── */

export async function getArticleImages(articleId: number) {
  const { data, error } = await supabase
    .from('article_images')
    .select('*')
    .eq('article_id', articleId)
    .order('sort_order');
  if (error) throw error;
  return data as ArticleImage[];
}

export async function getAllImagesForGallery() {
  const { data, error } = await supabase
    .from('article_images')
    .select('*, articles!inner(id, title, slug, published)')
    .eq('articles.published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as (ArticleImage & { articles: Pick<Article, 'id' | 'title' | 'slug'> })[];
}

export async function createArticleImage(image: Omit<ArticleImage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('article_images')
    .insert(image)
    .select()
    .single();
  if (error) throw error;
  return data as ArticleImage;
}

export async function updateArticleImage(id: number, updates: Partial<Pick<ArticleImage, 'caption' | 'alt_text' | 'sort_order'>>) {
  const { data, error } = await supabase
    .from('article_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ArticleImage;
}

export async function deleteArticleImage(id: number) {
  const { error } = await supabase
    .from('article_images')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
