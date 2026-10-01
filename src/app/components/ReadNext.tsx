import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getArticles } from '../../lib/api';
import type { MappedArticle } from '../lib/article-types';
import { toComponentArticle } from '../lib/map-article';
import { StoryVisual } from './StoryVisual';

export function ReadNext({ article }: { article: MappedArticle }) {
  const [stories, setStories] = useState<MappedArticle[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true; setStories([]); setFailed(false);
    (async () => {
      let rows = await getArticles({ categoryName: article.category, excludeId: article.id, limit: 3 });
      if (!rows.length) rows = await getArticles({ excludeId: article.id, limit: 3 });
      if (active) setStories(rows.map(toComponentArticle));
    })().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [article.id, article.category]);
  if (!stories.length && !failed) return null;
  return <section className="mt-14 border-t border-border pt-10" aria-labelledby="read-next-heading"><p className="editorial-kicker mb-2">Keep exploring</p><h2 id="read-next-heading" className="text-3xl mb-7">Read next</h2>
    {failed ? <Link to="/" className="text-primary underline">Browse more stories →</Link> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{stories.map(story => <Link key={story.id} to={`/articles/${story.slug}`} className="group"><div className="aspect-[4/3] overflow-hidden mb-4"><StoryVisual image={story.image} title={story.title} category={story.category} /></div><p className="text-xs text-primary mb-2">{story.category} · {story.readTime}</p><h3 className="text-xl group-hover:text-primary">{story.title}</h3></Link>)}</div>}
  </section>;
}
