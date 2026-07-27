# Netwise

An interactive, simulation-based learning environment for network and security
fundamentals. Six narrative chapters (firewall basics → SSL/TLS handshake →
key exchange & cipher suites → decryption policies → forward proxy deep dive),
a hands-on firewall rule sandbox, a certificate-use-case reference, and a
searchable glossary with hover tooltips on every acronym.

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview   # serves the built output locally
```

## Project structure

```
src/
  data/                   All content lives here, as plain TypeScript objects.
    acronyms.ts             The acronym → full-name dictionary (see below).
    handshakeSteps.ts        The 3-mode handshake stepper (Chapter 3).
    cipherSuite.ts            Cipher suite decoder chips (Chapter 4).
    certificates.ts           Certificate tab content (Reference).
    glossary.ts               Glossary entries, grouped by category.
    sandboxScenarios.ts       Rule options & test-traffic scenarios (Practice).

  lib/
    autoLink.tsx            Wraps any acronym in body text with a hover tooltip.
                            Use <AutoLink text={...} /> wherever you render
                            copy that might contain an acronym.

  components/
    ui/                     Reusable primitives: Card, Button, Toggle, SectionHead.
    layout/                 Header (nav) and Footer.
    chapters/               One component per chapter (Chapter1Firewall.tsx, etc.)
    sandbox/                The rule-builder + test-traffic Sandbox.
    reference/              CertificateTabs and Glossary.

  App.tsx                  The entire page is just this list, in order.
```

## How to add a new chapter later

This was built so "add a Chapter 7" is a small, mechanical change, not a
scavenger hunt through one giant file:

1. If it needs its own content data (like the handshake steps or cipher
   suite parts do), add a file under `src/data/`.
2. Create the component under `src/components/chapters/Chapter7Whatever.tsx`.
   Use an existing chapter (e.g. `Chapter5DecryptionPolicies.tsx`) as a
   template: `<SectionHead>` for the intro, `<Card>` for content blocks,
   `<AutoLink text={...} />` anywhere the copy might contain an acronym.
3. Add one line to `src/App.tsx` to render it in place.
4. Add one line to the `NAV_LINKS` array in
   `src/components/layout/Header.tsx` so it shows up in the header nav.

## Adding a new acronym tooltip

Add one line to the `ACRONYMS` dictionary in `src/data/acronyms.ts`:

```ts
NGFW: 'Next-Generation Firewall',
```

It will automatically get a hover tooltip everywhere it appears in any
`<AutoLink>`-wrapped text, no further wiring needed.

## Why the nav scrolling works now

Every section that's a nav target has `scroll-margin-top` set via the
`section[id]` rule in `src/index.css`. Without it, the sticky header
covers the top of whatever section a nav link jumps to, which is why
clicking a nav link in the old single-file prototype looked like it did
nothing. If you add a section whose header height changes, adjust that
value to match.

## Stack

- **Vite + React + TypeScript** for the app itself
- **Tailwind CSS v4** for styling (theme tokens defined in `src/index.css`,
  no separate config file needed with v4)
- **Framer Motion** for the animated schematic (Hero) and packet animations
  (Chapter 1 checkpoint viz, Chapter 3 handshake stepper)
- **lucide-react** available for icons if you want to add any
- **clsx** for conditional class names
