import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function ChapterCard({
  to,
  title,
  description,
  number,
}: {
  to: string;
  title: string;
  description: string;
  number?: number;
}) {
  return (
    <Link
      to={to}
      className="group block bg-panel border border-line-soft rounded-md p-5 hover:border-accent transition-colors"
    >
      {number && (
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-2">Chapter {number}</div>
      )}
      <h3 className="font-sans font-semibold text-base mb-1.5 flex items-center justify-between gap-2">
        {title}
        <ArrowRight size={16} className="text-ink-faint group-hover:text-accent transition-colors shrink-0" />
      </h3>
      <p className="text-ink-dim text-[13.5px]">{description}</p>
    </Link>
  );
}
