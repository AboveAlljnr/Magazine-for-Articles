import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SITE_URL = 'https://magazine-for-articles.vercel.app';

function getSiteUrl(): string {
  return (
    (process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')) ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const email = String(req.query.email || '').trim().toLowerCase();
  const token = String(req.query.token || '');
  const siteUrl = getSiteUrl();

  if (!email || !token) {
    res.status(400).send('Missing parameters');
    return;
  }

  const secret = process.env.NEWSLETTER_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) {
    res.status(500).send('Server not configured');
    return;
  }

  const expected = createHmac('sha256', secret).update(email).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  const valid = a.length === b.length && timingSafeEqual(a, b);

  if (!valid) {
    res.status(403).send('Invalid unsubscribe link');
    return;
  }

  const url = process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceRoleKey) {
    res.status(500).send('Server not configured');
    return;
  }

  try {
    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await admin
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('email', email);

    const safeEmail = escapeHtml(email);
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribed — Ubuntu Essence</title>
  <style>
    body { margin: 0; font-family: Georgia, serif; background: #faf6f1; color: #2d1810; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 420px; margin: 24px; padding: 40px 32px; background: #fff; border-radius: 16px; text-align: center; box-shadow: 0 8px 30px rgba(45,24,16,.08); }
    h1 { font-size: 22px; letter-spacing: 2px; color: #b8652f; margin: 0 0 8px; }
    p { color: #6b5346; font-size: 15px; line-height: 1.6; }
    a { color: #b8652f; }
  </style>
</head>
<body>
  <div class="card">
    <h1>UBUNTU ESSENCE</h1>
    <p>You've been unsubscribed from our newsletter, ${safeEmail}.</p>
    <p>You won't receive any more emails from us. If this was a mistake, you can subscribe again any time at <a href="${siteUrl}">${siteUrl}</a>.</p>
  </div>
</body>
</html>`);
  } catch (e: any) {
    console.error('Unsubscribe error', e);
    res.status(500).send('Something went wrong. Please try again.');
  }
}
