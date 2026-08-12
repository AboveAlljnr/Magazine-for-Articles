import { getSiteUrl } from './_site';

export default async function handler(req: any, res: any) {
  const siteUrl = getSiteUrl();
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /update-password

Sitemap: ${siteUrl}/sitemap.xml`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  res.status(200).send(robots);
}
