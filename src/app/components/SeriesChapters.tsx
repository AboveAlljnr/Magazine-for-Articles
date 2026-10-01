import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { orderSeriesChapters, storySeries } from '../lib/story-series';

export function SeriesChapters({ seriesSlug, articleSlug }: { seriesSlug?: string; articleSlug?: string }) {
  const series = storySeries.find(s => articleSlug ? s.articles.includes(articleSlug) : s.slug === seriesSlug);
  const [chapters, setChapters] = useState<{ slug: string; title: string; read_time_minutes: number }[]>([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!series) return;
    let active = true;
    setStatus('loading'); setChapters([]);
    supabase.from('articles').select('slug,title,read_time_minutes').eq('published', true).in('slug', series.articles).then(({ data, error }) => {
      if (!active) return;
      if (error) { setStatus('error'); return; }
      setChapters(orderSeriesChapters(series.articles, data || [])); setStatus('ready');
    });
    return () => { active = false; };
  }, [series, attempt]);
  if (!series) return null;
  const index = chapters.findIndex(c => c.slug === articleSlug);
  const previous = index > 0 ? chapters[index - 1] : null;
  const next = index >= 0 ? chapters[index + 1] : null;
  return <section className="border border-border bg-card p-5 sm:p-8 my-10" aria-label="Series reading order">
    <p className="editorial-kicker mb-3">Read the series</p>
    <h2 className="text-2xl mb-3"><Link to={`/series/${series.slug}`} className="hover:text-primary">{series.title}</Link></h2>
    <p className="text-muted-foreground text-sm mb-5">{series.description}</p>
    {status === 'loading' && <p role="status">Loading chapters…</p>}
    {status === 'error' && <p role="status">Chapters couldn’t be loaded. <button className="underline py-3" onClick={() => setAttempt(a => a + 1)}>Try again</button></p>}
    {status === 'ready' && !chapters.length && <p className="text-sm text-muted-foreground">The chapters are being prepared. Check back for the first story.</p>}
    <ol className="divide-y divide-border">{chapters.map((chapter, i) => <li key={chapter.slug}><Link to={`/articles/${chapter.slug}`} aria-current={chapter.slug === articleSlug ? 'page' : undefined} className={`flex gap-4 py-4 hover:text-primary ${chapter.slug === articleSlug ? 'text-primary' : ''}`}><span aria-hidden="true" className="text-muted-foreground tabular-nums">{String(i + 1).padStart(2, '0')}</span><span>{chapter.title}<span className="block text-xs text-muted-foreground mt-1">{chapter.read_time_minutes} min read{chapter.slug === articleSlug ? ' · You are here' : ''}</span></span></Link></li>)}</ol>
    {articleSlug && status === 'ready' && index >= 0 && <nav aria-label="Adjacent chapters" className="grid sm:grid-cols-2 gap-4 border-t border-border pt-4 mt-3">
      {previous && <Link to={`/articles/${previous.slug}`} className="text-primary py-3"><span className="block text-xs mb-1">← Previous chapter</span>{previous.title}</Link>}
      {next ? <Link to={`/articles/${next.slug}`} className="text-primary py-3"><span className="block text-xs mb-1">Next chapter →</span>{next.title}</Link> : <p className="text-muted-foreground text-sm py-3">You’ve reached the latest published chapter.</p>}
    </nav>}
  </section>;
}
