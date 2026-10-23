import { Link } from 'react-router-dom';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { ChapterTOC } from '../ui/ChapterTOC';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';
import { AutoLink } from '../../lib/autoLink';
import { HandshakeStepper } from './HandshakeStepper';
import { SinglePassViz } from './SinglePassViz';

const TOC_ITEMS = [
  { id: 'tls-versions', label: 'TLS 1.2 vs 1.3' },
  { id: 'three-lenses', label: 'Three lenses' },
  { id: 'single-pass', label: 'One pass, not one per feature' },
  { id: 'mitm', label: 'MITM, on purpose' },
  { id: 'ech', label: 'Encrypted Client Hello' },
];

const TLS12_STEPS = [
  'ClientHello — proposes the TLS version, random bytes, and which cipher suites it supports.',
  'ServerHello — server picks one cipher suite from that list and sends its own random bytes.',
  'Certificate — server sends its certificate, in the clear.',
  "ServerKeyExchange — server's ephemeral public key, signed with its long-term private key. Only shows up at all if the chosen cipher suite is ECDHE or DHE.",
  "ClientKeyExchange — client sends its own half of the key exchange.",
  'Both sides independently compute the same shared secret from what they just exchanged.',
  'ChangeCipherSpec + Finished, both directions — a last integrity check, and the first thing actually sent encrypted.',
];

const TLS13_STEPS = [
  "ClientHello — now carries the client's key share up front, not just a list of cipher suite options.",
  "ServerHello — server's key share comes back immediately. Both sides derive the shared secret right here.",
  'Everything from this point on is encrypted, including the certificate itself.',
  'EncryptedExtensions, Certificate, CertificateVerify, Finished — sent as one encrypted block.',
  "Client's own Finished closes out the handshake.",
];

const PIPELINE_POINTS = [
  {
    strong: 'App-ID.',
    text: 'Identifies what the traffic actually is by watching its behavior, not by trusting the port number it showed up on.',
  },
  {
    strong: 'User-ID.',
    text: "Maps the traffic to an actual signed-in identity, so policy can target a specific person or group, not just an address.",
  },
  {
    strong: 'Content-ID.',
    text: "Inspects the actual payload, once it's visible, for threats, exploits, or sensitive data.",
  },
];

const SINGLE_PASS_POINTS = [
  {
    strong: 'The old model stacked a full pass per feature.',
    text: "Older firewalls ran each inspection job as its own separate engine: one pass for antivirus scanning, another for intrusion detection, another for application control, and so on, with traffic queued through every one of them in turn before it could move on. Switch on one more feature and you added one more full pass over the same traffic, so protection and delay scaled together.",
  },
  {
    strong: 'Single-pass parallel processing does the decoding once, then runs every check together.',
    text: "Decrypt the traffic once, decode it once, then run the policy match and all three lenses, App-ID, User-ID, and Content-ID, against that same single pass at the same time instead of one after another. Turning on User-ID doesn't add a second decrypt, and turning on Content-ID doesn't add a third pass behind it; everything enabled rides through in the same traversal the traffic was already making.",
  },
  {
    strong: 'It scales by running many sessions in parallel, not by cutting any one check short.',
    text: "None of this makes an individual check instant, more inspection checks running is still more computation happening somewhere. What changes is where that extra work lands: as more happening at once, across many sessions handled in parallel on dedicated hardware, instead of one more sequential pass every single session has to survive before it gets through.",
  },
];

const MITM_POINTS = [
  {
    strong: 'Trust.',
    text: "Your organization deliberately installs the firewall's CA into your device's trust store ahead of time, so your browser is designed to accept it without complaint.",
  },
  {
    strong: 'No trust, for an attacker.',
    text: "Their fake certificate isn't signed by anything your browser already trusts, which is why it throws a warning instead of quietly succeeding.",
  },
  {
    strong: 'Same mechanism, opposite authorization.',
    text: 'Whether an interception counts as "safe" or an attack comes down to who authorized it, not what it technically does.',
  },
];

const ECH_POINTS = [
  {
    strong: 'What it actually does.',
    text: "The client folds two ClientHellos into one message: an outer one, generic and unencrypted, carrying a placeholder name instead of the real destination, and an inner one, carrying the real SNI and the rest of the real handshake, encrypted with a public key the destination already published in DNS ahead of time. Only the server holding that key can unwrap the inner hello, everyone else on the wire, including a passively-watching firewall, sees only the outer one.",
  },
  {
    strong: 'Passthrough loses its one crumb of visibility.',
    text: "This chapter's no-decryption scenario was quietly leaning on that one visible field, SNI, to make any destination-aware decision at all without decrypting anything. Once ECH is in play on a connection, that field is gone, and the same category-based policy rules from Chapter 5 that assumed they could read a destination before deciding whether to decrypt lose the input they were reading.",
  },
  {
    strong: "Forward proxy doesn't get a pass either.",
    text: "It's tempting to assume forward proxy sidesteps this since it already terminates the real handshake, but the trust that lets it do that, the client accepting a forged certificate because the firewall's CA is installed ahead of time, doesn't extend to ECH. The key protecting the inner ClientHello belongs to the real destination, published through DNS, not anything a locally-installed CA touches. A firewall can't forge its way past that the way it forges past certificate trust, so the practical answer today is the same lever already used to install that CA in the first place: push a policy disabling ECH on managed devices via GPO or MDM, from Chapter 6, rather than trying to intercept it.",
  },
  {
    strong: 'Inbound inspection barely notices.',
    text: "It was never reading SNI to begin with, it already holds the server's own private key and decrypts a copy directly, regardless of what an outside client reveals about its destination on the way in.",
  },
  {
    strong: 'Where it stands today.',
    text: "ECH's core specification only recently finished years of draft status, and it's already active in some major browsers and rolled out by some large content platforms. Not everywhere yet, but live production traffic, not a future hypothetical.",
  },
];

