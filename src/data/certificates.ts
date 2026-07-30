export interface CertPoint {
  strong?: string;
  text: string;
}

export interface CertTabData {
  flow: string[];
  title: string;
  points: CertPoint[];
}

export type CertTab = 'forward' | 'inbound' | 'vpn';

export const CERT_DATA: Record<CertTab, CertTabData> = {
  forward: {
    flow: ['your device', 'firewall (proxy)', 'internet site'],
    title: 'SSL forward proxy: decrypting outbound traffic',
    points: [
      { strong: 'When it applies:', text: 'people on your network browsing out to the internet, where the firewall doesn\'t own the destination server.' },
      { strong: 'What the firewall holds:', text: 'a "forward trust" CA certificate, usually your own internal CA. For each site visited, the firewall generates a fake leaf certificate on the fly, signed by that internal CA, and presents it to the browser instead of the site\'s real certificate.' },
      { strong: 'The catch:', text: 'every managed device has to trust that internal CA in its OS or browser trust store, or people see certificate warnings on every single HTTPS site.' },
      { text: 'There\'s also a "forward untrust" CA for sites with genuine certificate problems (expired, self-signed, revoked), so people still see a real warning rather than the firewall silently masking it.' },
    ],
  },
  inbound: {
    flow: ['outside user', 'firewall (inline)', 'your server'],
    title: 'SSL inbound inspection: decrypting traffic to your own servers',
    points: [
      { strong: 'When it applies:', text: 'outside traffic hitting a server you own, customers reaching your web app, for example.' },
      { strong: 'What the firewall holds:', text: 'the actual server certificate and its matching private key, imported directly onto the firewall.' },
      { text: 'Unlike forward proxy, the firewall isn\'t generating a fake certificate. It holds the real one, so it decrypts in place and the client sees the exact same valid public certificate the whole time.' },
      { strong: 'The catch:', text: 'this only works cleanly when the negotiated cipher suite uses plain RSA key exchange. If the server negotiates an ephemeral (ECDHE/DHE) exchange instead, the private key alone isn\'t enough to derive the session key, so real deployments often have to restrict which cipher suites the server offers.' },
      { strong: 'The upside:', text: 'nothing changes from the client\'s point of view, so there\'s no trust-store rollout needed on anyone\'s device.' },
    ],
  },
  vpn: {
    flow: ['site or laptop', 'IKE negotiation', 'remote gateway'],
    title: 'Certificates for VPN authentication',
    points: [
      { strong: 'When it applies:', text: 'proving the identity of a VPN endpoint, whether that\'s two gateways in a site-to-site VPN or a single laptop in a remote-access VPN, instead of relying only on a shared pre-shared key.' },
      { strong: 'What each side holds:', text: 'its own device or client certificate, signed by a CA both ends already trust.' },
      { text: 'During IKE (IPSec\'s negotiation phase) or an SSL VPN\'s TLS handshake, each side proves who it is by presenting its certificate rather than typing in a shared secret.' },
      { strong: 'Why it matters:', text: 'certificates scale far better across many remote users or sites than one shared key, and a single lost or compromised device\'s certificate can be revoked without touching anyone else\'s.' },
    ],
  },
};

// --- Certificate lifecycle & revocation (research-ideas.md #5 + #17) ---
// Cross-cutting facts that apply regardless of which tab (forward/inbound/vpn) is selected above,
// which is why this lives outside CERT_DATA rather than as a fourth tab. See content-plan.md.

export interface LifecycleSection {
  heading: string;
  intro: string;
  points: CertPoint[];
}

export const CERT_LIFECYCLE_BRIDGE = 'The three tabs above are about where a certificate sits and who holds the private key. The two things below are about time: how long each certificate in the chain actually gets to live, and what happens when one has to die earlier than planned.';

