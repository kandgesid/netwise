# Phase 3 — Simulation / Interaction Design: Zero Trust Architecture (Chapter 7)

**Author role:** Simulation/Interaction Designer (game-design role — mechanics and states only, no prose, no code).
**Status:** Draft, awaiting project-owner review alongside the Content & Flow Strategist's parallel content plan for this topic.
**Consumes:** `docs/research-ideas.md` #4 ("Zero Trust Architecture") for subject-matter grounding, read in full; `src/components/chapters/FirewallCheckpointViz.tsx`, `src/components/chapters/HandshakeStepper.tsx` + `src/data/handshakeSteps.ts`, `src/components/chapters/CipherDecoder.tsx` + `src/data/cipherSuite.ts`, `src/components/chapters/SessionTrackingViz.tsx`, `src/components/chapters/SinglePassViz.tsx`, `src/components/sandbox/Sandbox.tsx`, `src/components/chapters/Chapter5DecryptionPolicies.tsx`'s `PolicyEvaluator`, and `src/components/reference/VerificationWalkthrough.tsx` — the site's full existing interactive vocabulary; `docs/integration/phase-1-certificates/simulation-design.md`, `docs/integration/phase-2a-ech/simulation-design.md`, `docs/integration/phase-2b-pq-crypto/simulation-design.md`, `docs/integration/phase-2c-quic/simulation-design.md`, and `docs/integration/phase-2d-single-pass/simulation-design.md` as process precedent and rigor standard; `src/data/glossary.ts` and `src/data/acronyms.ts` for existing terminology footprint; `CLAUDE.md` in full for architecture, design-system, and motion-tiering constraints.
**Produces:** this document. Owns mechanics, exact data-shape, and the *facts* each new piece of copy must convey — not the polished sentences themselves. A parallel content plan (Content & Flow Strategist, entry #4) owns final prose, chapter structure, and framing decisions. Entry #7 ("ZTNA vs. VPN") is out of scope by explicit project-owner instruction (`NOT NOW` in `research-ideas.md`'s summary table) — nothing below depends on it, and §6.4 states the boundary explicitly so the Implementer doesn't accidentally build into it.

---

## Implementation status (Implementer, post project-owner review)

All items below were executed. See `content-plan.md`'s own status block for the owner's placement-synthesis
resolution (§6.2 below was explicitly left as "not this doc's call, one observation offered" — the owner's
resolution used this doc's own recommended reading order almost exactly: `ContinuousVerificationViz` between
Card 1 and Card 2, `TrustSignalsViz` between Card 3 and Card 4).

- §3 `ContinuousVerificationViz` (component, state shape, two-row rendering, accessibility requirement) —
  ✅ Implemented as `src/components/chapters/ContinuousVerificationViz.tsx`. Draft placeholder copy (intro, row
  captions, caveat, closing) was rewritten into final polished prose per the Implementer's brief, preserving every
  fact-list item stated in §3.6.
- §4 `TrustSignalsViz` (three independent toggles, AND-gated verdict, "two out of three" callout, perimeter-model
  callout) — ✅ Implemented as `src/components/chapters/TrustSignalsViz.tsx`, including the exactly-one-signal-bad
  conditional sentence (§4.5) and the always-visible one-line Chapter 1 callout (§4.6). Draft placeholder copy
  finalized per the fact-lists in §4.7.
- §5 color semantics — ✅ Implemented exactly as specified and explicitly owner-approved as a deliberate exception:
  `ContinuousVerificationViz` inverts the convention (Row 1 "still allowed" → danger-red when compromised; Row 2
  "access revoked" → success-green when compromised). `TrustSignalsViz` uses the standard, non-inverted convention
  (ALLOW = success-green, DENY = danger-red), per §5.2.
- §6.1 (pillars taxonomy, "assume breach," least privilege/microsegmentation as static prose, not a third mechanic)
  — ✅ Honored; no third interactive was built. Least privilege / micro-segmentation ended up as prose inside
  Chapter 7's Card 4 ("Smaller than a zone"), per `content-plan.md` §4, not a mechanic — consistent with this
  section's recommendation and the §6.4 boundary against entry #7.
- §6.2 (placement) — resolved by the project owner; see `content-plan.md`'s status block for the exact combined
  order. Both mechanics landed inside `Chapter7ZeroTrust.tsx`, adjacent to the Card that sets each one up, per this
  section's own recommended adjacency.
- §6.3 (`MDM`/`GPO` groundwork) — `MDM` ✅ used in both mechanics (already present in `ACRONYMS`, no new entry
  needed). `GPO` — ❌ Skipped (reason: flagged only as available groundwork, not required by either mechanic;
  Chapter 7's shipped prose didn't need a concrete "how a device policy gets set" example).
- §6.3 (`ZTA` acronym) — ❌ Skipped (reason: per owner resolution #3, contingent on the shipped prose using the bare
  initialism more than once; it never does — `content-plan.md` §4/§9 always writes "Zero Trust" in full).
- §6.4 (scope boundary against entry #7) — ✅ Honored; no VPN/ZTNA content or mechanic added anywhere in either
  component.
- §6.5/§6.6 (no new color tokens/motion primitives/data file; both mechanics independently shippable) — ✅ Honored;
  both components are self-contained, zero-prop, inline-constant files with no `src/data/*.ts` addition.

`npx tsc -b`, `npm run lint` (oxlint), and `npm run build` all pass clean after these changes.

---

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string in quotes (labels, captions, status badges) is a **draft/placeholder written to prove the mechanic reads correctly** — the Implementer should treat these as content-requirements to match against the Content Strategist's voice, not paste them in verbatim as final copy. Where I mean "these exact facts must appear, wording is not mine to decide," I've written that as a bullet list of facts instead of a sentence.

**Starting position, same as Phase 2c/2d:** `research-ideas.md` #4 makes no mechanic suggestion of its own — it states the reframe and stops. The task brief that spawned this document offers one candidate to weigh (the same access request evaluated two ways, side by side, echoing `FirewallCheckpointViz`), explicitly framed as a candidate, not a prescription, and explicitly invites me to conclude more than one mechanic is warranted if the material calls for it, given this is the biggest single canvas the series has worked with (a full new chapter, not a section addition). This document does the full exercise: find the one "aha," sharpen or reject the offered candidate, check every existing pattern, and only build what earns its place.

**Headline conclusion, stated up front:** this chapter earns **two** small interactives, not one, and not more. §1 explains why the material splits cleanly into two genuinely different concepts rather than one bigger mechanic or several smaller ones, and why a third candidate concept (multi-signal breadth *as a taxonomy*, and least-privilege/segmentation) is deliberately left to prose or explicitly deferred to entry #7.

---

## 1. What's actually being taught, and picking the "aha"(s)

### 1.1 The reframe, restated precisely from the source material

`research-ideas.md` #4, read in full, reduces to one sentence the rest of the entry exists to unpack: *"no request is trusted by default just because of its network location; every access attempt gets checked against identity, device health, and context, every time, regardless of whether it originated 'inside' or 'outside.'"* Unpacked, that sentence actually makes **two separable claims**, not one:

- **Claim A — WHEN a check happens.** Chapters 1–6 all quietly assume trust, once granted, holds for the life of a connection or session: `FirewallCheckpointViz`'s packet clears the checkpoint once and is done; `HandshakeStepper`'s handshake completes once and the session proceeds; `SessionTrackingViz` (Phase 2c) even names this outright — "quietly assumes the firewall can tell this is still the same connection" by watching one thing stay constant. Zero Trust's claim is that trust is **not durable** — it has to be re-earned, not just assumed to persist, regardless of whether anything about *location* changed.
- **Claim B — WHAT gets checked, and how the checks combine.** Every access-control mechanic taught so far evaluates **one axis at a time**: `Sandbox` matches on port *or* App-ID *or* User-ID (a mode picker, not a combination); `PolicyEvaluator` matches an ordered list of rules, first match wins, each rule keyed on one category. Zero Trust's claim is that a request is evaluated against **several independent signal types at once** — identity, device health, and context — and (per NIST SP 800-207, the standards document behind this entire framing) failing *any one* is enough to deny, regardless of how well the others check out. That's a different combining logic (simultaneous AND across categories) from anything on the site so far (single-attribute match, or ordered first-match).

These are genuinely different facts, not one fact restated twice — the same distinction Phase 2b was careful to keep clean between forward secrecy and harvest-now-decrypt-later, and Phase 2d was careful to keep clean between per-packet stages and per-appliance session concurrency. Conflating "checks happen more often" with "more kinds of things get checked" would blur two separate reasons the perimeter model breaks down. §1.3–1.4 test each independently against the "shared variable, divergent response" bar this series has used since Phase 2c, rather than assuming both automatically deserve a mechanic just because both are real.

### 1.2 Sharpening the brief's own candidate before evaluating it

The brief's candidate — "the exact same access request evaluated two ways side by side" — is directionally right but, taken completely literally, has no interactive payoff. A static side-by-side rendering of "perimeter: checked once" next to "Zero Trust: checked continuously," with nothing to click, is a labeled fact pair, not a mechanic — the same failure mode Phase 2c's §1.3 rejected for "block UDP/443 vs. decrypt-and-inspect" (two static postures, no shared trigger). For this to earn interactivity the way `SessionTrackingViz` did, there has to be a **shared variable that both rows react to, and diverge on** — the same test Phase 2d's §1.1 named as the reason its own comparison cleared the bar.

The natural shared variable here: **something changes about the request's legitimacy *after* the point where both models would already have let it through once.** Concretely: an employee authenticates this morning, is inside whatever the perimeter model calls "trusted" (a zone, a VPN tunnel, a subnet), and is also inside whatever Zero Trust calls "trusted for this specific past decision." Later the same day, before that employee's session would naturally end, **their device's compliance state changes — malware is detected on it.** Nothing about their network location changed. Nothing about their identity changed (their credentials weren't touched). One thing did: device posture. Toggle that one variable and watch what each model does about it. This is claim A, made concrete and clickable — not a rewrite of the candidate, a sharpening of it into the shape this site's mechanics take.

**Why device posture specifically, and not identity or location, as the triggering variable:** location changing mid-session is already `SessionTrackingViz`'s territory (a client roaming networks) — reusing it here would be near-duplicate content, the same reasoning Phase 2c's §1.1 used to reject a second SNI/ECH mechanic for QUIC. Identity changing mid-session (credentials get stolen) is a real Zero Trust talking point too, but it's a weaker beginner "aha" than device posture, because a learner has to already accept "the credentials still work but shouldn't be trusted" — a more abstract claim than "malware was detected on this laptop," which is immediately, viscerally legible to a complete beginner as "this device should not be trusted anymore," full stop. Device posture is also the one signal type that has **zero footprint anywhere else on the site** — Chapters 1–6 are entirely about network traffic and cryptography, never about the device's own health — making it the freshest, least-overlapping choice, and (see §6.3) it happens to be the one signal type the site's glossary/acronym data already has orphaned groundwork for (`MDM`, `GPO`), unused anywhere on the site today.

**Decision: build claim A as a triggered, two-row, side-by-side comparison — the sharpened form of the brief's candidate.** §3 specs it as `ContinuousVerificationViz`.

### 1.3 Testing claim B against the same bar

Claim B — several independent signal types evaluated together, any one failure enough to deny — is a different shape of fact and needs its own test, not a ride-along inside claim A's mechanic. Does it have a shared variable with a divergent response? Not in the same two-systems-compared sense claim A does (there's no "old way" that evaluates multiple signals at all — the honest old-model answer is "it doesn't check most of these," which is a single sentence, not a second row worth building). But it clears a different, equally legitimate bar this site already recognizes: `PolicyEvaluator` and `VerificationWalkthrough` are both single-system, reactive-on-select mechanics (pick an input, watch a verdict compute) with no "old way" comparison row at all, and neither is weaker for it. Claim B's mechanic payoff is watching the **AND-logic itself**: toggle only one of three independent signals to "bad" while leaving the other two "good," and see the verdict flip anyway — a fact a learner cannot get from reading a sentence nearly as effectively as from personally failing to talk the system into letting a good-identity, good-context, bad-device request through. That's a genuine, testable claim about *how the decision logic combines inputs*, not just a restatement of "more gets checked."

