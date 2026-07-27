# Phase 1 — Certificate Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `docs/research-ideas.md` candidates #5 (short-lived certs & ACME) and #17 (root cert longevity/expiry/revocation) into the Reference → Certificates section as one cohesive content block, plus two new hands-on interactives (a certificate field decoder, and a chain-verification walkthrough), without disrupting the site's existing reading flow or voice.

**Architecture:** Same three-role analysis→approval→build pipeline used for the original six-chapter content pass: a Content & Flow Strategist and a Simulation/Interaction Designer run in parallel and each produce a planning doc; the project owner reviews and approves both; only then does an Implementer execute them against the real source files. This plan governs that whole loop for Phase 1, not just the code-writing step.

**Tech Stack:** Vite + React 19 + TypeScript + Tailwind v4 (existing app — see `CLAUDE.md`). No test framework exists in this repo; verification is `tsc -b` + `oxlint` + `vite build` + manual interaction in the running dev server.

## Global Constraints

- No new colors, fonts, or design tokens — everything themes through the existing `@theme` block in `src/index.css` (tempered-terminal palette, JetBrains Mono + Inter). See `CLAUDE.md`'s Design System section.
- **One interactive = one concept.** The field decoder and the verification walkthrough are two separate components, never merged into one widget.
- Content & Flow Strategist and Simulation/Interaction Designer are **read-only on `src/`** — they only write to `docs/integration/phase-1-certificates/`. Only the Implementer touches `src/`.
- No verbatim copying from `docs/research-ideas.md` or any external source into site copy — original phrasing only, matching the site's established voice (see `docs/content-strategy.md` for that voice's precedent).
- Any new acronym-bearing prose uses the existing `<AutoLink text={...} />` convention (`src/lib/autoLink.tsx`), and any genuinely new acronym gets added to `src/data/acronyms.ts`.
- There is no test suite in this repo (`CLAUDE.md` is explicit about this) — do not invent one. Verification is `npx tsc -b`, `npm run lint`, `npm run build`, and manual browser interaction.
- The four `NOT NOW`-marked topics in `docs/research-ideas.md` are out of scope for this and every phase.

---

### Task 1: Dispatch the Content & Flow Strategist for Phase 1

