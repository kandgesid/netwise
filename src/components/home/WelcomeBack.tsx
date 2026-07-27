import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import clsx from 'clsx';
import { COURSE_ROUTES, type RouteMeta } from '../../routeMeta';
import { PITCH_TEXT } from '../chapters/Hero';

// The returning-visitor counterpart to Hero: compact, leads with "get back
// to it" instead of the full first-time pitch. Home.tsx renders this OR
// Hero, never both — see useReadingProgress's `lastRoute`.
export function WelcomeBack({
  lastRoute,
  visited,
  done,
  total,
  onReset,
}: {
  lastRoute: RouteMeta;
  visited: Set<string>;
  done: number;
  total: number;
  onReset: () => void;
}) {
  const [showPitch, setShowPitch] = useState(false);

  return (
    <section className="pt-16 pb-10 max-w-[1080px] mx-auto px-8">
      <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">Welcome back</div>

      <div className="relative mb-3">
        <Link
          to={lastRoute.path}
          className="group flex items-center justify-between gap-4 bg-panel border border-accent/40 rounded-md px-6 py-5 pr-14 hover:border-accent transition-colors"
        >
          <div>
            <div className="font-mono text-xs text-ink-faint mb-1">Continue reading</div>
            <div className="font-mono font-bold text-2xl tracking-tight">
              {lastRoute.chapterNumber ? `Chapter ${lastRoute.chapterNumber}: ` : ''}
              {lastRoute.navLabel}
            </div>
          </div>
          <ArrowRight size={22} className="text-ink-faint group-hover:text-accent transition-colors shrink-0" />
        </Link>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset reading progress"
          title="Reset reading progress"
          className="absolute top-3 right-3 text-ink-faint hover:text-danger transition-colors p-1"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex gap-1 mb-2" role="img" aria-label={`${done} of ${total} chapters read`}>
        {COURSE_ROUTES.map((r) => (
          <div
            key={r.path}
            className={clsx('h-[3px] flex-1 rounded-sm', visited.has(r.path) ? 'bg-accent' : 'bg-line-soft')}
          />
        ))}
      </div>
      <div className="font-mono text-xs text-ink-faint mb-7">
        {done} of {total} chapters read
      </div>

      <button
        type="button"
        onClick={() => setShowPitch((v) => !v)}
        className="font-mono text-xs text-ink-faint hover:text-accent transition-colors"
      >
        {showPitch ? 'Hide ↑' : 'New here? What Netwise is →'}
      </button>
      {showPitch && <p className="text-ink-dim text-[15px] max-w-[60ch] mt-3">{PITCH_TEXT}</p>}
    </section>
  );
}