**Decision: build claim B as a three-independent-signal, AND-gated verdict mechanic**, deliberately **not** shaped like claim A's two-row comparison (see §2 for why forcing both into one shape would be a worse fit for each). §4 specs it as `TrustSignalsViz`.

### 1.4 Why this is two mechanics and not one, and not three

Merging A and B into one component was considered and rejected. A single mechanic that both (a) compares two architectures' response to a changing signal over time, and (b) demonstrates AND-logic across three independent signals simultaneously, would need a control surface with both a "which model" axis and a "which of three signals, in what state" axis at once — a four-or-more-dimension surface for a "complete beginners" audience (CLAUDE.md's own framing of the site's readership), and a direct violation of the standing one-interactive-per-concept rule this series has followed since Phase 1 ("Two components, never merged, per the project's one-interactive-per-concept rule"). Building one mechanic here because the topic is big would trade clarity for a false economy of scope; building two small, single-purpose mechanics is the same discipline every prior phase applied, just applied twice because — unusually, and only because the source material genuinely contains two separable claims — this topic has two "aha"s instead of one.

A third mechanic was considered and rejected: a taxonomy-style "pillars of Zero Trust" interactive (identity / device / network / application / data, the standard five-pillar breakdown many vendor and NIST framings use). Checked against the same bar: this is a **list**, not a shared-variable-divergent-response mechanic and not an AND-gated verdict — it has the same shape as Chapter 1's `TYPES` grid and Chapter 5's `ACTIONS` grid, both of which are static content grids, not interactive components, precisely because nothing in them reacts to anything. §6.1 recommends this explicitly as a static grid, not a third mechanic, for the Content Strategist to build if the chapter structure wants a pillars overview.

