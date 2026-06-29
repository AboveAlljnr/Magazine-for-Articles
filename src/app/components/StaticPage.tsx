import { ArrowLeft, BookOpen } from 'lucide-react';
import type { StaticSection } from '../lib/legal-content';

interface StaticPageProps {
  title: string;
  sections: StaticSection[];
  onBack: () => void;
}

export function StaticPage({ title, sections, onBack }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm tracking-tight text-primary font-medium">UBUNTU ESSENCE</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl text-foreground mb-10">{title}</h1>
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg text-foreground font-medium mb-3">{section.heading}</h2>
              {section.body.split('\n').map((line, j) => (
                <p key={j} className="text-[0.95rem] leading-relaxed text-foreground/80 mb-2 last:mb-0 whitespace-pre-wrap">
                  {line || '\u00A0'}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          &copy; 2026 Ubuntu Essence. Celebrating African culture and community.
        </div>
      </footer>
    </div>
  );
}
