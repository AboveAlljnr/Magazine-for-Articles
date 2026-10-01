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

function upsertCanonical(url?: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function upsertJsonLd(data?: object) {
  document.head.querySelectorAll<HTMLScriptElement>('script[data-seo-jsonld]').forEach(n => n.remove());
  if (!data) return;
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.setAttribute('data-seo-jsonld', 'true');
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

export interface SeoData {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
  jsonLd?: object;
}

export function applySeo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
  canonical,
  jsonLd,
}: SeoData) {
  const imageUrl = absolute(image || '/logo.jpg');
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', type);
  upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('property', 'og:url', absolute(url || window.location.pathname)!);
  upsertMeta('property', 'og:site_name', 'Ubuntu Essence');
  upsertMeta('property', 'og:image:alt', title);
  if (imageUrl) {
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:image', imageUrl);
  }
  upsertCanonical(canonical ?? url ? absolute(canonical ?? url) : undefined);
  upsertJsonLd(jsonLd);
}

export function resetSeo() {
  upsertMeta('property', 'og:image', absolute('/logo.jpg')!);
  upsertMeta('name', 'twitter:image', absolute('/logo.jpg')!);
  upsertMeta('property', 'og:image:alt', 'Ubuntu Essence');
  upsertMeta('property', 'og:url', window.location.origin + '/');
  document.title = DEFAULT_TITLE;
  upsertMeta('name', 'description', DEFAULT_DESCRIPTION);
  upsertMeta('property', 'og:title', DEFAULT_TITLE);
  upsertMeta('property', 'og:description', 'A digital magazine celebrating African culture, heritage, and the spirit of togetherness.');
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', DEFAULT_TITLE);
  upsertMeta('name', 'twitter:description', 'A digital magazine celebrating African culture, heritage, and the spirit of togetherness.');
  upsertCanonical(undefined);
  upsertJsonLd(undefined);
}
