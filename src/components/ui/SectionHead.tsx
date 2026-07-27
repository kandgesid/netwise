import type { ReactNode } from 'react';

export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-[60ch] mb-10">
      <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-2.5">{eyebrow}</div>
      <h2 className="font-mono font-bold text-[26px] mb-3 tracking-tight">{title}</h2>
      {children && <p className="text-ink-dim text-[15px] leading-relaxed">{children}</p>}
    </div>
  );
}
