import { useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';

/**
 * Session Tracking Viz — the one genuinely new mechanic this phase's research called for: a
 * firewall's session identity (the 5-tuple) has no QUIC equivalent, and QUIC's connection ID
 * survives a network change that would restart an ordinary TCP+TLS session. Sized and shaped
 * like FirewallCheckpointViz (one Card, one small piece of local state, no data file, no props).
 * Reuses PolicyEvaluator's/VerificationWalkthrough's reactive-on-select pattern, not Sandbox's
 * accumulating terminal log — nothing here is a triggered event, it's a static comparison that
 * re-renders in place when the toggle changes.
 * See docs/integration/phase-2c-quic/simulation-design.md §3.
 */

type NetworkState = 'same' | 'roamed';

const NETWORK_OPTIONS: { value: NetworkState; label: string }[] = [
  { value: 'same', label: 'Same network' },
  { value: 'roamed', label: 'Client roams (Wi-Fi → cellular)' },
];

interface AddressSnapshot {
  srcIp: string;
  srcPort: string;
}

const DEST = { ip: '192.0.2.10', port: '443' };

const CLIENT_ADDRESS: Record<NetworkState, AddressSnapshot> = {
  same: { srcIp: '203.0.113.42', srcPort: '51422' },
  roamed: { srcIp: '198.51.100.77', srcPort: '60110' },
};

const QUIC_CONNECTION_ID = 'a3f9e21c88b04dd1';

const INTRO =
  "Every session the chapters before this one describe, App-ID identifying an app in Chapter 3, a decryption policy matching traffic in Chapter 5, a rule catching one specific person, quietly assumes the firewall can tell this is still the same connection. It does that by watching one thing stay put: the 5-tuple, source IP, source port, destination IP, destination port, and protocol. QUIC identifies a connection differently, with a connection ID both sides agree on up front instead of deriving one from the network path. Toggle the network below and watch the same event, a client's address changing, play out two different ways.";

const ROW1_SAME = 'This address pair is the 5-tuple the firewall keys this session on.';
const ROW1_ROAMED =
  "Source changed, so this no longer matches the 5-tuple the firewall had on file. It reads as a brand-new connection: the TCP handshake restarts, and whatever this session had already established, App-ID's identification, whether decryption applied, which policy rule matched, is gone with it.";

const ROW2_SAME = 'The firewall keys this session on the connection ID below, not the address above.';
const ROW2_ROAMED =
  "Address changed, but the connection ID didn't. The firewall, and the server, still recognize this as the same ongoing connection. No restart.";

const CAVEAT =
  "One simplification worth naming: a real QUIC connection ID can also deliberately rotate to a new value mid-session, negotiated in advance, for privacy, so it isn't a fingerprint that literally never changes for the life of a connection, just stable enough to survive the roam simulated above.";

const CLOSING =
  "This is the practical reason some firewalls today just block UDP/443 outright: refusing the protocol is simpler than rebuilding session tracking around a connection ID. The other real answer, decrypting and inspecting QUIC directly, means the firewall becomes an actual QUIC endpoint itself, the same move Chapter 6 already covers for ordinary TLS, just aimed at a transport that wasn't built with a middlebox in mind.";

export function SessionTrackingViz() {
  const [network, setNetwork] = useState<NetworkState>('same');
  const roamed = network === 'roamed';
  const addr = CLIENT_ADDRESS[network];

  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2.5">
        Try it: does this connection survive a network change?
      </h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        <AutoLink text={INTRO} />
      </p>

      <div className="mb-4">
        <label className="block font-mono text-xs text-ink-faint mb-1.5">Network</label>
        <Toggle options={NETWORK_OPTIONS} value={network} onChange={setNetwork} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-md p-4 border border-line-soft bg-bg-deep">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint mb-2">TCP + TLS</div>
          <div className="font-mono text-[12.5px] text-ink mb-3">
            {addr.srcIp}:{addr.srcPort} → {DEST.ip}:{DEST.port} · TCP
          </div>
          <div
            className={clsx(
              'rounded-md px-3 py-2.5 border text-[13px]',
              roamed ? 'border-danger bg-danger/10 text-ink' : 'border-transparent text-ink-dim'
            )}
          >
            <div className="flex items-start gap-2">
              {roamed ? (
                <XCircle size={16} className="text-danger mt-0.5 shrink-0" />
              ) : (
                <MinusCircle size={16} className="text-ink-faint mt-0.5 shrink-0" />
              )}
              <span><AutoLink text={roamed ? ROW1_ROAMED : ROW1_SAME} /></span>
            </div>
          </div>
        </div>

        <div className="rounded-md p-4 border border-line-soft bg-bg-deep">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint mb-2">QUIC (UDP)</div>
          <div className="font-mono text-[12.5px] text-ink mb-1.5">
            {addr.srcIp}:{addr.srcPort} → {DEST.ip}:{DEST.port} · UDP
          </div>
          <div className="font-mono text-[12.5px] text-accent mb-3">
            Connection ID: {QUIC_CONNECTION_ID}
          </div>
          <div
            className={clsx(
              'rounded-md px-3 py-2.5 border text-[13px]',
              roamed ? 'border-accent bg-accent/10 text-ink' : 'border-transparent text-ink-dim'
            )}
          >
            <div className="flex items-start gap-2">
              {roamed ? (
                <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
              ) : (
                <MinusCircle size={16} className="text-ink-faint mt-0.5 shrink-0" />
              )}
              <span><AutoLink text={roamed ? ROW2_ROAMED : ROW2_SAME} /></span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-ink-faint text-[12.5px] mb-4">{CAVEAT}</p>

      <p className="text-ink-dim text-[14.5px]">
        <AutoLink text={CLOSING} />
      </p>
    </Card>
  );
}
