# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Netwise is an interactive, simulation-based learning environment for network and security fundamentals: seven narrative chapters (firewall basics → what a firewall does → SSL/TLS handshake → key exchange & cipher suites → decryption policies → forward proxy deep dive → Zero Trust), a hands-on firewall rule sandbox, a certificate-use-case reference, and a searchable glossary with hover tooltips on every acronym. It's a routed multi-page site (`react-router-dom`, `HashRouter`) — a hub/landing page at `/` links out to one route per chapter/tool, each rendered inside a persistent shell with a collapsible sidebar. See "Routing & page structure" below.

## Commands

```bash
npm install
npm run dev        # Vite dev server, usually http://localhost:5173
npm run build       # tsc -b && vite build (type-checks, then bundles)
npm run preview     # serve the production build locally
npm run lint         # oxlint
```

There is no test suite/framework configured in this repo.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 for styling — theme tokens live in `src/index.css`; there is no `tailwind.config.js` (not needed with v4's Vite plugin)
- Framer Motion for animation (Hero schematic, Chapter 1 checkpoint viz, Chapter 3 handshake stepper)
- react-router-dom (`HashRouter`) for routing — chosen over `BrowserRouter` because no hosting/deployment target is fixed yet; hash routing works on any static host with zero server config and is a one-line swap to `BrowserRouter` later
- lucide-react for icons, clsx for conditional classNames
- oxlint (not eslint) for linting, configured in `.oxlintrc.json`

## Architecture

**Content lives separately from presentation.** Everything a chapter says lives in `src/data/*.ts` as plain TypeScript objects/arrays; components in `src/components/` just render that data. When changing copy or adding scenarios/steps/glossary entries, edit the data file, not the component, unless the layout itself needs to change:

- `data/acronyms.ts` — acronym → full name dictionary, powers tooltips everywhere
- `data/handshakeSteps.ts` — the 3-mode handshake stepper (Chapter 3)
- `data/cipherSuite.ts` — cipher suite decoder chips (Chapter 4)
- `data/certificates.ts` — certificate tab content (Certificates tool)
- `data/glossary.ts` — glossary entries, grouped by category
- `data/sandboxScenarios.ts` — firewall rule options & test-traffic scenarios (Sandbox)

**Acronym tooltips are automatic, not manual.** Any body copy that might contain a known acronym should be rendered via `<AutoLink text={...} />` (`src/lib/autoLink.tsx`) instead of a raw string — it regex-matches against `ACRONYMS` from `data/acronyms.ts` and wraps matches in a hoverable/focusable tooltip. Adding a new acronym is a one-line addition to that dictionary; no component wiring needed.

## Routing & page structure

`src/routes.tsx` is the single source of truth for every page. It exports a `ROUTES` array of `RouteEntry` objects (`{ path, navLabel, description, group: 'course' | 'tools', order, chapterNumber?, element }`), plus `COURSE_ROUTES`/`TOOL_ROUTES`, the same array pre-filtered and sorted. `src/App.tsx` just maps `ROUTES` into a `<Routes>` tree nested inside `AppShell`; the sidebar (`Sidebar.tsx`), the home page's card grid (`pages/Home.tsx`), and each chapter's prev/next footer (`ChapterPage.tsx`) all derive their content from that same array — nothing else needs to change per page.

`AppShell.tsx` (logo top bar + collapsible sidebar + `<Outlet />` + footer) is what every routed page mounts inside. The sidebar is a normal in-flow column on desktop and an off-canvas drawer on mobile (toggled by the top bar's hamburger button); it's hidden entirely on the home page.

**Adding a new chapter or tool is mechanical by design:**
1. Add a data file under `src/data/` if it needs its own content.
2. Create `src/components/chapters/Chapter8Whatever.tsx` (or a tool under `components/sandbox`/`components/reference`), using an existing chapter (e.g. `Chapter5DecryptionPolicies.tsx`) as a template. Wrap the returned JSX in `<ChapterPage title="...">...</ChapterPage>` instead of a raw `<section>` — `ChapterPage` owns the container styling, the page-title side effect, the "Chapter N of M" indicator, and the prev/next footer (computed automatically from `routes.tsx`).
3. Add one entry to the `ROUTES` array in `src/routes.tsx`. That's the only other file that needs a change — it shows up in the sidebar, the home page, and prev/next automatically.
4. For a heavy chapter (4+ `<Card>` sections), optionally add a `<ChapterTOC items={[...]} />` right after `<SectionHead>` and give each `<Card>` a matching `id` prop — see `Chapter3Handshake.tsx` for the pattern.

**Component directories:**
- `components/ui/` — reusable primitives (Card, Button, Toggle, SectionHead, ChapterTOC)
- `components/layout/` — AppShell, Sidebar, Header (slim top bar), ChapterPage, Footer
- `components/home/` — ChapterCard (hub page grid)
- `components/chapters/` — one component per chapter, plus chapter-specific visualizations (FirewallCheckpointViz, HandshakeStepper, CipherDecoder, SinglePassViz, SessionTrackingViz, ContinuousVerificationViz, TrustSignalsViz)
- `components/sandbox/` — the rule-builder + test-traffic Sandbox
- `components/reference/` — CertificateTabs, CertificateFieldDecoder, VerificationWalkthrough, Glossary
- `pages/` — top-level route components that aren't chapters/tools (currently just `Home.tsx`, the hub page)

## Design system

The theme is a **tempered cybersecurity terminal** look, not full neon-on-black — this was a deliberate, research-backed choice (color psychology / dark-mode reading fatigue / halation risk on pure neon), not a stylistic default, so don't casually brighten it back toward `#00FF41`-on-`#000000`. All color tokens live in the `@theme` block in `src/index.css` and are consumed exclusively through Tailwind utility classes (`bg-accent`, `text-danger`, `border-line`, etc.) — there are no hardcoded hex values anywhere in `src/`, so a re-theme only ever means editing the token values in `index.css`.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#0B1220` | Page background |
| `--color-bg-deep` | `#060A12` | Deepest surfaces; also "on-accent" text color for primary buttons |
| `--color-panel` / `--color-panel-2` | `#101826` / `#16202F` | Card/panel surfaces |
| `--color-ink` / `-dim` / `-faint` | `#E5EDF5` / `#B8C4D4` / `#94A3B8` | Text hierarchy |
| `--color-line` / `-soft` | `#27324A` / `#1B2537` | Borders |
| `--color-accent` / `-dim` | `#22C55E` / `#16A34A` | Primary/CTA green + hover state |
| `--color-success` | `#22C55E` | Same hue as accent — "allowed" traffic and primary actions intentionally share the same green |
| `--color-danger` | `#EF4444` | Errors, blocked traffic — reserved for that meaning only |

Fonts stay `JetBrains Mono` (headings/code) + `Inter` (body) — a swap to IBM Plex Sans was considered and rejected (no comprehension gain, since disambiguation only matters in code contexts that already render in JetBrains Mono).

**Motion is intentionally split in two tiers**, also research-backed (decorative animation raises extraneous cognitive load during learning; diegetic/feedback-tied animation doesn't):
- Everywhere else: keep the existing restrained Framer Motion style. Don't add typing-reveal effects, cursor blinks, or other decoration to chapter content.
- The Sandbox (`src/components/sandbox/Sandbox.tsx`) is the one exception — its test-traffic results render as an accumulating terminal-style log (`log: LogEntry[]`, auto-scrolling, timestamped, with a blinking `.cursor-blink` prompt) because that motion *is* the simulation's feedback, not decoration. If you extend the Sandbox, keep new feedback in that console rather than adding a separate static result box. `.cursor-blink` respects `prefers-reduced-motion` in `src/index.css` — preserve that if you touch it.

A UI/UX design-intelligence skill is installed at `.claude/skills/ui-ux-pro-max/` (vendored from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT-licensed, see `LICENSE.txt` inside that folder) — use its `scripts/search.py` for color/typography/UX/motion lookups before making design decisions rather than guessing.

## Open source

This project is MIT-licensed (`LICENSE`) and set up for outside contributions — see `CONTRIBUTING.md` for the contributor-facing setup/workflow guide (don't duplicate its content here), `.github/ISSUE_TEMPLATE/` for bug/content-proposal templates, and `.github/PULL_REQUEST_TEMPLATE.md` for the PR checklist.
