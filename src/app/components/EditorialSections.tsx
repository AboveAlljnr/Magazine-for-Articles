import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getArticles } from '../../lib/api';
import type { MappedArticle } from '../lib/article-types';
import { toComponentArticle } from '../lib/map-article';
import { ArticleCard } from './ArticleCard';

interface Props {
  savedIds: Set<number>;
  onToggleSave: (a: MappedArticle) => void;
  onArticleClick: (a: MappedArticle) => void;
  onAuthorClick: (name: string) => void;
  onCategoryChange: (category: string) => void;
}
const topics = [
  { slug: 'heritage-culture', name: 'Heritage & Culture', title: 'Heritage & Culture', description: 'The traditions, places, and stories that connect us.' },
  { slug: 'grace-spirit', name: 'Grace & Spirit', title: 'Faith & Reflection', description: 'A little space for gratitude, growth, and the life within.' },
  { slug: 'the-chronicle', name: 'The Chronicle', title: 'Life & Discovery', description: 'Campus chronicles, journeys, and curious ways of seeing the world.' },
];

function TopicSection({ topic, ...props }: Props & { topic: typeof topics[number] }) {
  const [stories, setStories] = useState<MappedArticle[]>([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus('loading');
    getArticles({ categorySlug: topic.slug, limit: 3 }).then(rows => {
      if (active) { setStories(rows.map(toComponentArticle)); setStatus('ready'); }
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [topic.slug, attempt]);
  if (status === 'ready' && !stories.length) return null;
  return <section className="mt-16 sm:mt-20" aria-label={topic.title}>
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5 mb-7"><div><h2 className="text-3xl mb-2">{topic.title}</h2><p className="text-sm text-muted-foreground">{topic.description}</p></div><button onClick={() => { props.onCategoryChange(topic.name); window.scrollTo({ top: 0, behavior: 'auto' }); }} className="editorial-text-link py-3">Explore all →</button></div>
    {status === 'loading' && <p role="status" className="text-muted-foreground py-8">Gathering stories…</p>}
    {status === 'error' && <p role="status">Stories couldn’t be loaded. <button onClick={() => setAttempt(a => a + 1)} className="underline py-3">Try again</button></p>}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{stories.map(article => <ArticleCard key={article.id} article={article} onClick={props.onArticleClick} saved={props.savedIds.has(article.id)} onToggleSave={props.onToggleSave} onAuthorClick={props.onAuthorClick} />)}</div>
  </section>;
}

export function EditorialSections(props: Props) {
  return <>
    <section className="series-invitation mt-16 p-6 sm:p-10 border border-border bg-muted" aria-labelledby="series-invitation-title">
      <p className="editorial-kicker mb-3">Stay with the story</p><h2 id="series-invitation-title" className="text-3xl mb-3">A chapter at a time</h2><p className="text-muted-foreground max-w-xl mb-5">Follow Kayla’s campus chronicles and reflections through the months. Find each series in reading order.</p><Link to="/series" className="editorial-button">Explore the series →</Link>
    </section>
    {topics.map(topic => <TopicSection key={topic.slug} topic={topic} {...props} />)}
  </>;
}