---

## 2. Fit-check against every existing interactive pattern

Same discipline every prior phase in this series has applied before proposing something new — checked against both new mechanics together, since the conclusion (new components, not extensions) is the same for both:

| Existing pattern | What it structurally models | Fits claim A (`ContinuousVerificationViz`)? | Fits claim B (`TrustSignalsViz`)? |
|---|---|---|---|
| `FirewallCheckpointViz` (Ch. 1) | One fixed checkpoint, a fixed animated packet path, replay-triggered, no state/toggle at all. | **No — checked explicitly, since the brief itself names this component as the direct contrast.** The entire layout assumes exactly one checkpoint, checked once, with no concept of "later" or "a second check." Zero Trust's whole point is that trust isn't a single point in space a packet passes through — it's re-evaluated at multiple points in time. That's not expressible as a toggle on a fixed single-checkpoint animation without rebuilding the component's core assumption, the same class of structural mismatch Phase 2d's §1.2 found when it checked this same component for single-pass architecture. Its green-allowed/red-blocked color convention is relevant, though — see §5 for why that convention is deliberately *inverted*, not reused as-is, in claim A. | No — no checkpoint-position axis exists here at all; this mechanic has no spatial "packet travels" dimension in the first place. |
| `HandshakeStepper` + a new toggle (ECH/QUIC precedent) | A fixed, ordered sequence of steps at fixed `pos` values, walked forward/backward; a toggle swaps *body text* on specific steps without touching step count or identity. | No — nothing about claim A is a point inside a connect→handshake→inspect→decide sequence. The event being modeled (device posture changing) happens *after* any handshake is long finished, possibly hours later, and isn't a "step" any session walks through once. Same category of mismatch Phase 2c's §2.1 found in its own duplication-check table. | No — same reasoning; there's no handshake step here to attach three independent signal toggles to. |
| `CipherDecoder` + a toggle (hybrid-PQ precedent) | One string decomposed into independent axes; a chip's code is a literal substring of one composite string. | No — there's no single composite value here for a chip to be a substring of. | No — same reasoning; three independent signals aren't fragments of one string, they're three independent facts about one request. |
| `PolicyEvaluator` / `VerificationWalkthrough` | Ordered checks, first-*fail*-stops (`VerificationWalkthrough`) or first-*match*-wins (`PolicyEvaluator`), against one picked scenario from a dropdown. | No — claim A isn't an ordered chain and isn't picking from a curated scenario list; it's two independent systems reacting to one shared toggle, `SessionTrackingViz`'s shape, not this one. | **Partial — checked seriously, still rejected in favor of independent toggles, not a scenario dropdown.** Both existing components pick *one* scenario from a curated list and walk an *ordered* sequence (sequential stops for `VerificationWalkthrough`, first-match for `PolicyEvaluator`). Claim B's payoff specifically requires letting a learner isolate *one* signal as bad while the other two stay good — a combination a curated scenario list could easily omit (a list author might only think to offer "everything passes" and "everything fails"). Three independent toggles, each freely combinable, is a different, deliberately *un-ordered*, simultaneous-AND control surface — see §4.1 for the full reasoning. |
| `SessionTrackingViz` (Ch. 6, Phase 2c) | One `Toggle`, two always-visible rows that both react to the same click, one row's outcome changes while the other's doesn't. | **Yes — direct structural fit**, the closest precedent in the codebase for exactly this shape. Same "one shared trigger, two systems diverge" mechanic, different subject matter. | No — claim B isn't two systems compared, it's one system (Zero Trust's own decision engine) with three independent inputs. Forcing it into a two-row comparison would mean inventing a second, less-interesting "old model" row that just says "wasn't checking any of this" three times, adding width without adding a third real reaction to compare. |
| `SinglePassViz` (Ch. 3, Phase 2d) | One `Toggle` (4 cumulative states), two always-visible rows, no color-coding because neither row is right/wrong, just cheaper/costlier. | Structurally close in *weight class* (one `Card`, one small state, no data file), but the underlying judgment differs — see §5: claim A's two rows genuinely are a correctness judgment (one is a security gap, one is the system working), unlike `SinglePassViz`'s deliberately neutral cost comparison. Noted as a precedent for scope/size, not for color treatment. | Same weight-class precedent; not a shape match otherwise. |

