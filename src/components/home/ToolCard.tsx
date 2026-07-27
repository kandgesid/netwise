import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export function ToolCard({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      className="group block bg-panel border border-line-soft rounded-md p-5 hover:border-accent transition-colors"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="flex items-center justify-center w-6 h-6 rounded-sm border border-line text-ink-faint group-hover:border-accent group-hover:text-accent transition-colors shrink-0">
          <Icon size={13} />
        </span>
        <span className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint">Tool</span>
      </div>
      <h3 className="font-sans font-semibold text-base mb-1.5 flex items-center justify-between gap-2">
        {title}
        <ArrowRight size={16} className="text-ink-faint group-hover:text-accent transition-colors shrink-0" />
      </h3>
      <p className="text-ink-dim text-[13.5px]">{description}</p>
    </Link>
  );
}
