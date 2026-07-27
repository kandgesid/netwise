import clsx from 'clsx';

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A segmented-control style toggle, used for scenario switches, rule action, match mode, and tabs. */
export function Toggle<T extends string>({ options, value, onChange }: ToggleProps<T>) {
  return (
    <div className="flex bg-bg-deep border border-line rounded-md overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 font-mono text-[12.5px] py-2.5 px-2 transition-colors',
            value === opt.value ? 'bg-accent text-bg-deep font-bold' : 'text-ink-dim hover:text-ink'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
