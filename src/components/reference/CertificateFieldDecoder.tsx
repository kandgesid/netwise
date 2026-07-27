import { useState } from 'react';
import clsx from 'clsx';
import { Card } from '../ui/Card';
import { AutoLink } from '../../lib/autoLink';
import { CERT_PREVIEW, CERT_FIELDS } from '../../data/certificateFields';

/**
 * Certificate Field Decoder — adapts CipherDecoder's chip-click pattern (see
 * src/components/chapters/CipherDecoder.tsx) to a fictional leaf certificate. A static preview
 * block shows the whole certificate first, then chips (one per field) drive an explainer panel
 * below. See docs/integration/phase-1-certificates/simulation-design.md §1.
 */
export function CertificateFieldDecoder() {
  const [active, setActive] = useState(0);
  const field = CERT_FIELDS[active];

  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-1">Decode a certificate</h3>
      <p className="text-ink-dim text-[14.5px] mb-4.5">
        Here's a fictional but realistically-shaped leaf certificate for{' '}
        <span className="font-mono text-ink">portal.netwise-example.test</span>, signed by a fictional
        intermediate CA. Every field below is doing a specific job. Click one to see what it actually says.
      </p>
      <pre className="rounded-md border border-line-soft bg-bg-deep p-3.5 mb-4.5 font-mono text-[12px] leading-relaxed text-ink-dim overflow-x-auto whitespace-pre">
        {CERT_PREVIEW}
      </pre>
      <div className="flex gap-2 flex-wrap mb-4.5 font-mono">
        {CERT_FIELDS.map((f, idx) => (
          <button
            key={f.id}
            onClick={() => setActive(idx)}
            className={clsx(
              'bg-bg-deep border rounded-sm px-3.5 py-2 text-[13px] transition-colors',
              active === idx ? 'border-accent text-accent bg-accent/10' : 'border-line text-ink-dim hover:border-accent hover:text-ink'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="border border-line-soft rounded-md p-3.5">
        <div className="font-mono text-[12.5px] text-accent mb-2.5 break-all">{field.value}</div>
        <div className="text-sm text-ink-dim">
          <AutoLink text={field.text} />
        </div>
      </div>
    </Card>
  );
}
