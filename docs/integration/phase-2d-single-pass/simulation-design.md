# Phase 2d — Simulation / Interaction Design: Single-Pass (Parallel Processing) Architecture

**Author role:** Simulation/Interaction Designer (game-design role — mechanics and states only, no prose, no code).
**Status:** Draft, awaiting project-owner review alongside the Content & Flow Strategist's parallel content plan for this topic.
**Consumes:** `docs/research-ideas.md` #16 ("Single pass (parallel processing) architecture") for subject-matter grounding; `src/components/chapters/FirewallCheckpointViz.tsx`, `src/components/chapters/HandshakeStepper.tsx` + `src/data/handshakeSteps.ts`, `src/components/chapters/CipherDecoder.tsx` + `src/data/cipherSuite.ts`, `src/components/chapters/SessionTrackingViz.tsx`, `src/components/sandbox/Sandbox.tsx`, `src/components/chapters/Chapter5DecryptionPolicies.tsx`'s `PolicyEvaluator`, `src/components/chapters/Chapter3Handshake.tsx` (home of the App-ID/User-ID/Content-ID vendor-attribution card this topic answers), `src/components/chapters/Chapter6ForwardProxy.tsx` (current home of `SessionTrackingViz`, read to gauge how crowded that chapter already is) — the site's full existing interactive vocabulary and its two most recent additions; `docs/integration/phase-1-certificates/simulation-design.md`, `docs/integration/phase-2a-ech/simulation-design.md`, `docs/integration/phase-2b-pq-crypto/simulation-design.md`, and `docs/integration/phase-2c-quic/simulation-design.md` as process precedent, Phase 2c specifically as the precedent for doing this from scratch with no suggested mechanic to evaluate, and for treating "no interactive, prose is enough" as a legitimate conclusion for some of a topic's facts.
**Produces:** this document. Owns mechanics, exact data-shape, and the *facts* each new piece of copy must convey — not the polished sentences themselves. A parallel content plan owns final prose and placement/framing decisions.

---

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string in quotes (labels, captions, messages) is a **draft/placeholder written to prove the mechanic reads correctly** — the Implementer should treat these as content-requirements to match against the Content Strategist's voice, not paste them in verbatim as final copy. Where I mean "these exact facts must appear, wording is not mine to decide," I've written that as a bullet list of facts instead of a sentence.

**Same starting position as Phase 2c:** `research-ideas.md` #16 makes no mechanic suggestion of its own — it states what single-pass architecture is and why it matters, and stops. This brief itself offers one candidate to weigh (an old-way-N-sequential-hops vs. new-way-one-traversal contrast) but explicitly frames it as a candidate, not a prescription. So this document does the full exercise from scratch, the way Phase 2c did: find the one "aha," check it against every existing pattern, and only reach for something new — or conclude nothing's needed — once that check is done.

---

## 1. What's actually being taught, and picking the one "aha"

`research-ideas.md` #16 is thinner than the QUIC entry Phase 2c worked from — it's one idea, not five facts to triage, which matters for how big a mechanic this topic can justify. Restated precisely:

