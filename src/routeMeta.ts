// Route metadata only — deliberately has zero component imports. routes.tsx
// (which does import every chapter/tool component) attaches `element` to
// this data for the <Routes> table. Anything that only needs path/label/
// description/order (Sidebar, Home, ChapterPage, useReadingProgress) should
// import from here, not from routes.tsx — importing routes.tsx from a file
// that ChapterPage.tsx itself depends on creates a circular import, since
// every chapter component imports ChapterPage.
export interface RouteMeta {
  path: string;
  navLabel: string;
  description: string;
  group: 'course' | 'tools';
  order: number;
  chapterNumber?: number;
}

// Add a new chapter: create the component (its own file, wrapped in
// <ChapterPage title="...">), then add one entry here and one line in
// routes.tsx pairing this path to that component. It shows up in the
// sidebar, the home page's course grid, and prev/next navigation
// automatically — no other file needs to change.
export const ROUTE_META: RouteMeta[] = [
  {
    path: '/chapters/firewall',
    navLabel: 'Firewall',
    description: "What a firewall actually is, and the three jobs it plays depending on which way traffic is going.",
    group: 'course',
    order: 1,
    chapterNumber: 1,
  },
  {
    path: '/chapters/what-it-does',
    navLabel: 'What it does',
    description: 'Encryption, decryption, and why almost nothing today is inspectable without dealing with TLS first.',
    group: 'course',
    order: 2,
    chapterNumber: 2,
  },
  {
    path: '/chapters/handshake',
    navLabel: 'Handshake',
    description: 'Step through the SSL/TLS handshake, single-pass inspection, forward-proxy MITM, and Encrypted Client Hello.',
    group: 'course',
    order: 3,
    chapterNumber: 3,
  },
  {
    path: '/chapters/key-exchange',
    navLabel: 'Key exchange',
    description: 'Key exchange groups, cipher suites, forward secrecy, and what post-quantum key exchange changes.',
    group: 'course',
    order: 4,
    chapterNumber: 4,
  },
  {
    path: '/chapters/policies',
    navLabel: 'Policies',
    description: 'How a decryption policy decides Decrypt, No decrypt, or Bypass — first match wins, same as Chapter 1.',
    group: 'course',
    order: 5,
    chapterNumber: 5,
  },
  {
    path: '/chapters/forward-proxy',
    navLabel: 'Forward proxy',
    description: 'What it actually takes to deploy forward proxy, plus how QUIC and HTTP/3 change the picture.',
    group: 'course',
    order: 6,
    chapterNumber: 6,
  },
  {
    path: '/chapters/key-protection',
    navLabel: 'Key protection',
    description: "Why the keys a firewall now holds, the forward-trust CA and the server's own signing key, are worth protecting as hard as anything they protect — HSMs, master-key encryption, and short-lived certificates, and what hardware, software, and cloud form factors each change about that.",
    group: 'course',
    order: 7,
    chapterNumber: 7,
  },
  {
    path: '/chapters/zero-trust',
    navLabel: 'Zero Trust',
    description: 'What changes once being inside a zone stops being proof of anything by itself.',
    group: 'course',
    order: 8,
    chapterNumber: 8,
  },
  {
    path: '/sandbox',
    navLabel: 'Sandbox',
    description: 'Build a firewall rule, choose Allow or Block, and send test traffic through it yourself.',
    group: 'tools',
    order: 1,
  },
  {
    path: '/certificates',
    navLabel: 'Certificates',
    description: 'The same certificate concept across forward proxy, inbound inspection, and VPN, plus field and chain decoders.',
    group: 'tools',
    order: 2,
  },
  {
    path: '/glossary',
    navLabel: 'Glossary',
    description: 'Every term this site uses, defined plainly, grouped by firewall basics, TLS, VPN, and Zero Trust.',
    group: 'tools',
    order: 3,
  },
];

export const COURSE_ROUTES = ROUTE_META.filter((r) => r.group === 'course').sort((a, b) => a.order - b.order);
export const TOOL_ROUTES = ROUTE_META.filter((r) => r.group === 'tools').sort((a, b) => a.order - b.order);
