import { ArrowRight, ArrowLeft, ArrowDown } from 'lucide-react';

/**
 * Static ECDHE key-exchange diagram, modeled on the source doc's §6 diagram:
 * Client/Server generate ephemeral pairs, exchange public keys, converge on the
 * same shared secret, derive session keys, destroy the ephemeral keys. Replaces
 * the old 5-step numbered text list in Chapter4KeyExchange.tsx with the actual
 * shape instead of a prose description of it.
 */

export function KeyExchangeDiagram() {
  return (
    <div className="rounded-md border border-line-soft bg-bg-deep p-4">
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="rounded-md border border-line-soft bg-panel px-3 py-2.5 text-center">
          <div className="font-mono text-[12px] text-accent mb-1">Client</div>
          <div className="text-[11px] text-ink-faint">ephemeral key pair</div>
        </div>
        <div className="rounded-md border border-line-soft bg-panel px-3 py-2.5 text-center">
          <div className="font-mono text-[12px] text-accent mb-1">Server</div>
          <div className="text-[11px] text-ink-faint">ephemeral key pair</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-ink-faint mb-3 font-mono text-[10.5px]">
        <span>public key</span>
        <ArrowRight size={12} className="shrink-0" />
        <span className="mx-1.5 text-line">·</span>
        <ArrowLeft size={12} className="shrink-0" />
        <span>public key</span>
      </div>
      <div className="flex justify-center mb-2">
        <ArrowDown size={14} className="text-ink-faint" />
      </div>
      <div className="flex justify-center mb-2">
        <div className="rounded-md border border-accent/50 bg-accent/10 px-4 py-2 text-center max-w-[260px]">
          <div className="font-mono text-[12px] text-accent">Shared secret</div>
          <div className="text-[10.5px] text-ink-faint mt-0.5">same value, computed independently on each side</div>
        </div>
      </div>
      <div className="flex justify-center mb-2">
        <ArrowDown size={14} className="text-ink-faint" />
      </div>
      <div className="flex justify-center mb-3">
        <div className="rounded-md border border-line-soft bg-panel px-4 py-2 text-center">
          <span className="font-mono text-[12px] text-ink">Session keys</span>
        </div>
      </div>
      <p className="text-center text-[10.5px] text-ink-faint italic">
        Ephemeral private keys destroyed immediately after — nothing left to steal later.
      </p>
    </div>
  );
}
