import { Fragment } from 'react';
import { ACRONYMS } from '../data/acronyms';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ACRONYM_KEYS = Object.keys(ACRONYMS)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp);

const ACRONYM_REGEX = new RegExp(`\\b(${ACRONYM_KEYS.join('|')})\\b`, 'g');

/**
 * Renders a plain string, but wraps any known acronym (see data/acronyms.ts)
 * in a hoverable/focusable tooltip showing what it stands for.
 * Use this anywhere body copy is rendered instead of a raw string.
 */
export function AutoLink({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  ACRONYM_REGEX.lastIndex = 0;

  while ((match = ACRONYM_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const term = match[0];
    parts.push(
      <span className="acr" tabIndex={0} key={`acr-${key++}`}>
        {term}
        <span className="acr-tip">{ACRONYMS[term]}</span>
      </span>
    );
    lastIndex = match.index + term.length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return <>{parts}</>;
}