export function Chapter3Handshake() {
  return (
    <ChapterPage title="Chapter 3: Handshake">
      <SectionHead eyebrow="Chapter 3" title="Inside the SSL/TLS handshake">
        Every secure connection follows the same sequence: a connection is opened, identity is proven, then
        a firewall inspects and decides. Step through it once end to end, then switch scenarios to see how
        the story changes.
      </SectionHead>

      <ChapterTOC items={TOC_ITEMS} />

      <div className="mb-6">
        <HandshakeStepper />
      </div>

      <Card id="tls-versions" className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">TLS 1.2 vs. TLS 1.3, the actual sequence</h3>
        <p className="text-ink-dim text-[14.5px] mb-3.5">
          <AutoLink text="The stepper above shows one firewall-centric path through a handshake. Here's the handshake itself, message by message, both versions side by side." />
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-3.5">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-faint mb-2">TLS 1.2 — 2 round trips</h4>
            <ol className="pl-4 text-ink-dim text-[13.5px] space-y-1.5 list-decimal marker:text-line">
              {TLS12_STEPS.map((s, i) => (
                <li key={i}><AutoLink text={s} /></li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-faint mb-2">TLS 1.3 — 1 round trip</h4>
            <ol className="pl-4 text-ink-dim text-[13.5px] space-y-1.5 list-decimal marker:text-line">
              {TLS13_STEPS.map((s, i) => (
                <li key={i}><AutoLink text={s} /></li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-ink-faint text-[13px]">
          <AutoLink text="Fewer messages, encryption starting earlier, and one path removed entirely: TLS 1.3 only allows the ephemeral kind of key exchange, so static RSA key exchange has nowhere left to run. That's exactly why one path through the inbound-inspection scenario above, a server that's negotiated TLS 1.3, always lands on the active-participant mechanism rather than a quiet decrypt." />
        </p>
      </Card>

      <Card id="three-lenses" className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">Three lenses the firewall applies</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          You'll have seen these three names go by in the stepper above. Worth pinning down before the{' '}
          <Link to="/sandbox" className={TOOL_LINK_CLASS}>
            Sandbox
          </Link>
          , since it's built entirely around them:
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line mb-3.5">
          {PIPELINE_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
        <p className="text-ink-faint text-[13px]">
          <AutoLink text="App-ID, User-ID, and Content-ID are one major firewall vendor's names for these capabilities. Every modern firewall does some version of identifying the real application, knowing who's sending it, and inspecting content for threats, but the product-specific names differ vendor to vendor. This site uses one vendor's naming throughout for consistency, since the underlying ideas transfer regardless of which product you eventually work with." />
        </p>
      </Card>

      <Card id="single-pass" className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">One pass, not one per feature</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Look back at those three lenses, then add one more thing this chapter already covers: a firewall doing forward proxy or inbound inspection is decrypting that traffic too, on every packet, before any of the three lenses even get a look at it. If a firewall is doing this much work on every packet, why doesn't switching more of it on make everything slower?" />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line mb-3.5">
          {SINGLE_PASS_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
        <p className="text-ink-faint text-[13px]">
          <AutoLink text="Single-pass parallel processing, sometimes abbreviated SP3, is this same vendor's branded name for this specific architecture, the same situation as App-ID, User-ID, and Content-ID above. Other firewalls run their own single-traversal designs under different names and different implementation details, but the general shape, doing this work together instead of stacking it in sequence, shows up across most modern firewall architectures in some form, not just this one." />
        </p>
      </Card>

      <SinglePassViz />

      <Card id="mitm" className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">A man-in-the-middle, on purpose</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          Switch to "Forward proxy" in the stepper above and watch closely. The firewall intercepts the
          handshake and presents its <em>own</em> certificate instead of the real site's, which is
          structurally identical to a malicious man-in-the-middle attack. So what actually separates the
          two?
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {MITM_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card id="ech" className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">What changes next: Encrypted Client Hello</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="One piece of the handshake was never covered by any of this: the SNI field in the very first message, ClientHello, where the client states which hostname it's trying to reach, sent in the clear even under TLS 1.3, the version this chapter otherwise treats as the modern default. Encrypted Client Hello (ECH) is the extension that closes that last gap, and it changes what each of this chapter's three scenarios actually gets to see." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {ECH_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-ink-faint text-[13.5px] mt-4">
        <AutoLink text="The public key that makes ECH's encryption possible has to come from somewhere the two sides agreed on ahead of time, without ever exchanging it directly on this connection. That's the same asymmetric-key idea Chapter 4 covers next, and in most real ECH deployments today, it runs on X25519, the same curve Chapter 4 names as one of the two in common use." />
      </p>
    </ChapterPage>
  );
}
