export type GlossaryCategory = 'firewall' | 'tls' | 'vpn' | 'zerotrust';

export interface GlossaryEntry {
  term: string;
  def: string;
}

export const GLOSSARY: Record<GlossaryCategory, GlossaryEntry[]> = {
  firewall: [
    { term: 'Zone', def: 'A named grouping of interfaces the firewall uses to define what counts as "inside" versus "outside" for policy purposes.' },
    { term: 'Security policy rule', def: 'An ordered instruction telling the firewall what to allow or deny. Rules are evaluated top to bottom; first match wins.' },
    { term: 'NAT', def: 'Network Address Translation. Rewriting the source or destination address of a packet, most often so many internal devices can share one public IP.' },
    { term: 'App-ID', def: "Identifies what application traffic actually is by inspecting its behavior, not just trusting the port number it arrived on. App-ID, User-ID, and Content-ID (see Chapter 3) are one vendor's branded names for capabilities most modern firewalls implement in some form under different names." },
    { term: 'User-ID', def: 'Maps traffic to an actual signed-in user identity, so policy can target a specific person rather than just an IP address.' },
    { term: 'Content-ID', def: 'Inspects the actual content of already-allowed traffic for threats, exploits, or sensitive data.' },
    { term: 'SP3 (single pass parallel processing)', def: "Doing the networking lookup, policy match, App-ID, User-ID, Content-ID, and decryption for a piece of traffic together in one traversal, instead of a separate full pass per feature, with many sessions handled in parallel across dedicated hardware. SP3 is this same vendor's branded name for this specific architecture (see Chapter 3); other firewalls run their own single-traversal designs under different names." },
    { term: 'HSM (hardware security module)', def: 'A physical, tamper-resistant device that generates, stores, and uses cryptographic keys without ever letting the key itself leave in a usable form. The firewall sends it a "sign this" or "decrypt this" request and gets back only the result.' },
    { term: 'Master key encryption', def: 'Encrypting every private key stored on the firewall under one master key, so none of them are usable without that master key first being unlocked. Can itself be protected locally or by an HSM, and is typically layered with one rather than used instead of one.' },
    { term: 'Threat prevention', def: 'Signature and behavior-based detection run against decrypted traffic to catch known exploits, malware, and spyware.' },
    { term: '5-tuple', def: "The source IP, source port, destination IP, destination port, and protocol combination a firewall has traditionally used to identify one ongoing connection and track its state, built around TCP and UDP's fixed address-and-port model. QUIC's connection ID exists specifically because that model doesn't hold for it." },
    { term: 'Connection ID', def: "QUIC's own way of naming an ongoing connection, agreed on by both sides during the handshake instead of derived from IP addresses and ports. Because the ID travels with the connection rather than the network path, the same connection can survive a client's network changing entirely, moving from Wi-Fi to cellular mid-session, for instance, without restarting the handshake." },
  ],
  tls: [
    { term: 'Certificate authority (CA)', def: 'An organization whose signature vouches that a certificate is genuine.' },
    { term: 'Root certificate', def: 'The top of a trust chain: self-signed, and trusted directly by the operating system or browser.' },
    { term: 'Intermediate certificate', def: 'A certificate signed by a root CA and used to sign end-entity certificates, keeping the root itself offline and safer.' },
    { term: 'Leaf certificate', def: 'The certificate that actually identifies one specific server or site, the one at the bottom of the chain.' },
    { term: 'Chain of trust', def: 'The linked sequence from leaf up to root that a client checks before deciding to trust a connection.' },
    { term: 'SAN (subject alternative name)', def: 'A field on a certificate listing every domain that one certificate is valid for.' },
    { term: 'Wildcard certificate', def: 'A certificate valid for any subdomain under one domain, using an asterisk pattern like *.example.com.' },
    { term: 'Self-signed certificate', def: 'A certificate signed by its own key rather than a CA. Fine for internal testing, not for anything public-facing.' },
    { term: 'Cipher suite', def: 'The specific combination of algorithms two sides agree to use for key exchange, encryption, and integrity checking.' },
    { term: 'Forward secrecy (PFS)', def: "Using a fresh, disposable key pair for each session instead of the same long-term key every time, so a key stolen later can't unlock sessions that already finished. Protects past traffic from a future key theft; doesn't protect against the stolen key being used to impersonate the server going forward." },
    { term: 'mTLS (mutual TLS)', def: "TLS where the server also requires the client to present its own certificate, authenticating both directions instead of just the server. A firewall doing forward proxy or inbound inspection has no way to supply the client's private key, so mTLS traffic is a Bypass, not a decryption policy setting." },
    { term: 'Certificate pinning', def: "An app hardcoding which exact certificate (or public key) it will accept from a server, instead of trusting anything a normal chain of trust validates. Rejects a firewall's substitute certificate the same way it would reject an attacker's, so pinned apps need a Bypass exception rather than a decryption rule." },
    { term: 'ACME (automatic certificate management environment)', def: 'The standard automated conversation between a server and a CA that proves domain control and issues a fresh certificate without a human doing it by hand. What makes very short-lived certificates practical at scale.' },
    { term: 'OCSP (online certificate status protocol)', def: 'A live, real-time check asking a CA whether one specific certificate has been revoked. Being phased out industry-wide in favor of CRLs.' },
    { term: 'CRL (certificate revocation list)', def: 'A periodically downloaded list of every currently revoked certificate, checked locally instead of queried live. The direction revocation checking is shifting toward as OCSP use declines.' },
    { term: 'Revocation', def: 'A certificate being invalidated before its scheduled expiry, usually because a private key leaked or the domain changed hands. A different failure mode than expiry, which is scheduled and unavoidable.' },
    { term: 'SNI (server name indication)', def: "The field in ClientHello where a client states which hostname it's trying to reach, sent in the clear even when the rest of the handshake is encrypted. How a server hosting multiple sites behind one address knows which certificate to present, and how a passively-watching firewall can normally tell which destination traffic is headed to." },
    { term: 'ECH (encrypted client hello)', def: 'A TLS extension that encrypts SNI and the rest of the real ClientHello, using a public key the destination already published in DNS ahead of time, so anyone just watching the wire sees only a generic placeholder hello instead of the real one.' },
    { term: 'DNS (domain name system)', def: "The system that turns a hostname like example.com into the IP address a client actually connects to. Also where a server can publish extra configuration for clients to fetch ahead of time, like the public key ECH depends on." },
    { term: 'ML-KEM (module-lattice-based key encapsulation mechanism)', def: "A NIST-standardized key-establishment algorithm built to resist attacks from a sufficiently powerful quantum computer, not just classical ones. Works differently from ECDHE: one side wraps a secret using the other's public key instead of both sides combining public values directly." },
    { term: 'Hybrid key exchange', def: "Running a classical key exchange group (like X25519) and a post-quantum one (like ML-KEM) in the same handshake and combining both resulting secrets into one session key, so the connection stays safe unless both are broken. The industry's actual answer to the quantum threat, not a straight swap to ML-KEM alone." },
    { term: 'Harvest now, decrypt later', def: "An attacker recording encrypted traffic today, with nothing decryptable yet, on the bet that the classical math protecting it eventually becomes breakable and the recording can be decrypted retroactively. The main reason post-quantum key exchange is being deployed years before a quantum computer capable of breaking today's math actually exists." },
    { term: 'QUIC (quick udp internet connections)', def: 'The transport HTTP/3 runs on, built directly on UDP instead of TCP, with a TLS 1.3 handshake folded into its own packets instead of layered on top of an already-open connection. The name started as a backronym, "Quick UDP Internet Connections," but the standard treats QUIC as a name in its own right, not a literal acronym.' },
    { term: 'UDP (user datagram protocol)', def: "A connectionless alternative to TCP: packets go out with no three-way handshake and no built-in tracking of an ongoing session. Whatever counts as a \"session\" is left entirely to whatever protocol runs on top of it, QUIC included." },
    { term: 'HTTP/3', def: 'The current version of HTTP. The one change from HTTP/2 that actually matters here: it runs over QUIC instead of TCP, and inherits everything that changes about session tracking and handshake visibility as a result.' },
  ],
  vpn: [
    { term: 'VPN', def: 'An encrypted tunnel that makes traffic between two points look like it\'s on a private network, even when it crosses the public internet.' },
    { term: 'IPSec', def: 'A suite of protocols for encrypting and authenticating IP traffic, most commonly used for site-to-site VPNs.' },
    { term: 'IKE', def: 'Internet Key Exchange: the negotiation phase where two VPN endpoints authenticate each other and agree on encryption keys before any real traffic flows.' },
    { term: 'Site-to-site VPN', def: 'A permanent, usually always-on tunnel connecting two networks, such as two office locations.' },
    { term: 'Remote-access VPN', def: 'A tunnel a single user\'s device establishes on demand, typically to reach a company network from home or while travelling.' },
    { term: 'Pre-shared key (PSK)', def: 'A shared secret both VPN endpoints already know, typed in ahead of time, used to authenticate each other instead of certificates.' },
  ],
  zerotrust: [
    { term: 'Zero Trust', def: "An architectural stance, not a product: no request gets automatic trust just because of where it came from, inside a zone or outside it. Every access attempt gets checked against identity, device posture, and context, continuously, not just once at the perimeter. Formalized by NIST as a vendor-neutral standard (SP 800-207), not one company's branded framework." },
    { term: 'Device posture', def: "The measurable state of the device making a request: patched, encrypted, running required security software, not tampered with. One of the signals a Zero Trust policy checks before granting access. The same identity looks like a different request depending on what device it's coming from." },
    { term: 'Least privilege', def: "Granting access to only the specific resource a task actually needs, nothing broader by default. The opposite of a zone-wide allow once someone's already inside." },
    { term: 'Micro-segmentation', def: "Dividing access far more finely than a traditional zone (see Chapter 1), down to individual applications or resources, so reaching one thing doesn't imply reaching whatever else happens to sit nearby." },
    { term: 'MFA (multi-factor authentication)', def: "Proving identity with more than one factor, something you know plus something you have or are, instead of a password alone. One concrete way identity gets verified continuously, since a stolen password by itself is exactly what a single-factor check lets through." },
  ],
};
