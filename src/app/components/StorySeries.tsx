import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { supabase } from '../../lib/supabase';
import { applySeo, resetSeo } from '../lib/seo';

// Add article slugs here in reading order. Unpublished entries stay hidden.
const series = [{
  slug: 'kayla-in-ho',
  title: 'Kayla in Ho',
  description: 'Follow Kayla’s campus chronicles in Ho, one story at a time.',
  articles: ['day-1-kayla-in-ho-meet-my-school'],
}];

export function StorySeries({ articleSlug }: { articleSlug?: string }) {
  const params = useParams();
  const collection = series.find(s => articleSlug ? s.articles.includes(articleSlug) : s.slug === params.seriesSlug);
  const [stories, setStories] = useState<{ slug: string; title: string }[]>([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (articleSlug || !collection) return;
    window.scrollTo(0, 0);
    applySeo({ title: `${collection.title} | Ubuntu Essence`, description: collection.description });
    return () => resetSeo();
  }, [articleSlug, collection]);

  useEffect(() => {
    if (!collection) return;
    let active = true;
    setStatus('loading');
    setStories([]);
    supabase.from('articles').select('slug, title').eq('published', true).in('slug', collection.articles)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) { setStatus('error'); return; }
        setStories(collection.articles.flatMap(slug => (data || []).filter(a => a.slug === slug)));
        setStatus('ready');
      });
    return () => { active = false; };
  }, [collection, attempt]);

  if (!collection) return articleSlug ? null : <main className="max-w-3xl mx-auto p-6"><Link to="/">Back to stories</Link><h1 className="text-3xl mt-8">Series not found</h1></main>;
  if (articleSlug && (status !== 'ready' || !stories.some(a => a.slug === articleSlug))) return null;
  const current = stories.findIndex(a => a.slug === articleSlug);
  const previous = stories[current - 1];
  const next = stories[current + 1];

  const content = <>
    <p className="text-xs uppercase tracking-widest text-primary mb-3">Story series</p>
    <h2 className="text-2xl mb-3"><Link to={`/series/${collection.slug}`} className="hover:text-primary">{collection.title}</Link></h2>
    <p className="text-muted-foreground leading-relaxed mb-5">{collection.description}</p>
    {status === 'loading' && <p role="status">Loading stories…</p>}
    {status === 'error' && <p role="alert">Stories couldn’t be loaded. <button className="underline min-h-11" onClick={() => setAttempt(a => a + 1)}>Try again</button></p>}
    {status === 'ready' && stories.length === 0 && <p>New chapters are on their way. Check back soon.</p>}
    <ol className="space-y-2">
      {stories.map((story, i) => <li key={story.slug}><Link to={`/articles/${story.slug}`} aria-current={story.slug === articleSlug ? 'page' : undefined} className={`block rounded-lg border border-border p-4 hover:border-primary ${story.slug === articleSlug ? 'bg-primary/10 text-primary' : ''}`}><span className="text-xs text-muted-foreground block mb-1">Chapter {i + 1}{story.slug === articleSlug ? ' · You are here' : ''}</span>{story.title}</Link></li>)}
    </ol>
    {articleSlug && <nav aria-label="Series chapters" className="flex flex-wrap justify-between gap-4 mt-5">
      {previous && <Link className="py-3 text-primary underline" to={`/articles/${previous.slug}`}>← Previous chapter</Link>}
      {next && <Link className="py-3 text-primary underline" to={`/articles/${next.slug}`}>Next chapter →</Link>}
      {!next && <p className="text-sm text-muted-foreground py-3">You’re up to date with this series.</p>}
    </nav>}
  </>;
  return articleSlug ? <section aria-label="Read this series" className="mt-12 rounded-xl border border-border bg-muted/30 p-5 sm:p-8">{content}</section> : <main className="max-w-3xl mx-auto px-4 py-10"><Link to="/" className="inline-block py-3 mb-8 text-primary">← Back to stories</Link><h1 className="text-4xl mb-8">Read the series</h1>{content}</main>;
}
