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
- `src/data/certificates.ts` — certificate tab content (Reference section)
- `src/data/glossary.ts` — glossary entries, grouped by category
- `src/data/sandboxScenarios.ts` — firewall rule options & test-traffic scenarios (Sandbox)

Component directories:

- `src/components/ui/` — reusable primitives (`Card`, `Button`, `Toggle`, `SectionHead`)
- `src/components/layout/` — `Header` (nav) and `Footer`
- `src/components/chapters/` — one component per chapter, plus chapter-specific
  visualizations (`FirewallCheckpointViz`, `HandshakeStepper`, `CipherDecoder`)
- `src/components/sandbox/` — the rule-builder + test-traffic Sandbox
- `src/components/reference/` — `CertificateTabs` and `Glossary`

`src/App.tsx` renders the whole page as one flat list of section components,
in order.

## Recipe: adding a new chapter

This is the main way the project is expected to grow, and it's designed to
be a small, mechanical change:

1. If the chapter needs its own structured content (like the handshake steps
   or cipher suite parts do), add a data file under `src/data/`.
2. Create `src/components/chapters/Chapter7Whatever.tsx`. Use an existing
   chapter as a template — `src/components/chapters/Chapter5DecryptionPolicies.tsx`
   is a good simple one to copy from. Use `<SectionHead>` for the intro,
   `<Card>` for content blocks, and `<AutoLink text={...} />` (see below) for
   any copy that might contain an acronym. Give the wrapping `<section>` a
   stable `id` (e.g. `id="ch7"`) — the header nav links to it by anchor.
3. Add one line to `src/App.tsx` to render the new component in place in the
   page list.
4. Add one line to the `NAV_LINKS` array in `src/components/layout/Header.tsx`,
   e.g. `{ href: '#ch7', label: '7. Whatever' }`, so it appears in the header nav.

If your new section's header height differs from existing ones, you may also
need to adjust the `scroll-margin-top` value on the `section[id]` rule in
`src/index.css` so the sticky header doesn't cover the section top when a nav
link jumps to it.

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

Categories currently are `firewall`, `tls`, and `vpn`. If your entry doesn't
fit an existing category, propose a new one in your PR description rather
than jamming it into the closest match.

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
