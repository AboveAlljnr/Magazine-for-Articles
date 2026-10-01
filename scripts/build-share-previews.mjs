import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const origin = (env.SITE_URL || 'https://magazine-for-articles.vercel.app').replace(/\/+$/, '');
const db = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const template = await readFile('dist/index.html', 'utf8');
function page(title, description, image, url, type) {
  const clean = template.replace(/<title>[\s\S]*?<\/title>/g, '').replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '');
  const tags = [['name','description',description],['property','og:title',title],['property','og:description',description],['property','og:image',image],['property','og:image:alt',title],['property','og:url',url],['property','og:type',type],['property','og:site_name','Ubuntu Essence'],['name','twitter:card','summary_large_image'],['name','twitter:title',title],['name','twitter:description',description],['name','twitter:image',image]];
  return clean.replace('</head>', `<title>${escape(title)}</title>\n<link rel="canonical" href="${escape(url)}" />\n${tags.map(([attr,key,value])=>`<meta ${attr}="${key}" content="${escape(value)}" />`).join('\n')}\n</head>`);
}
let rows = [];
for (let start = 0; ; start += 500) {
  const { data, error } = await db.from('articles').select('slug,title,excerpt,image_url').eq('published',true).order('id').range(start,start+499);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 500) break;
}
for (const article of rows) {
  if (!/^[a-zA-Z0-9_-]+$/.test(article.slug)) throw new Error('Unsupported article slug');
  const dir = `dist/articles/${article.slug}`;
  await mkdir(dir,{recursive:true});
  const image = article.image_url ? new URL(article.image_url,origin).href : `${origin}/logo.jpg`;
  await writeFile(`${dir}/index.html`,page(`${article.title} | Ubuntu Essence`,article.excerpt || 'Rooted in Africa. Connected through stories.',image,`${origin}/articles/${article.slug}`,'article'));
}
await writeFile('dist/index.html',page('Ubuntu Essence — Rooted in Africa. Connected through stories.','Stories of heritage, belonging, and everyday life.',`${origin}/logo.jpg`,`${origin}/`,'website'));
console.log(`Created share metadata for ${rows.length} published stories.`);
