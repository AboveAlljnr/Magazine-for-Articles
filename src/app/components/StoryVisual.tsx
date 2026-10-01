import { useEffect, useState } from 'react';
import { optimizedImage } from '../../lib/image';

export function StoryVisual({ image, title, category, eager = false }: { image?: string; title: string; category: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  return image?.trim() && !failed ? <img src={optimizedImage(image, 800)} alt={title} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} className="story-photo w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105" /> :
    <div className="story-type-cover" aria-hidden="true"><span className="editorial-kicker">{category || 'From the journal'}</span><span className="story-cover-title">{title}</span><span className="story-cover-signature">Ubuntu Essence · Words to sit with</span></div>;
}
