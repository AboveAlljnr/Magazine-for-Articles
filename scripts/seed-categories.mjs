import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwaflydtycyremfosnwd.supabase.co';
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Missing SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function upsertBySlug(table, row) {
  const { data: existing } = await supabase.from(table).select('id').eq('slug', row.slug).maybeSingle();
  if (existing) {
    await supabase.from(table).update(row).eq('id', existing.id);
    console.log(`  Updated ${table}: ${row.name}`);
    return existing.id;
  }
  const { data, error } = await supabase.from(table).insert(row).select('id').single();
  if (error) { console.error(`  Error inserting ${table} "${row.name}":`, error.message); return null; }
  console.log(`  Inserted ${table}: ${row.name}`);
  return data.id;
}

async function main() {
  // 1. Author
  const authorSlug = 'mikayla-enam-ashiadey';
  let authorId;
  const { data: existingAuthor } = await supabase.from('authors').select('id').eq('slug', authorSlug).maybeSingle();
  if (existingAuthor) {
    authorId = existingAuthor.id;
    console.log(`Author exists: Mikayla Enam Ashiadey (id=${authorId})`);
  } else {
    const { data, error } = await supabase.from('authors').insert({
      name: 'Mikayla Enam Ashiadey',
      slug: authorSlug,
      bio: 'Writer, storyteller, and chronicler of African culture and student life.',
    }).select('id').single();
    if (error) { console.error('Error creating author:', error.message); process.exit(1); }
    authorId = data.id;
    console.log(`Created author: Mikayla Enam Ashiadey (id=${authorId})`);
  }

  // 2. Categories
  const categories = [
    { name: 'The Chronicle', slug: 'the-chronicle' },
    { name: 'Heritage & Culture', slug: 'heritage-culture' },
    { name: 'Echoes', slug: 'echoes' },
    { name: 'Grace & Spirit', slug: 'grace-spirit' },
  ];

  console.log('\n── Categories ──');
  const catMap = {};
  for (const cat of categories) {
    const id = await upsertBySlug('categories', cat);
    if (id) catMap[cat.slug] = id;
  }

  // 3. Subcategories
  const subcategories = [
    { name: 'Campus & Travel Chronicles', slug: 'campus-travel-chronicles', category_slug: 'the-chronicle' },
    { name: 'Philosophical Musings', slug: 'philosophical-musings', category_slug: 'the-chronicle' },
    { name: 'Historical Roots', slug: 'historical-roots', category_slug: 'the-chronicle' },
    { name: 'Folktales & Oral Traditions', slug: 'folktales-oral-traditions', category_slug: 'heritage-culture' },
    { name: 'Cultural Identity & Symbolism', slug: 'cultural-identity-symbolism', category_slug: 'heritage-culture' },
    { name: 'Daily Bread & Student Life', slug: 'daily-bread-student-life', category_slug: 'echoes' },
    { name: 'Mindset & Resilience', slug: 'mindset-resilience', category_slug: 'echoes' },
    { name: 'Prayer & Reflection', slug: 'prayer-reflection', category_slug: 'grace-spirit' },
    { name: 'Declarations & Gratitude', slug: 'declarations-gratitude', category_slug: 'grace-spirit' },
  ];

  console.log('\n── Subcategories ──');
  const subMap = {};
  for (const sub of subcategories) {
    const catId = catMap[sub.category_slug];
    if (!catId) { console.error(`  Missing category for "${sub.name}"`); continue; }
    const { name, slug } = sub;
    const id = await upsertBySlug('subcategories', { name, slug, category_id: catId });
    if (id) subMap[sub.slug] = id;
  }

  // 4. Articles
  const placeholderBody = ['Coming soon...'];

  const articles = [
    { title: 'Day 1 of the series: Kayla in Ho — Meet My School', slug: 'day-1-kayla-in-ho-meet-my-school', sub_slug: 'campus-travel-chronicles' },
    { title: 'What if Santiago never left?', slug: 'what-if-santiago-never-left', sub_slug: 'philosophical-musings' },
    { title: 'The history of the New Year / Ancient Babylon & Janus', slug: 'history-of-new-year-babylon-janus', sub_slug: 'historical-roots' },
    { title: 'Coconut man', slug: 'coconut-man', sub_slug: 'folktales-oral-traditions' },
    { title: 'The deep meaning of African Headgear', slug: 'deep-meaning-of-african-headgear', sub_slug: 'cultural-identity-symbolism' },
    { title: 'Random thoughts (Staring at my lecturer...)', slug: 'random-thoughts-staring-at-lecturer', sub_slug: 'daily-bread-student-life' },
    { title: 'Sometimes, showing up is the best thing...', slug: 'sometimes-showing-up-is-the-best-thing', sub_slug: 'mindset-resilience' },
    { title: 'There\'s no version of reality where I don\'t see myself successful', slug: 'no-version-of-reality-not-successful', sub_slug: 'mindset-resilience' },
    { title: 'Lately, I\'ve been in my shell... (Month of love & wisdom)', slug: 'lately-been-in-my-shell-month-of-love', sub_slug: 'mindset-resilience' },
    { title: 'When I was like 6, I used to watch my cousin pray...', slug: 'when-i-was-6-watched-cousin-pray', sub_slug: 'prayer-reflection' },
    { title: 'The hand of the Lord is upon my life...', slug: 'hand-of-the-lord-upon-my-life', sub_slug: 'declarations-gratitude' },
    { title: 'Reflecting on how gently and intentionally my Heavenly Father has raised me', slug: 'reflecting-how-gently-father-raised-me', sub_slug: 'declarations-gratitude' },
  ];

  console.log('\n── Articles ──');
  for (const art of articles) {
    const subId = subMap[art.sub_slug];
    if (!subId) { console.error(`  Missing subcategory for "${art.title}"`); continue; }
    const catData = subcategories.find(s => s.slug === art.sub_slug);
    const catId = catMap[catData?.category_slug];
    const { data: existing } = await supabase.from('articles').select('id').eq('slug', art.slug).maybeSingle();
    if (existing) {
      console.log(`  Article exists: ${art.title}`);
      continue;
    }
    const { error } = await supabase.from('articles').insert({
      title: art.title,
      slug: art.slug,
      body: placeholderBody,
      category_id: catId,
      subcategory_id: subId,
      author_id: authorId,
      published: false,
      featured: false,
      read_time_minutes: 1,
    });
    if (error) { console.error(`  Error inserting article "${art.title}":`, error.message); }
    else { console.log(`  Inserted article: ${art.title}`); }
  }

  console.log('\n✓ Done.');
}

main().catch(console.error);
