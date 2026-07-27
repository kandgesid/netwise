// Add a new chapter link here and it shows up in the nav automatically.
// Chapter numbering shows up as the in-page "Chapter N" eyebrow instead of
// here, so labels stay short enough for the nav to fit without scrolling.
const NAV_LINKS = [
  { href: '#ch1', label: 'Firewall' },
  { href: '#ch2', label: 'What it does' },
  { href: '#ch3', label: 'Handshake' },
  { href: '#ch4', label: 'Key exchange' },
  { href: '#ch5', label: 'Policies' },
  { href: '#ch6', label: 'Forward proxy' },
  { href: '#ch7', label: 'Zero Trust' },
  { href: '#sandbox', label: 'Sandbox' },
  { href: '#reference', label: 'Reference' },
  { href: '#glossary', label: 'Glossary' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-bg-deep/85 border-b border-line-soft">
      <div className="max-w-[1080px] mx-auto px-8 h-[60px] flex items-center justify-between gap-6">
        <div className="font-mono font-bold text-[17px] flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 bg-accent rounded-sm inline-block" />
          NETWISE
          <span className="font-mono text-[10px] tracking-wide text-ink-faint border border-line rounded-sm px-1.5 py-0.5 uppercase">
            Simulation
          </span>
        </div>
        <nav className="no-scrollbar flex gap-3 text-[13px] text-ink-dim overflow-x-auto whitespace-nowrap">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm px-0.5 py-1 hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
