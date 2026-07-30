import { useState } from 'react';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';
import { CERT_DATA, CERT_LIFECYCLE_BRIDGE, CERT_LIFECYCLE_SECTIONS, CERT_LIFECYCLE_CLOSING, CERT_CHAIN_BRIDGE, CERT_CHAIN_SECTIONS, type CertTab } from '../../data/certificates';
import { CertificateFieldDecoder } from './CertificateFieldDecoder';
import { VerificationWalkthrough } from './VerificationWalkthrough';
import { ChainOfTrustDiagram } from './ChainOfTrustDiagram';

const TAB_OPTIONS: { value: CertTab; label: string }[] = [
  { value: 'forward', label: 'Forward proxy' },
  { value: 'inbound', label: 'Inbound inspection' },
  { value: 'vpn', label: 'VPN' },
];

export function CertificateTabs() {
  const [tab, setTab] = useState<CertTab>('forward');
  const data = CERT_DATA[tab];

  return (
    <ChapterPage title="Certificate reference">
      <SectionHead eyebrow="Reference" title="The same certificate concept, three different jobs">
        A certificate isn't one thing used one way. Where it sits and who holds the private key changes
        completely depending on whether the firewall is watching outbound browsing, protecting an inbound
        server, or authenticating a VPN tunnel.
      </SectionHead>
      <Card>
        <Toggle options={TAB_OPTIONS} value={tab} onChange={setTab} />
        <div className="mt-6">
          <div className="flex items-center gap-2.5 flex-wrap font-mono text-[11px] text-ink-faint mb-5">
            {data.flow.map((n, idx) => (
              <span key={n}>
                <span className="border border-line rounded-md px-3 py-1.5 text-ink-dim">{n}</span>
                {idx < data.flow.length - 1 && ' → '}
              </span>
            ))}
          </div>
          <h4 className="font-sans font-semibold text-lg mb-3">
            <AutoLink text={data.title} />
          </h4>
          <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2.5 list-disc marker:text-line">
            {data.points.map((p, idx) => (
              <li key={idx}>
                {p.strong && <strong className="text-ink">{p.strong} </strong>}
                <AutoLink text={p.text} />
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <p className="text-ink-dim text-[14.5px] mt-6 mb-5 max-w-[70ch]">
        <AutoLink text={CERT_CHAIN_BRIDGE} />
      </p>

      {CERT_CHAIN_SECTIONS.map((section) => (
        <Card key={section.heading} className="mb-5">
          <h3 className="font-sans font-semibold text-base mb-2">
            <AutoLink text={section.heading} />
          </h3>
          <p className="text-ink-dim text-[14.5px] mb-2.5">
            <AutoLink text={section.intro} />
          </p>
          <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2.5 list-disc marker:text-line">
            {section.points.map((p, idx) => (
              <li key={idx}>
                {p.strong && <strong className="text-ink">{p.strong} </strong>}
                <AutoLink text={p.text} />
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <ChainOfTrustDiagram />

      <p className="text-ink-dim text-[14.5px] mt-6 mb-5 max-w-[70ch]">
        <AutoLink text={CERT_LIFECYCLE_BRIDGE} />
      </p>

      {CERT_LIFECYCLE_SECTIONS.map((section) => (
        <Card key={section.heading} className="mb-5">
          <h3 className="font-sans font-semibold text-base mb-2">
            <AutoLink text={section.heading} />
          </h3>
          <p className="text-ink-dim text-[14.5px] mb-2.5">
            <AutoLink text={section.intro} />
          </p>
          <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2.5 list-disc marker:text-line">
            {section.points.map((p, idx) => (
              <li key={idx}>
                {p.strong && <strong className="text-ink">{p.strong} </strong>}
                <AutoLink text={p.text} />
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <p className="text-ink-faint text-[13.5px] mt-2 mb-7">
        <AutoLink text={CERT_LIFECYCLE_CLOSING} />
      </p>

      <CertificateFieldDecoder />
      <VerificationWalkthrough />
    </ChapterPage>
  );
}
