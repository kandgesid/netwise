import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
}

export function Button({ variant = 'default', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-mono text-[13px] tracking-wide px-5 py-3 rounded-sm inline-flex items-center gap-2 transition-colors',
        variant === 'default' &&
          'bg-transparent text-ink border border-line hover:border-accent hover:text-accent',
        variant === 'primary' &&
          'bg-accent border border-accent text-bg-deep hover:bg-accent-dim hover:border-accent-dim',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
