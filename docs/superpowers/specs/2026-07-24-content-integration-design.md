# Design: Integrating research-ideas.md topics into Netwise

**Status:** Approved by project owner, ready for implementation planning.
**Date:** 2026-07-24

## Goal

`docs/research-ideas.md` has a set of researched, credible candidate topics (new protocols, evolving practices) that could extend Netwise. The goal is to integrate them into the live site — new chapters and sections, plus hands-on interactive elements for the harder-to-grasp ones — **without breaking the site's existing reading flow, narrative voice, or pacing**. This is explicitly a phased effort: small, reviewable units, one at a time, rather than one large rewrite.

Everything in `docs/research-ideas.md` marked `NOT NOW` by the project owner (#7 ZTNA vs. VPN, #9 Service mesh & mTLS, #12 Email authentication, #15 Software supply chain/SBOM) stays excluded. Nothing in this design changes that.

## Scope

All remaining Tier 1 candidates, done eventually, in three phases:

1. **Phase 1 — Certificate cluster.** `docs/research-ideas.md` #5 (short-lived certs & ACME) + #17 (root certificate longevity, expiry, revocation) + a new certificate visualization (the project owner's own idea: show what a real certificate looks like, what fields it contains, and how verification actually works). All land in the existing Reference → Certificates section. Self-contained, lowest risk, goes first.
2. **Phase 2 — Section-level additions to existing chapters**, one topic at a time:
   - 2a. Encrypted Client Hello (ECH) → Chapter 3
   - 2b. Post-quantum hybrid key exchange → Chapter 4
   - 2c. QUIC vs. TCP+TLS and what it does to inspection → Chapter 2 or 6
   - 2d. Single pass (parallel processing) architecture → Chapter 3 / Sandbox intro
3. **Phase 3 — Zero Trust Architecture as a new Chapter 7.** Biggest and riskiest (it reframes the perimeter/zone model every prior chapter assumes), goes last, once the process has been proven on lower-risk phases.

Within Phase 2, each topic is its own fully-closed-out round (research/plan → review → build → verify) before the next starts — these four topics touch different, unrelated chapters, so isolating them keeps blast radius small. Phase 1's two prose topics and the visualization are treated as one round, since they're literally the same reference section and splitting them further only adds overhead without reducing risk.

## Design principle: one interactive = one concept

**Do not combine multiple teaching moments into a single mega-simulation.** Each interactive element should teach exactly one thing, be usable on its own, and not require understanding an unrelated mechanic first. This is why Phase 1 is two separate pieces (a field decoder, and a verification walkthrough) rather than one combined widget — and it's a standing rule for every phase after this one, not just Phase 1. If a topic seems to need multiple interactive moments, build multiple small ones rather than one complex one.

## Agent team

Four distinct roles, each with a single responsibility and its own output — no role blends into another, matching the separation already established for the original six-chapter content pass:

1. **Research Agent** — deepens `docs/research-ideas.md` with implementation-relevant technical detail, only when the Content Strategist or Simulation Designer flags a real gap (not run by default every phase). Web access, no verbatim copying, general source-area notes only, same rules as before.
2. **Content & Flow Strategist** — plans the *prose*: exact insertion point in the existing chapter flow, what it says, how it bridges from what came before and into what comes after, matching the site's established voice. Read-only on `src/`; writes to `docs/integration/<phase>/content-plan.md`.
3. **Simulation/Interaction Designer** *(new role for this effort)* — decides what's worth making interactive vs. static, specs the mechanics precisely (states, triggers, what's revealed), and explicitly flags open design questions (`⚠ needs a decision: ...`) rather than guessing when it doesn't have a confident answer. Does not write prose, does not write code. Read-only on `src/`; writes to `docs/integration/<phase>/simulation-design.md`.
4. **Implementer** — reads the *approved* content-plan and simulation-design docs for a phase and builds both the prose and the interactive components. Does not invent new strategy. Tags each item done in both docs, same pattern as the original `content-strategy.md` implementation pass.

Research, Content Strategist, and Simulation Designer run in parallel per phase/sub-phase (independent lenses on the same source material). Implementer only starts after the project owner has reviewed both docs and given explicit go-ahead — same hard gate as the original round. Final verification (typecheck, lint, build, live browser check, flow re-read) is done directly by the orchestrating session, not a fifth agent.

