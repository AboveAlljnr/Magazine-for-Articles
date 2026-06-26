export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, 'id' | 'display_name'>;
        Update: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>>;
      };
      authors: {
        Row: Author;
        Insert: Pick<Author, 'name' | 'slug' | 'bio' | 'avatar_url'>;
        Update: Partial<Pick<Author, 'name' | 'bio' | 'avatar_url'>>;
      };
      categories: {
        Row: Category;
        Insert: Pick<Category, 'name' | 'slug'>;
        Update: Partial<Pick<Category, 'name'>>;
      };
      subcategories: {
        Row: Subcategory;
        Insert: Pick<Subcategory, 'name' | 'slug' | 'category_id'>;
        Update: Partial<Pick<Subcategory, 'name'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: Pick<Bookmark, 'user_id' | 'article_id'>;
        Update: never;
      };
      comments: {
        Row: Comment;
        Insert: Pick<Comment, 'article_id' | 'user_id' | 'body'>;
        Update: Partial<Pick<Comment, 'body'>>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Pick<NewsletterSubscriber, 'email'>;
        Update: never;
      };
      article_images: {
        Row: ArticleImage;
        Insert: Omit<ArticleImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ArticleImage, 'id' | 'created_at'>>;
      };
    };
    Functions: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  created_at: string;
}

export interface Article {
  id: number;
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
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  user_id: string;
  article_id: number;
  created_at: string;
}

export interface Comment {
  id: number;
  article_id: number;
  user_id: string;
  body: string;
  likes_count: number;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  created_at: string;
}

export interface ArticleImage {
  id: number;
  article_id: number;
  image_url: string;
  caption: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}
