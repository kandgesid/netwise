import { useState } from 'react';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';
import { GLOSSARY, type GlossaryCategory } from '../../data/glossary';

const CAT_OPTIONS: { value: GlossaryCategory; label: string }[] = [
  { value: 'firewall', label: 'Firewall basics' },
  { value: 'tls', label: 'Certificates & TLS' },
  { value: 'vpn', label: 'VPN' },
  { value: 'zerotrust', label: 'Zero Trust' },
];

export function Glossary() {
  const [cat, setCat] = useState<GlossaryCategory>('firewall');
  const entries = GLOSSARY[cat];

  return (
    <ChapterPage title="Glossary">
      <SectionHead eyebrow="Reference" title="Terminology, in plain terms">
        The same words come up constantly once you're actually reading firewall configs. No definitions
        written to impress, just what each term means and why it exists.
      </SectionHead>
      <Card>
        <Toggle options={CAT_OPTIONS} value={cat} onChange={setCat} />
        <ul className="mt-6">
          {entries.map((entry, idx) => (
            <li
              key={entry.term}
              className={`py-3.5 ${idx < entries.length - 1 ? 'border-b border-line-soft' : ''}`}
            >
              <div className="font-mono text-sm text-accent mb-1">{entry.term}</div>
              <div className="text-ink-dim text-[14.5px]">
                <AutoLink text={entry.def} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </ChapterPage>
  );
}
