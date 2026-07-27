export interface Step {
  pos: number;
  label: string;
  title: string;
  body: string;
  /** Shown instead of `body` when the ECH toggle is on. Only present on steps ECH changes. */
  echBody?: string;
}

export type ScenarioMode = 'passthrough' | 'forwardproxy' | 'inbound';

export interface ScenarioData {
  label: string;
  note: string;
  /** Shown instead of `note` when the ECH toggle is on. Only defined on the `passthrough` entry. */
  echNote?: string;
  steps: Step[];
}

export const SCENARIOS: Record<ScenarioMode, ScenarioData> = {
  passthrough: {
    label: 'No decryption',
    note: "No SSL decryption is configured. The handshake happens directly between client and server. The firewall watches the encrypted traffic go by without ever holding a private key or terminating anything itself.",
    echNote: "No SSL decryption is configured, and Encrypted Client Hello (ECH) is turned on for this connection. The handshake still happens directly between client and server, and the firewall still watches it go by without ever holding a private key or terminating anything itself, but now it doesn't even get the destination hostname in cleartext. ECH hides that too.",
    steps: [
      { pos: 20, label: 'TCP handshake', title: 'SYN / SYN-ACK / ACK', body: 'Client and server complete the standard three-way handshake directly with each other. The firewall sits on the wire and observes, but takes no active part.' },
      { pos: 35, label: 'TLS handshake', title: 'ClientHello → ServerHello + certificate', body: 'Client and server negotiate TLS. In TLS 1.2 the real server certificate is visible on the wire at this point; in TLS 1.3 (the common case today) it\'s encrypted, though the destination is still visible from the ClientHello\'s SNI field. Either way, the firewall watches this happen without being a party to it.', echBody: 'With ECH enabled, the ClientHello itself changes shape: the client sends a generic "outer" ClientHello in cleartext, carrying a placeholder name, and an encrypted "inner" ClientHello nested inside it carries the real SNI. An observer on the wire, including this firewall, sees only the outer hello, never the actual destination. That\'s a separate axis from the TLS 1.2 vs. TLS 1.3 certificate-visibility question above; ECH doesn\'t change that, it closes the one gap TLS 1.3 still left open.' },
      { pos: 55, label: 'TLS handshake', title: 'Key exchange + Finished', body: 'Client and server derive a shared session key between themselves. The firewall never has this key, so it cannot see the plaintext of this session.' },
      { pos: 45, label: 'Firewall pipeline', title: 'App-ID (pattern-based)', body: 'Without the session key, the firewall can\'t read the payload. App-ID can still often identify the application from traffic patterns and handshake metadata alone, though.', echBody: 'With ECH enabled, App-ID loses one of its better signals: SNI is now hidden along with the payload. It leans harder on traffic patterns and fingerprinting of the outer hello, plus the destination IP address itself, since where the packets are actually routed is still visible even when the hostname inside the handshake isn\'t.' },
      { pos: 45, label: 'Firewall pipeline', title: 'User-ID', body: 'User-ID still works here. It maps the source address to a signed-in identity using directory information, not by reading the encrypted packet itself.' },
      { pos: 45, label: 'Firewall pipeline', title: 'Content-ID (limited)', body: 'Content-ID\'s visibility is limited in this mode. It can inspect whatever metadata is visible, but the actual payload stays encrypted end to end.' },
      { pos: 80, label: 'Policy decision', title: 'Allow or deny', body: 'The rule is evaluated on what\'s visible, mostly zone, address, port, and whatever App-ID could infer, and the encrypted session passes through untouched either way.', echBody: 'The rule is still evaluated on what\'s visible, zone, address, port, and whatever App-ID could infer, but with ECH enabled a hostname-based rule that depended on reading SNI in cleartext has nothing left to match against for this session. Address- and port-based rules are unaffected either way.' },
    ],
  },
  forwardproxy: {
    label: 'Forward proxy',
    note: 'The firewall decrypts outbound traffic to inspect it, then re-encrypts it going out the other side. That means two separate TLS sessions stitched together, not one straight line. Encrypted Client Hello, covered later in this chapter, adds a wrinkle even here: since ECH\'s key material belongs to the real destination rather than anything the firewall\'s forged certificate touches, enterprise interception setups typically have to account for ECH separately, usually by disabling it on managed devices.',
    steps: [
      { pos: 22, label: 'TCP handshake (leg 1)', title: 'Client ↔ firewall', body: 'Client opens a TCP connection, believing it\'s connecting directly to the destination site. It\'s actually connecting to the firewall.' },
      { pos: 22, label: 'TLS handshake (leg 1)', title: 'ClientHello', body: 'Client sends ClientHello to what it thinks is the destination server.' },
      { pos: 30, label: 'TLS handshake (leg 1)', title: 'Firewall presents a generated certificate', body: 'The firewall responds with a certificate for that destination, freshly generated on the spot and signed by its own internal "forward trust" CA. This is not the site\'s real certificate.' },
      { pos: 38, label: 'TLS handshake (leg 1)', title: 'Session 1 established', body: 'The client accepts this certificate only because that internal CA was deployed to its trust store ahead of time. Session 1 (client ↔ firewall) is now live, and the firewall can see this side\'s plaintext.' },
      { pos: 48, label: 'Firewall pipeline', title: 'App-ID, User-ID, Content-ID', body: 'With real plaintext now visible, the firewall runs full inspection on it, including Content-ID against the actual payload, not just metadata.' },
      { pos: 62, label: 'TCP + TLS handshake (leg 2)', title: 'Firewall ↔ real server', body: 'The firewall opens its own connection to the real destination server, acting as the client this time, and receives the server\'s actual certificate.' },
      { pos: 72, label: 'TLS handshake (leg 2)', title: 'Session 2 established', body: 'A second, independent session (firewall ↔ server) is now live. The firewall re-encrypts the approved traffic and forwards it onward.' },
      { pos: 85, label: 'Policy decision', title: 'Two sessions, one experience', body: 'The client and the real server never talk directly. Two separate encrypted sessions get stitched together by the firewall in the middle, which is what "SSL forward proxy" means in practice.' },
    ],
  },
  inbound: {
    label: 'Inbound inspection',
    note: 'The firewall isn\'t spoofing anything here. It holds the real server\'s own private key, which can let it derive the session key and decrypt a copy in place, without ever changing what the client sees, though whether that actually works depends on which key exchange the server negotiates (the key-derivation step below explains the catch).',
    steps: [
      { pos: 20, label: 'TCP handshake', title: 'Client ↔ server', body: 'Client opens a TCP connection addressed to the real server the whole time. The firewall sits inline but doesn\'t terminate anything itself.' },
      { pos: 35, label: 'TLS handshake', title: 'ClientHello', body: 'Client sends ClientHello, addressed to the real server.' },
      { pos: 55, label: 'TLS handshake', title: 'ServerHello + the real certificate', body: 'The server responds with its actual, valid public certificate, exactly what the client would see with no firewall involved at all.' },
      { pos: 60, label: 'Key derivation', title: 'Firewall computes the same session key (with static RSA)', body: 'Because the firewall was given the server\'s private key ahead of time, it can independently derive the same session key being negotiated, without inserting itself as a third party into the handshake. This works cleanly as long as the negotiated cipher suite uses plain RSA key exchange. If the server negotiates an ephemeral (ECDHE/DHE) exchange instead, the forward-secrecy mode covered in Chapter 4, the static private key alone isn\'t enough to derive the session key, which is why real inbound-decryption deployments often have to restrict which cipher suites the server offers.' },
      { pos: 65, label: 'Session established', title: 'Inline decrypt', body: 'Once the handshake finishes (and assuming the cipher suite allowed it, per the previous step), the firewall decrypts a copy of the traffic in place using that derived key and runs full App-ID, User-ID, and Content-ID inspection on it.' },
      { pos: 85, label: 'Policy decision', title: 'Delivered unchanged', body: 'Traffic reaches the server exactly as sent. The client and server never see anything different from a normal, direct connection.' },
    ],
  },
};
