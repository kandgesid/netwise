import clsx from 'clsx';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { CipherDecoder } from './CipherDecoder';
import { KeyExchangeDiagram } from './KeyExchangeDiagram';
import { AutoLink } from '../../lib/autoLink';

const KEY_THEFT_IMPACT: {
  condition: string;
  pastTraffic: { verdict: 'safe' | 'compromised'; text: string };
  futureTraffic: { verdict: 'at-risk'; text: string };
}[] = [
  {
    condition: 'With PFS (ECDHE/DHE)',
    pastTraffic: {
      verdict: 'safe',
      text: "Protected. The private key was only ever used to sign the ephemeral exchange, never to encrypt anything directly, and the ephemeral keys that actually protected each past session were destroyed right after that session's handshake finished. There's nothing left for a stolen key to unlock.",
    },
    futureTraffic: {
      verdict: 'at-risk',
      text: "Not protected. Anyone holding the private key can sign a new ephemeral exchange and convince a new client it's really talking to the server, the exact mechanism the inbound-inspection firewall in Chapter 3 legitimately relies on. PFS was never a defense against impersonation, only against decrypting old traffic.",
    },
  },
  {
    condition: 'Without PFS (static RSA)',
    pastTraffic: {
      verdict: 'compromised',
      text: "Fully exposed. Every past session's pre-master secret was encrypted directly with this public key, so the stolen private key decrypts all of it retroactively, no new handshake required. (Heartbleed, 2014, is the textbook real-world case.)",
    },
    futureTraffic: {
      verdict: 'at-risk',
      text: "Same exposure as the PFS row above — a stolen key lets an attacker impersonate the server either way. PFS changes nothing about future risk; it only changes whether past traffic is also exposed.",
    },
  },
];

const PQ_POINTS = [
  {
    strong: 'Not the same threat as forward secrecy.',
    text: "Forward secrecy above defends against a stolen key: an attacker who gets the server's long-term private key years later still can't unlock old sessions, because the one-time keys that protected them are already gone. A quantum computer breaking the underlying math is a different failure entirely, no key theft required. A recorded handshake's public values would be enough on their own, whether the key behind them was ephemeral or not.",
  },
  {
    strong: 'Harvest now, decrypt later.',
    text: "None of this makes today's traffic unsafe today. The concern is what happens to traffic that's already been captured and quietly stored, on the bet that whatever's unreadable now stays unreadable forever. If the math protecting it is ever broken, that stored traffic doesn't need to be captured again, it just needs to be decrypted with whatever broke it.",
  },
  {
    strong: "ML-KEM is the industry's answer.",
    text: "Standardized by NIST in 2024 after years of public scrutiny, ML-KEM is a key-establishment algorithm built on a different kind of hard problem, one believed to hold up even against a quantum computer. It works a little differently than the groups above: instead of both sides combining public values into the same secret, one side publishes a public key and the other uses it to wrap a freshly chosen secret and sends the wrapped result back to be unwrapped. Different mechanism, same outcome: both sides end up holding one identical secret neither one ever sent directly.",
  },
  {
    strong: 'The real move is hybrid, not replace.',
    text: "TLS doesn't swap X25519 out for ML-KEM, it negotiates both in the same handshake and combines the two resulting secrets into the one real session key, so the connection stays safe unless both are broken. That's as much a hedge as a quantum defense: ML-KEM hasn't had anywhere near the decades of scrutiny the classical math above has, so pairing it with a proven classical group means an unnoticed flaw in the new algorithm doesn't sink the connection either.",
  },
  {
    strong: 'Where it stands today.',
    text: "TLS already negotiates the key exchange group as one named value, separate from the rest of the cipher suite, and a hybrid group is just a new option on that same list, its name reflecting both halves at once (commonly written as something like X25519MLKEM768). This isn't a future roadmap item either: hybrid key exchange is already the default for a meaningful share of real HTTPS traffic right now, the same quiet way TLS 1.3 itself became the default, an upgrade to what a connection falls back to, not something a typical user or admin switches on by hand.",
  },
];

