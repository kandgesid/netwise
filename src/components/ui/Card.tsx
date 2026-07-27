import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-panel border border-line-soft rounded-md p-6', className)}>
      {children}
    </div>
  );
}
