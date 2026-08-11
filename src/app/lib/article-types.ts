/** Shared article shape used across all magazine components */
export interface MappedArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  image: string;
  category: string;
  subcategory: string;
  author: string;
  authorBio: string;
  authorAvatar: string | null;
  date: string;
  readTime: string;
  featured: boolean;
  views: number;
}