export function Chapter4KeyExchange() {
  return (
    <ChapterPage title="Chapter 4: Key exchange">
      <SectionHead eyebrow="Chapter 4" title="Key exchange groups & cipher suites">
        Two things were doing the real work during the "key exchange" step you just watched: the key
        exchange group decides <em>how</em> the shared secret gets derived, and the cipher suite decides{' '}
        <em>which algorithms</em> handle the rest of the connection.
      </SectionHead>

      <p className="text-ink-dim text-[14.5px] mb-5 max-w-[70ch]">
        Here's why "ephemeral" specifically is worth caring about: picture a firewall doing inbound
        inspection, or an attacker who's been quietly recording your encrypted traffic for later. If either
        one gets hold of the server's long-term private key down the line, ephemeral exchange means it
        still buys them nothing against sessions that already finished, the one-time keys that actually
        protected them are already gone.
      </p>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">Key exchange groups</h3>
        <p className="text-ink-dim text-[14.5px] mb-3">
          Both sides combine public values so each can independently compute the same shared secret,
          without ever sending that secret over the wire:
        </p>
        <KeyExchangeDiagram />
        <p className="text-ink-dim text-[14.5px] mt-3.5">
          <AutoLink text="That's what the E in ECDHE and DHE stands for, ephemeral: there's nothing left to steal after the fact. Common groups in use today: X25519 and secp256r1 (also called P-256). The decoder below lets you toggle the first chip to see what a post-quantum-hybrid version of X25519 looks like." />
        </p>
      </Card>

      <CipherDecoder />

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">What forward secrecy doesn't protect</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Forward secrecy above is specifically about sessions that already finished. It says nothing about what a stolen key still lets an attacker do going forward, and conflating the two is an easy way to end up thinking a stolen key is basically harmless once PFS is involved. It isn't." />
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="py-2 pr-3 border-b border-line-soft"> </th>
                <th className="py-2 pr-3 border-b border-line-soft">Past traffic</th>
                <th className="py-2 border-b border-line-soft">Future traffic</th>
              </tr>
            </thead>
            <tbody>
              {KEY_THEFT_IMPACT.map((row) => (
                <tr key={row.condition} className="align-top">
                  <td className="py-3 pr-3 border-b border-line-soft font-semibold text-ink">
                    {row.condition}
                  </td>
                  <td
                    className={clsx(
                      'py-3 pr-3 border-b border-line-soft',
                      row.pastTraffic.verdict === 'safe' ? 'text-accent' : 'text-danger'
                    )}
                  >
                    <span className="font-mono text-[11px] uppercase block mb-1">
                      {row.pastTraffic.verdict === 'safe' ? 'Safe' : 'Compromised'}
                    </span>
                    <span className="text-ink-dim font-normal text-[12.5px]">
                      <AutoLink text={row.pastTraffic.text} />
                    </span>
                  </td>
                  <td className="py-3 border-b border-line-soft text-danger">
                    <span className="font-mono text-[11px] uppercase block mb-1">At risk</span>
                    <span className="text-ink-dim font-normal text-[12.5px]">
                      <AutoLink text={row.futureTraffic.text} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-ink-faint text-[13px] mt-3">
          Real example: Heartbleed (2014) leaked private keys from live servers and exposed years of past
          traffic specifically because most of the web was still running static RSA key exchange at the
          time. The same bug today, against a server running ECDHE, would still hand an attacker the ability
          to impersonate that server going forward, just not a time machine into its past traffic.
        </p>
      </Card>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">What changes next: post-quantum key exchange</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Every group named above, X25519 and secp256r1 included, gets its safety from the same kind of guarantee: a math problem that's hard to reverse today, on any computer that exists. A powerful enough quantum computer would break that guarantee outright, not gradually, and the industry isn't waiting to find out when that happens to start defending against it." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {PQ_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-ink-faint text-[13.5px] mt-4">
        All of this, key exchange, authentication, encryption, integrity, only happens because something
        told the firewall to decrypt this traffic in the first place. That instruction is next: decryption
        policy.
      </p>
    </ChapterPage>
  );
}
