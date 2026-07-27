import { useState } from 'react';
import clsx from 'clsx';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';
import { CIPHER_PARTS } from '../../data/cipherSuite';

type KeyExchangeMode = 'classical' | 'hybrid';
const KEY_EXCHANGE_MODE_OPTIONS: { value: KeyExchangeMode; label: string }[] = [
  { value: 'classical', label: 'Classical' },
  { value: 'hybrid', label: 'Hybrid (post-quantum)' },
];

export function CipherDecoder() {
  const [active, setActive] = useState(0);
  const [kexMode, setKexMode] = useState<KeyExchangeMode>('classical');

  const hybridActive = active === 0 && kexMode === 'hybrid';
  const explainerText = hybridActive && CIPHER_PARTS[0].hybridText
    ? CIPHER_PARTS[0].hybridText
    : CIPHER_PARTS[active].text;

  return (
    <Card>
      <h3 className="font-sans font-semibold text-base mb-1">Decode a cipher suite</h3>
      <p className="text-ink-dim text-[14.5px] mb-4.5">
        A cipher suite name looks cryptic, but it's really just four separate questions about the same
        connection, answered once each and bundled into one string: how do we agree on a secret, who's
        really on the other end, what actually encrypts the data, and how do we know it wasn't tampered
        with. This four-part format is the classic, TLS 1.2-style way of writing it, and it's still what
        most firewall and decryption tooling displays, even though TLS 1.3 negotiates these same four
        decisions separately instead of bundling them into one name. Click each piece to see which question
        it answers.
      </p>
      <div className="flex gap-2 flex-wrap mb-4.5 font-mono">
        {CIPHER_PARTS.map((part, idx) => {
          const showHybrid = idx === 0 && kexMode === 'hybrid';
          const chipLabel = showHybrid && part.hybridCode ? part.hybridCode : part.code;
          return (
            <button
              key={part.code}
              onClick={() => setActive(idx)}
              className={clsx(
                'bg-bg-deep border rounded-sm px-3.5 py-2 text-[13px] transition-colors',
                active === idx ? 'border-accent text-accent bg-accent/10' : 'border-line text-ink-dim hover:border-accent hover:text-ink'
              )}
            >
              {chipLabel}
            </button>
          );
        })}
      </div>
      {active === 0 && (
        <div className="mb-4.5 pl-3 border-l border-line-soft max-w-[220px]">
          <label className="block font-mono text-[10.5px] text-ink-faint mb-1">
            Key exchange algorithm
          </label>
          <Toggle options={KEY_EXCHANGE_MODE_OPTIONS} value={kexMode} onChange={setKexMode} />
        </div>
      )}
      <div className="border border-line-soft rounded-md p-3.5 text-sm text-ink-dim">
        <AutoLink text={explainerText} />
        {hybridActive && (
          <div className="mt-2 font-mono text-xs text-ink-faint">Wire format: X25519MLKEM768</div>
        )}
      </div>
    </Card>
  );
}
