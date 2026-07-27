import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { AutoLink } from '../../lib/autoLink';

const POINTS = [
  {
    strong: 'Encryption.',
    text: 'Scrambling data so only whoever holds the right key can read it. It\'s what makes your banking session unreadable to anyone watching the network between you and the bank.',
  },
  {
    strong: 'Decryption.',
    text: 'Reversing that scramble. If a firewall wants to see what\'s actually inside a connection, rather than infer it from patterns, it has to decrypt a copy of the traffic, at least temporarily.',
  },
  {
    strong: 'SSL and TLS.',
    text: 'The protocols that set up encrypted connections in the first place. SSL is the older name; almost everything running today is actually TLS, its modern replacement. People still say "SSL" out of habit, in certificate names and decryption settings, for instance, even though the connection underneath is really running the newer protocol.',
  },
];

export function Chapter2WhatItDoes() {
  return (
    <section id="ch2" className="max-w-[1080px] mx-auto px-8 py-18">
      <SectionHead eyebrow="Chapter 2" title="What a firewall actually does">
        Checking an address and a port only gets a firewall so far. To really know what's inside traffic,
        rather than just guess from the outside, it has to deal with the fact that almost everything today
        is encrypted.
      </SectionHead>
      <Card>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-3.5 list-disc marker:text-line">
          {POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-ink-faint text-[13.5px] mt-4">
        So how does a connection actually become encrypted in the first place? That moment, the handshake,
        is next.
      </p>
    </section>
  );
}
