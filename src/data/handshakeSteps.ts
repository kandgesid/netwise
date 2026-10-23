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
  /**
   * Shown instead of `note` when the key-exchange toggle is set to 'ecdhe'. Only defined on the
   * `inbound` entry — the one scenario where the server's negotiated key-exchange algorithm
   * changes what the firewall structurally has to do (see `kexSteps`).
   */
  kexNote?: string;
  /**
   * Shown instead of `steps` when the key-exchange toggle is set to 'ecdhe'. Only defined on the
   * `inbound` entry. Unlike `echBody` (a per-step text swap within one shared sequence), this is a
   * full alternate sequence, because ECDHE inbound inspection isn't a cosmetic variant of the
   * static-RSA path, it's a structurally different handshake (the firewall runs two independent DH
   * exchanges instead of passively deriving one key). `pos` values in this array are independent of
   * `steps`' pos values.
   */
  kexSteps?: Step[];
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
    note: "The firewall isn't spoofing anything here. It holds the real server's own private key the whole time, and what that key actually buys depends on which key exchange the server negotiates: a quiet decrypt with the same key everyone else derives, or something more active. Toggle below to see both.",
    kexNote: "The server negotiated an ephemeral (ECDHE/DHE) key exchange, so a static copy of its private key no longer lets the firewall passively derive the session key the way it could with plain RSA. To still inspect this traffic, the firewall has to become an active participant in two separate Diffie-Hellman exchanges, one with the client, one with the server, and prove its identity on the client-facing leg by signing with the server's real private key. Two independent shared secrets come out of this, not one, which is exactly how outbound forward proxy works too (two sessions stitched together) — the difference here is the firewall authenticates with the server's own key instead of a forged certificate.",
    steps: [
      { pos: 20, label: 'TCP handshake', title: 'Client ↔ server', body: 'Client opens a TCP connection addressed to the real server the whole time. The firewall sits inline but doesn\'t terminate anything itself.' },
      { pos: 35, label: 'TLS handshake', title: 'ClientHello', body: 'Client sends ClientHello, addressed to the real server.' },
      { pos: 55, label: 'TLS handshake', title: 'ServerHello + the real certificate', body: 'The server responds with its actual, valid public certificate, exactly what the client would see with no firewall involved at all.' },
      { pos: 60, label: 'Key derivation', title: 'Firewall computes the same session key (with static RSA)', body: "Because the firewall was given the server's private key ahead of time, it can independently derive the same session key being negotiated, without inserting itself as a third party into the handshake. This works cleanly as long as the negotiated cipher suite uses plain RSA key exchange. If the server negotiates an ephemeral (ECDHE/DHE) exchange instead, the static private key alone isn't enough — toggle to ECDHE below to see what the firewall has to do instead." },
      { pos: 65, label: 'Session established', title: 'Inline decrypt', body: 'Once the handshake finishes (and assuming the cipher suite allowed it, per the previous step), the firewall decrypts a copy of the traffic in place using that derived key and runs full App-ID, User-ID, and Content-ID inspection on it.' },
      { pos: 85, label: 'Policy decision', title: 'Delivered unchanged', body: 'Traffic reaches the server exactly as sent. The client and server never see anything different from a normal, direct connection.' },
    ],
    kexSteps: [
      { pos: 20, label: 'TCP handshake', title: 'Client ↔ server', body: 'Client opens a TCP connection addressed to the real server, same as always. The firewall sits inline — but this time it can\'t just watch and derive a key afterward, it has to step into the handshake itself.' },
      { pos: 32, label: 'TLS handshake (leg 1)', title: 'ClientHello', body: 'Client sends ClientHello, listing ECDHE/DHE-capable cipher suites. This never reaches the server directly.' },
      { pos: 50, label: 'Firewall as active participant', title: 'Firewall generates two ephemeral key pairs', body: "A static private key can't produce an ECDHE session key, so the firewall generates its own fresh ephemeral key pair for the client-facing leg, and a separate one for the server-facing leg. These two legs will end up with two different shared secrets." },
      { pos: 62, label: 'TLS handshake (leg 2)', title: 'Firewall → server: firewall acts as the client', body: 'The firewall opens its own TLS handshake to the real server, this time playing the client role, and sends its leg-2 ephemeral public key share.' },
      { pos: 72, label: 'TLS handshake (leg 2)', title: 'Server responds with its own ephemeral key share', body: 'The server replies with ServerHello and its ephemeral ECDHE public key, exactly as it would to any client.' },
      { pos: 62, label: 'Key derivation (leg 2)', title: 'shared_2 established', body: "Firewall computes shared_2 = DH(firewall_leg2_private, server_public). The real server computes the same value from its side. This secret belongs only to the firewall↔server leg — the client's keys play no part in it." },
      { pos: 38, label: 'TLS handshake (leg 1)', title: 'Firewall → client: real certificate + signed key share', body: "Back on the client-facing leg, the firewall sends the server's actual, real certificate, not a forged one like outbound forward proxy uses, along with its own leg-1 ephemeral public key share. Critically, it signs that key share using the server's real private key." },
      { pos: 38, label: 'Signature check', title: 'Client verifies the signature', body: "The client checks that signature against the public key on the server's real certificate. It passes, because the firewall actually holds the matching private key, so from the client's side this looks exactly like talking to the real server directly. This is the one step the static-RSA path never needed." },
      { pos: 38, label: 'Key derivation (leg 1)', title: 'shared_1 established', body: 'Client computes shared_1 = DH(client_private, firewall_leg1_public). The firewall independently computes the same value using its leg-1 ephemeral private key. Two separate shared secrets now exist: shared_1 (client ↔ firewall) and shared_2 (firewall ↔ server).' },
      { pos: 65, label: 'Session established', title: 'Inline decrypt, now via two live key exchanges', body: 'The firewall decrypts traffic on session 1 using shared_1, inspects it, then re-encrypts with shared_2 before forwarding to the server, and the reverse on the way back. Same inspection outcome as the static-RSA path, achieved by active participation instead of passive key reuse.' },
      { pos: 85, label: 'Policy decision', title: 'Delivered unchanged', body: "Traffic reaches the server exactly as sent. The client and server never see anything different from a normal, direct connection — what makes that possible is the server's signature on the firewall's key share, not anything the client would flag as unusual." },
    ],
  },
};
