import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-bg-deep/85 border-b border-line-soft">
      <div className="px-6 h-[60px] flex items-center justify-between gap-6">
        <Link to="/" className="font-mono font-bold text-[17px] flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 bg-accent rounded-sm inline-block" />
          NETWISE
          <span className="font-mono text-[10px] tracking-wide text-ink-faint border border-line rounded-sm px-1.5 py-0.5 uppercase">
            Simulation
          </span>
        </Link>
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
            className="md:hidden text-ink-dim hover:text-accent transition-colors"
          >
            <Menu size={22} />
          </button>
        )}
      </div>
    </header>
  );
}
