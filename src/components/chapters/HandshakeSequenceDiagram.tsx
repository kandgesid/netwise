import { Fragment } from 'react';
import clsx from 'clsx';
import { ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * Static Client/Server message-sequence diagram, modeled directly on the source
 * doc's §5 handshake diagrams (two columns, numbered arrows, round-trip count).
 * Used twice in Chapter3Handshake.tsx (TLS 1.2, TLS 1.3) — same component, different
 * message lists, so the two sequences are visually comparable side by side.
 */

interface SequenceMessage {
  direction: 'right' | 'left';
  label: string;
  encrypted?: boolean;
  annotate?: string;
}

interface HandshakeSequenceDiagramProps {
  title: string;
  roundTrips: number;
  messages: SequenceMessage[];
}

export function HandshakeSequenceDiagram({ title, roundTrips, messages }: HandshakeSequenceDiagramProps) {
  return (
    <div className="rounded-md border border-line-soft bg-bg-deep p-3.5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">{title}</h4>
        <span className="font-mono text-[10px] uppercase tracking-wide text-accent border border-accent/40 rounded-sm px-1.5 py-0.5 shrink-0">
          {roundTrips} round trip{roundTrips > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-ink-faint mb-2 px-1">
        <span>Client</span>
        <span>Server</span>
      </div>
      <div className="grid grid-cols-2 gap-x-2">
        {messages.map((m, i) => (
          <Fragment key={i}>
            <div
              className={clsx(
                'flex items-center justify-end gap-1 py-0.5 text-right',
                m.direction !== 'right' && 'invisible'
              )}
            >
              <span className={clsx('text-[11px] leading-tight', m.encrypted ? 'text-accent' : 'text-ink-dim')}>
                {m.label}
              </span>
              <ArrowRight size={11} className="text-ink-faint shrink-0" />
            </div>
            <div
              className={clsx('flex items-center gap-1 py-0.5', m.direction !== 'left' && 'invisible')}
            >
              <ArrowLeft size={11} className="text-ink-faint shrink-0" />
              <span className={clsx('text-[11px] leading-tight', m.encrypted ? 'text-accent' : 'text-ink-dim')}>
                {m.label}
              </span>
            </div>
            {m.annotate && (
              <div className="col-span-2 text-center text-[10px] text-ink-faint italic py-0.5">
                {m.annotate}
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="mt-2.5 pt-2 border-t border-line-soft text-center">
        <span className="font-mono text-[10px] uppercase tracking-wide text-accent">Encrypted session</span>
      </div>
    </div>
  );
}
