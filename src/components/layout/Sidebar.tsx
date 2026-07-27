import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { COURSE_ROUTES, TOOL_ROUTES, type RouteMeta } from '../../routeMeta';
import { useReadingProgress } from '../../lib/useReadingProgress';
import { TOOL_ICONS } from '../../lib/toolIcons';

// Reuses the handshake stepper's segmented-bar look (h-[3px] filled/unfilled
// strips) so the reader's course progress reads as the same "checkpoints
// passed" idea the site already teaches, not a generic loading bar.
function CourseProgressBar({ visited, onReset }: { visited: Set<string>; onReset: () => void }) {
  const done = COURSE_ROUTES.filter((r) => visited.has(r.path)).length;
  if (done === 0) return null;
  return (
    <div className="px-3 mb-3">
      <div
        className="flex gap-1 mb-1.5"
        role="img"
        aria-label={`${done} of ${COURSE_ROUTES.length} chapters read`}
      >
        {COURSE_ROUTES.map((r) => (
          <div
            key={r.path}
            className={clsx('h-[3px] flex-1 rounded-sm', visited.has(r.path) ? 'bg-accent' : 'bg-line-soft')}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="font-mono text-[11px] text-ink-faint hover:text-danger transition-colors"
      >
        Reset progress
      </button>
    </div>
  );
}

function NavGroup({
  label,
  routes,
  onNavigate,
  visited,
  showIcons,
}: {
  label: string;
  routes: RouteMeta[];
  onNavigate: () => void;
  visited?: Set<string>;
  showIcons?: boolean;
}) {
  if (routes.length === 0) return null;
  return (
    <div className="mb-6 px-3">
      <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2 px-2">{label}</div>
      <nav className="flex flex-col gap-0.5">
        {routes.map((r) => {
          const Icon = showIcons ? TOOL_ICONS[r.path] : undefined;
          return (
            <NavLink
              key={r.path}
              to={r.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'px-2 py-2 rounded-sm text-[13.5px] border-l-2 transition-colors flex items-center justify-between gap-2',
                  isActive
                    ? 'bg-accent/10 text-accent border-accent'
                    : 'text-ink-dim border-transparent hover:text-ink hover:bg-panel'
                )
              }
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {Icon && <Icon size={13} className="text-ink-faint shrink-0" />}
                <span className="truncate">
                  {r.chapterNumber ? `${r.chapterNumber}. ${r.navLabel}` : r.navLabel}
                </span>
              </span>
              {visited?.has(r.path) && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-label="Read" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { visited, reset } = useReadingProgress();

  function handleReset() {
    if (window.confirm('Reset your reading progress? This clears which chapters are marked as read.')) {
      reset();
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          'w-[240px] shrink-0 border-r border-line-soft bg-bg-deep overflow-y-auto py-6',
          'fixed md:sticky top-[60px] left-0 h-[calc(100vh-60px)] z-30',
          'transition-transform duration-200 md:transition-none',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <CourseProgressBar visited={visited} onReset={handleReset} />
        <NavGroup label="Course" routes={COURSE_ROUTES} onNavigate={onClose} visited={visited} />
        <NavGroup label="Tools" routes={TOOL_ROUTES} onNavigate={onClose} showIcons />
      </aside>
    </>
  );
}
