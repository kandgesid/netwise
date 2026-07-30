import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';

/**
 * Chain of Trust Diagram — a static, non-interactive structural picture of the three-tier
 * root/intermediate/leaf hierarchy, sitting right after the prose Card that explains it
 * (CERT_CHAIN_SECTIONS). Deliberately has no state: unlike every other interactive on this page,
 * there's no variable axis to toggle or select, the structure doesn't change, so this
 * intentionally does NOT adopt CipherDecoder's chip-click or VerificationWalkthrough's
 * reactive-on-select pattern. All three tiers are always visible at once, arrows pointing in the
 * issuance direction (root signs intermediate, intermediate signs leaf) — the opposite direction
 * from VerificationWalkthrough's leaf-to-root check order further down this page.
 * See docs/integration/phase-4-chain-of-trust-basics/simulation-design.md §2.
 */

interface ChainTier {
  id: 'root' | 'intermediate' | 'leaf';
  label: string;
  roleTag: string;
}

const CHAIN_TIERS: ChainTier[] = [
  { id: 'root', label: 'Root CA', roleTag: 'Self-signed. Pre-installed as a trust anchor.' },
  { id: 'intermediate', label: 'Intermediate CA', roleTag: 'Signed by the root. Does the routine signing.' },
  { id: 'leaf', label: 'Leaf certificate', roleTag: 'Signed by the intermediate. What the client actually sees.' },
];

export function ChainOfTrustDiagram() {
  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2.5">The shape of a chain of trust</h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        The same three tiers from above, laid out in the order each one signs the next.
      </p>
      <div className="flex items-stretch gap-2 overflow-x-auto">
        {CHAIN_TIERS.map((tier, idx) => (
          <div key={tier.id} className="flex items-center gap-2 shrink-0">
            <div className="rounded-md border border-line-soft bg-bg-deep px-4 py-3 w-[170px]">
              <div className="font-mono text-[13px] text-accent mb-1">{tier.label}</div>
              <div className="text-[12px] text-ink-dim leading-snug">{tier.roleTag}</div>
            </div>
            {idx < CHAIN_TIERS.length - 1 && (
              <div className="flex flex-col items-center text-ink-faint shrink-0 px-0.5">
                <ArrowRight size={16} />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">signs</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
