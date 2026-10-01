import { readFile, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

// Run with: node --env-file=.env --env-file=.env.local scripts/import-mikayla-substack.mjs
// Preview is the default. Add --apply to create drafts; existing articles are never updated.
const apply = process.argv.includes('--apply');
const root = new URL('../imports/mikayla-substack/', import.meta.url);
const { posts } = JSON.parse(await readFile(new URL('posts.json', root), 'utf8'));
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase server credentials are required in the local environment.');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const normalize = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const read = async query => { const { data, error } = await query; if (error) throw new Error(error.message); return data; };
const [authors, categories, existing, subcategories] = await Promise.all([
  read(db.from('authors').select('id,name,slug').eq('slug', 'mikayla-enam-ashiadey')),
  read(db.from('categories').select('id,name,slug')),
  read(db.from('articles').select('id,title,slug,body,published,published_at,author_id')),
  read(db.from('subcategories').select('id,slug,category_id')),
]);
if (authors.length !== 1) throw new Error('Expected one matching author; import stopped.');
const author = authors[0];
const report = { mode: apply ? 'applied' : 'preview', author: author.name, created: [], skipped: [], planned: [] };
const seen = new Set();
const candidates = [];
for (const post of posts) {
  if (seen.has(post.slug)) throw new Error('Duplicate source slug in migration bundle.');
  seen.add(post.slug);
  if (post.source_url !== `https://mikaylascribes.substack.com/p/${post.slug}` || Number.isNaN(Date.parse(post.published_at)) || !post.body?.length) throw new Error(`Invalid source record: ${post.slug}`);
  if (post.slug === 'coming-soon') { report.skipped.push({ slug: post.slug, reason: 'Substack launch announcement, not an article' }); continue; }
  const title = post.subtitle ? `${post.title} — ${post.subtitle}` : post.title;
  const duplicate = existing.find(a => a.slug === post.slug || a.body?.some(p => p.includes(post.source_url)) || (a.author_id === author.id && (normalize(a.title) === normalize(title) || (!post.subtitle && normalize(a.title) === normalize(post.title)) || normalize(a.body?.join(' ') || '') === normalize(post.body.join(' ')))));
  if (duplicate) { report.skipped.push({ slug: post.slug, reason: 'Already exists; left unchanged', article_id: duplicate.id, title: duplicate.title }); continue; }
  let categorySlug = 'echoes';
  let subcategorySlug = 'mindset-resilience';
  if (['head-pans', 'the-fisherman'].includes(post.slug)) { categorySlug = 'heritage-culture'; subcategorySlug = 'cultural-identity-symbolism'; }
  if (post.slug.endsWith('-b7a')) { categorySlug = 'grace-spirit'; subcategorySlug = 'declarations-gratitude'; }
  if (post.slug.endsWith('-211')) { categorySlug = 'the-chronicle'; subcategorySlug = 'philosophical-musings'; }
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) throw new Error(`Missing category: ${categorySlug}`);
  const subcategory = subcategories.find(s => s.slug === subcategorySlug && s.category_id === category.id);
  const excerpt = post.body[0].replace(/^#+\s|^>\s|^-\s/, '').replace(/\s+/g, ' ');
  const payload = {
    title, slug: post.slug,
    excerpt: excerpt.length > 260 ? `${excerpt.slice(0, 257).replace(/\s+\S*$/, '')}…` : excerpt,
    body: [...post.body, `Originally published on Substack: ${post.source_url}`],
    author_id: author.id, category_id: category.id, subcategory_id: subcategory?.id ?? null,
    image_url: '', read_time_minutes: Math.max(1, Math.ceil(post.body.join(' ').split(/\s+/).length / 200)),
    published: false, featured: false, published_at: post.published_at,
  };
  candidates.push(payload);
  report.planned.push({ title, slug: post.slug, published_at: post.published_at, category: category.name, paragraphs: post.body.length });
}
// One insert statement makes the batch atomic; unique slugs also prevent repeat imports.
if (apply && candidates.length) {
  report.created = await read(db.from('articles').insert(candidates).select('id,slug,title,published,published_at'));
  const verified = await read(db.from('articles').select('id,slug,body,published,published_at,author_id').in('slug', candidates.map(p => p.slug)));
  for (const payload of candidates) {
    const actual = verified.find(p => p.slug === payload.slug);
    if (!actual || actual.published || actual.author_id !== author.id || Date.parse(actual.published_at) !== Date.parse(payload.published_at) || JSON.stringify(actual.body) !== JSON.stringify(payload.body)) throw new Error(`Verification failed for ${payload.slug}; inspect the database before retrying.`);
  }
  report.verified = true;
}
await writeFile(new URL(apply ? 'import-result.json' : 'import-preview.json', root), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
