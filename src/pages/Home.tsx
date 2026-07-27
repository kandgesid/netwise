import { Hero } from '../components/chapters/Hero';
import { WelcomeBack } from '../components/home/WelcomeBack';
import { ChapterCard } from '../components/home/ChapterCard';
import { ToolCard } from '../components/home/ToolCard';
import { COURSE_ROUTES, TOOL_ROUTES } from '../routeMeta';
import { useReadingProgress } from '../lib/useReadingProgress';
import { TOOL_ICONS } from '../lib/toolIcons';

export function Home() {
  const { lastRoute, visited, done, total, reset } = useReadingProgress();

  function handleReset() {
    if (window.confirm('Reset your reading progress? This clears which chapters are marked as read.')) {
      reset();
    }
  }

  return (
    <>
      {lastRoute ? (
        <WelcomeBack lastRoute={lastRoute} visited={visited} done={done} total={total} onReset={handleReset} />
      ) : (
        <Hero />
      )}
      <section className="max-w-[1080px] mx-auto px-8 py-8">
        <h2 className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint mb-4">The course</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-14">
          {COURSE_ROUTES.map((r) => (
            <ChapterCard
              key={r.path}
              to={r.path}
              number={r.chapterNumber}
              title={r.navLabel}
              description={r.description}
            />
          ))}
        </div>

        {TOOL_ROUTES.length > 0 && (
          <>
            <h2 className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint mb-4">Tools</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {TOOL_ROUTES.map((r) => (
                <ToolCard
                  key={r.path}
                  to={r.path}
                  title={r.navLabel}
                  description={r.description}
                  icon={TOOL_ICONS[r.path]}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
