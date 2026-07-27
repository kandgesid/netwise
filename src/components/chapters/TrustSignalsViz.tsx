import { useState } from 'react';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';

/**
 * Trust Signals Viz — claim B ("WHAT gets checked, and how it combines") from
 * docs/integration/phase-3-zero-trust/simulation-design.md §4. Sits in
 * PolicyEvaluator's weight class (reactive-on-select, one verdict bar), but
 * three independent toggles drive it instead of one scenario dropdown, so a
 * learner can freely isolate any single failing signal rather than being
 * limited to whatever combinations a curated scenario list happened to offer.
 *
 * Standard, non-inverted color convention: ALLOW is success-green, DENY is
 * danger-red — unlike ContinuousVerificationViz, no inversion is needed here.
 */

type SignalState = 'ok' | 'bad';

interface Signal {
  id: 'identity' | 'device' | 'context';
  label: string;
  okLabel: string;
  badLabel: string;
  okDetail: string;
  badDetail: string;
}

const SIGNALS: Signal[] = [
  {
    id: 'identity',
    label: 'Identity',
    okLabel: 'Verified',
    badLabel: 'Suspicious',
    okDetail: 'Signed in with valid credentials, nothing unusual about this sign-in.',
    badDetail: "This sign-in used a password that's already appeared in a known breach.",
  },
  {
    id: 'device',
    label: 'Device',
    okLabel: 'Compliant',
    badLabel: 'Non-compliant',
    okDetail: 'MDM confirms this device meets policy: patched, encrypted, managed.',
    badDetail: 'MDM flags this device as non-compliant: malware detected.',
  },
  {
    id: 'context',
    label: 'Context',
    okLabel: 'Expected',
    badLabel: 'Anomalous',
    okDetail: 'Same country, same general hours this employee always signs in from.',
    badDetail: "Signing in from a country they've never used before, minutes after a login somewhere else entirely.",
  },
];

const INTRO =
  "Every rule the Sandbox and Chapter 5's policy evaluator taught you to build checks one thing at a time: a port, an app, a person. Zero Trust checks several independent things about the same finance-team employee's request at once: who's asking (identity), what they're asking from (device), and where and when they're asking (context). Toggle each one below and watch what it takes to get an ALLOW.";

const CALLOUT =
  "Under the zone model from Chapter 1, being on the trusted network would have been enough on its own, none of these three signals would even be checked.";

const CLOSING =
  "What's shown here is the decision itself: how several signals combine into one answer. What that answer actually grants access to, one specific resource, or a much wider slice of the network, is a related question this component isn't answering.";

function verdictSummary(failing: Signal[]): string {
  if (failing.length === 0) return 'All three signals check out.';
  const names = failing.map((s) => s.label);
  if (names.length === 1) return `${names[0]} failed.`;
  if (names.length === 2) return `${names[0]} and ${names[1]} failed.`;
  return `${names[0]}, ${names[1]}, and ${names[2]} failed.`;
}

export function TrustSignalsViz() {
  const [states, setStates] = useState<Record<Signal['id'], SignalState>>({
    identity: 'ok',
    device: 'ok',
    context: 'ok',
  });

  const failing = SIGNALS.filter((s) => states[s.id] === 'bad');
  const allOk = failing.length === 0;
  const exactlyOneFailing = failing.length === 1;

  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2.5">
        Try it: what does it take to get an ALLOW?
      </h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        <AutoLink text={INTRO} />
      </p>

      <div className="space-y-3.5 mb-4">
        {SIGNALS.map((signal) => {
          const state = states[signal.id];
          const detail = state === 'ok' ? signal.okDetail : signal.badDetail;
          return (
            <div key={signal.id}>
              <label className="block font-mono text-xs text-ink-faint mb-1.5">{signal.label}</label>
              <Toggle
                options={[
                  { value: 'ok' as SignalState, label: signal.okLabel },
                  { value: 'bad' as SignalState, label: signal.badLabel },
                ]}
                value={state}
                onChange={(v) => setStates((prev) => ({ ...prev, [signal.id]: v }))}
              />
              <p className="text-ink-dim text-[13px] mt-1.5">
                <AutoLink text={detail} />
              </p>
            </div>
          );
        })}
      </div>

      <div className="font-mono text-[12.5px] flex justify-between items-center border-t border-line-soft pt-3">
        <span className="text-ink-dim">{verdictSummary(failing)}</span>
        <span className={allOk ? 'text-success' : 'text-danger'}>{allOk ? 'ALLOW' : 'DENY'}</span>
      </div>

      {exactlyOneFailing && (
        <p className="text-ink-dim text-[13px] mt-3">
          Two out of three checked out. Zero Trust doesn't average them, or let a strong identity make up
          for a risky device: one failing signal is enough.
        </p>
      )}

      <p className="text-ink-faint text-[12.5px] mt-3">
        <AutoLink text={CALLOUT} />
      </p>

      <p className="text-ink-dim text-[14.5px] mt-4">
        <AutoLink text={CLOSING} />
      </p>
    </Card>
  );
}
