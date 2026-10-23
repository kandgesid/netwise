import { useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';

/**
 * Continuous Verification Viz — claim A ("WHEN a check happens") from
 * docs/integration/phase-3-zero-trust/simulation-design.md §3. Same shape as
 * SessionTrackingViz (Chapter 6): one Toggle, two always-visible rows reacting
 * to the same click, so the divergence is visible in one glance.
 *
 * Deliberately inverts the site's usual green=allowed/red=blocked convention:
 * Row 1 ("still allowed") is the security gap and gets danger-red; Row 2
 * ("access revoked") is the system working correctly and gets success-green.
 * This is a confident, approved, one-time exception — see simulation-design.md
 * §5 for the full reasoning. Do not "fix" this to match the normal convention.
 */

type Posture = 'healthy' | 'compromised';

const POSTURE_OPTIONS: { value: Posture; label: string }[] = [
  { value: 'healthy', label: 'Device healthy' },
  { value: 'compromised', label: 'Malware detected' },
];

const INTRO =
  "Chapter 1 introduced the firewall as a checkpoint: a packet gets inspected once, then it's through, or it isn't. Zero Trust exists because that's not the whole story once a session has been running for hours, not seconds. Toggle this finance-team employee's device posture below and watch what each model does about a change that has nothing to do with where they're connecting from.";

const ROW1_SUBCAPTION =
  'This finance-team employee authenticated once this morning and is inside the trusted zone.';
const ROW1_HEALTHY = "Nothing here re-checks anything mid-session. There's nothing to catch yet, either.";
const ROW1_COMPROMISED =
  "MDM just flagged this device as non-compliant: malware detected. This model has no way to notice. The employee authenticated once, is still inside the trusted zone, and stays trusted for the rest of the session regardless of what happens to the device itself.";

const ROW2_SUBCAPTION =
  'Same employee, same morning login, but nothing here treats that login as good forever.';
const ROW2_HEALTHY =
  'The next request this employee makes gets checked again: still them, still a healthy device, still an expected pattern.';
const ROW2_COMPROMISED =
  "Device posture is one of the things checked on the next request, not just at login. Malware detected means access is denied immediately, without waiting for the employee to leave and re-enter the network.";

const CAVEAT =
  "One thing 'continuous' doesn't mean here: a literal nonstop stream of checks running underneath the whole session. In practice it means re-evaluating at the next request, or on a short interval, not once at login and never again, still much more often than the perimeter model's exactly-once check, just not literally infinite.";

const CLOSING =
  "This doesn't make everything Chapters 1 through 7 taught wrong, a firewall zone is still a real control. It just isn't treated as sufficient on its own anymore. That's the shift Zero Trust names: necessary, not sufficient.";

export function ContinuousVerificationViz() {
  const [posture, setPosture] = useState<Posture>('healthy');
  const compromised = posture === 'compromised';

  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2.5">
        Try it: does trust survive the rest of the session?
      </h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        <AutoLink text={INTRO} />
      </p>

      <div className="mb-4">
        <label className="block font-mono text-xs text-ink-faint mb-1.5">Device posture</label>
        <Toggle options={POSTURE_OPTIONS} value={posture} onChange={setPosture} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-md p-4 border border-line-soft bg-bg-deep">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint">
              Perimeter model — checked once, at the door
            </div>
            {compromised && (
              <span className="shrink-0 font-mono text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm border border-danger text-danger">
                Still allowed
              </span>
            )}
          </div>
          <p className="text-ink-dim text-[13px] mb-3">{ROW1_SUBCAPTION}</p>
          <div
            className={clsx(
              'rounded-md px-3 py-2.5 border text-[13px]',
              compromised ? 'border-danger bg-danger/10 text-ink' : 'border-transparent text-ink-dim'
            )}
          >
            <div className="flex items-start gap-2">
              {compromised ? (
                <XCircle size={16} className="text-danger mt-0.5 shrink-0" />
              ) : (
                <MinusCircle size={16} className="text-ink-faint mt-0.5 shrink-0" />
              )}
              <span><AutoLink text={compromised ? ROW1_COMPROMISED : ROW1_HEALTHY} /></span>
            </div>
          </div>
        </div>

        <div className="rounded-md p-4 border border-line-soft bg-bg-deep">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint">
              Zero Trust — re-verified on the next request
            </div>
            {compromised && (
              <span className="shrink-0 font-mono text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm border border-accent text-accent">
                Access revoked
              </span>
            )}
          </div>
          <p className="text-ink-dim text-[13px] mb-3">{ROW2_SUBCAPTION}</p>
          <div
            className={clsx(
              'rounded-md px-3 py-2.5 border text-[13px]',
              compromised ? 'border-accent bg-accent/10 text-ink' : 'border-transparent text-ink-dim'
            )}
          >
            <div className="flex items-start gap-2">
              {compromised ? (
                <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
              ) : (
                <MinusCircle size={16} className="text-ink-faint mt-0.5 shrink-0" />
              )}
              <span><AutoLink text={compromised ? ROW2_COMPROMISED : ROW2_HEALTHY} /></span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-ink-faint text-[12.5px] mb-4">
        <AutoLink text={CAVEAT} />
      </p>

      <p className="text-ink-dim text-[14.5px]">
        <AutoLink text={CLOSING} />
      </p>
    </Card>
  );
}
