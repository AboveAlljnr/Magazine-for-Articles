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

export default async function handler(req: any, res: any) {
  try {
    const url = process.env.VITE_SUPABASE_URL || '';
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) throw new Error('Missing Supabase env vars');

    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from('articles')
      .select('title, slug, excerpt, body, image_url, published_at, categories(name), authors(name)')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(20);
    if (error) throw error;

    const siteUrl = getSiteUrl();

    const items = (data || []).map((article: any) => {
      const link = `${siteUrl}/articles/${article.slug}`;
      const category = article.categories?.name || '';
      const bodyText = (article.body || []).join('\n\n');
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(article.published_at || Date.now()).toUTCString()}</pubDate>
      <description>${escapeXml(article.excerpt || '')}</description>
      ${article.image_url ? `<enclosure url="${escapeXml(article.image_url)}" type="image/jpeg" />` : ''}
      <content:encoded><![CDATA[${bodyText}]]></content:encoded>
      ${category ? `<category>${escapeXml(category)}</category>` : ''}
      ${article.authors?.name ? `<dc:creator>${escapeXml(article.authors.name)}</dc:creator>` : ''}
    </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Ubuntu Essence — Celebrating African Culture &amp; Heritage</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>A digital magazine celebrating African culture, heritage, and the spirit of togetherness.</description>
    <language>en</language>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.status(200).send(xml);
  } catch (e: any) {
    console.error('RSS feed error', e);
    res.status(500).send('Unable to generate feed.');
  }
}
