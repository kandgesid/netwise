import { Terminal, ShieldCheck, BookOpen, type LucideIcon } from 'lucide-react';

// One icon per tool route, shared between ToolCard (home grid) and the
// Sidebar's Tools group, so a tool reads as "a utility" (icon + neutral tag)
// at a glance, distinct from a numbered, accent-tagged course chapter.
export const TOOL_ICONS: Record<string, LucideIcon> = {
  '/sandbox': Terminal,
  '/certificates': ShieldCheck,
  '/glossary': BookOpen,
};
