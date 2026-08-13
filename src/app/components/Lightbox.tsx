import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: { image_url: string; caption?: string; alt_text?: string; article_title?: string; article_slug?: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const current = images[currentIndex];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-white/70">
          {currentIndex + 1} / {images.length}
        </span>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-3">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        {images.length > 1 && (
          <button
            onClick={onPrev}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-3 sm:p-2 text-white/60 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <img
          src={current.image_url}
          alt={current.alt_text || current.caption || ''}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />

        {images.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-3 sm:p-2 text-white/60 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Bottom caption */}
      <div className="px-6 py-4 text-center">
        {current.caption && (
          <p className="text-sm text-white/80">{current.caption}</p>
        )}
        {current.article_title && (
          <p className="text-xs text-white/50 mt-1">
            {current.article_slug ? (
              <a href={`/articles/${current.article_slug}`} className="hover:underline">{current.article_title}</a>
            ) : (
              current.article_title
            )}
          </p>
        )}
      </div>
    </div>
  );
}
