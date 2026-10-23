import { ArrowRight, ArrowLeft } from 'lucide-react';
import { AutoLink } from '../../lib/autoLink';

/**
 * Four static diagrams for Chapter7KeyProtection.tsx, each replacing a plain bullet
 * list with the actual structural picture from the source doc (§8–9): blast-radius
 * comparison, Without/With-HSM, master-key wrapping, and the hardware/software/cloud
 * comparison table. All non-interactive — these are fixed facts, not a variable a
 * reader chooses, same "diagram not interactive" call as ChainOfTrustDiagram.
 */

export function KeyBlastRadiusDiagram() {
  return (
    <div className="grid md:grid-cols-2 gap-3.5">
      <div className="rounded-md border border-line-soft bg-bg-deep p-4">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-faint mb-2">
          Session key (ephemeral)
        </div>
        <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-center mb-2.5">
          <span className="font-mono text-[10.5px] text-accent uppercase tracking-wide">Small blast radius</span>
        </div>
        <p className="text-[12.5px] text-ink-dim">
          Dies with the handshake it was generated for. Stealing it, if that were even possible after the
          fact, exposes one session and nothing else.
        </p>
      </div>
      <div className="rounded-md border border-line-soft bg-bg-deep p-4">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-faint mb-2">
          Signing key (CA / server private key)
        </div>
        <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-1.5 text-center mb-2.5">
          <span className="font-mono text-[10.5px] text-danger uppercase tracking-wide">Large blast radius</span>
        </div>
        <p className="text-[12.5px] text-ink-dim">
          Long-lived, reused across every session. Stealing it enables impersonating any session, to
          anyone who trusts it, going forward.
        </p>
      </div>
    </div>
  );
}

export function HsmDiagram() {
  return (
    <div className="grid md:grid-cols-2 gap-3.5">
      <div className="rounded-md border border-line-soft bg-bg-deep p-4 flex flex-col">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-faint mb-3 text-center">
          Without HSM
        </div>
        <div className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 mx-auto w-full max-w-[190px]">
          <div className="font-mono text-[12px] text-ink mb-1.5 text-center">Firewall</div>
          <div className="rounded-sm border border-danger/50 bg-bg-deep px-2 py-1.5 text-[10.5px] text-danger text-center">
            Private key in memory/config
          </div>
        </div>
        <p className="text-center text-[11px] text-ink-faint mt-2.5">
          The key is directly usable by, and never leaves, the device holding it.
        </p>
      </div>
      <div className="rounded-md border border-line-soft bg-bg-deep p-4 flex flex-col">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-faint mb-3 text-center">
          With HSM
        </div>
        <div className="flex items-center justify-center gap-2 flex-1">
          <div className="rounded-md border border-line-soft bg-panel px-2.5 py-2.5 text-center w-[96px] shrink-0">
            <div className="font-mono text-[11px] text-ink">Firewall</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-ink-faint shrink-0">
            <div className="flex items-center gap-0.5 font-mono text-[9px] whitespace-nowrap">
              <ArrowRight size={10} /> sign/decrypt
            </div>
            <div className="flex items-center gap-0.5 font-mono text-[9px] whitespace-nowrap">
              <ArrowLeft size={10} /> result
            </div>
          </div>
          <div className="rounded-md border border-accent/50 bg-accent/10 px-2.5 py-2.5 text-center w-[96px] shrink-0">
            <div className="font-mono text-[11px] text-accent">HSM</div>
            <div className="text-[9.5px] text-ink-faint mt-0.5 leading-tight">key locked inside</div>
          </div>
        </div>
        <p className="text-center text-[11px] text-ink-faint mt-2.5">
          Key material never crosses the boundary — only the result does.
        </p>
      </div>
    </div>
  );
}

export function MasterKeyDiagram() {
  return (
    <div className="rounded-md border border-line-soft bg-bg-deep p-4 max-w-[380px] mx-auto">
      <div className="rounded-md border border-line-soft bg-panel px-4 py-3">
        <div className="font-mono text-[10.5px] uppercase tracking-wide text-ink-faint mb-2 text-center">
          Firewall config
        </div>
        <ul className="text-[11.5px] text-ink-dim space-y-1">
          <li className="flex justify-between gap-2">
            <span>Forward Trust CA key</span>
            <span className="text-ink-faint font-mono text-[10px] shrink-0">[encrypted]</span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Server private key 1</span>
            <span className="text-ink-faint font-mono text-[10px] shrink-0">[encrypted]</span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Server private key 2</span>
            <span className="text-ink-faint font-mono text-[10px] shrink-0">[encrypted]</span>
          </li>
        </ul>
      </div>
      <div className="flex justify-center my-1.5">
        <ArrowRight size={14} className="text-ink-faint rotate-90" />
      </div>
      <div className="rounded-md border border-accent/50 bg-accent/10 px-4 py-2.5 text-center">
        <div className="font-mono text-[12px] text-accent">Master key</div>
        <div className="text-[10.5px] text-ink-faint mt-0.5">Local, or HSM-protected (most secure)</div>
      </div>
    </div>
  );
}

const KEY_PROTECTION_COMPARISON: { aspect: string; hardware: string; software: string; cloud: string }[] = [
  {
    aspect: 'Key storage',
    hardware: 'On-device, optionally backed by an external HSM',
    software: 'Virtual disk, optionally backed by a network HSM',
    cloud: 'Cloud HSM or KMS',
  },
  {
    aspect: 'Biggest distinct risk',
    hardware: 'Physical theft of the appliance',
    software: 'Hypervisor admin can snapshot or clone the VM, keys included',
    cloud: "Shared responsibility — the provider's own access is a different trust boundary",
  },
  {
    aspect: 'Mitigated by',
    hardware: 'Tamper-resistant hardware, restricted physical/console access',
    software: 'External HSM (keys never touch the VM), disabled snapshots, restricted hypervisor access',
    cloud: 'Customer-managed keys, dedicated single-tenant HSM, audit + contractual controls',
  },
];

export function FormFactorTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            <th className="py-2 pr-3 border-b border-line-soft"> </th>
            <th className="py-2 pr-3 border-b border-line-soft">Hardware</th>
            <th className="py-2 pr-3 border-b border-line-soft">Software (VM)</th>
            <th className="py-2 border-b border-line-soft">Cloud</th>
          </tr>
        </thead>
        <tbody>
          {KEY_PROTECTION_COMPARISON.map((row) => (
            <tr key={row.aspect} className="align-top">
              <td className="py-3 pr-3 border-b border-line-soft font-semibold text-ink whitespace-nowrap">
                {row.aspect}
              </td>
              <td className="py-3 pr-3 border-b border-line-soft text-ink-dim text-[12.5px]">
                <AutoLink text={row.hardware} />
              </td>
              <td className="py-3 pr-3 border-b border-line-soft text-ink-dim text-[12.5px]">
                <AutoLink text={row.software} />
              </td>
              <td className="py-3 border-b border-line-soft text-ink-dim text-[12.5px]">
                <AutoLink text={row.cloud} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
