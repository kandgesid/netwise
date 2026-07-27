import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { CipherDecoder } from './CipherDecoder';
import { AutoLink } from '../../lib/autoLink';

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
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          Both sides combine public values so each can independently compute the same shared secret,
          without ever sending that secret over the wire.
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          <li>
            Modern TLS almost always uses an <strong className="text-ink">ephemeral</strong> version,
            written as <AutoLink text="ECDHE or DHE" /> (the "E" is for ephemeral). A brand-new key pair is
            generated just for this one session, then thrown away afterward.
          </li>
          <li>
            That's what gives TLS <strong className="text-ink">forward secrecy</strong>: stealing tomorrow's
            key doesn't unlock today's sessions, since the keys that actually protected them never get
            written down anywhere.
          </li>
          <li>
            Common groups in use today: <strong className="text-ink">X25519</strong> and{' '}
            <strong className="text-ink">secp256r1</strong> (also called P-256). The decoder below lets
            you toggle the first chip to see what a post-quantum-hybrid version of X25519 looks like.
          </li>
        </ul>
      </Card>

      <CipherDecoder />

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
