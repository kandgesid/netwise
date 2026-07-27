import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { COURSE_ROUTES, TOOL_ROUTES } from '../../routeMeta';
import { useReadingProgress } from '../../lib/useReadingProgress';
import { useScrollProgress } from '../../lib/useScrollProgress';

export function ChapterPage({ title, children }: { title: string; children: ReactNode }) {
  const location = useLocation();
  const { markVisited } = useReadingProgress();
  const scrollProgress = useScrollProgress(location.pathname);

  useEffect(() => {
    document.title = `${title} — Netwise`;
  }, [title]);

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  const all = [...COURSE_ROUTES, ...TOOL_ROUTES];
  const current = all.find((r) => r.path === location.pathname);
  const group = current?.group === 'tools' ? TOOL_ROUTES : COURSE_ROUTES;
  const idx = group.findIndex((r) => r.path === location.pathname);
  const prev = idx > 0 ? group[idx - 1] : undefined;
  const next = idx >= 0 && idx < group.length - 1 ? group[idx + 1] : undefined;

  return (
    <section className="max-w-[1080px] mx-auto px-8 py-18">
      {current?.group === 'course' && (
        <div className="fixed top-[60px] left-0 right-0 h-[2px] bg-line-soft z-40" aria-hidden="true">
          <div className="h-full bg-accent" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}
      {current?.chapterNumber && (
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-4">
          Chapter {current.chapterNumber} of {COURSE_ROUTES.length}
        </div>
      )}
      {children}
      {(prev || next) && (
        <div className="flex items-center justify-between mt-14 pt-6 border-t border-line-soft">
          {prev ? (
            <Link
              to={prev.path}
              className="flex items-center gap-2 text-ink-dim hover:text-accent transition-colors text-sm"
            >
              <ArrowLeft size={16} /> {prev.navLabel}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={next.path}
              className="flex items-center gap-2 text-ink-dim hover:text-accent transition-colors text-sm"
            >
              {next.navLabel} <ArrowRight size={16} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </section>
  );
}
