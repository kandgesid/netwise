import { useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { AutoLink } from '../../lib/autoLink';

/**
 * Verification Walkthrough — adapts PolicyEvaluator's ordered-check, reactive-on-select pattern
 * (see PolicyEvaluator in src/components/chapters/Chapter5DecryptionPolicies.tsx), not Sandbox's
 * terminal-log pattern (CLAUDE.md reserves that treatment for Sandbox specifically). Picking a
 * scenario re-renders the five-step chain instantly: no button, no accumulating log.
 * See docs/integration/phase-1-certificates/simulation-design.md §2.
 */

interface VerificationStep {
  id: string;
  label: string;
  passMessage: string;
}

const VERIFICATION_STEPS: VerificationStep[] = [
  { id: 'leaf-sig', label: 'Leaf signature valid?', passMessage: "Verified — the leaf certificate's signature checks out against the intermediate CA's public key." },
  { id: 'intermediate-sig', label: 'Intermediate signature valid?', passMessage: "Verified — the intermediate CA's own certificate is properly signed by the root CA's public key." },
  { id: 'root-trusted', label: 'Root in trust store?', passMessage: "Verified — that root CA is present in this client's trusted root store." },
  { id: 'validity-window', label: 'Inside the validity window?', passMessage: "Verified — today's date falls between Not Before and Not After." },
  { id: 'revocation', label: 'Has it been revoked?', passMessage: 'Verified — not found on the CRL, not flagged as revoked.' },
];

interface VerificationScenario {
  value: string;
  label: string;
  failStepIndex: number | null;
  failMessage?: string;
  verdictSummary: string;
}

const VERIFICATION_SCENARIOS: VerificationScenario[] = [
  {
    value: 'valid',
    label: 'Valid certificate (the happy path)',
    failStepIndex: null,
    verdictSummary: 'All 5 checks passed — the browser proceeds with the connection.',
  },
  {
    value: 'tampered',
    label: 'Tampered certificate',
    failStepIndex: 0,
    failMessage: "Failed — this certificate's signature doesn't verify against the intermediate CA's public key. The signed content and the signature don't match. Whether that's corruption or forgery, the result is the same: the chain never even gets to check who issued it.",
    verdictSummary: 'Blocked at step 1: invalid signature.',
  },
  {
    value: 'untrusted-root',
    label: 'Untrusted root CA',
    failStepIndex: 2,
    failMessage: "Failed — this chain leads back to a root CA that isn't in this client's trusted root store. The signatures are all internally consistent, this isn't tampering. The client simply has no reason to trust that specific root.",
    verdictSummary: 'Blocked at step 3: unknown root CA.',
  },
  {
    value: 'expired',
    label: 'Expired certificate',
    failStepIndex: 3,
    failMessage: 'Failed — this certificate expired 12 days ago. Browsers hard-block here, no exceptions, no partial trust, regardless of how solid the signature chain above it is.',
    verdictSummary: 'Blocked at step 4: certificate has expired.',
  },
  {
    value: 'revoked',
    label: 'Revoked certificate',
    failStepIndex: 4,
    failMessage: "Failed — this certificate's serial number appears on the issuing CA's revocation list, revoked 3 days ago, reason given: key compromise. It's still inside its validity window, the CA killed it early anyway.",
    verdictSummary: 'Blocked at step 5: certificate revoked.',
  },
];

type StepStatus = 'pass' | 'fail' | 'not-reached';

function stepStatus(idx: number, failStepIndex: number | null): StepStatus {
  if (failStepIndex === null || idx < failStepIndex) return 'pass';
  if (idx === failStepIndex) return 'fail';
  return 'not-reached';
}

export function VerificationWalkthrough() {
  const [scenarioValue, setScenarioValue] = useState(VERIFICATION_SCENARIOS[0].value);
  const scenario = VERIFICATION_SCENARIOS.find((s) => s.value === scenarioValue)!;
  const trusted = scenario.failStepIndex === null;

  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2.5">Try it: does this certificate check out?</h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        Five checks, in the order a client actually runs them. Pick a certificate scenario and see how far
        it gets, steps after the first failure never get a chance to run, the same way a lower security
        policy rule never fires once one above it already has.
      </p>
      <div className="mb-4">
        <label className="block font-mono text-xs text-ink-faint mb-1.5">Certificate scenario</label>
        <select
          value={scenarioValue}
          onChange={(e) => setScenarioValue(e.target.value)}
          className="w-full bg-bg-deep text-ink border border-line rounded-md px-2.5 py-2 text-sm"
        >
          {VERIFICATION_SCENARIOS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <ol className="space-y-2 mb-4">
        {VERIFICATION_STEPS.map((step, idx) => {
          const status = stepStatus(idx, scenario.failStepIndex);
          const message =
            status === 'fail'
              ? scenario.failMessage!
              : status === 'pass'
              ? step.passMessage
              : 'Not evaluated — an earlier check already failed, so the chain never reaches this one.';
          return (
            <li
              key={step.id}
              className={clsx(
                'rounded-md px-3 py-2.5 border',
                status === 'pass' && 'border-accent bg-accent/10 text-ink',
                status === 'fail' && 'border-danger bg-danger/10 text-ink',
                status === 'not-reached' && 'border-transparent text-ink-dim'
              )}
            >
              <div className="flex items-start gap-2">
                {status === 'pass' && <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />}
                {status === 'fail' && <XCircle size={16} className="text-danger mt-0.5 shrink-0" />}
                {status === 'not-reached' && <MinusCircle size={16} className="text-ink-faint mt-0.5 shrink-0" />}
                <div>
                  <div className="text-[13.5px] font-semibold mb-0.5">{step.label}</div>
                  <div className="text-[13px] text-ink-dim">
                    <AutoLink text={message} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="font-mono text-[12.5px] flex justify-between items-center border-t border-line-soft pt-3">
        <span className="text-ink-dim">{scenario.verdictSummary}</span>
        <span className={trusted ? 'text-success' : 'text-danger'}>
          {trusted ? 'TRUSTED' : 'NOT TRUSTED'}
        </span>
      </div>
    </Card>
  );
}
