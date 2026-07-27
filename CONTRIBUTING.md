# Contributing to Netwise

Netwise is an interactive, simulation-based learning site for network and
security fundamentals. The most valuable contributions are new chapters,
glossary entries, and content corrections from people who know this domain —
you don't need to be deeply familiar with the codebase to contribute
meaningfully.

## Getting set up

```bash
npm install
npm run dev        # Vite dev server, usually http://localhost:5173
```

Before opening a PR, make sure both of these pass:

```bash
npm run lint        # oxlint
npm run build        # tsc -b && vite build — type-checks, then bundles
```

There is no test suite configured in this repo, so `lint` + `build` +
manually checking the page in the dev server is the whole verification loop.

## How the project is organized

The core idea: **content lives separately from presentation.** Everything a
chapter says lives in `src/data/*.ts` as plain TypeScript objects/arrays;
components in `src/components/` just render that data. If you're only
changing copy or adding scenarios/steps/glossary entries, you should only
need to touch a file under `src/data/`, not a component.

- `src/data/acronyms.ts` — acronym → full name dictionary, powers tooltips everywhere
- `src/data/handshakeSteps.ts` — the 3-mode handshake stepper (Chapter 3)
- `src/data/cipherSuite.ts` — cipher suite decoder chips (Chapter 4)
- `src/data/certificates.ts` — certificate tab content (Certificates tool)
- `src/data/glossary.ts` — glossary entries, grouped by category
- `src/data/sandboxScenarios.ts` — firewall rule options & test-traffic scenarios (Sandbox)

Component directories:

- `src/components/ui/` — reusable primitives (`Card`, `Button`, `Toggle`, `SectionHead`, `ChapterTOC`)
- `src/components/layout/` — `AppShell`, `Sidebar`, `Header` (slim top bar), `ChapterPage`, `Footer`
- `src/components/home/` — `ChapterCard` (hub page grid)
- `src/components/chapters/` — one component per chapter, plus chapter-specific
  visualizations (`FirewallCheckpointViz`, `HandshakeStepper`, `CipherDecoder`, and others)
- `src/components/sandbox/` — the rule-builder + test-traffic Sandbox
- `src/components/reference/` — `CertificateTabs` and `Glossary`
- `src/pages/` — top-level route components that aren't chapters/tools (currently just `Home.tsx`)

Netwise is a routed multi-page site (`react-router-dom`, `HashRouter`), not a
single scrolling page. `src/routes.tsx` is the one file that lists every
page — see the recipe below.

## Recipe: adding a new chapter or tool

This is the main way the project is expected to grow, and it's designed to
be a small, mechanical change:

1. If the chapter needs its own structured content (like the handshake steps
   or cipher suite parts do), add a data file under `src/data/`.
2. Create `src/components/chapters/Chapter8Whatever.tsx`. Use an existing
   chapter as a template — `src/components/chapters/Chapter5DecryptionPolicies.tsx`
   is a good simple one to copy from. Use `<SectionHead>` for the intro,
   `<Card>` for content blocks, and `<AutoLink text={...} />` (see below) for
   any copy that might contain an acronym. Wrap the whole thing in
   `<ChapterPage title="Chapter 8: Whatever">...</ChapterPage>` instead of a
   raw `<section>` — it owns the container styling, the page title, the
   "Chapter N of M" indicator, and the prev/next footer, all computed
   automatically from `src/routes.tsx`.
3. Add one entry to the `ROUTES` array in `src/routes.tsx` (`path`,
   `navLabel`, a one-line `description` for its hub-page card, `group:
   'course'`, and the next `order`/`chapterNumber`). That's the only other
   file that needs a change — it now appears in the sidebar, the home page's
   course grid, and prev/next navigation automatically.
4. Optional, for a heavy chapter (4+ `<Card>` sections): add
   `<ChapterTOC items={[{ id: 'foo', label: 'Foo' }, ...]} />` right after
   `<SectionHead>`, and give each `<Card>` a matching `id` prop. See
   `Chapter3Handshake.tsx` for a worked example.

A new **tool** (not part of the chapter sequence, like Sandbox/Certificates/
Glossary) follows the same shape but goes under `src/components/<area>/`
instead of `chapters/`, and its `ROUTES` entry uses `group: 'tools'` and no
`chapterNumber`.

Content-only PRs (fixing wording, correcting a technical detail, expanding an
explanation) are welcome and don't need to follow the full "new chapter"
recipe — just edit the relevant file under `src/data/` or the relevant
chapter component's inline copy.

## Recipe: adding an acronym / glossary entry

These are two different things and both are easy one-line additions:

**Acronym tooltip** (hover/focus tooltip anywhere the acronym appears in
`<AutoLink>`-wrapped copy): add one line to the `ACRONYMS` dictionary in
`src/data/acronyms.ts`:

```ts
NGFW: 'Next-Generation Firewall',
```

No component wiring needed — it's picked up automatically everywhere.

**Glossary entry** (shown in the searchable Glossary reference section): add
an entry to the relevant category array in `src/data/glossary.ts`:

```ts
{ term: 'Zone', def: 'A named grouping of interfaces the firewall uses to define what counts as "inside" versus "outside" for policy purposes.' },
```

Categories currently are `firewall`, `tls`, `vpn`, and `zerotrust`. If your
entry doesn't fit an existing category, propose a new one in your PR
description rather than jamming it into the closest match.

## Coding conventions

These aren't formally enforced beyond `oxlint`, but they're consistent
throughout the codebase and PRs should follow them:

- **Functional components only**, written in TypeScript. No class components.
- **Tailwind utility classes** for styling, directly in JSX `className`
  props. Theme tokens (colors, etc.) live in `src/index.css` — there's no
  `tailwind.config.js` (not needed with Tailwind v4's Vite plugin). Avoid
  introducing new one-off colors; use the existing tokens.
- **`clsx`** for any conditional class names, rather than manual string
  concatenation or ternaries in `className`.
- **`<AutoLink text={...} />`** (`src/lib/autoLink.tsx`) for any body copy
  that might contain a known acronym, instead of rendering a raw string. It
  regex-matches against `ACRONYMS` and wraps matches in a hoverable/focusable
  tooltip automatically.
- Keep copy and layout data in `src/data/*.ts`, not hardcoded inside JSX,
  when a component already follows that pattern.
- Match the existing file's formatting rather than introducing a new style
  (indentation, quote style, etc. are consistent with the surrounding file).

## Proposing a change

1. Fork the repo and create a branch off `main` named something descriptive,
   e.g. `chapter/nat-traversal`, `content/glossary-vpn-fixes`,
   `fix/handshake-typo`.
2. Make your change, following the recipes above.
3. Run `npm run lint` and `npm run build` locally and confirm both pass.
4. Open a PR using the pull request template. Keep PRs focused — one chapter
   or one topic per PR is easier to review than a bundle of unrelated
   changes.
5. Be responsive to review feedback. Since this is a small project without a
   dedicated review team, turnaround may not be immediate — that's not a
   reflection of the contribution's value.

There is currently no CI pipeline configured on this repo, so `lint` and
`build` passing locally, plus a working `npm run dev` check, is what
reviewers will expect you to have done before requesting review.

## Where to ask questions

Open a [GitHub Issue](../../issues) or start a
[GitHub Discussion](../../discussions) if Discussions is enabled on this
repo. There's no other project channel (no Discord/Slack/mailing list) at
this time.

If you're proposing a new chapter or content addition and want feedback on
the idea before writing code, open an issue using the "Chapter / content
proposal" template first.