export const CERT_LIFECYCLE_SECTIONS: LifecycleSection[] = [
  {
    heading: 'Not every certificate in the chain lives the same length of time',
    intro: "Root, intermediate, and leaf certificates aren't just different links in the same chain of trust, they're built to live on entirely different clocks, and the reason comes down to how disruptive replacing each one is.",
    points: [
      { strong: 'Root:', text: 'commonly valid for around twenty years. Every browser and operating system ships with a fixed list of root certificates it already trusts, installed ahead of time, so swapping one out means waiting for a replacement to reach that trust list on essentially every device in use first. That kind of rollout is slow by nature, which is exactly why roots are issued to last a long time and retired on a schedule planned years in advance.' },
      { strong: 'Intermediate:', text: 'typically valid for several years, sitting between the root and the leaf specifically so the root itself can stay locked away and rarely touched. Rotation happens with deliberate overlap, a new intermediate is already trusted well before the old one expires, so nothing downstream ever has to wait on one exact expiry date.' },
      { strong: 'Leaf:', text: 'the shortest-lived by far, and still shrinking. Public certificate lifetimes that were commonly around a year until recently are being cut down in scheduled stages under current industry rules, with the endpoint as low as 47 days.' },
      { strong: 'The tradeoff:', text: "a shorter-lived leaf certificate narrows how long a stolen or wrongly issued one can cause damage before it simply stops working, but it costs convenience. Renewing a certificate by hand once a year was already easy to forget; renewing one every few weeks by hand isn't something any real organization can keep up with." },
      { strong: 'How it renews itself:', text: "ACME defines a standard, scripted conversation between a small agent running on a server and a CA: prove control of the domain, receive a freshly signed certificate, install it, and repeat automatically, well before the current one runs out. It's the same mechanism behind several widely used free certificate authorities, and it's the reason certificate lifetimes can keep shrinking without renewal turning into a full-time job for someone." },
    ],
  },
  {
    heading: "Expiry and revocation aren't the same problem",
    intro: 'A certificate can stop being trusted in two different ways, and only one of them is on a schedule.',
    points: [
      { strong: 'Expiry:', text: 'scheduled and absolute. Every certificate carries a hard end date, and the moment it passes, every browser blocks the connection, no grace period and no exceptions.' },
      { strong: 'Revocation:', text: "a certificate being invalidated before its stated expiry, usually because something went wrong, a private key was exposed, or the domain it covers changed hands. The certificate itself hasn't expired; it's just been declared untrustworthy ahead of schedule." },
      { strong: 'Checking has meant OCSP:', text: 'a live, real-time query to the CA asking whether one specific certificate has been revoked, made fresh on every connection.' },
      { strong: "Now it's shifting to CRLs:", text: 'the industry is moving away from those real-time OCSP lookups and back toward CRL-based checking, downloading a list of everything currently revoked on a schedule and checking it locally instead of querying a server live. Shrinking leaf certificate lifespans are a direct part of why: a certificate that only lives for weeks instead of a year gives a compromised-but-not-yet-expired certificate a much smaller window to do damage, which makes the always-on infrastructure real-time checking requires less load-bearing than it used to be.' },
    ],
  },
];

export const CERT_LIFECYCLE_CLOSING = "Put the two together and it's really one story: roots stay put for decades because replacing one is disruptive everywhere at once, leaves now live for weeks because renewing one got automated, and revocation checking is being redesigned around exactly that same shift.";

// --- Chain of trust basics (phase-4) ---
// What root/intermediate/leaf structurally are, and why the chain is checked leaf-up-to-root. Lives above
// CERT_LIFECYCLE_SECTIONS because that content (and VerificationWalkthrough further down the page) both
// assume this vocabulary already. See docs/integration/phase-4-chain-of-trust-basics/content-plan.md.

export const CERT_CHAIN_BRIDGE = "Whichever job a certificate is doing above, it never stands alone. Every certificate on this page is actually the bottom of a three-tier chain, and the terms that chain runs on are worth pinning down before going further.";

export const CERT_CHAIN_SECTIONS: LifecycleSection[] = [
  {
    heading: 'A certificate is trusted because of the chain behind it, not on its own',
    intro: "That chain has three tiers, root, intermediate, and leaf, and each one exists to solve a different problem: who a client trusts blindly, who does the actual day-to-day signing, and who's actually being identified.",
    points: [
      { strong: 'Root:', text: "the top of the chain, and the only certificate in it that isn't signed by anyone else, it's self-signed. A fixed set of these comes pre-installed in every operating system and browser as a trust anchor: something the client already trusts by default, because whoever built the OS or browser decided it should. Nothing vouches for a root; that's what makes it one." },
      { strong: 'Intermediate:', text: "signed by a root, and it exists mainly to keep the root out of everyday use. If a root's own key had to sign every server certificate directly, that key would be in constant, active use, which makes it a bigger target and makes a compromise catastrophic, recovering means getting every device on the internet to stop trusting that root and pick up a new one. An intermediate absorbs that risk instead. It does the routine signing, and if it's ever compromised, only that intermediate has to be revoked and replaced. The root underneath it never has to move." },
      { strong: 'Leaf:', text: "the certificate that actually identifies one specific server, portal.netwise-example.test, or whatever site is actually being connected to. It's signed by an intermediate, not a root, and it's the only certificate in the chain a client hasn't already decided to trust ahead of time. Everything else in the chain exists to justify trusting this one." },
      { strong: 'Why leaf-to-root:', text: "a client can't start from something it already trusts and work forward, because it has no way to know in advance which leaf certificate a given site is about to present. What it does know ahead of time is a fixed list of trusted roots. So it starts at the one certificate it just received, the leaf, confirms that certificate's signature actually traces to the intermediate that issued it, confirms that intermediate's own signature traces to a root, and only trusts the connection if that walk lands on a root already sitting in its trust store. That's the exact order the walkthrough further down this page runs the check in." },
    ],
  },
];
