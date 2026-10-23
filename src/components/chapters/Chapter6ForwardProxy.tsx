import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { ChapterTOC } from '../ui/ChapterTOC';
import { AutoLink } from '../../lib/autoLink';
import { SessionTrackingViz } from './SessionTrackingViz';

const TOC_ITEMS = [
  { id: 'where-used', label: 'Where it\'s used' },
  { id: 'deployed', label: 'How it\'s deployed' },
  { id: 'standing', label: 'Standing considerations' },
  { id: 'quic', label: 'QUIC and HTTP/3' },
  { id: 'adapts', label: 'How deployments adapt' },
];

const USES = ['Malware downloads', 'Data exfiltration', 'Policy violations'];

const DEPLOY_STEPS = [
  <>Generate or import a CA certificate on the firewall. This is the <strong className="text-ink">Forward Trust</strong> CA that will sign every fake certificate it presents.</>,
  <>Distribute that CA's public certificate to every managed device's trust store, typically pushed via <AutoLink text="GPO or MDM" />, not installed by hand one device at a time.</>,
  <>Write a decryption policy (Chapter 5) matching the outbound traffic to inspect, with the action set to Decrypt.</>,
];

const DEPLOY_CONSIDERATIONS = [
  <>A separate <strong className="text-ink">Forward Untrust</strong> CA handles sites with genuinely invalid certificates, so users still see a real warning instead of the firewall quietly masking an actual problem.</>,
  <>Some traffic won't decrypt cleanly. Apps that pin certificates, for example, hardcode which certificate they'll accept and break under interception. These typically need a Bypass or No decrypt exception from Chapter 5, not a Decrypt rule.</>,
];

const QUIC_POINTS = [
  {
    strong: 'A different transport underneath, not just a different look.',
    text: "Every scenario in Chapter 3's stepper opens with the same first step: a TCP handshake, SYN, SYN-ACK, ACK, that a firewall watches happen before anything else. QUIC, the transport HTTP/3 runs on, skips that step entirely. It drops TCP and rides on UDP instead, so there's no three-way handshake to observe, and no stable source IP, source port, destination IP, destination port, and protocol combination, usually called the 5-tuple, sitting still long enough for a firewall to key its session tracking off the way it always has.",
  },
  {
    strong: 'More of the transport itself is hidden, not just the payload.',
    text: "TCP was never encrypted to begin with, only whatever TLS wrapped around it was. A firewall watching an ordinary TCP-plus-TLS connection could always see the TCP layer doing its job in the clear: sequence numbers, acknowledgments, retransmissions, the connection closing. QUIC folds a TLS 1.3 handshake into its own packets and then encrypts most of that transport-level signaling too, not because TLS suddenly hides more than it already did, but because the layer underneath TLS finally does as well.",
  },
  {
    strong: 'Connection ID replaces the address a firewall used to key off.',
    text: "Instead of identifying a connection by its 5-tuple, QUIC has both sides agree on a connection ID during the handshake and carry it forward from there. Because that ID travels with the connection rather than being derived from the network path, the same connection can survive a client's network changing entirely, moving from Wi-Fi to cellular mid-session, for instance, without restarting anything. That's a genuinely new mechanic, not just the same session hidden behind more encryption, and a firewall built around 5-tuple tracking has no direct equivalent to fall back on.",
  },
  {
    strong: "SNI didn't go anywhere, and neither did ECH.",
    text: "The destination hostname still shows up in cleartext in QUIC's handshake the same way it does in ordinary TLS, unless the connection also uses Encrypted Client Hello from Chapter 3. SNI-based policy isn't automatically dead here, it's exactly as exposed, or exactly as closed off, as it already was, just riding on a transport that isn't TCP anymore.",
  },
];

const QUIC_RESPONSE_POINTS = [
  {
    strong: 'Block UDP/443 outright.',
    text: "The blunt, early answer. Browsers only try QUIC as an upgrade and fall straight back to HTTP/2 over ordinary TCP if UDP/443 gets no response, so blocking it doesn't break the connection, it just forces it back onto the transport this chapter's decryption policy already knows how to handle.",
  },
  {
    strong: 'Decrypt and inspect QUIC directly.',
    text: "The newer approach, and conceptually the same move this chapter already teaches: present a substitute identity, decrypt a copy, inspect it, forward it. What's different is everything underneath that move, terminating a UDP-based, connection-ID-tracked, more thoroughly protected handshake instead of a TCP one, which is a heavier lift than the forward proxy setup earlier in this chapter, not a free extension of it.",
  },
  {
    strong: "Neither option is free, and this isn't a hypothetical anymore.",
    text: "Blocking UDP/443 gives up whatever QUIC actually improves, lower latency and better behavior on unreliable networks, for any traffic that has to fall back. Decrypting it directly means extending everything this chapter's deployment steps already cover to a transport they weren't originally written for. QUIC and HTTP/3 already carry a substantial and growing share of ordinary web traffic, so this is a decision most real deployments are already making one way or another, not an edge case a rollout might never run into.",
  },
];

export function Chapter6ForwardProxy() {
  return (
    <ChapterPage title="Chapter 6: Forward proxy">
      <SectionHead eyebrow="Chapter 6" title="Forward proxy, in depth">
        You've now seen forward proxy from a few angles: one of the three firewall types in Chapter 1, a
        legitimate man-in-the-middle in Chapter 3, and what actually turns it on, from Chapter 5's
        decryption policy. This is what it actually takes to run one.
      </SectionHead>

      <ChapterTOC items={TOC_ITEMS} />

      <Card id="where-used" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Where it's used</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          Organizations use forward proxy to get visibility into traffic their own users generate going out
          to the internet, catching things that would otherwise be invisible inside an encrypted session:
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-1.5 list-disc marker:text-line">
          {USES.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </Card>

      <Card id="deployed" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">How it's actually deployed</h3>
        <ol className="pl-4 text-ink-dim text-[14.5px] space-y-3 list-decimal marker:text-line">
          {DEPLOY_STEPS.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </Card>

      <Card id="standing" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">Two things that aren't a one-time step</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          These aren't sequenced after the setup above, they're standing considerations that apply
          throughout a rollout:
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-3 list-disc marker:text-line">
          {DEPLOY_CONSIDERATIONS.map((c, idx) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </Card>

      <Card id="quic" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">What changes next: QUIC and HTTP/3</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Every deployment step above assumes the traffic riding through it looks the same underneath: a TCP connection, then TLS layered on top of it. HTTP/3 doesn't make that assumption anymore. It runs over QUIC, a transport built without a firewall looking over its shoulder in mind, and it still shows up on the familiar port 443, just over UDP instead of TCP." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {QUIC_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card id="adapts" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">How a forward proxy deployment adapts</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="None of that makes HTTP/3 traffic invisible, it just means the tools this chapter already covers aren't enough on their own anymore. Real deployments handle it one of two ways." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {QUIC_RESPONSE_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <SessionTrackingViz />

      <p className="text-ink-faint text-[13.5px] mt-4">
        Skip the trust-store step and every managed device throws a certificate warning on every HTTPS
        site. It's the single most common way a forward proxy rollout goes wrong.
      </p>

      <p className="text-ink-faint text-[13.5px] mt-2">
        <AutoLink text="You've now read through every piece firewalls use to make a decision when trust follows a connection's location: which zone it's in, which policy rule it matches, which certificate gets presented. One thing all of that quietly assumes: that the Forward Trust CA's private key, the one generated in step 1 above, stays exactly as secret as it needs to be. Chapter 7 is about making sure that's actually true." />
      </p>
    </ChapterPage>
  );
}
