import { useEffect, useRef, useState } from 'react';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';
import {
  PORT_OPTIONS,
  APP_OPTIONS,
  USER_OPTIONS,
  TRAFFIC_SCENARIOS,
  type MatchMode,
  type RuleAction,
} from '../../data/sandboxScenarios';

interface Result {
  status: 'allow' | 'block';
  headline: string;
  detail: string;
}

interface LogEntry extends Result {
  rule: string;
  time: string;
}

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

export function Sandbox() {
  const [ruleAction, setRuleAction] = useState<RuleAction>('allow');
  const [ruleMode, setRuleMode] = useState<MatchMode>('port');
  const [port, setPort] = useState('443');
  const [app, setApp] = useState('web-browsing');
  const [user, setUser] = useState('finance');
  const [traffic, setTraffic] = useState(TRAFFIC_SCENARIOS[0].value);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [log, hint]);

  const actionLabel = ruleAction === 'allow' ? 'ALLOW' : 'BLOCK';

  function ruleDescription() {
    if (ruleMode === 'port') return `${ruleAction === 'allow' ? 'Allow' : 'Block'} traffic on port ${port}`;
    if (ruleMode === 'appid') return `${ruleAction === 'allow' ? 'Allow' : 'Block'} application: ${app}`;
    return `${ruleAction === 'allow' ? 'Allow' : 'Block'} user/group: ${user}`;
  }

  function ruleHint() {
    if (ruleMode === 'port') {
      return ruleAction === 'allow'
        ? "This rule trusts the port number alone. Anything arriving on this port gets through, including traffic that isn't what the port name suggests."
        : 'This rule blocks by port number alone. The same risky traffic arriving on a different port sails straight past it, untouched.';
    }
    if (ruleMode === 'appid') {
      return ruleAction === 'allow'
        ? "This rule inspects the actual application, not just the port. Traffic has to genuinely be that app to pass, so disguising it on an allowed port won't help."
        : "This rule blocks based on what the traffic actually is, not which port it arrived on, so disguising it elsewhere won't get it through either.";
    }
    return ruleAction === 'allow'
      ? "This rule checks who's actually sending the traffic, via User-ID, not the app or the port. Only this specific person or group gets through, whatever app or port they use."
      : 'This rule blocks a specific person or group by identity, via User-ID, regardless of which app or port they try instead.';
  }

  function sendPacket() {
    const [actualUser, actualApp, actualPort] = traffic.split(':');
    let matched: boolean;
    let detail: string;

    if (ruleMode === 'port') {
      matched = actualPort === port;
      detail = matched
        ? `Matched: this traffic arrived on port ${port}.`
        : `No match: this traffic used port ${actualPort}, not the rule's port ${port}.`;
    } else if (ruleMode === 'appid') {
      matched = actualApp === app;
      detail = matched
        ? `Matched: App-ID confirmed this traffic genuinely is ${app}.`
        : `No match: App-ID identified this traffic as "${actualApp}", not "${app}", regardless of which port it used.`;
    } else {
      matched = actualUser === user;
      detail = matched
        ? `Matched: User-ID confirmed this traffic belongs to ${user}.`
        : `No match: User-ID identified this traffic as belonging to "${actualUser}", not "${user}", regardless of app or port.`;
    }

    let status: 'allow' | 'block';
    let headline: string;
    if (matched) {
      status = ruleAction;
      headline = status === 'allow' ? 'ALLOWED' : 'BLOCKED';
    } else if (ruleAction === 'allow') {
      status = 'block';
      headline = 'BLOCKED';
      detail += ' No rule matched, so the implicit deny-all at the end of the policy applies.';
    } else {
      status = 'allow';
      headline = 'ALLOWED';
      detail += " This rule only blocks a match. Traffic that doesn't match passes through untouched, same as it would with this rule absent entirely.";
    }
    setHint(null);
    setLog((prev) => [...prev, { status, headline, detail, rule: ruleDescription(), time: timestamp() }]);
  }

  function tryImplicitDenyExample() {
    setRuleAction('allow');
    setRuleMode('port');
    setPort('80'); // No traffic scenario uses port 80, guaranteed non-match.
    setTraffic('finance:web-browsing:443');
    setHint('Loaded: Allow rule for port 80, traffic actually on port 443. Click "Send packet" to see it blocked despite the rule saying Allow.');
  }

  return (
    <ChapterPage title="Sandbox">
      <SectionHead eyebrow="Practice" title="Build a rule. Break it. Fix it.">
        This is the core idea firewalls are built on, and the same one Chapter 8's Zero Trust reframing
        leans on hardest: a rule written for a port number can be fooled, a rule written for an actual
        application identity can't, and a rule written for a specific person can enforce things neither
        of the others can. Build a rule, choose whether it allows or blocks, then send test traffic
        through it.
      </SectionHead>

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-8">
        <Card>
          <h3 className="font-mono text-sm text-ink-dim uppercase tracking-wide mb-4 font-medium">
            Firewall rule
          </h3>
          <div className="text-[13px] text-ink-faint mb-4 leading-relaxed">
            This simulates one rule inside a larger policy. An Allow rule assumes everything else is denied
            by default. A Block rule assumes it's a carve-out from traffic that's otherwise already
            permitted elsewhere.
          </div>

          <div className="mb-3.5">
            <label className="block font-mono text-xs text-ink-faint mb-1.5">Action</label>
            <Toggle
              options={[
                { value: 'allow' as RuleAction, label: 'Allow' },
                { value: 'block' as RuleAction, label: 'Block' },
              ]}
              value={ruleAction}
              onChange={setRuleAction}
            />
          </div>

          <div className="mb-3.5">
            <label className="block font-mono text-xs text-ink-faint mb-1.5">Match on</label>
            <Toggle
              options={[
                { value: 'port' as MatchMode, label: 'Port' },
                { value: 'appid' as MatchMode, label: 'App-ID' },
                { value: 'userid' as MatchMode, label: 'User-ID' },
              ]}
              value={ruleMode}
              onChange={setRuleMode}
            />
          </div>

          <p className="text-[11.5px] text-ink-faint mb-3.5 -mt-1">
            <AutoLink text="App-ID and User-ID are one firewall vendor's branded names for capabilities most firewalls implement in some form — Chapter 3 has the full disclosure note." />
          </p>

          {ruleMode === 'port' && (
            <div className="mb-3.5">
              <label className="block font-mono text-xs text-ink-faint mb-1.5">Port</label>
              <select
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-bg-deep text-ink border border-line rounded-md px-2.5 py-2 text-sm"
              >
                {PORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          {ruleMode === 'appid' && (
            <div className="mb-3.5">
              <label className="block font-mono text-xs text-ink-faint mb-1.5">Application</label>
              <select
                value={app}
                onChange={(e) => setApp(e.target.value)}
                className="w-full bg-bg-deep text-ink border border-line rounded-md px-2.5 py-2 text-sm"
              >
                {APP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          {ruleMode === 'userid' && (
            <div className="mb-3.5">
              <label className="block font-mono text-xs text-ink-faint mb-1.5">User / group (from User-ID)</label>
              <select
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-bg-deep text-ink border border-line rounded-md px-2.5 py-2 text-sm"
              >
                {USER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          <ul className="font-mono text-[12.5px] mb-4">
            <li className="flex justify-between py-2">
              <span className="text-ink-dim">{ruleDescription()}</span>
              <span className={ruleAction === 'allow' ? 'text-success' : 'text-danger'}>{actionLabel}</span>
            </li>
          </ul>
          <div className="text-[13px] text-ink-faint leading-relaxed">
            <AutoLink text={ruleHint()} />
          </div>
        </Card>

        <Card>
          <h3 className="font-mono text-sm text-ink-dim uppercase tracking-wide mb-4 font-medium">
            Send test traffic
          </h3>
          <div className="mb-3.5">
            <label className="block font-mono text-xs text-ink-faint mb-1.5">What's actually happening</label>
            <select
              value={traffic}
              onChange={(e) => setTraffic(e.target.value)}
              className="w-full bg-bg-deep text-ink border border-line rounded-md px-2.5 py-2 text-sm"
            >
              {TRAFFIC_SCENARIOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" className="w-full justify-center mb-3.5" onClick={sendPacket}>
            Send packet →
          </Button>
          <div
            ref={consoleRef}
            className="rounded-md border border-line-soft bg-bg-deep p-3.5 mb-3.5 font-mono text-[12.5px] leading-relaxed max-h-[260px] overflow-y-auto"
          >
            {log.length === 0 && !hint && (
              <div className="text-ink-faint">
                <span className="text-accent">$</span> awaiting input
                <span className="cursor-blink" aria-hidden="true">_</span>
              </div>
            )}
            {log.map((entry, i) => (
              <div key={i} className={i > 0 ? 'mt-3' : ''}>
                <div className="text-ink-faint">
                  <span className="text-accent">$</span> [{entry.time}] send-packet <span className="text-ink-dim">rule="{entry.rule}"</span>
                </div>
                <div className={entry.status === 'allow' ? 'text-success' : 'text-danger'}>
                  → {entry.headline}
                </div>
                <div className="text-ink-faint">
                  <AutoLink text={entry.detail} />
                </div>
              </div>
            ))}
            {hint && (
              <div className={log.length > 0 ? 'mt-3' : ''}>
                <span className="text-ink-faint"># {hint}</span>
              </div>
            )}
            {(log.length > 0 || hint) && (
              <div className="text-accent mt-1">
                $<span className="cursor-blink" aria-hidden="true">_</span>
              </div>
            )}
          </div>
          <div className="text-[13px] text-ink-faint mb-3.5 leading-relaxed">
            Nothing matches your rule? Real firewalls default to deny, so an unmatched packet gets blocked
            here too, not silently allowed.
          </div>
          <div className="text-[12px] text-ink-faint mb-3.5 leading-relaxed italic">
            Real firewalls usually need to see a few packets of a session before App-ID can confirm what's
            actually running. This sandbox shows the eventual verdict instantly, for clarity — and Chapter 3's
            single-pass card explains part of why that verdict doesn't cost more as more checks get added.
          </div>
          <Button className="w-full justify-center" onClick={tryImplicitDenyExample}>
            Try it: load a rule nothing matches →
          </Button>
        </Card>
      </div>
    </ChapterPage>
  );
}