**Files:**
- Create (by the dispatched agent): `docs/integration/phase-1-certificates/content-plan.md`
- Read-only reference: `CLAUDE.md`, `docs/research-ideas.md` (entries #5, #17), `docs/content-strategy.md`, `src/components/reference/CertificateTabs.tsx`, `src/data/certificates.ts`

**Interfaces:**
- Produces: `docs/integration/phase-1-certificates/content-plan.md` — consumed by Task 3 (owner review) and Task 4 (Implementer).

- [ ] **Step 1: Launch the agent**

Use the `Agent` tool (`subagent_type: general-purpose`, `run_in_background: true`) with this prompt:

```
Project: /Users/sidkandge/Documents/Projects/netwise-project — "Netwise," an interactive Vite + React + TypeScript site teaching network/security fundamentals to complete beginners. Read /Users/sidkandge/Documents/Projects/netwise-project/CLAUDE.md first (architecture, conventions, and the site's design system).

You are the Content & Flow Strategist for Phase 1 of an ongoing content-integration effort — one of several separate agents; a Simulation/Interaction Designer is working in parallel on the same topic, and neither of you edits src/. A separate Implementer will execute your approved plan later; you do not implement anything yourself.

Read docs/research-ideas.md entries #5 ("Short-lived certificates and automated renewal (ACME)") and #17 ("Root certificate longevity and how expiry actually gets handled") in full. Read docs/content-strategy.md to learn this site's established voice and pacing conventions (it documents exactly how the existing six chapters talk to a beginner). Read src/components/reference/CertificateTabs.tsx and src/data/certificates.ts to see the current certificate reference section's structure, tone, and data shape.

Your job: plan exactly how #5 and #17 land in the existing Reference → Certificates section as ONE cohesive new content block (the research doc itself frames them as "two halves of the same story" — root certs are long-lived, leaf certs are shrinking, and revocation checking is shifting from OCSP to CRLs as a consequence). Decide: where exactly it goes (new tab in the existing CertificateTabs component? A new block below the existing tabs? Be specific and justify it against the existing component's structure), what headings/subsections it has, and full draft prose for each — written in the site's own voice, not copied or closely paraphrased from the research doc or any external source. Also specify any new glossary terms this content would need (cross-check against src/data/glossary.ts first so you don't duplicate).

You do NOT edit any file under src/. Write your complete plan to docs/integration/phase-1-certificates/content-plan.md. Structure it so the Implementer (who will only read this doc, not this conversation) can execute it without guessing: exact file(s) to touch, exact new text, exact placement.
```

- [ ] **Step 2: Confirm the agent has been launched and note its task ID for later reference**

No output check needed yet — this runs in the background alongside Task 2.

---

### Task 2: Dispatch the Simulation/Interaction Designer for Phase 1

**Files:**
- Create (by the dispatched agent): `docs/integration/phase-1-certificates/simulation-design.md`
- Read-only reference: `CLAUDE.md`, `docs/research-ideas.md` (entries #5, #17), `src/components/chapters/CipherDecoder.tsx`, `src/data/cipherSuite.ts`, `src/components/chapters/Chapter5DecryptionPolicies.tsx` (the `PolicyEvaluator` component), `src/components/sandbox/Sandbox.tsx`

**Interfaces:**
- Produces: `docs/integration/phase-1-certificates/simulation-design.md` — consumed by Task 3 (owner review) and Task 4 (Implementer).

- [ ] **Step 1: Launch the agent**

Use the `Agent` tool (`subagent_type: general-purpose`, `run_in_background: true`) with this prompt:

```
Project: /Users/sidkandge/Documents/Projects/netwise-project — "Netwise," an interactive Vite + React + TypeScript site teaching network/security fundamentals to complete beginners. Read /Users/sidkandge/Documents/Projects/netwise-project/CLAUDE.md first.

You are the Simulation/Interaction Designer for Phase 1 of an ongoing content-integration effort — the "game designer" role: you decide what's worth making interactive and spec exactly how it behaves, but you do NOT write prose and you do NOT write code. A Content & Flow Strategist is working in parallel on the actual written content for the same topic; you don't need to duplicate their job, just make sure your interaction specs know what content they're built around (read docs/research-ideas.md entries #5 and #17 for that context). A separate Implementer will build what you spec later.

Read src/components/chapters/CipherDecoder.tsx and src/data/cipherSuite.ts — this is the site's existing "click a labeled chip, see a plain-English explainer below" pattern. Read src/components/chapters/Chapter5DecryptionPolicies.tsx's PolicyEvaluator function and src/components/sandbox/Sandbox.tsx — this is the site's existing "ordered checks, pass/fail highlighting, a final result" pattern. These two patterns already exist in the codebase and are proven; your job is to adapt them, not invent a new interaction vocabulary from scratch.

Design TWO separate interactives (per this project's standing rule: one interactive = one concept, never merge multiple teaching moments into one widget):

1. A CERTIFICATE FIELD DECODER, adapting the CipherDecoder chip-click pattern to a certificate's fields (Subject, Issuer, Validity window, SAN, Public Key, Signature Algorithm, at minimum). Invent a clearly-fictional, illustrative example certificate (not a real domain) with plausible values for every field. For each field, specify the FACTS its explainer needs to convey (bullet points, not final polished prose — that's the Content Strategist's job, informed by your facts) — e.g. for "Validity window," the facts might be: what the two dates mean, that browsers hard-block once the end date passes, and a pointer to the site's short-lived-cert content for why this window is shrinking industry-wide.

2. A VERIFICATION WALKTHROUGH, adapting the PolicyEvaluator ordered-check pattern to actual TLS chain validation: leaf signature valid? → intermediate signature valid? → root in trust store? → is today inside the validity window? → has it been revoked? Specify exactly what UI state changes at each step, and design at least three toggleable failure scenarios (e.g. expired certificate, untrusted root, revoked certificate) so a learner can see specifically which step fails and why, mirroring how the existing PolicyEvaluator highlights which rule matched. Specify the exact data for each scenario (what's wrong with it, which step it fails at, what message displays).

Where you genuinely don't have a confident answer for some interaction detail, write an explicit "⚠ needs a decision: ..." callout instead of guessing — don't silently pick something arbitrary.

You do NOT edit any file under src/. Write your complete design to docs/integration/phase-1-certificates/simulation-design.md, detailed enough that an Implementer who only reads this doc (not this conversation) can build it without guessing: every field, every state, every scenario's exact data.
```

- [ ] **Step 2: Confirm the agent has been launched**

No output check needed yet — this runs in the background alongside Task 1.

---

### Task 3: Owner review gate

**Files:** None (review step, no files created or modified).

**Interfaces:**
- Consumes: `docs/integration/phase-1-certificates/content-plan.md`, `docs/integration/phase-1-certificates/simulation-design.md`
- Produces: an explicit go-ahead (or revision request) from the project owner — required before Task 4 can start.

- [ ] **Step 1: Wait for both Task 1 and Task 2 agents to complete**

- [ ] **Step 2: Read both output docs in full**

Read `docs/integration/phase-1-certificates/content-plan.md` and `docs/integration/phase-1-certificates/simulation-design.md`.

- [ ] **Step 3: Summarize both for the project owner and present for review**

Include: exact placement decision, section structure, the two interactives' mechanics, any `⚠ needs a decision` flags the Simulation Designer raised (surface these explicitly — they need the owner's input, not a guess).

- [ ] **Step 4: Do not proceed to Task 4 until the owner gives an explicit go-ahead**

If the owner requests changes, re-invoke the relevant agent(s) from Task 1/2 with the feedback (via `SendMessage` to the existing agent, not a fresh dispatch, so they retain context) and repeat Step 2–4.

---

### Task 4: Dispatch the Implementer to build Phase 1

**Files:**
- Modify: `src/components/reference/CertificateTabs.tsx`, `src/data/certificates.ts`
- Create: new component file(s) under `src/components/reference/` for the field decoder and verification walkthrough (exact filenames determined by the Implementer to match the approved simulation-design.md structure — likely `CertificateFieldDecoder.tsx` and `CertificateVerification.tsx`, but confirm against what simulation-design.md actually specifies)
- Create (if new acronyms are introduced): additions to `src/data/acronyms.ts`
- Update: `docs/integration/phase-1-certificates/content-plan.md` and `simulation-design.md` (status tags)

**Interfaces:**
- Consumes: the two approved docs from Task 1/2 as sole source of truth for content and mechanics.
- Produces: working, rendered UI in the live site — consumed by Task 5 (verification).

- [ ] **Step 1: Launch the agent**

Use the `Agent` tool (`subagent_type: general-purpose`, `run_in_background: true`) with this prompt:

```
Project: /Users/sidkandge/Documents/Projects/netwise-project — "Netwise." Read /Users/sidkandge/Documents/Projects/netwise-project/CLAUDE.md first (architecture, conventions, design system — a dark "tempered terminal" palette, do not deviate from it).

You are the Implementer for Phase 1 of an ongoing content-integration effort. A Content & Flow Strategist and a Simulation/Interaction Designer already produced approved plans — the project owner has reviewed and approved both. Read them in full before touching anything:
- docs/integration/phase-1-certificates/content-plan.md
- docs/integration/phase-1-certificates/simulation-design.md

Your job is to faithfully execute both — you do not invent new content or interaction design of your own. Where a plan leaves an implementation detail open (exact component structure, exact Tailwind classes), use good judgment consistent with this codebase's existing patterns, but don't go beyond what the plans actually ask for.

Build:
1. The content-plan.md's prose additions to the Reference → Certificates section (src/components/reference/CertificateTabs.tsx, src/data/certificates.ts).
2. The simulation-design.md's two interactives, each as its own component (one interactive = one concept — do not merge them). Reuse this codebase's existing patterns: src/components/chapters/CipherDecoder.tsx for chip-click-reveal, and Chapter5DecryptionPolicies.tsx's PolicyEvaluator / src/components/sandbox/Sandbox.tsx for ordered-check-with-highlighting. For the verification walkthrough's explainer/step copy, write final polished prose informed by the Simulation Designer's fact-requirements, matching the voice the Content Strategist established in content-plan.md.
3. If simulation-design.md left any `⚠ needs a decision` flags, they should already have been resolved by the project owner before this task started — if you find one that wasn't resolved, stop and report it rather than guessing.

Wire any new components into CertificateTabs.tsx in the placement content-plan.md specifies. If content-plan.md introduces any acronym not already in src/data/acronyms.ts, add it there, and wrap any body copy that might contain a known acronym in <AutoLink text={...} /> per this codebase's established convention.

After making changes, update both docs/integration/phase-1-certificates/content-plan.md and simulation-design.md in place, tagging each item ✅ Implemented / ❌ Skipped (reason), same pattern as docs/content-strategy.md from the original six-chapter pass.

Verification before you finish: run `npx tsc -b` and `npm run lint` (oxlint) — both must pass clean. If either fails with a native-binding error unrelated to your changes ("Cannot find native binding" from an npm optional-dependencies bug), that's a known pre-existing environment issue — run `npm install @oxlint/binding-darwin-arm64 --no-save` or `npm install @rolldown/binding-darwin-arm64 --no-save` to resolve it rather than reporting it as a code problem. Also run `npm run build` and confirm it completes.

Report back: which items you implemented, any you skipped and why, and confirm tsc/lint/build all pass.
```

- [ ] **Step 2: Wait for the agent to report completion**

---

### Task 5: Independent verification

**Files:** None created — this task exercises the code the Implementer wrote.

**Interfaces:**
- Consumes: the built UI from Task 4.
- Produces: a pass/fail verification result gating Task 6.

- [ ] **Step 1: Re-run type-check and lint directly (don't just trust the Implementer's self-report)**

Run: `npx tsc -b`
Expected: no output, exit code 0.

Run: `npm run lint`
Expected: `EXIT:0`, no errors from oxlint.

- [ ] **Step 2: Re-run the build**

Run: `npm run build`
Expected: completes without error (Vite build output, no red error text).

- [ ] **Step 3: Read the actual diff for both interactives against their design docs**

Read the new component file(s) and confirm the field list / verification steps / failure scenarios match what `simulation-design.md` specified — not just that something rendered.

- [ ] **Step 4: Start the dev server and exercise both interactives live in the browser**

Run: `npm run dev` (background)

Using the claude-in-chrome tools: navigate to the Certificates reference section, click through every field in the decoder and confirm each shows its explainer, then run the verification walkthrough for the default (valid) case and for at least one failure scenario (e.g. expired) and confirm it correctly shows where the chain breaks.

- [ ] **Step 5: Re-read the affected section and its immediate neighbors for flow**

Confirm the new content block reads smoothly against the existing certificate reference content around it — no jarring tone shift, no orphaned transition sentences.

---

### Task 6: Report and sign-off gate

**Files:** None.

- [ ] **Step 1: Summarize what shipped, referencing the actual verified behavior from Task 5, not the Implementer's self-report**

- [ ] **Step 2: Explicitly ask the project owner for sign-off before starting Phase 2**

Do not begin Phase 2a (ECH) work until this sign-off is given.
