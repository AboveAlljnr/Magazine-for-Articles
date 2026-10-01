import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { storySeries } from '../lib/story-series';
import { SeriesChapters } from '../components/SeriesChapters';
import { applySeo, resetSeo } from '../lib/seo';

export function SeriesPage() {
  const { seriesSlug } = useParams();
  const selected = storySeries.find(s => s.slug === seriesSlug);
  useEffect(() => {
    window.scrollTo(0, 0);
    applySeo({ title: `${selected?.title || 'Story series'} | Ubuntu Essence` });
    return resetSeo;
  }, [seriesSlug, selected]);
  return <div className="heritage-background min-h-screen bg-background"><main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <Link to="/" className="inline-block text-primary py-3 mb-8">← Back to stories</Link>
    <p className="editorial-kicker mb-3">Stay with the story</p><h1 className="text-4xl sm:text-5xl mb-5">{seriesSlug && !selected ? 'Series not found' : selected?.title || 'A chapter at a time'}</h1>
    {!seriesSlug && <><p className="text-muted-foreground leading-relaxed mb-8">Find your place in Kayla’s stories. Explore the chapters in the order they were meant to be read.</p><div className="space-y-5">{storySeries.map(s => <Link key={s.slug} to={`/series/${s.slug}`} className="block border border-border bg-card p-6 hover:border-primary"><h2 className="text-2xl mb-3">{s.title}</h2><p className="text-muted-foreground text-sm mb-4">{s.description}</p><span className="text-primary text-sm">Explore chapters →</span></Link>)}</div></>}
    {selected && <><SeriesChapters seriesSlug={selected.slug} /><Link to="/series" className="text-primary underline">All series</Link></>}
  </main></div>;
}
