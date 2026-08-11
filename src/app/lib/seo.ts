/** Per-route SEO meta injection for the SPA. Restores defaults on cleanup. */

export const DEFAULT_TITLE = 'Ubuntu Essence — Celebrating African Culture & Heritage';
export const DEFAULT_DESCRIPTION =
  'Ubuntu Essence is a digital magazine celebrating African culture, heritage, fashion, arts, travel, and lifestyle through compelling stories and insightful articles.';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function absolute(url?: string): string | undefined {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url, window.location.origin).toString();
}

export interface SeoData {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function applySeo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
}: SeoData) {
  const imageUrl = absolute(image);
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', type);
  upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  if (url) upsertMeta('property', 'og:url', absolute(url)!);
  if (imageUrl) {
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:image', imageUrl);
  }
}

export function resetSeo() {
  document.title = DEFAULT_TITLE;
  upsertMeta('name', 'description', DEFAULT_DESCRIPTION);
  upsertMeta('property', 'og:title', DEFAULT_TITLE);
  upsertMeta('property', 'og:description', 'A digital magazine celebrating African culture, heritage, and the spirit of togetherness.');
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', DEFAULT_TITLE);
  upsertMeta('name', 'twitter:description', 'A digital magazine celebrating African culture, heritage, and the spirit of togetherness.');
}
