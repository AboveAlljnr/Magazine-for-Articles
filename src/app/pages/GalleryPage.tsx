import { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { getAllImagesForGallery } from '../../lib/api';
import { Lightbox } from '../components/Lightbox';

interface GalleryPageProps {
  onBack: () => void;
  onImageClick?: (slug: string) => void;
}

export function GalleryPage({ onBack, onImageClick }: GalleryPageProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    getAllImagesForGallery()
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const lightboxImages = lightboxIndex !== null
    ? images.map((img) => ({
        image_url: img.image_url,
        caption: img.caption,
        alt_text: img.alt_text,
        article_title: img.articles?.title,
        article_slug: img.articles?.slug,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-base font-medium text-foreground">Gallery</h1>
          <span className="text-sm text-muted-foreground">{images.length} image{images.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
            <p className="text-sm">No images yet.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="break-inside-avoid rounded-xl overflow-hidden border border-border bg-card cursor-pointer group transition-shadow hover:shadow-lg"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || img.caption || ''}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {(img.caption || img.articles?.title) && (
                  <div className="p-3 space-y-1">
                    {img.caption && (
                      <p className="text-xs text-foreground line-clamp-2">{img.caption}</p>
                    )}
                    {img.articles?.title && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onImageClick && img.articles?.slug) onImageClick(img.articles.slug);
                        }}
                        className="text-xs text-primary hover:underline block truncate"
                      >
                        {img.articles.title}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
        />
      )}
    </div>
  );
}
