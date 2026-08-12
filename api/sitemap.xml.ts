import { createClient } from '@supabase/supabase-js';

const DEFAULT_SITE_URL = 'https://magazine-for-articles.vercel.app';

function getSiteUrl(): string {
  return (
    (process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')) ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, '');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(d?: string | null): string {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export default async function handler(req: any, res: any) {
  try {
    const url = process.env.VITE_SUPABASE_URL || '';
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) throw new Error('Missing Supabase env vars');

    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from('articles')
      .select('slug, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (error) throw error;

    const siteUrl = getSiteUrl();

    const staticPages = [
      { path: '', lastmod: '' },
      { path: '/about', lastmod: '' },
      { path: '/contact', lastmod: '' },
      { path: '/privacy', lastmod: '' },
      { path: '/terms', lastmod: '' },
      { path: '/cookies', lastmod: '' },
      { path: '/gallery', lastmod: '' },
      { path: '/notes', lastmod: '' },
    ];

    const urls = [
      ...staticPages.map(p => {
        const loc = p.path ? `${siteUrl}${p.path}` : siteUrl;
        return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.path ? 'monthly' : 'daily'}</changefreq>
    <priority>${p.path ? '0.6' : '1.0'}</priority>
  </url>`;
      }),
      ...(data || []).map(article => {
        const lastmod = isoDate(article.published_at);
        return `  <url>
    <loc>${escapeXml(`${siteUrl}/articles/${article.slug}`)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.status(200).send(xml);
  } catch (e: any) {
    console.error('Sitemap error', e);
    res.status(500).send('Unable to generate sitemap.');
  }
}
