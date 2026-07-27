import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';
import { AutoLink } from '../../lib/autoLink';

/**
 * Single Pass Viz — demonstrates the compounding-vs-flat contrast between a chained-engine
 * firewall (one full sequential pass per enabled feature) and single-pass parallel processing
 * (every enabled feature riding through the same one traversal). Sized and shaped like
 * SessionTrackingViz (one Card, one small piece of local state, no data file, no props),
 * reactive-on-select with no animation, no transition delay, no button. Deliberately does not
 * reuse SessionTrackingViz's success/danger row coloring — neither row here is right or wrong,
 * just cheaper or costlier, so no color-coding is applied to either row (see
 * docs/integration/phase-2d-single-pass/simulation-design.md §4).
 * See docs/integration/phase-2d-single-pass/simulation-design.md §3.
 */

// FeatureCount is modeled as a string union (rather than the numeric 1 | 2 | 3 | 4 the design doc
// sketches) because Toggle<T extends string> — the shared segmented-control primitive every other
// toggle in this codebase reuses (HandshakeStepper's MODE_OPTIONS, CipherDecoder's key-exchange
// toggle, Sandbox's match-mode toggle) — is constrained to string values. Cumulative semantics and
// the four states themselves are unchanged from the spec; only the value type differs.
type FeatureCount = '1' | '2' | '3' | '4';

// Cumulative, in the same order Chapter 3's "Three lenses" card already lists App-ID / User-ID /
// Content-ID, with decryption appended as the fourth — deliberately not alphabetical or random,
// so a learner who's already read that card recognizes the same three names in the same order,
// plus one more.
const FEATURES = ['App-ID', 'User-ID', 'Content-ID', 'Decryption'] as const;

const FEATURE_COUNT_OPTIONS: { value: FeatureCount; label: string }[] = [
  { value: '1', label: 'App-ID only' },
  { value: '2', label: '+ User-ID' },
  { value: '3', label: '+ Content-ID' },
  { value: '4', label: '+ Decryption' },
];

const INTRO =
  "App-ID, User-ID, and Content-ID were introduced back in Chapter 3 as one vendor's branded names for capabilities most firewalls implement in some form. Single-pass architecture is that same vendor's name for how it runs all of them, plus decryption, without each one adding its own delay. Older-style firewalls historically chained together a separate engine per capability, antivirus, intrusion detection, application control, and so on, and a packet had to survive each one in sequence. Turn on more of them below and watch what that costs, in one architecture and not the other.";

const ROW1_SINGLE =
  'One feature, one pass. No difference yet, the two architectures only start to diverge once more gets turned on.';

const ROW2_CAPTION = 'One pass, no matter how many of these are active.';

const CAVEAT_BEFORE =
  "One thing this isn't saying: that turning features on is free. Each one still does real work inside that single traversal, more signatures to check, more computation. What single-pass avoids specifically is paying for each feature as its own separate trip through the packet's path. It's also part of why the";

const CAVEAT_AFTER =
  "can show App-ID's verdict instantly, for clarity, without that being a bigger simplification than it already is.";

const CLOSING =
  "One related fact this toggle doesn't show: single-pass firewalls also typically handle many different sessions at once, spread across dedicated processing cores. That's a separate lever, how many packets get worked on in parallel, not how many stages any one packet's own trip involves, which is what's actually being compared above.";

export function SinglePassViz() {
  const [count, setCount] = useState<FeatureCount>('1');
  const n = Number(count);
  const active = FEATURES.slice(0, n);
  const bundled = active.join(' + ');

  return (
    <Card className="mb-6">
      <h3 className="font-sans font-semibold text-base mb-2.5">
        Try it: what does turning on more features cost?
      </h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        <AutoLink text={INTRO} />
      </p>

      <div className="mb-4">
        <label className="block font-mono text-xs text-ink-faint mb-1.5">Features enabled</label>
        <Toggle options={FEATURE_COUNT_OPTIONS} value={count} onChange={setCount} />
      </div>

      <div className="rounded-md p-4 border border-line-soft bg-bg-deep mb-3">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint mb-2.5">
          Legacy: chained engines
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {active.map((feature, idx) => (
            <span key={feature} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-ink-faint">→</span>}
              <span className="bg-bg-deep border border-line rounded-sm px-2.5 py-1 text-[12.5px] text-ink-dim font-mono">
                {feature}
              </span>
            </span>
          ))}
        </div>
        <p className="text-[13px]">
          {n === 1 ? (
            <span className="text-ink-dim">
              <AutoLink text={ROW1_SINGLE} />
            </span>
          ) : (
            <span className="text-ink-dim">
              <strong className="text-ink">{n}</strong>{' '}
              <AutoLink text="sequential passes. Every feature added here is one more stop this same packet has to survive before it reaches a decision." />
            </span>
          )}
        </p>
      </div>

      <div className="rounded-md p-4 border border-line-soft bg-bg-deep mb-4">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint mb-2.5">
          Single-pass: one traversal
        </div>
        <div className="mb-3">
          <span className="inline-block border border-accent bg-accent/10 text-ink font-mono text-[12.5px] px-2.5 py-1.5 rounded-sm">
            {bundled}
          </span>
        </div>
        <p className="text-[13px] text-ink-dim">{ROW2_CAPTION}</p>
      </div>

      <p className="text-ink-faint text-[12.5px] mb-4">
        <AutoLink text={CAVEAT_BEFORE} />{' '}
        <Link to="/sandbox" className={TOOL_LINK_CLASS}>
          Sandbox
        </Link>{' '}
        <AutoLink text={CAVEAT_AFTER} />
      </p>

      <p className="text-ink-dim text-[14.5px]">
        <AutoLink text={CLOSING} />
      </p>
    </Card>
  );
}
