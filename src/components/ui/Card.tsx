import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={clsx('bg-panel border border-line-soft rounded-md p-6', className)}>
      {children}
    </div>
  );
}
