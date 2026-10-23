interface TOCItem {
  id: string;
  label: string;
}

export function ChapterTOC({ items }: { items: TOCItem[] }) {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className="flex flex-wrap gap-2 mb-8" aria-label="On this page">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => scrollToSection(item.id)}
          className="font-mono text-[11.5px] text-ink-dim border border-line-soft rounded-sm px-2.5 py-1 hover:text-accent hover:border-accent transition-colors"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
