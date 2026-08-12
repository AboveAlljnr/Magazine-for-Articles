import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import { Resend } from 'resend';

const DEFAULT_SITE_URL = 'https://magazine-for-articles.vercel.app';

function getSiteUrl(): string {
  return (
    (process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')) ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, '');
}

function unsubscribeToken(email: string, secret: string): string {
  return createHmac('sha256', secret).update(email).digest('hex');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY'].filter((k) => !process.env[k]);
    if (missing.length) {
      throw new Error(`Missing server environment variables: ${missing.join(', ')}`);
    }
    const url = process.env.VITE_SUPABASE_URL || '';
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const resendKey = process.env.RESEND_API_KEY || '';

    // 1. Verify the caller is a signed-in admin
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }
    const authClient = createClient(url, anonKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!profile?.is_admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    // 2. Load active subscribers + recent articles (service role bypasses RLS)
    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [{ data: subscribers }, { data: articles }] = await Promise.all([
      admin.from('newsletter_subscribers')
        .select('email, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      admin.from('articles')
        .select('title, slug, excerpt, categories(name)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(5),
    ]);

    // Test mode: only email the signed-in admin (for previewing the send)
    const testOnly = req.body?.test === true;
    const emails = (subscribers || [])
      .map((s: any) => s.email)
      .filter(Boolean)
      .filter((e: string) => !testOnly || e === user.email);
    if (emails.length === 0) {
      res.status(200).json({ sent: 0, total: 0, message: 'No active subscribers yet.' });
      return;
    }

    const siteUrl = getSiteUrl();
    const hmacSecret = process.env.NEWSLETTER_SECRET || serviceRoleKey;

    const storiesHtml = (articles || []).map((a: any) => `
      <tr>
        <td style="padding: 12px 0;">
          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #b8652f;">${a.categories?.name || 'Ubuntu Essence'}</p>
          <a href="${siteUrl}/articles/${a.slug}" style="color: #2d1810; text-decoration: none; font-size: 16px; font-weight: 600;">${a.title}</a>
          <p style="margin: 4px 0 0; color: #6b5346; font-size: 13px;">${a.excerpt || ''}</p>
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2d1810;">
        <h1 style="text-align: center; color: #b8652f; letter-spacing: 2px; font-size: 22px;">UBUNTU ESSENCE</h1>
        <p style="text-align: center; color: #6b5346; font-style: italic;">Celebrating African culture and community</p>
        <hr style="border: none; border-top: 1px solid #d4a574; margin: 24px 0;" />
        <h2 style="font-size: 18px;">This week's stories</h2>
        <table style="width: 100%;">${storiesHtml}</table>
        <hr style="border: none; border-top: 1px solid #d4a574; margin: 24px 0;" />
        <p style="text-align: center; font-size: 12px; color: #6b5346;">
          You're receiving this because you subscribed to Ubuntu Essence.<br/>
          <a href="${siteUrl}" style="color: #b8652f;">Read more on ubuntuessence</a> ·
          <a href="{{UNSUBSCRIBE_LINK}}" style="color: #b8652f;">Unsubscribe</a>
        </p>
      </div>`;

    const resend = new Resend(resendKey);
    const payloads = emails.map((email: string) => ({
      from: 'Ubuntu Essence <onboarding@resend.dev>',
      to: [email],
      subject: `${testOnly ? '[TEST] ' : ''}Ubuntu Essence — This week in African culture & community`,
      html: html.replace(
        '{{UNSUBSCRIBE_LINK}}',
        `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email, hmacSecret)}`,
      ),
    }));

    const { data, error } = await resend.batch.send(payloads);

    if (error) throw error;
    res.status(200).json({ sent: emails.length, total: emails.length, data, test: testOnly });
  } catch (e: any) {
    console.error('Newsletter send error', e);
    res.status(500).json({ error: e.message || 'Failed to send newsletter' });
  }
}
