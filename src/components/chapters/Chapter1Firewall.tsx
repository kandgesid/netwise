import { Link } from 'react-router-dom';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { FirewallCheckpointViz } from './FirewallCheckpointViz';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';

const TYPES = [
  { tag: 'Outbound', title: 'Forward proxy', text: 'Inspects traffic from your users going out to the internet.' },
  { tag: 'Inbound', title: 'Inbound inspection', text: 'Protects a server you own from traffic coming in from outside.' },
  { tag: 'Site-to-site / remote', title: 'VPN', text: 'Authenticates and encrypts a tunnel between two trusted endpoints.' },
];

export function Chapter1Firewall() {
  return (
    <ChapterPage title="Chapter 1: Firewall">
      <SectionHead eyebrow="Chapter 1" title="Firewall: the secure middleman">
        A firewall sits between two networks (your device and the internet, or your company network and
        the outside world) and looks at everything that tries to pass through. Think of it less as a wall
        and more as a checkpoint: every packet gets inspected, then it's allowed through or turned away,
        based on rules someone configured.
      </SectionHead>

      <div className="mb-8">
        <FirewallCheckpointViz />
      </div>

      <div className="mb-6">
        <h3 className="font-sans font-semibold text-lg mb-2">Three jobs, one firewall</h3>
        <p className="text-ink-dim text-sm mb-3">
          Those rules aren't checked all at once, they're an ordered list. The firewall works through them
          top to bottom and stops at the first one that matches; whatever action that rule specifies is
          what happens. If nothing matches, an implicit deny at the end of the list blocks the traffic.
          That ordering comes back explicitly in Chapter 5.
        </p>
        <p className="text-ink-dim text-sm">
          The same firewall plays a different role depending on which direction traffic is going, and who
          owns the destination. The chapters ahead go deep on the first two below, forward proxy and
          inbound inspection; VPN gets its own detailed treatment in the{' '}
          <Link to="/certificates" className={TOOL_LINK_CLASS}>
            Certificates tool
          </Link>{' '}
          rather than a narrative chapter of its own.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {TYPES.map((t) => (
          <div
            key={t.title}
            className="bg-panel border border-line-soft rounded-md p-5"
          >
            <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-2">{t.tag}</div>
            <h4 className="font-sans font-semibold text-base mb-1.5">{t.title}</h4>
            <p className="text-ink-dim text-[13.5px]">{t.text}</p>
          </div>
        ))}
      </div>

      <p className="text-ink-faint text-[13.5px] mt-4">
        Firewalls make these decisions on cleartext traffic easily enough. Encrypted traffic is a
        different story, and that's where Chapter 2 picks up.
      </p>
    </ChapterPage>
  );
}