## Doc organization

```
docs/integration/
  phase-1-certificates/
    content-plan.md
    simulation-design.md
  phase-2a-ech/
    content-plan.md
    simulation-design.md
  phase-2b-pq-crypto/
    content-plan.md
    simulation-design.md
  phase-2c-quic/
    content-plan.md
    simulation-design.md
  phase-2d-single-pass/
    content-plan.md
    simulation-design.md
  phase-3-zero-trust/
    content-plan.md
    simulation-design.md
```

## Per-phase workflow loop

1. (Optional) Research Agent deepens grounding if a real gap is flagged.
2. Content & Flow Strategist and Simulation/Interaction Designer run in parallel, each reading `CLAUDE.md`, the relevant `docs/research-ideas.md` entry/entries, the target existing source files, and `docs/content-strategy.md` for established voice/conventions.
3. Both docs are brought to the project owner for review — approve, or send back for revision (repeat step 2 with feedback as needed).
4. Once approved, Implementer executes both docs faithfully, tags each item `✅ Implemented` / `❌ Skipped (reason)` in place.
5. Independent verification: `npx tsc -b`, `npm run lint`, `npm run build` all clean; live browser check actually exercising new interactive elements (not just screenshotting them); a quick end-to-end re-read of the affected chapter and its immediate neighbors to confirm bridges still hold (done directly; Content Strategist can be pulled back in if something feels off).
6. Report back, wait for explicit sign-off before starting the next phase/sub-phase.

## Phase 1 — Certificates (detailed)

**Content plan direction:** Treat research-ideas.md #5 (short-lived certs/ACME) and #17 (root cert longevity/expiry/revocation) as one cohesive new block in the Reference → Certificates section — the research doc itself frames them as "two halves of the same story" (why leaf certs are shrinking vs. why root certs are deliberately long-lived, and how revocation checking is shifting from OCSP to CRLs as a result).

**Simulation plan direction — two separate pieces, per the one-interactive-per-concept rule:**
- **Field decoder**, adapting the existing `CipherDecoder` pattern (`src/components/chapters/CipherDecoder.tsx`) — click a labeled field on a realistic example certificate (Subject, Issuer, Validity window, SAN, Public Key, Signature) and get a plain-English explainer.
- **Verification walkthrough**, adapting the existing `Sandbox`/`PolicyEvaluator` pattern — an ordered sequence of checks (leaf signature → intermediate signature → root in trust store → expiry → revocation) with pass/fail highlighting and a final TRUSTED/NOT TRUSTED result, ideally with toggleable failure scenarios (expired, untrusted root, revoked) so the learner sees why each one breaks.

## Phases 2–3 (lighter touch, confidence noted per topic)

- **2a. ECH → Chapter 3.** Likely mechanic: extend the existing `HandshakeStepper` with a 4th scenario toggle ("ECH enabled") showing the SNI field going dark in the wire view. Reuses existing UI; reasonably confident.
- **2b. Post-quantum key exchange → Chapter 4.** Likely mechanic: a 5th chip on the existing `CipherDecoder` for hybrid key exchange (e.g. X25519+ML-KEM). Reuses existing UI; reasonably confident.
- **2c. QUIC vs. TCP+TLS → Chapter 2 or 6.** ⚠ No existing UI pattern maps cleanly onto "compare two traffic types side by side, showing what's visible to a firewall in each." Left open for the Simulation Designer to actually solve when this sub-phase starts.
- **2d. Single pass architecture → Chapter 3 / Sandbox intro.** ⚠ Also open — likely some "one pipeline, several checks at once" vs. "several sequential passes" visual, not committed to a specific mechanic yet.
- **3. Zero Trust → new Chapter 7.** ⚠ Biggest open flag. Likely needs to directly contrast against the existing `FirewallCheckpointViz`/Sandbox mental model (zone-based trust vs. continuous re-verification), but deserves real design attention when this phase actually starts, not a premature guess now.

## Out of scope

- The four `NOT NOW`-marked topics in `docs/research-ideas.md`.
- Any topic not currently in `docs/research-ideas.md`.
- Combining multiple concepts into one interactive (see design principle above).
