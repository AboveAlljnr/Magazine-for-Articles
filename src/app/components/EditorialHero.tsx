import { Link } from 'react-router';
import type { MappedArticle } from '../lib/article-types';
import { StoryVisual } from './StoryVisual';

export function EditorialHero({ article }: { article?: MappedArticle }) {
  return <section className={`editorial-hero ${article ? '' : 'editorial-hero-text'}`} aria-labelledby="welcome-title">
    <div className="editorial-hero-copy">
      <p className="editorial-kicker">Rooted in Africa. Connected through stories.</p>
      <h1 id="welcome-title">Our stories.<br /><em>Our spirit.</em></h1>
      <p className="editorial-intro">Culture, campus life, and the moments that make us. A place for heritage, honest reflection, and a little everyday wonder.</p>
      <div className="editorial-actions"><a href="#journal" className="editorial-button">Explore stories <span aria-hidden="true">↗</span></a><Link to="/about" className="editorial-text-link">Meet Ubuntu Essence</Link></div>
      <p className="editorial-signature">Heritage. Belonging. Togetherness.</p>
      <div className="heritage-pattern-panel" aria-hidden="true" />
    </div>
    {article && <Link to={`/articles/${article.slug}`} className="editorial-hero-image">
      <div className="editorial-lead-visual"><StoryVisual image={article.image} title={article.title} category={article.category} eager /></div>
      <div className="editorial-photo-caption"><span className="editorial-kicker">In the spotlight · {article.category}</span><h2>{article.title}</h2><span className="editorial-photo-cta">Read the story <span aria-hidden="true">↗</span></span></div>
    </Link>}
  </section>;
}
