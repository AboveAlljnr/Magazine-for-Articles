export const DEFAULT_SITE_URL = 'https://magazine-for-articles.vercel.app';

/** Resolves the canonical site URL from env, with trailing-slash safety. */
export function getSiteUrl(): string {
  return (
    (process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')) ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, '');
}