**Conclusion:** build two new, small, standalone components. `ContinuousVerificationViz` sits in `SessionTrackingViz`'s weight class and shape (one `Toggle`, two always-visible rows). `TrustSignalsViz` sits in `PolicyEvaluator`'s weight class (reactive-on-select, one verdict bar) but with three independent toggles driving it instead of one scenario dropdown. Neither needs a `src/data/` file — same "inline constants" precedent every component in this palette since Phase 2c has used, for the same reason: a handful of fixed strings, smaller and less reusable elsewhere than `cipherSuite.ts` or `handshakeSteps.ts` ever were.

---

## 3. Exact spec — `ContinuousVerificationViz` (claim A: WHEN)

### 3.1 Component

**Suggested name/path:** `src/components/chapters/ContinuousVerificationViz.tsx` — same "concept + Viz" naming shape as every other chapter visualization, same directory, regardless of exact placement within the new chapter (placement is not this doc's call — see §6.2).

**No separate data file.** All constants inline at the top of the component file, per §2's conclusion.

**Self-contained, zero props.**

### 3.2 Shared fictional continuity

Reuses the site's established fictional world rather than inventing a new one:
- **Persona:** a finance-team employee — reuses the `finance-team` category from `Chapter5DecryptionPolicies.tsx`'s `PolicyEvaluator` and the `finance` User-ID option from `Sandbox`'s `USER_OPTIONS`, so a learner who's already met "the finance team" as a User-ID example in two earlier interactives recognizes the same persona here, not a new unrelated character.
- **Resource:** the finance reporting dashboard at `portal.netwise-example.test` — reuses the exact fictional hostname Phase 1 established and Phase 2a/2c's copy already reused, continuing that continuity chain rather than inventing a fourth hostname.
- **The triggering event:** malware detected on the employee's laptop, flagged by the device's MDM enrollment. **`MDM` is already in `src/data/acronyms.ts`** (`Mobile Device Management`) and is currently unused anywhere on the site — the same kind of pre-seeded, orphaned groundwork `research-ideas.md` itself flagged for the VPN glossary category before any chapter used it. Using it here isn't a new content dependency, it's picking up groundwork that was already laid. See §6.3.

### 3.3 State and data shape

```ts
type Posture = 'healthy' | 'compromised';

const POSTURE_OPTIONS: { value: Posture; label: string }[] = [
  { value: 'healthy', label: 'Device healthy' },
  { value: 'compromised', label: 'Malware detected' },
];

const [posture, setPosture] = useState<Posture>('healthy');
```

**Default is `'healthy'`, deliberately** — same "baseline first, learner opts into the changed state" convention every toggle in this palette has used (`ech`'s `'off'`, `kexMode`'s `'classical'`, `network`'s `'same'`, `count`'s `'1'`). Nothing has diverged yet on load.

**No reset condition to specify.** Same reasoning every prior toggle-only component in this palette has given: no sibling state, no parent scenario to reset against. `posture` persists at whatever the learner last set it to for the life of the mounted component.

**Instant, no transition delay, no button.** Same as every other state change already in this palette.

**Binary, not multi-state, and this is a deliberate choice, not a default:** unlike `SinglePassViz`'s 4-state toggle (justified there because the claim was a *trend* across a range), claim A's claim is a single before/after fact — "did this get re-checked or not" — with exactly one meaningful transition (healthy → compromised). A third or fourth state (e.g., "device patched but out of date," "device jailbroken") would add surface area without adding a new *kind* of divergence to observe; the two systems' behavior doesn't change in kind between "somewhat risky" and "actively malicious," only in degree, and degree isn't this mechanic's teaching point. Confident recommendation, matching `SessionTrackingViz`'s own binary `network` state, not a scope cut made for expedience.

### 3.4 Rendering — two rows, always both visible

Same "adjacent, not a memory exercise" argument every prior two-row comparison in this palette has made (Phase 2a §1.2, Phase 2c §3.4, Phase 2d §3.3): both rows render simultaneously, reacting to the same click, so the divergence is visible in one glance rather than held in memory across a toggle flip.

**Layout:** `Card` containing, top to bottom: intro paragraph (§3.6) → `Toggle` (labeled "Device posture," primary-weight, this component's only control) → two rows in a `grid md:grid-cols-2 gap-4` (matching `SessionTrackingViz`'s layout, since row content length here is comparable — a couple of sentences per state, not `SinglePassViz`'s variable-length chip chain that needed full-width stacking) → caveat aside (§3.6) → closing paragraph (§3.6).

**Row 1 — "Perimeter model — checked once, at the door" (draft header):**
- Sub-caption, always present: `{finance employee} authenticated once this morning and is inside the trusted zone.` (draft, static, doesn't change with `posture` — this row's whole point is that nothing here reacts).
- Status line, dependent on `posture`:
  - `posture === 'healthy'`: neutral (`MinusCircle`, `text-ink-faint`, no border/background tint — matching `VerificationWalkthrough`'s `not-reached`/neutral treatment). Draft text: *"Nothing here re-checks anything mid-session. There's nothing to catch yet, either."*
  - `posture === 'compromised'`: **danger** styling (`border-danger`/`bg-danger/10`/`text-danger`, `XCircle` icon). Draft text: *"MDM just flagged this device as non-compliant — malware detected. This model has no way to notice: the employee authenticated once, is still inside the trusted zone, and stays trusted for the rest of the session regardless of what happens to the device itself."* Badge, small, top-right of the row or beneath the status text: **"STILL ALLOWED"** (draft).

**Row 2 — "Zero Trust — re-verified on the next request" (draft header):**
- Sub-caption, always present, static: `Same employee, same morning login — but nothing here treats that login as good forever.` (draft).
- Status line, dependent on `posture`:
  - `posture === 'healthy'`: neutral (`MinusCircle`, same neutral treatment as Row 1's healthy state). Draft text: *"The next request this employee makes gets checked again: still them, still a healthy device, still an expected pattern."*
  - `posture === 'compromised'`: **success** styling (`border-accent`/`bg-accent/10`/`text-ink`, `CheckCircle2` icon — **this is the load-bearing color decision of this whole document; see §5 before implementing**). Draft text: *"Device posture is one of the things checked on the next request, not just at login. Malware detected → access is denied immediately, without waiting for the employee to leave and re-enter the network."* Badge: **"ACCESS REVOKED"** (draft).

### 3.5 Accessibility note (binding, not optional)

Neither row's status may rely on color alone — both drafts above already pair color with an icon and a full sentence, satisfying this by construction, matching every prior component's requirement. This is doubly important here because §5 documents a deliberate *inversion* of the site's usual green-means-safe intuition — text and icon must carry the meaning unambiguously, since a learner skimming color alone would land on exactly the wrong read.

### 3.6 Required facts — intro paragraph, caveat aside, closing paragraph

**Intro paragraph** (draft placeholder, facts firm):
- Chapter 1 introduced the firewall as a checkpoint: inspected once, then allowed through or turned away. Every chapter since has quietly kept that shape — trust granted once, assumed to hold.
- Zero Trust challenges exactly that assumption: being "inside" a trusted zone isn't something checked once and then true forever.
- Pointer to what to do: toggle device posture below and watch what each model does about a change that has nothing to do with network location at all.

Draft text: *"Chapter 1 introduced the firewall as a checkpoint: a packet gets inspected once, then it's through, or it isn't. Zero Trust exists because that's not the whole story once a session has been running for hours, not seconds. Toggle this employee's device posture below and watch what each model does about a change that has nothing to do with where they're connecting from."*

**Caveat aside** (draft placeholder, facts firm — required so the mechanic doesn't overclaim):
- "Continuous" doesn't mean a literal unbroken real-time stream of verification running underneath every millisecond of a session. In practice it means re-evaluating at each new request, or on a short interval, not a single check that happens once and never again. Worth naming so a learner doesn't come away picturing something more exotic than what's actually happening.

Draft text: *"One thing 'continuous' doesn't mean here: a literal nonstop stream of checks running underneath the whole session. In practice it means re-evaluating at the next request, or on a short interval, not once at login and never again — still much more often than the perimeter model's exactly-once check, just not literally infinite."*

**Closing paragraph** (draft placeholder, facts firm):
- This is the single most conceptually significant thing a Chapter 6 graduate hasn't been told yet: the zone/perimeter model taught since Chapter 1 is treated as necessary-but-not-sufficient in modern network design, not wrong outright — a firewall zone is still a real, useful control, it's just no longer treated as sufficient on its own.
- This is mainstream, baseline guidance now, not an edge case or a buzzword.

Draft text: *"This doesn't make everything Chapters 1 through 6 taught wrong — a firewall zone is still a real control. It just isn't treated as sufficient on its own anymore. That's the shift Zero Trust names: necessary, not sufficient."*

---

## 4. Exact spec — `TrustSignalsViz` (claim B: WHAT, and how it combines)

### 4.1 Why three independent toggles, not a scenario dropdown

Stated in §2's table; expanded here because it's the component's central design decision. `PolicyEvaluator` and `VerificationWalkthrough` both use a single dropdown selecting between curated, named scenarios. That shape works well when the *interesting* states are a small, specific, hand-picked set (five certificate failure modes; four traffic scenarios). It works poorly here, because the entire teaching point of claim B is the **AND-logic**: any one bad signal is disqualifying, independent of the other two. A curated scenario list — even a generous one — risks an author only thinking to offer "all clear" and "everything's wrong," silently never letting a learner construct "identity's fine, context is fine, only the device is bad" for themselves. Three independent binary toggles, freely combinable (2³ = 8 reachable states, all computed from the same three booleans, no per-combination authoring needed), guarantee that exact combination is always one click away, and put the discovery in the learner's hands rather than a scenario author's.

### 4.2 Component

**Suggested name/path:** `src/components/chapters/TrustSignalsViz.tsx`.

**No separate data file, self-contained, zero props** — same reasoning as §3.1.

### 4.3 Shared fictional continuity

Same persona and resource as §3.2 (the finance-team employee, the finance reporting dashboard at `portal.netwise-example.test`) — deliberately identical across both mechanics, so a learner who's just watched `ContinuousVerificationViz` recognizes this as the same ongoing story, viewed from a different angle (time-based re-check vs. simultaneous multi-signal combination), not a new unrelated scenario each time. The **device** signal below (§4.4) explicitly reuses the same `MDM`-flags-it-non-compliant framing `ContinuousVerificationViz` uses, so a learner who's absorbed one already recognizes the vocabulary in the other.

### 4.4 State and data shape

```ts
type SignalState = 'ok' | 'bad';

interface Signal {
  id: 'identity' | 'device' | 'context';
  label: string;      // toggle group label, e.g. "Identity"
  okLabel: string;     // e.g. "Verified"
  badLabel: string;    // e.g. "Suspicious"
  okDetail: string;    // one sentence, shown when this signal is 'ok'
  badDetail: string;   // one sentence, shown when this signal is 'bad'
}

const SIGNALS: Signal[] = [
  {
    id: 'identity',
    label: 'Identity',
    okLabel: 'Verified',
    badLabel: 'Suspicious',
    okDetail: 'Signed in with valid credentials, nothing unusual about this sign-in.',
    badDetail: "This sign-in used a password that's already appeared in a known breach.",
  },
  {
    id: 'device',
    label: 'Device',
    okLabel: 'Compliant',
    badLabel: 'Non-compliant',
    okDetail: "MDM confirms this device meets policy: patched, encrypted, managed.",
    badDetail: 'MDM flags this device as non-compliant: malware detected.',
  },
  {
    id: 'context',
    label: 'Context',
    okLabel: 'Expected',
    badLabel: 'Anomalous',
    okDetail: 'Same country, same general hours this employee always signs in from.',
    badDetail: "Signing in from a country they've never used before, minutes after a login somewhere else entirely.",
  },
];

const [states, setStates] = useState<Record<Signal['id'], SignalState>>({
  identity: 'ok',
  device: 'ok',
  context: 'ok',
});

const allOk = SIGNALS.every((s) => states[s.id] === 'ok');
const failing = SIGNALS.filter((s) => states[s.id] === 'bad');
```

**Default is all three `'ok'`, deliberately** — same "baseline first" convention every toggle in this palette uses. The default state is ALLOW, unremarkable; the teaching moment is entirely in what happens once a learner starts flipping signals, mirroring how `SessionTrackingViz` and `ContinuousVerificationViz` both start at their unremarkable baseline too.

**No reset condition.** Same reasoning as every prior component in this palette — three independent pieces of local state, no sibling scenario to reset against, persist for the life of the mounted component.

**Instant, no transition delay, no button.** Same as every other state change in this palette. Flipping any one of the three `Toggle`s recomputes the verdict synchronously.

**Device signal's bad-state deliberately identical framing to `ContinuousVerificationViz`'s trigger event** ("MDM flags this device as non-compliant: malware detected") — not a coincidence, a continuity choice per §4.3, so a learner sees the same fact expressed two ways: as something that changes *over time* in one mechanic, and as one of three things checked *at once* in this one.

### 4.5 Rendering

**Layout:** `Card` containing, top to bottom: intro paragraph (§4.7) → three stacked `Toggle` groups, each labeled (`Identity`, `Device`, `Context`), each a 2-option `Toggle` exactly like every other `Toggle` in this palette → a verdict bar (below) → a one-line perimeter-model callout (§4.6) → closing paragraph (§4.7).

**Per-signal detail line:** beneath each `Toggle`, a small `text-[13px] text-ink-dim` line showing that signal's current `okDetail`/`badDetail` — same "the state change is described in words, not just a badge flip" requirement every prior component has followed.

**Verdict bar** (bottom of `Card`, matching `PolicyEvaluator`'s `font-mono flex justify-between items-center border-t border-line-soft pt-3` bar shape exactly — deliberate reuse of that specific visual, since a verdict bar *is* the right shape here, unlike the scenario-picker above it):
- Left side: a summary sentence.
  - `allOk`: *"All three signals check out."*
  - not `allOk`: dynamic, naming exactly which signal(s) failed, e.g. *"Device failed."* or, if more than one is bad, *"Device and Context failed."* (join with commas + "and" for 3).
- Right side: verdict badge.
  - `allOk`: **"ALLOW"**, `text-success` — standard, **not inverted**, convention (see §5.2 for why this one *doesn't* need the same color caveat §3.4 required).
  - not `allOk`: **"DENY"**, `text-danger`, standard convention.

**The one-signal-is-enough moment, made explicit in copy, not just implied by the mechanic:** when exactly one signal is `'bad'` and the other two are `'ok'`, add one extra sentence beneath the verdict bar, present only in that specific case: *"Two out of three checked out. Zero Trust doesn't average them, or let a strong identity make up for a risky device — one failing signal is enough."* (draft). This is the component's actual "aha," made unmissable rather than left for the learner to notice unprompted — worth stating explicitly since it's the one fact this mechanic exists to prove and the UI alone (three independent toggles, one verdict) could otherwise let a learner miss the *significance* of what they just demonstrated.

### 4.6 The perimeter-model callout — one line, not a second row

Directly beneath the verdict bar, a single always-visible `text-ink-faint text-[12.5px]` line, not a second comparison row (per §2's reasoning against forcing this mechanic into `SessionTrackingViz`'s two-row shape): *"Under the zone model from Chapter 1, being on the trusted network would have been enough on its own — none of these three signals would even be checked."* (draft). This ties claim B back to claim A's throughline without rebuilding a full second comparison inside this component — a learner who's already seen `ContinuousVerificationViz` recognizes the callback; a learner who hasn't yet still gets the fact stated plainly.

### 4.7 Required facts — intro and closing paragraph

**Intro paragraph** (draft placeholder, facts firm):
- Every access-control mechanic taught so far checks one thing at a time: a port, or an application, or a user identity (`Sandbox`), one rule's category at a time, first match wins (`PolicyEvaluator`).
- Zero Trust checks several independent things about the same request at once — identity, device health, and context are the three named in `research-ideas.md`'s own framing — and requires all of them to hold, not just one.
- Pointer to what to do: toggle each signal below and watch the verdict.

Draft text: *"Every rule the Sandbox and Chapter 5's policy evaluator taught you to build checks one thing at a time: a port, an app, a person. Zero Trust checks several independent things about the same request at once: who's asking (identity), what they're asking from (device health), and where and when they're asking (context). Toggle each one below and watch what it takes to get an ALLOW."*

**Closing paragraph** (draft placeholder, facts firm — states the honest limit of what this mechanic covers, so it doesn't overclaim what "least privilege" or narrower access actually requires):
- What this mechanic demonstrates is the *decision logic* — how signals combine into one verdict. It deliberately does not get into *how* access gets scoped once granted (a specific app vs. a whole network) — that's a related but separate architectural question this chapter doesn't need to resolve here.

Draft text: *"What's shown here is the decision itself: how several signals combine into one answer. What that answer actually grants access *to*, one specific resource, or a much wider slice of the network, is a related question this component isn't answering."* (This sentence is deliberately worded to avoid stepping into entry #7's territory — see §6.4.)

---

## 5. Color semantics — why `ContinuousVerificationViz` inverts the site's convention and `TrustSignalsViz` doesn't

Worth its own section, since getting this wrong would either mislead a learner or quietly break the site's one color rule for no reason. This is the single trickiest call in this document and deserves the most explicit reasoning in it.

### 5.1 The default convention, and its actual scope

CLAUDE.md documents `--color-danger` as reserved for "errors, blocked traffic" and `--color-success` as sharing `--color-accent`'s hue for "allowed traffic and primary actions." Read narrowly, that's "red = blocked, green = allowed." But `VerificationWalkthrough` already establishes a *broader* reading in practice: its verdict bar shows "TRUSTED" in success-green and "NOT TRUSTED" in danger-red — a **correctness judgment about a certificate chain**, not literally "traffic was blocked." A tampered certificate isn't "blocked traffic" in the literal sense CLAUDE.md's sentence describes; it's an *error*, the other word that sentence explicitly includes. That's the precedent this section leans on: danger/success already means "this failed / this held up," not exclusively "this packet was stopped."

### 5.2 `TrustSignalsViz` — the narrow reading holds, no inversion needed

In `TrustSignalsViz`, ALLOW genuinely means the request goes through, and DENY genuinely means it's blocked — the literal reading and the correctness reading agree with each other, exactly like `PolicyEvaluator`'s own `DECRYPT`/non-decrypt verdict coloring. **No special treatment needed here; use the standard convention as-is.**

### 5.3 `ContinuousVerificationViz` — the two readings pull apart, and the correctness reading has to win

Here they don't agree. Row 1 ("still allowed") is literally "traffic keeps flowing" — the narrow reading says green. But it is the **worse of the two outcomes** in this mechanic: it's the model failing to catch a real problem, a live security gap. Row 2 ("access revoked") is literally "traffic gets blocked" — the narrow reading says red. But it's the **better of the two outcomes**: the system catching what it's supposed to catch, working as intended.

Coloring Row 1 green and Row 2 red — the literal, narrow reading — would actively teach the wrong lesson: it would visually tell a learner "the perimeter model's response here is the good one," reinforcing the exact misconception this entire chapter exists to correct, using the same green-means-safe color vocabulary `FirewallCheckpointViz` trained since Chapter 1. **Decision: invert it.** Row 1 gets danger-red when `posture === 'compromised'` (this is the error state — a gap, matching `VerificationWalkthrough`'s "NOT TRUSTED" precedent for "this failed to do its job," not "traffic was blocked"). Row 2 gets success-green in the same state (this is the system correctly doing its job, matching "TRUSTED" — working as intended — not "traffic was allowed").

This is a **confident, deliberate, load-bearing choice**, not an inconsistency slipping in unnoticed, and not a departure from precedent either — it's the same "danger/success judges correctness, not literal traffic flow" reading `VerificationWalkthrough` already established, applied to a case where correctness and literal traffic-flow direction happen to point opposite ways for the first time in this site's history. §3.5's accessibility requirement (text and icon always present, never color alone) is doing double duty here: it's required anyway by this site's standing rule, and it's the thing that keeps this inversion from being confusing on its own — a learner never has to infer "wait, does green mean allowed or does it mean correct here" from color alone, the sentence always says so directly.

**Why this doesn't set a precedent that destabilizes the site's existing color reading elsewhere:** every other danger/success usage on the site (`FirewallCheckpointViz`, `SessionTrackingViz`, `TrustSignalsViz` above) has the narrow and broad readings agreeing, so nothing about this changes how a learner should read color in any *other* component. This is an isolated, well-motivated exception inside one new component whose entire subject is "the thing that looks safe (still allowed) is the thing that's actually the problem" — the color choice is in service of that exact idea, not incidental to it.

---

## 6. Cross-cutting notes

### 6.1 What deliberately does *not* get a mechanic

- **A "pillars of Zero Trust" taxonomy (identity / device / network / application / data or similar).** Rejected as a third mechanic in §1.4 — it's a list, not a shared-variable-divergent-response or AND-gated-verdict mechanic. Recommend a static content grid, matching the existing `TYPES` (Chapter 1) / `ACTIONS` (Chapter 5) pattern: a fixed array of `{ tag, title, text }` objects rendered as non-interactive cards. Not this doc's call to build, just naming the pattern already established on the site if the Content Strategist wants one.
- **"Assume breach"** (the standard companion principle to "never trust, always verify" — assume an attacker may already be inside, so internal traffic gets scrutinized too, not just traffic crossing the perimeter). A real, citable Zero Trust principle, but it's a single supporting fact with no shared variable of its own to dramatize — recommend one sentence of prose, not a mechanic, the same treatment Phase 2d gave the "many sessions in parallel" fact in its own §1.3.
- **Least privilege and microsegmentation** (scoping access to one specific resource at a time, rather than broad network reach once "in"). This is real Zero Trust content, but it is **also exactly the axis `research-ideas.md` #7 (ZTNA vs. VPN) is built around** — "grants access to one specific application at a time... without ever placing the user 'on' the network the way a VPN does." Building a mechanic that dramatizes narrow-vs-broad access scope here would substantially pre-empt entry #7's own reason for existing, and entry #7 is explicitly marked `NOT NOW`. §4.7's closing paragraph is deliberately worded to name this as a decision-vs-scope distinction and stop there, rather than build out the scope side of the story. See §6.4.

### 6.2 Placement — explicitly not this doc's call, one observation offered

Per the same role split every prior phase in this series has honored, chapter structure and exact placement of these two components within the new Chapter 7 belongs to the Content & Flow Strategist / project owner. One observation worth passing along: the two mechanics have a natural reading order that mirrors §1's own argument structure — `ContinuousVerificationViz` pairs naturally with whatever prose opens the chapter by naming the Chapter 1 checkpoint contrast (it directly echoes `FirewallCheckpointViz`, so placing it early, right after that framing lands, keeps the callback legible), and `TrustSignalsViz` reads better once identity/device/context have each been named in prose individually (it assumes the vocabulary, it doesn't introduce it) — so a natural order is intro → Chapter-1 contrast → `ContinuousVerificationViz` → identity/device/context breakdown (possibly the §6.1 pillars grid) → `TrustSignalsViz` → closing. Offered as a recommendation, not a requirement.

Mechanically, adding the chapter follows the process CLAUDE.md already documents: a new `src/components/chapters/Chapter7ZeroTrust.tsx` (or whatever name the Content Strategist picks), one new line in `src/App.tsx`'s render list, one new line in `Header.tsx`'s `NAV_LINKS`. Nothing about either mechanic in this doc requires deviating from that mechanical process.

### 6.3 Glossary and acronym notes (Content Strategist's/owner's call, not mine)

- **`MDM` (Mobile Device Management) is already in `ACRONYMS`** and, as of this writing, used nowhere on the site — both mechanics in this doc use it (§3.2, §4.4). No new acronym entry needed for it.
- **`GPO` (Group Policy Object)** is also already in `ACRONYMS` and also currently unused. Neither mechanic in this doc needs it, but flagging it as available, pre-seeded groundwork in case the Content Strategist's prose wants a concrete example of *how* a device compliance rule gets set in the first place (a GPO push, an MDM profile) — not a requirement, just passing along what's already there, the same way `research-ideas.md` itself flagged the orphaned VPN glossary category before any chapter used it.
- **No new acronyms are required by anything in this document.** Both new signal-failure examples (§4.4: "a password that's already appeared in a known breach," "signing in from a country they've never used before") were deliberately phrased to avoid needing `MFA` or any other net-new acronym — a scope-minimization choice, not an oversight.
- **`Zero Trust` itself is a name, not an acronym** — same treatment `QUIC` got in Phase 2c: do not add it to `ACRONYMS`. **`ZTA` (Zero Trust Architecture)** is a real initialism the chapter's own title uses, but whether the Content Strategist's prose actually uses "ZTA" as shorthand repeatedly (vs. always spelling out "Zero Trust") isn't something this doc can predict — recommend adding it to `ACRONYMS` only if the prose ends up using the bare initialism more than once; skip it if the prose just says "Zero Trust" throughout. Not a ⚠ flag, a contingent, low-stakes call for whoever writes the final copy.
- **Glossary category is an awkward fit, flagged rather than resolved, the same way Phase 2c flagged 5-tuple/Connection ID/QUIC's fit into `firewall`/`tls`/`vpn`.** Terms this design's copy leans on — *device posture*, *continuous verification*, *policy decision* — don't sit cleanly in any of the three existing `GlossaryCategory` values (`firewall` | `tls` | `vpn`). A fourth category (e.g. `zero-trust`) reads as the natural fix, but adding a new `GlossaryCategory` value is a data-shape decision outside this design's scope, per the same boundary Phase 2c drew around its own version of this question.

### 6.4 Explicit scope boundary against entry #7 (ZTNA vs. VPN)

Stated once, plainly, since this is the one boundary most worth getting exactly right: nothing in this document builds, implies, or requires a mechanic comparing VPN's broad-tunnel access model against ZTNA's per-application access model. `ContinuousVerificationViz`'s "perimeter model" row is framed purely around the **zone-based firewall model from Chapter 1** (already-taught content), not VPN specifically — VPN isn't named anywhere in either mechanic's spec. If the Content Strategist's parallel prose wants to mention VPN briefly as one further example of "the old model" (it's already in the Chapter 1 `TYPES` grid and the glossary, so a passing mention costs nothing new), that's a one-sentence prose choice, not something either mechanic in this document depends on or dramatizes. Building any interactive around VPN's access breadth vs. ZTNA's per-app scoping is entry #7's job, explicitly deferred by the project owner's own `NOT NOW`.

### 6.5 No new color tokens, no new motion primitives, no new `src/data/` file

Confirmed throughout §3–§5. Both components reuse `Card`, `Toggle`, `clsx`-driven conditional className logic, and `lucide-react`'s `CheckCircle2`/`XCircle`/`MinusCircle` (already a dependency via `VerificationWalkthrough`/`SessionTrackingViz`) exactly as this palette already does it. No new entries to `index.css`, no changes to `Toggle.tsx`.

### 6.6 Independently shippable, independently from each other too

Neither mechanic depends on the other existing to function — `ContinuousVerificationViz` doesn't read `TrustSignalsViz`'s state or vice versa, matching every prior "self-contained, zero props" component in this palette. Either could ship alone if the project owner wanted to cut one; the §4.6 callout line in `TrustSignalsViz` references `ContinuousVerificationViz`'s content in prose only, not as a runtime dependency, so removing `ContinuousVerificationViz` would just mean deleting that one callout sentence, not breaking anything.

---

## 7. Summary of ⚠ needs-a-decision flags

None. Every question this brief raised has a confident, resolved recommendation with rationale above, matching the standard every prior phase has held and this phase's larger canvas asks to be held to more strictly, not less:

- Whether this topic needs one interactive, two, or more, given its full-new-chapter size (§1.4) — **two**, because the source material splits into two genuinely separable claims (when a check happens; what gets checked and how it combines), each independently clearing this series' "worth a mechanic" bar, and a third candidate (a pillars taxonomy) does not.
- Whether to build the brief's own candidate literally, as a static "checked once vs. checked continuously" label pair (§1.2) — **rejected**, no shared variable, no interactive payoff; sharpened into a triggered event (device posture changing mid-session) instead, which is the same underlying idea made clickable.
- Whether `ContinuousVerificationViz` fits as a toggle on `FirewallCheckpointViz` itself, the component the brief explicitly names as the direct contrast (§2) — **rejected**, checked explicitly: the single fixed-checkpoint layout has no concept of "a second check, later," which is the entire point being taught.
- Whether claim B (`TrustSignalsViz`) should use `PolicyEvaluator`/`VerificationWalkthrough`'s scenario-dropdown shape or independent toggles (§4.1) — **independent toggles**, because the AND-logic teaching point specifically requires a learner being able to isolate any single failing signal, which a curated scenario list could too easily never offer.
- Whether claim B needs its own two-row "old model" comparison, mirroring claim A (§4.6) — **no**, a single callout line instead; a second row here would mean inventing a second, uninteresting reaction ("wasn't checking any of this," three times) rather than adding a real comparison.
- Component scope, data shape, default states, reset behavior, row/signal content, and exact draft copy for both mechanics (§3, §4) — fully specified.
- Color semantics, including the one deliberate inversion of the site's usual convention in `ContinuousVerificationViz` and why `TrustSignalsViz` doesn't need the same treatment (§5) — resolved with explicit reasoning grounded in `VerificationWalkthrough`'s existing precedent, not left as an unexplained departure.
- What gets left to prose entirely — a pillars grid, "assume breach," least privilege/microsegmentation (§6.1) — resolved with reasoning for each, including the explicit boundary against entry #7's territory (§6.4).
- Glossary/acronym handling, including the pre-seeded `MDM`/`GPO` groundwork this design deliberately picks up (§6.3) — resolved with a recommendation, no new acronyms required.

The only two items left open are, consistent with every prior phase in this series: **placement** (§6.2 — always the Content Strategist's/project owner's call, though a recommendation is offered), and **whether `ZTA` gets added to `ACRONYMS`** (§6.3 — contingent on a prose choice this document can't predict, not an unresolved mechanic question).