- Older-style firewalls historically chained together **separate inspection engines** (antivirus, intrusion detection, application control, and so on), and traffic passed through each one **in sequence**. Turning on more features meant more sequential passes, and more added delay — the tax **compounds** as more gets enabled.
- Single-pass architecture instead does the networking lookup, policy match, application identification, and threat/content signature matching **all in one traversal per packet**. Enabling more inspection doesn't multiply the number of passes traffic has to survive.
- A second, related-but-separate fact: many sessions are handled **at once**, across dedicated processing cores. This is a *concurrency/throughput* claim (how many different packets get worked on in parallel across the whole appliance), not the *per-packet latency* claim above (how many sequential stages one packet's own traversal goes through). The two facts share the word "parallel" but aren't the same axis — see §1.3 for why only the first is worth a mechanic here.
- Like App-ID/User-ID/Content-ID, "single-pass" is one vendor's branded name for an architecture pattern other vendors implement differently — the same disclosure Chapter 3's existing vendor-attribution card already makes for those three names needs to extend to this one too, if the copy is going to use the term "single-pass" as a proper noun.
- It's explicitly framed as a **footnote to mechanics already taught**, not new content: "small section... doesn't need its own chapter... more of a 'how' footnote." It directly resolves a tension the site already set up but never answered (Chapter 3's vendor-attribution card names App-ID/User-ID/Content-ID without saying how a firewall affords doing all three, plus decryption, without becoming the bottleneck) and it's an honest justification for a simplification the Sandbox already makes out loud (its own italic aside: *"Real firewalls usually need to see a few packets of a session before App-ID can confirm what's actually running. This sandbox shows the eventual verdict instantly, for clarity."*).

### 1.1 The one genuine "aha," and why it clears the bar this series has set

The load-bearing fact is the **compounding vs. flat** contrast: as an admin enables more inspection capability, a chained-engine design's per-packet cost keeps climbing, one hop per feature, while a single-pass design's per-packet cost doesn't, because the same features run together inside one traversal instead of one after another. That's a genuine mechanic, not just a fact to state, for the same reason Phase 2c's connection-ID persistence cleared its bar: it's a **shared variable** (how many inspection features are turned on) that produces **two different, divergent responses** in two architectures, watched side by side. It is not a static, unordered tradeoff between two named postures with no shared trigger — that shape was already rejected once, by Phase 2c §1.3, for "block UDP/443 vs. decrypt-and-inspect," and this is a different, mechanic-shaped kind of fact from that one.

**Decision: this is worth an interactive.** Sections 2–3 spec it. Section 1.2 covers why I'm *not* recommending the literal "old way: N checkpoints in a row, animated packet" version of this brief's own candidate, and 1.3 covers the second fact (parallel sessions across cores) that I'm deliberately leaving out.

### 1.2 Weighing the brief's own candidate: animated multi-checkpoint timeline vs. static toggle-driven comparison

The brief poses this explicitly as a live question, not a rubber-stamp. Working through it the way Phase 2c worked through its HandshakeStepper-toggle question (§2.1 there):

**Would this fit as a toggle on `FirewallCheckpointViz`?** Checked directly, using the same duplication-style method: `FirewallCheckpointViz` today is two "network" boxes, one fixed-position 60px-wide firewall box in the middle, and five packets each animating along one fixed path (`left: '6%' → '48%' → '90%'`) that either continue past the checkpoint or stop and get an ✕ at the 48% mark. Every part of that layout assumes **exactly one checkpoint**. Modeling a chain of N sequential engines means replacing that single centered box with N boxes in series and re-deriving the packet path's keyframes for however many stops are active — the position values, not just the label text, change shape depending on state. That's the same class of problem Phase 2c found when it checked `HandshakeStepper` for a QUIC toggle and rejected it (2c §2.1): a structural, layout-level change, not a text-swap on an existing extension point. `FirewallCheckpointViz` has no `echBody`/`hybridText`-style optional field to hang this off of, and inventing one here would mean rebuilding most of the component, not extending it.

**Would a *new* component built in that same animated-timeline style be worth it anyway?** This is really a scope question, and it's where this topic's own sizing matters. `research-ideas.md` #16 is explicit that this is a "small section... more of a 'how' footnote," the thinnest-sized Tier 1 entry among the four this integration effort has now worked through (Phase 1's certificate content, 2a's ECH, 2b's PQ crypto, and 2c's QUIC all read as denser, multi-fact topics; this one is one idea). Building a second animated, multi-checkpoint packet-timeline component, with its own keyframe math for a variable number of stops, is a bigger implementation surface than `FirewallCheckpointViz` itself required for a single fixed checkpoint — disproportionate to a topic this doc's own source material sizes as a footnote. It would also duplicate, not extend, the "packet moving left to right, allowed or stopped" visual vocabulary `FirewallCheckpointViz` already trains a learner on from Chapter 1 onward, for a comparison that doesn't actually need motion to land (see next paragraph).

**Does the comparison need animation to be legible, or does a static, reactive-on-select rendering already say it?** The core claim is a **count**: how many sequential stages a packet passes through. A count is not better communicated by watching something travel for 1.5 seconds than by seeing, at a glance, "one connected chain of 4 boxes" next to "one box." `SessionTrackingViz` (Phase 2c) already established, and its own §3.7 argues explicitly, that a comparison which is "a static two-row comparison that re-renders in place" rather than "a triggered action producing a new event each time" belongs in the reactive/static tier, not the animated-feedback tier — and CLAUDE.md's own motion-tiering rationale (decorative animation raises extraneous cognitive load; only feedback-tied animation earns its cost) cuts the same way here. Nothing about *this* comparison is a triggered event a learner fires and watches resolve; it's two systems' standing response to a dial a learner turns. That is exactly `SessionTrackingViz`'s shape, not `FirewallCheckpointViz`'s.

**Conclusion: build the comparison as a new, small, static/toggle-driven component in `SessionTrackingViz`'s weight class — reject the animated-timeline version of the brief's own candidate.** The underlying "old way: N hops, one per feature; new way: one traversal" contrast is right and worth keeping; the animated-checkpoint-chain *delivery mechanism* for it is not, for the reasons above.

### 1.3 Weighing whether the "many sessions in parallel, across dedicated cores" fact deserves its own treatment

`research-ideas.md` #16 mentions this in the same breath as single-pass, but it's a different axis: it's about how many *different packets/sessions* an appliance works on simultaneously (a throughput/scaling fact), not how many sequential *stages one packet's own traversal* goes through (the latency fact §1.1 covers). Conflating the two in one mechanic would blur exactly the distinction Phase 2b was careful to keep clean between forward secrecy and harvest-now-decrypt-later (2b §3.3): two real, related facts that answer *different* questions and shouldn't be taught as one.

Checked on its own merits: does "many sessions handled at once, across dedicated cores" clear the same "shared variable, divergent response" bar §1.1 used? No — there's no comparable "old way" for this specific fact to contrast against in what the site already teaches (nothing on the site currently claims older firewalls process sessions *serially*, one at a time, across the whole appliance; that's not the claim `research-ideas.md` #16 makes either — its contrast is about *stages per packet*, not *sessions in flight*). Without a genuine two-sided comparison, this is a standalone fact, better served by one sentence of prose than by a second mechanic. **Decision: no mechanic for this fact.** Recommend it appear, if at all, as a single supporting sentence near whatever copy accompanies the mechanic in §3 — worth naming so the mechanic's own copy doesn't imply it's the *only* way single-pass designs get performance headroom, but not something this design specs further.

---

## 2. Fit-check against every existing interactive pattern

Same discipline every prior phase in this series has applied before proposing something new:

| Existing pattern | What it structurally models | Does the single-pass-vs-chained comparison fit it? |
|---|---|---|
| `FirewallCheckpointViz` (Ch. 1) | One fixed checkpoint, a fixed animated packet path, replay-triggered. | **No — checked in detail in §1.2.** Requires a variable number of sequential stops, which the component's single-checkpoint layout and fixed keyframes can't express without a structural rebuild. |
| `HandshakeStepper` + toggle (ECH precedent) | A fixed, ordered sequence of steps at fixed `pos` values; a toggle swaps body text on specific steps. | No — nothing here is a point in a connect→handshake→inspect→decide sequence. This is a comparison between two *architectures* processing the same abstract packet, not a moment inside one handshake walkthrough. Same shape of mismatch Phase 2c found (2c §2.1) when it checked this same component for a QUIC toggle. |
| `CipherDecoder` + toggle (hybrid-PQ precedent) | One string decomposed into independent axes; a chip's code is a literal substring of that string. | No — there's no single string here for anything to be a substring of. Structurally foreign from the start, same conclusion Phase 2b and 2c both reached checking this pattern against their own topics. |
| `PolicyEvaluator` / `Sandbox` | Ordered checks or rule-matching against a picked scenario, first-match-wins; or button-triggered send-and-log. | No — nothing here is "which rule fires first," and nothing is a discrete triggered action worth a console-log entry. Also: CLAUDE.md reserves the terminal-log/blinking-cursor treatment specifically for `Sandbox`; this mechanic isn't extending `Sandbox`'s own testable rule-vs-traffic action, so it shouldn't borrow that visual language even if it ends up placed near it (see §5). |
| `SessionTrackingViz` (Ch. 6, Phase 2c) | One `Toggle`, two always-visible rows that both react to the same click, one row's outcome changes while the other's doesn't. | **Yes — this is the fit.** One shared variable (features enabled), two rows (chained / single-pass) that diverge in exactly the way that's the whole point. Closest structural precedent in the entire codebase. |

**Conclusion:** build one new, small, standalone component, deliberately sized and shaped like `SessionTrackingViz` — one `Card`, one small piece of local state, no data file, no props, reactive-on-select with no animation, no transition delay, no button.

---

## 3. Exact spec

### 3.1 Component

**Suggested name/path:** `src/components/chapters/SinglePassViz.tsx` — same "concept + Viz" naming shape as `FirewallCheckpointViz` and `SessionTrackingViz`, same directory as every other chapter visualization, regardless of which page ends up hosting it (placement is explicitly not this doc's call — see §5).

**No separate data file.** Four feature names and their cumulative groupings are a handful of fixed strings, smaller and less reusable-elsewhere than `cipherSuite.ts` or `handshakeSteps.ts` ever were — the same "inline constants, not a `src/data/` file" precedent `SessionTrackingViz` set in Phase 2c §3.1, for the same reason.

**Self-contained, zero props.** Nothing else on the site needs to read or drive this component's state.

### 3.2 State and data shape

```ts
type FeatureCount = 1 | 2 | 3 | 4;

// Cumulative, in the same order Chapter 3's "Three lenses" card already lists App-ID / User-ID /
// Content-ID, with decryption appended as the fourth — deliberately not alphabetical or random,
// so a learner who's already read that card recognizes the same three names in the same order,
// plus one more.
const FEATURES = ['App-ID', 'User-ID', 'Content-ID', 'Decryption'] as const;

const FEATURE_COUNT_OPTIONS: { value: FeatureCount; label: string }[] = [
  { value: 1, label: 'App-ID only' },
  { value: 2, label: '+ User-ID' },
  { value: 3, label: '+ Content-ID' },
  { value: 4, label: '+ Decryption' },
];

const [count, setCount] = useState<FeatureCount>(1);
const active = FEATURES.slice(0, count); // e.g. count=2 -> ['App-ID', 'User-ID']
```

**Default is `1` (App-ID only), deliberately.** Same "baseline first, learner opts into the changed state" convention every prior toggle in this palette has used (`ech`'s `'off'`, `kexMode`'s `'classical'`, `network`'s `'same'`). App-ID is also the one baseline check a firewall always does regardless of what else is configured — the site's own Sandbox and Chapter 3 content already treat it as the default-on capability that User-ID/Content-ID/decryption are layered on top of by policy, so defaulting to "App-ID only" doesn't just match this palette's convention, it matches how these four capabilities are actually deployed relative to each other.

**Why 4 states, not 2 (a `SessionTrackingViz`-style binary toggle was considered):** A 2-state toggle (say, "1 feature" vs. "all 4") would still demonstrate that the two architectures diverge, but the actual claim being taught is about a **trend** — cost climbs steadily as more gets turned on in one architecture and doesn't in the other — and a single before/after jump is weaker evidence for a trend than four points on the same curve are. The implementation cost of 4 states over 2 is negligible (one more array slice, three more `Toggle` options, well within precedent — `HandshakeStepper`'s `MODE_OPTIONS` and `Sandbox`'s match-mode toggle both already run 3 options through this exact `Toggle` component). Confident recommendation, not a flag.

**No reset condition to specify.** Same reasoning every prior toggle-only component in this palette has given (2c §3.3 for `kexMode`, 2c for `network`): no sibling state, no parent scenario to reset against. `count` simply persists at whatever the learner last set it to, for the life of the mounted component.

**Instant, no transition delay, no button.** Same as every other state change already in this palette. Clicking a `FEATURE_COUNT_OPTIONS` entry recomputes both rows synchronously.

### 3.3 Rendering — two rows, stacked, always both visible

Both rows render simultaneously at all times, not one-at-a-time — same "adjacent, not a memory exercise" argument Phase 2a (§1.2) and Phase 2c (§3.4) both made for their own two-state comparisons: the point is watching one identical click produce two different outcomes in the same glance.

**Layout — stacked full-width rows, not a `md:grid-cols-2` pair.** `SessionTrackingViz` used a two-column grid because each row's content was a couple of short lines. Here, the legacy row needs to render up to 4 chips plus connectors in sequence, which wants full card width to stay legible, especially at the 4-feature state — a side-by-side grid would force that chain to wrap awkwardly inside a half-width column on anything but a wide viewport. Suggested structure: `Card` containing, top to bottom: intro paragraph (§3.5) → `Toggle` (labeled, primary-weight — this is the component's only control, same reasoning `SessionTrackingViz` §3.4 gave for giving its own single `Toggle` full visual weight rather than the demoted secondary-control treatment `ech`/`kexMode` get) → Row 1 → Row 2 → caveat aside (§3.5) → closing paragraph (§3.5). Each row is its own full-width block (`rounded-md p-4 border border-line-soft bg-bg-deep`, matching the box treatment `SessionTrackingViz`'s two column-cells already use, just full-width instead of half-width).

**Row 1 — "Legacy: chained engines" (draft header):**
- A horizontal, wrapping (`flex flex-wrap items-center gap-1.5`) chain: one small chip per entry in `active` (font-mono, same visual family as `CipherDecoder`'s inactive-chip styling — `bg-bg-deep border border-line rounded-sm px-2.5 py-1 text-[12.5px] text-ink-dim`, **not** clickable, purely a display element, so don't reuse the *active*/accent-highlighted chip state, only the resting one), each pair separated by a small `→` glyph (`text-ink-faint`) to read as "then, then, then."
- Beneath the chain, a caption line, dynamic on `count`:
  - `count === 1`: neutral. Draft text: *"One feature, one pass. No difference yet — the two architectures only start to diverge once more gets turned on."*
  - `count > 1`: draft text template: *"{count} sequential passes. Every feature added here is one more stop this same packet has to survive before it reaches a decision."* Styling: plain `text-ink` for the emphasized count number (e.g. wrap `{count}` in a `<strong>` or slightly larger/bolder text), rest of the sentence `text-ink-dim` — **deliberately no color token beyond that.** See §4 for why this intentionally does not reuse `danger`/`success` the way `SessionTrackingViz`'s rows do.

**Row 2 — "Single-pass: one traversal" (draft header):**
- One chip, always exactly one regardless of `count`, containing every entry in `active` joined together (e.g. `count = 1` → `App-ID`; `count = 4` → `App-ID + User-ID + Content-ID + Decryption`), styled with an accent tint to mark it as the "bundled together" element — `border-accent bg-accent/10 text-ink`, `font-mono text-[12.5px] px-2.5 py-1.5 rounded-sm`, `inline-block` so it doesn't force full width when short.
- Beneath it, a caption line, **not dynamic on `count`** (this is the entire point — it doesn't change): *"One pass, no matter how many of these are active."*

### 3.4 Accessibility note (binding, not optional)

Row 1's growing-count caption must not rely on color alone to signal "this is getting bigger" — the sentence itself states the number and says "sequential passes," which satisfies this by construction, matching the same requirement Phase 2c's §3.5 stated for `SessionTrackingViz`. Since this design deliberately avoids color-coding Row 1 as bad/dangerous (§4), there's no color-only state to guard against here in the first place.

### 3.5 Required facts — intro paragraph, caveat aside, and closing paragraph

**Intro paragraph** (draft placeholder, facts firm):
- App-ID, User-ID, and Content-ID were already disclosed, in Chapter 3, as one vendor's branded names for capabilities most firewalls implement in some form. "Single-pass" is that same vendor's branded name for *this* architecture pattern — the same disclosure needs to extend to this term too, the first time this copy uses it as a proper noun. This is a **required fact**, not optional flavor — it's the same disclosure obligation the site already committed to in Chapter 3's existing vendor-attribution card, and skipping it here would be an inconsistency the Content Strategist should not introduce.
- Older-style firewalls historically ran separate inspection engines (antivirus, intrusion detection, application control, and so on) as separate sequential stages; enabling more of them meant more stages a packet had to pass through, one after another.
- Single-pass architecture instead does the networking lookup, policy match, and every inspection capability (App-ID, User-ID, Content-ID, decryption) together, in one traversal per packet — so turning more of them on doesn't multiply how many stages a packet survives.
- Pointer to what to do: toggle the number of enabled features below and watch the two rows diverge.

Draft text: *"App-ID, User-ID, and Content-ID were introduced back in Chapter 3 as one vendor's branded names for capabilities most firewalls implement in some form. Single-pass architecture is that same vendor's name for how it runs all of them, plus decryption, without each one adding its own delay. Older-style firewalls historically chained together a separate engine per capability, antivirus, intrusion detection, application control, and so on, and a packet had to survive each one in sequence. Turn on more of them below and watch what that costs, in one architecture and not the other."*

**Row 1 / Row 2 captions:** specified in §3.3, facts firm, exact wording draft.

**Caveat aside** (draft placeholder, facts firm — required so the mechanic doesn't overclaim):
- Single-pass doesn't mean enabling more features is free. Each additional capability still does real, additional work inside that one traversal (more signatures to check, more computation) — what single-pass avoids is specifically the **multiplicative, one-hop-per-feature** cost of doing each as its own separate sequential pass, not all cost whatsoever.
- This is the honest version of a simplification the Sandbox elsewhere on this site already makes out loud: App-ID resolving instantly there is a simplification for clarity, and single-pass architecture is *part of* why real firewalls don't pay a bigger latency tax for each additional thing they're asked to check, not a claim that any of this is instantaneous.

Draft text: *"One thing this isn't saying: that turning features on is free. Each one still does real work inside that single traversal, more signatures to check, more computation. What single-pass avoids specifically is paying for each feature as its own separate trip through the packet's path. It's also part of why the Sandbox further down this page can show App-ID's verdict instantly, for clarity, without that being a bigger simplification than it already is."*

**Closing paragraph** (draft placeholder, facts firm — carries the one fact §1.3 explicitly kept out of the mechanic itself):
- Single-pass architecture is also usually paired with running many different sessions at once, across dedicated processing cores — a genuinely separate fact from the one-traversal-per-packet idea this component demonstrates (that one's about how many *sessions* run at once; this component is about how many *stages* one packet's own traversal goes through), worth naming so a learner doesn't come away thinking one-traversal-per-packet is the whole performance story.

Draft text: *"One related fact this toggle doesn't show: single-pass firewalls also typically handle many different sessions at once, spread across dedicated processing cores. That's a separate lever, how many packets get worked on in parallel, not how many stages any one packet's own trip involves, which is what's actually being compared above."*

### 3.6 Visual / motion notes

No new color tokens. `accent`, `ink`/`ink-dim`/`ink-faint`, `line`/`line-soft` cover everything (see §4 for why `success`/`danger` are deliberately *not* used here, unlike `SessionTrackingViz`). No new motion — state changes are instant, matching every other toggle-driven state change in this palette; this is explicitly **not** a `Sandbox`-style accumulating log and explicitly **not** a `FirewallCheckpointViz`-style animated timeline, for the reasons argued in §1.2. Reuses `Card`, `Toggle`, `clsx`-driven conditional className logic exactly as every other component in this palette already does it.

**Optional, skippable enhancement** (same status every prior phase has given this category of extra — "worth doing if time allows, safe to skip if not"): a small Framer Motion touch where Row 1's chips fade/slide in one at a time, left to right, with a short stagger (e.g. 150ms apart) when `count` increases, versus Row 2's single chip which never re-animates on `count` change (its content updates in place). This would give the "extra stops take extra time" idea one more sensory cue without turning the component into a full timeline animation — it's decoration *tied to* the actual state change, not decoration for its own sake, so it wouldn't cross the line §1.2 draws against a full animated-checkpoint rebuild. If skipped, §3.3's captions already state the same fact in text; nothing is lost mechanically.

---

## 4. Why this component deliberately does *not* reuse `SessionTrackingViz`'s success/danger convention

Worth stating explicitly, since departing from the immediately-preceding phase's own established color pattern needs justification, not just silent deviation. `SessionTrackingViz`'s two rows really are a pass/fail judgment — one architecture's session survives a network change (`success`, matching `FirewallCheckpointViz`'s "allowed" green) and the other's breaks (`danger`, matching "blocked" red), and CLAUDE.md reserves `danger` specifically for "errors, blocked traffic."

Neither of this component's two rows is an error or blocked traffic. A chained-engine firewall processing 4 features in 4 sequential passes is **slower, not wrong** — it still works, still reaches a decision, still allows or blocks traffic correctly. Coloring Row 1 `danger`-red as its chip count grows would misapply the site's one color convention specifically reserved for "this failed" to a fact that means "this costs more," which is a real but different judgment. It would also teach a false equivalence: a learner who's internalized `FirewallCheckpointViz`'s red-X-means-blocked convention from Chapter 1 onward could easily misread a red-tinted Row 1 as "the chained-engine firewall stops working once you enable enough features," which isn't the claim. **Decision: no color-coding of "cost" as good/bad on either row.** Row 2 gets a mild `accent` tint on its one bundled chip (marking it as "the thing to notice," the same low-stakes emphasis role `accent` already plays elsewhere on the site, e.g. `SessionTrackingViz`'s own `Connection ID` line), and Row 1's caption uses plain text-weight emphasis on the number, not a color, to signal "this is the value that's changing." Confident decision, not a flag.

---

## 5. Cross-cutting notes

- **Placement is explicitly not my call**, same role split as every prior phase. `research-ideas.md` #16 suggests "near the existing vendor-attribution card in Chapter 3 or as a short aside introducing the Sandbox." One observation worth passing along, the same way Phase 2c passed along a Chapter-2-is-interactive-free observation: **Chapter 3 and Chapter 6 are now the two most visually dense chapters on the site** (Chapter 3 already carries `HandshakeStepper` plus three `Card`s including the ECH "what changes next" card from Phase 2a; Chapter 6 already carries five `Card`s plus `SessionTrackingViz` from Phase 2c), while the Sandbox currently opens with only its `SectionHead` and no interactive lead-in — and the Sandbox's own existing italic aside (*"Real firewalls usually need to see a few packets... This sandbox shows the eventual verdict instantly, for clarity"*) is the exact sentence this component's caveat (§3.5) is written to pay off. That makes the Sandbox intro read as the tighter content fit to me, not just the less-crowded one — but this is a recommendation, not a requirement, and the Content Strategist/project owner should treat it as such.
- **Glossary suggestion (Content Strategist's call, not mine):** `src/data/glossary.ts`'s `firewall` category already holds `App-ID`, `User-ID`, `Content-ID`, and a `5-tuple`/`Connection ID` pair added for Phase 2c — the natural home for a `Single-pass architecture` entry, continuing that same category's "how a firewall actually processes traffic" theme. Suggested def, in the same voice as the existing `App-ID` entry's own vendor-disclosure sentence: something conveying "does networking, policy, App-ID/User-ID/Content-ID, and decryption together in one traversal per packet, rather than as separate sequential engine passes — one vendor's branded name for the pattern, like App-ID/User-ID/Content-ID above it."
- **No new acronym needed.** "Single-pass" isn't an acronym, and every term this design's copy leans on (`App-ID`, `User-ID`, `Content-ID`) is already in `src/data/acronyms.ts`. Flagging only so `single-pass` isn't mistakenly added as an acronym-tooltip entry the way Phase 2c had to explicitly warn off doing for `QUIC` (2c §5) — there's no expansion to give it.
- **No new color tokens, no new motion primitives, no new file under `src/data/`.** Confirmed in §3.1, §3.6, and §4.
- **Independently shippable.** Nothing elsewhere on the site depends on this component existing; if it's cut, nothing else in this design or on the site breaks. If the optional stagger animation in §3.6 is cut, the mechanic is unaffected.
- **Scope explicitly excludes** an animated multi-checkpoint timeline (§1.2) and a second mechanic for parallel-session throughput (§1.3) — both considered and rejected with reasoning above, not omissions.

---

## 6. Summary of ⚠ needs-a-decision flags

None. Every question this brief raised has a confident, resolved recommendation with rationale above:

- Whether this topic needs a dedicated interactive at all, given its "footnote" sizing (§1.1) — **yes**, because the compounding-vs-flat fact is a genuine shared-variable, divergent-response mechanic, not a static fact better left to prose.
- Whether to build the brief's own candidate as an animated multi-checkpoint timeline extending `FirewallCheckpointViz` (§1.2) — **rejected**, both because the existing component's layout can't absorb a variable-stage-count chain without a structural rebuild, and because the underlying claim is a count, which a static rendering communicates as well as an animation would, at a fraction of the implementation cost, for a topic this size.
- Whether the "many sessions in parallel across dedicated cores" fact deserves its own mechanic or treatment (§1.3) — **rejected**, no comparable "old way" exists on the site for it to contrast against, and conflating it with the per-packet-stages fact would blur two genuinely different claims; recommend one supporting sentence in prose instead.
- Component scope, data shape, default state (`count = 1`), why 4 states instead of 2, reset behavior, row content, and exact draft copy (§3) — all specified.
- Why this component's color treatment deliberately departs from `SessionTrackingViz`'s success/danger convention (§4) — resolved with reasoning, not left as an inconsistency.
- Glossary and acronym handling (§5) — resolved with a recommendation, including an explicit warning against a mistake (`single-pass` as a fake acronym) the same way Phase 2c warned against `QUIC`.

The only two items left open are, consistent with every prior phase in this series: **placement** (§5 — always the Content Strategist's/project owner's call, not a flag, though a recommendation is offered), and the **optional stagger-animation enhancement** (§3.6 — an explicitly skippable scope option, not an unresolved design question; the mechanic is fully specified and functional without it).

---

## 7. Implementation status

- ✅ Implemented — `src/components/chapters/SinglePassViz.tsx` created, matching §3's spec: zero props, no
  `src/data/` file, four cumulative `FEATURE_COUNT_OPTIONS` states defaulting to `count = 1` (App-ID only), two
  always-visible rows (chained chip-chain vs. one bundled chip), no color-coding of either row as good/bad per
  §4's explicit reasoning, no animation/transition delay/button per §3.6, intro/row captions/caveat/closing
  copy matching the facts specified in §3.5 in this chapter's established voice. Reuses `Card`, `Toggle`,
  `AutoLink` exactly as every other component in this palette does.
  - One implementation-level deviation from §3.2's literal type sketch, not from the mechanic itself:
    `FeatureCount` is a string union (`'1' | '2' | '3' | '4'`) rather than the numeric `1 | 2 | 3 | 4` shown in
    §3.2's draft, because the shared `Toggle<T extends string>` primitive (`src/components/ui/Toggle.tsx`) —
    reused unmodified, per this design's own instruction not to introduce new motion/color primitives — is
    constrained to string values, the same as every other toggle in this codebase (`HandshakeStepper`'s
    `ScenarioMode`/`EchState`, `CipherDecoder`'s `KeyExchangeMode`, `Sandbox`'s `MatchMode`, none of which are
    numeric either). Cumulative semantics, the four states, and every other behavior are unchanged.
- ❌ Skipped (reason) — §3.6's optional stagger-animation enhancement (Row 1's chips fading/sliding in with a
  150ms stagger on `count` increase). Skipped per this task's own instruction and §1.2's reasoning against
  animation for this topic: motion is not the point of this component, the captions already state the same
  fact in text per §3.6's own fallback note, and CLAUDE.md's motion-tiering rationale reserves feedback-tied
  animation for cases like `Sandbox`'s console log, not a static toggle-driven comparison like this one.
- ✅ Resolved (owner decision, not this doc's own recommendation) — **placement.** §5 recommended the Sandbox
  intro as "the tighter content fit," explicitly flagged as a recommendation, not a requirement, deferring the
  actual call to the Content Strategist/project owner. The project owner resolved this in favor of **Chapter 3**
  instead, directly below the Content Strategist's new "One pass, not one per feature" `Card` and above "A
  man-in-the-middle, on purpose," to preserve the same prose-adjacent-to-interactive locality pattern every
  prior phase in this series used. See `content-plan.md` §11 for the paired note on the content side.
- ✅ Implemented (owner addition, capturing this doc's own connection) — §1's closing observation and §3.5's
  caveat draft both explicitly connect this component's caveat text to the Sandbox's existing italic footnote
  ("Real firewalls usually need to see a few packets... This sandbox shows the eventual verdict instantly, for
  clarity"). Since the component itself ended up placed in Chapter 3 rather than the Sandbox, that connection is
  now captured as a one-line forward-reference added to the Sandbox's existing footnote instead of shared
  physical placement — see `content-plan.md` §11 for the exact addition. This preserves the genuinely good
  connection this design identified without requiring the component to live where the footnote lives.
- ✅ Verified — `npx tsc -b`, `npm run lint` (oxlint), and `npm run build` all pass clean.
