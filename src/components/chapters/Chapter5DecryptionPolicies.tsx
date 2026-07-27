import { useState } from 'react';
import clsx from 'clsx';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';

const ACTIONS = [
  { tag: 'Action 1', title: 'Decrypt', text: "The firewall actively intercepts and inspects this traffic, using forward proxy or inbound inspection depending on the direction it's flowing." },
  { tag: 'Action 2', title: 'No decrypt', text: 'The firewall recognizes the traffic but deliberately leaves it encrypted. Common for categories like banking or healthcare, where decrypting could violate policy or regulation.' },
  { tag: 'Action 3', title: 'Bypass', text: "Decryption processing is skipped entirely for this traffic, usually for performance, or because an app is known to break under interception, like ones that pin certificates. In most real products this shows up as an exclusion list or decryption-profile setting rather than a literal third choice sitting next to Decrypt and No decrypt, but the outcome plays out the same three ways." },
];

const FLOW = [
  'Traffic is checked against decryption policy rules, top to bottom. First match wins, the same way ordinary security policy rules work, from Chapter 1.',
  'Whichever rule matches first assigns one action: Decrypt, No decrypt, or Bypass.',
  'If the action is Decrypt, the traffic proceeds into whichever mode from Chapter 3 fits the direction: forward proxy for outbound, inbound inspection for a server you own.',
];

interface PolicyRule {
  id: string;
  label: string;
  action: 'Decrypt' | 'No decrypt' | 'Bypass';
  matches: (category: string) => boolean;
}

const POLICY_RULES: PolicyRule[] = [
  { id: 'r1', label: 'If category is banking or healthcare → No decrypt', action: 'No decrypt', matches: (c) => c === 'banking-or-healthcare' },
  { id: 'r2', label: 'If the app is known to pin certificates → Bypass', action: 'Bypass', matches: (c) => c === 'cert-pinned-app' },
  { id: 'r3', label: 'Everything else → Decrypt', action: 'Decrypt', matches: () => true },
];

interface EvalScenario {
  value: string;
  label: string;
  category: string;
}

const EVAL_SCENARIOS: EvalScenario[] = [
  { value: 'finance-banking', label: 'finance-team, browsing to an online banking site', category: 'banking-or-healthcare' },
  { value: 'guest-news', label: 'guest-wifi, browsing a news site', category: 'everything-else' },
  { value: 'eng-pinned-app', label: 'engineering-team, traffic from a certificate-pinned mobile app', category: 'cert-pinned-app' },
  { value: 'contractor-generic', label: 'contractor, generic web browsing', category: 'everything-else' },
];

function PolicyEvaluator() {
  const [scenarioValue, setScenarioValue] = useState(EVAL_SCENARIOS[0].value);
  const scenario = EVAL_SCENARIOS.find((s) => s.value === scenarioValue)!;
  const matchedIndex = POLICY_RULES.findIndex((r) => r.matches(scenario.category));
  const matchedRule = POLICY_RULES[matchedIndex];

  return (
    <Card className="mb-7">
      <h3 className="font-sans font-semibold text-base mb-2.5">Try it: which rule fires first?</h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        Three decryption policy rules, in the order the firewall actually checks them. Pick a traffic
        scenario and see which rule matches, rules below it never get a chance to fire once one above it
        already has.
      </p>
      <div className="mb-4">
        <label className="block font-mono text-xs text-ink-faint mb-1.5">Traffic scenario</label>
        <select
          value={scenarioValue}
          onChange={(e) => setScenarioValue(e.target.value)}
          className="w-full bg-bg-deep text-ink border border-line rounded-md px-2.5 py-2 text-sm"
        >
          {EVAL_SCENARIOS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <ol className="space-y-2 mb-4 pl-4 list-decimal marker:text-line">
        {POLICY_RULES.map((r, idx) => (
          <li
            key={r.id}
            className={clsx(
              'text-[13.5px] rounded-md px-3 py-2',
              idx === matchedIndex ? 'bg-accent/10 border border-accent text-ink' : 'text-ink-dim'
            )}
          >
            {r.label}
          </li>
        ))}
      </ol>
      <div className="font-mono text-[12.5px] flex justify-between items-center border-t border-line-soft pt-3">
        <span className="text-ink-dim">Rule {matchedIndex + 1} matched first, so it wins</span>
        <span className={matchedRule.action === 'Decrypt' ? 'text-accent' : 'text-ink-dim'}>
          {matchedRule.action.toUpperCase()}
        </span>
      </div>
    </Card>
  );
}

export function Chapter5DecryptionPolicies() {
  return (
    <section id="ch5" className="max-w-[1080px] mx-auto px-8 py-18">
      <SectionHead eyebrow="Chapter 5" title="Decryption policies">
        None of the decrypting and inspecting from Chapter 3, using whichever key exchange and cipher suite
        Chapter 4 just covered, happens unless an admin has explicitly told the firewall to do it. That
        instruction lives in a decryption policy, a rule that matches specific traffic and tells the
        firewall exactly what to do with it.
      </SectionHead>

      <div className="grid md:grid-cols-3 gap-4 mb-7">
        {ACTIONS.map((a) => (
          <div key={a.title} className="bg-panel border border-line-soft rounded-md p-5">
            <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-2">{a.tag}</div>
            <h4 className="font-sans font-semibold text-base mb-1.5">{a.title}</h4>
            <p className="text-ink-dim text-[13.5px]">{a.text}</p>
          </div>
        ))}
      </div>

      <Card className="mb-7">
        <h3 className="font-sans font-semibold text-base mb-2.5">The general flow</h3>
        <ol className="pl-4 text-ink-dim text-[14.5px] space-y-2.5 list-decimal marker:text-line">
          {FLOW.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
      </Card>

      <PolicyEvaluator />
    </section>
  );
}
