import { useState, useEffect } from 'react';
import { ArrowLeft, Quote, Film } from 'lucide-react';
import { motion } from 'motion/react';
import { getNotes } from '../../lib/api';
import { getVideoEmbedUrl } from '../lib/video-embed';

interface Note {
  id: number;
  body: string;
  video_url: string | null;
  created_at: string;
}

interface NotesPageProps {
  onBack: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function NotesPage({ onBack }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes()
      .then((data) => setNotes(data as Note[]))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />Back to magazine
        </button>

        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-primary mb-2">From the editors</p>
          <h1 className="text-4xl sm:text-5xl leading-tight text-foreground mb-4">Notes</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Brief thoughts, reflections, and moments from the Ubuntu Essence community.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6">
                <div className="h-4 w-24 bg-muted rounded mb-4" />
                <div className="h-5 w-full bg-muted rounded mb-2" />
                <div className="h-5 w-2/3 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Quote className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl text-foreground mb-2">No notes yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Our editors haven't shared any notes yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {notes.map((note) => {
              const embedUrl = getVideoEmbedUrl(note.video_url || '');
              return (
                <article key={note.id} className="rounded-xl border border-border bg-card p-6 sm:p-8">
                  <p className="text-xs text-muted-foreground mb-4">{formatDate(note.created_at)}</p>
                  <div className="flex gap-4">
                    <Quote className="w-5 h-5 text-primary/50 flex-shrink-0 mt-1" />
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-line">{note.body}</p>
                  </div>
                  {embedUrl && (
                    <div className="mt-6">
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground mb-3">
                        <Film className="w-3.5 h-3.5" />Watch
                      </p>
                      <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                        <iframe
                          src={embedUrl}
                          title={`Video for note ${note.id}`}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
