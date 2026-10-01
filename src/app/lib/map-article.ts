import type { MappedArticle } from './article-types';

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function toComponentArticle(row: any): MappedArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body || [],
    image: row.image_url,
    category: row.categories?.name || '',
    subcategory: row.subcategories?.name || '',
    author: row.authors?.name || '',
    authorBio: row.authors?.bio || '',
    authorAvatar: row.authors?.avatar_url || null,
    date: formatDate(row.published_at),
    readTime: `${row.read_time_minutes} min read`,
    featured: row.featured,
    views: row.views || 0,
    likes: row.likes_count || 0,
    comments: row.comments_count || 0,
  };
}

