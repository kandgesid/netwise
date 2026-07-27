**Implementation status (added by the Implementer agent, 2026-07-24): the ECH toggle is ✅ implemented, including both optional items — §2's one-sentence `forwardproxy.note` caveat and §3.4's inline SNI value line — per explicit project-owner resolution. See the inline ✅ notes in §2, §3.1, §3.2, §3.3, and §3.4 below.**

# Phase 2a — Simulation / Interaction Design: ECH and the HandshakeStepper

**Author role:** Simulation/Interaction Designer (game-design role — mechanics and states only, no prose, no code).
**Status:** Draft, awaiting project-owner review alongside the Content & Flow Strategist's parallel content plan for this topic.
**Consumes:** `docs/research-ideas.md` #1 ("Encrypted Client Hello (ECH) — TLS's next privacy layer") for subject-matter grounding; `src/components/chapters/HandshakeStepper.tsx` + `src/data/handshakeSteps.ts` (the component and data this design extends); `docs/integration/phase-1-certificates/simulation-design.md` as the process precedent (state facts, not final prose; quoted strings are draft/placeholder only).
**Produces:** this document. Owns mechanics, states, exact data-shape changes, and the *facts* each changed piece of copy must convey — not the polished sentences themselves. A parallel content plan owns final prose and placement/framing decisions outside this component.

---

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string in quotes (step body text, toggle labels, note text) is a **draft/placeholder written to prove the mechanic reads correctly** — the Implementer should treat these as content-requirements to match against the Content Strategist's voice, not paste them in verbatim as final copy. Where I mean "these exact facts must appear, wording is not mine to decide," I've written that as a bullet list of facts instead of a sentence.

---

## 1. The hypothesis: does ECH deserve a 4th scenario?

`research-ideas.md`'s own fit note proposes extending `HandshakeStepper` with a 4th scenario, `"ECH enabled,"` that shows the SNI field going dark. I evaluated this against how the component and data file are actually built, rather than assuming it's right. **Recommendation: reject the 4th-scenario approach. Build ECH as a toggle inside the existing `passthrough` scenario instead.** Below is the reasoning; nothing here is an open flag, this is a resolved design decision.

### 1.1 What a 4th scenario would actually contain

`passthrough.steps` has 7 entries. Walking through what an `"ech"` scenario's steps would need to say, compared to `passthrough`'s existing steps:

| # | Step | Would ECH change this step's content? |
|---|---|---|
| 0 | TCP handshake (SYN/SYN-ACK/ACK) | **No.** ECH operates inside the TLS ClientHello; TCP setup is identical. |
| 1 | TLS handshake — ClientHello → ServerHello + certificate | **Yes.** This is the one step ECH actually changes: SNI moves from cleartext to encrypted. |
| 2 | TLS handshake — Key exchange + Finished | **No.** Session-key derivation is unaffected by ECH. |
| 3 | Firewall pipeline — App-ID (pattern-based) | **Yes, but secondary.** SNI was one of the metadata signals App-ID leans on; losing it weakens (not eliminates) this step's inference. |
| 4 | Firewall pipeline — User-ID | **No.** User-ID maps source address to identity via directory data, never reads the packet. |
| 5 | Firewall pipeline — Content-ID (limited) | **No, not meaningfully.** Content-ID is already described as limited to "whatever metadata is visible" — SNI's disappearance doesn't change the framing of this step, since the step never singled out SNI as its source. |
| 6 | Policy decision — Allow or deny | **Yes, but secondary.** The existing text explicitly cites "whatever App-ID could infer" as a policy input; ECH removes SNI as one of those inputs for hostname-based rules specifically. |

Result: of 7 steps, **4 would be byte-for-byte identical to `passthrough`'s existing steps** (0, 2, 4, 5), and only 1 (step 1) is the actual subject of the proposed feature. Steps 3 and 6 would need light edits, not full rewrites. That means a full parallel scenario is **more than half duplicated content** whose only job is to change one field's visibility.

### 1.2 Why that duplication is a real cost, not just inelegance

- **Maintenance drift.** If `passthrough.steps[0]`, `[2]`, `[4]`, or `[5]` is ever edited (copy fix, added nuance), a duplicated `ech` scenario's copies of those same steps silently go stale unless someone remembers to mirror the edit. Nothing in the data file or component would catch that; `SCENARIOS` is a flat `Record`, there's no shared-step mechanism.
- **It's not a new topology.** The 3 existing scenarios (`passthrough`, `forwardproxy`, `inbound`) each represent a structurally distinct wire path — that's what the `pos` values and differing step counts encode (7 steps at fixed dot positions vs. 8 steps split across two legs vs. 6 steps with a key-derivation branch). ECH changes *what's visible on an already-existing leg*, not the leg itself. Giving it peer status with three genuine topology choices in the `Scenario` toggle misrepresents it as a fourth topology when it's actually an orthogonal visibility axis layered on top of one of the three.
- **It doesn't help the comparison a learner actually wants to make.** The pedagogical point — "SNI used to be visible here, now it isn't" — is best taught as an A/B toggle on the *same* step, not as two separately-selected scenarios a learner has to click back and forth between (`Scenario` toggle) and re-navigate to the same step index in both to compare. A same-screen toggle makes the diff immediate and adjacent; a 4th scenario makes it a memory exercise.

### 1.3 Does this conflict with the site's "one interactive per concept" rule?

No — that rule (see Phase 1 doc §0) is about not merging *distinct* concepts into one component (there, a field decoder and a chain-of-trust walkthrough). ECH-and-SNI-visibility during a no-decryption handshake is not a distinct concept from what `passthrough` already teaches — it's a variant of the same concept the scenario already exists to demonstrate. Folding it into `passthrough` as a toggle is *more* consistent with that rule than standing up a fourth, mostly-duplicate scenario would be.

### 1.4 Conclusion

Build a secondary **ECH toggle**, scoped to the `passthrough` scenario only. `ScenarioMode` stays exactly as it is today (`'passthrough' | 'forwardproxy' | 'inbound'`, unchanged, no 4th value). This does require a small structural change to `HandshakeStepper.tsx` (a new conditionally-rendered control, not just new data) — which is within CLAUDE.md's stated exception ("edit component only if layout itself needs to change"); the rest of the extension point (Section 3.2) is designed to keep that structural surface as small as possible.

---

## 2. Why scope is `passthrough` only (not `forwardproxy` or `inbound`)

Confident scoping decision, not a flag:

- **`forwardproxy`:** the firewall is the actual TLS endpoint for leg 1 (it presents its own generated certificate). It already sees full plaintext by design — that's the entire point of forward proxy — regardless of whether SNI was encrypted. ECH doesn't add or remove anything the firewall can see in this mode.
- **`inbound`:** the firewall derives the session key from the server's own static private key. It never relied on reading SNI to do that; SNI visibility is not an input to this scenario's mechanic at all.

Both are structurally unaffected by ECH in the way that matters to what this component teaches, so the toggle should not appear in either.

**One real-world nuance worth a single optional sentence, not a mechanic:** if a client actually attempts ECH against a destination that a forward-proxy device is intercepting, the handshake can behave differently in practice (the proxy doesn't hold the real destination's separate ECH/HPKE key material, which is distinct from the TLS certificate key). This is genuinely true but is a deeper wrinkle than this beginner-level component needs to model as a mechanic. **Recommendation:** at most, one optional sentence could be added to `forwardproxy.note` mentioning that enterprise interception setups typically have to account for ECH separately — skippable, no toggle or state required, purely the Content Strategist's call whether it's worth the aside. Nothing breaks if omitted.

✅ **Resolved by the project owner (2026-07-24): include it.** One sentence appended to the end of
`SCENARIOS.forwardproxy.note` in `src/data/handshakeSteps.ts`: "Encrypted Client Hello, covered later in this
chapter, adds a wrinkle even here: since ECH's key material belongs to the real destination rather than
anything the firewall's forged certificate touches, enterprise interception setups typically have to account
for ECH separately, usually by disabling it on managed devices." No toggle or new state added, exactly as
scoped above.

---

## 3. Exact spec

✅ **Implemented.** `Step.echBody?` and `ScenarioData.echNote?` added exactly as specified; `ScenarioMode` left
unchanged at three values. `forwardproxy` and `inbound` entries received no new fields, per this section.

### 3.1 Data shape changes — `src/data/handshakeSteps.ts`

Extend the two existing interfaces with optional fields (no new top-level scenario, no change to `ScenarioMode`):

```ts
export interface Step {
  pos: number;
  label: string;
  title: string;
  body: string;
  echBody?: string; // shown instead of `body` when the ECH toggle is on.
                     // Only present on steps ECH changes (1, 3, 6 — see §3.3).
                     // Absent on steps ECH doesn't affect (0, 2, 4, 5) and on
                     // every step of forwardproxy/inbound (toggle never shown there).
}

export interface ScenarioData {
  label: string;
  note: string;
  echNote?: string; // shown instead of `note` when the ECH toggle is on.
                     // Only defined on the `passthrough` entry.
  steps: Step[];
}
```

`SCENARIOS.passthrough.echNote` and the `echBody` fields on `SCENARIOS.passthrough.steps[1]`, `[3]`, and `[6]` are the only new data. `forwardproxy` and `inbound` entries need no changes at all (their `Step`/`ScenarioData` objects simply never define the optional fields).

✅ **Implemented.** `ech` state, `ECH_OPTIONS`, visibility/reset/no-reset-on-toggle behavior, and the
`displayedBody`/`displayedNote` rendering logic all added exactly as specified. The toggle is rendered as a
`Toggle` block indented under a left border (`border-l border-line-soft`), width-capped to 200px, with a
smaller `text-[10.5px]` label versus the Scenario block's `text-xs` label — giving it clearly lighter visual
weight than the Scenario toggle per this section's explicit requirement, without modifying the shared `Toggle`
component itself.

### 3.2 Component state and behavior — `src/components/chapters/HandshakeStepper.tsx`

New local state, alongside the existing `mode`/`i`:

```ts
type EchState = 'off' | 'on';
const ECH_OPTIONS: { value: EchState; label: string }[] = [
  { value: 'off', label: 'ECH off' },
  { value: 'on', label: 'ECH on' },
];
const [ech, setEch] = useState<EchState>('off');
```

Behavior rules:

1. **Visibility:** the ECH toggle renders only when `mode === 'passthrough'`. Not disabled-and-visible in the other two modes — not rendered at all (per §2, it has nothing to demonstrate there).
2. **Reset on scenario switch:** `changeMode()` (the existing handler that already resets `i` to `0`) also resets `ech` to `'off'`. Every scenario switch is a clean slate, matching the existing `i` reset — a learner switching away from and back to `passthrough` should not find ECH silently still "on."
3. **No reset on toggle:** flipping `ech` does **not** reset `i`. A learner can step to any point in the walkthrough, flip ECH on/off, and immediately see that step's text change in place — this is the actual comparison mechanic (see §1.2's "adjacent, not a memory exercise" point). This mirrors `PolicyEvaluator`'s reactive-recompute-on-change pattern (Phase 1 §2.4), just applied to a per-step toggle instead of a scenario dropdown.
4. **Instant, no transition delay, no button.** Same as every other state change in this component already.

Rendering logic (illustrative, not literal source):

```ts
const echOn = mode === 'passthrough' && ech === 'on';
const displayedBody = echOn && step.echBody ? step.echBody : step.body;
const displayedNote = echOn && scenario.echNote ? scenario.echNote : scenario.note;
```

`displayedBody` replaces the current direct use of `step.body` in the `<AutoLink text={step.body} />` call; `displayedNote` replaces the current direct use of `scenario.note`. Both keep going through `AutoLink` exactly as today — no change to that wiring.

**Placement:** the ECH toggle sits directly below the existing `Scenario` `Toggle` block, in its own small block, before the note text (so the note — which itself now depends on `ech` — renders after the control that drives it). It must read as a **secondary/modifier control**, not a co-equal peer of the `Scenario` toggle: e.g. smaller label text, or visually grouped/indented under the Scenario block rather than given its own full-width row with matching visual weight. Exact spacing/typography is implementer discretion; the requirement is only that it not look like a 4th, equally-weighted top-level choice — that would reintroduce the exact "false 4th scenario" framing this design rejects in §1.

Suggested label above the toggle: `"Encrypted Client Hello (ECH)"` (draft — Content Strategist's call on final wording).

✅ **Implemented.** Final polished copy written for all three `echBody` fields and `passthrough.echNote`,
matching this section's required facts and the Content Strategist's established voice for this chapter (not the
draft placeholder strings verbatim). Steps 0, 2, 4, 5 left without `echBody`, as specified.

### 3.3 Content facts required (draft strings included per the Phase 1 convention — quotes are placeholder, bullets are firm)

**Step 1 — TLS handshake, ClientHello → ServerHello + certificate** (`SCENARIOS.passthrough.steps[1].echBody`)

Facts the copy must convey:
- ECH changes the *shape* of the ClientHello: an "outer" ClientHello goes out in cleartext carrying a generic/placeholder SNI value (not the real destination); a real, encrypted "inner" ClientHello nested inside it carries the actual SNI.
- An on-path observer — this firewall included — sees only the outer hello. It cannot read the real destination hostname.
- This is independent of the TLS 1.2/1.3 certificate-visibility fact this step already states — ECH doesn't change certificate visibility, that's a separate axis (governed by TLS version, not ECH). Don't let the two get conflated in the rewritten copy.
- Optional supporting detail: ECH requires the client to have already fetched the destination's ECH configuration (commonly published via a DNS HTTPS resource record) before it can build the encrypted inner hello — this is *why* ECH isn't universally available yet, not the primary teaching point, include only if space allows.

Draft placeholder text: *"With ECH enabled, the ClientHello itself changes shape. The client sends a generic 'outer' ClientHello in cleartext, and an encrypted 'inner' ClientHello nested inside it carries the real SNI. An observer on the wire, including this firewall, sees only the outer hello and a placeholder name, not the actual destination. Certificate visibility (TLS 1.2 vs. TLS 1.3) is a separate detail and unaffected by ECH."*

**Step 3 — Firewall pipeline, App-ID (pattern-based)** (`SCENARIOS.passthrough.steps[3].echBody`)

Facts:
- SNI was one of the more useful metadata signals for App-ID in the no-ECH case; ECH removes it.
- App-ID doesn't go blind — it's weakened, not eliminated. It still has traffic patterns, TLS fingerprinting of the outer hello, and the destination IP address itself (ECH doesn't hide where packets are routed, only the hostname inside the handshake). Don't let the copy overclaim "the firewall knows nothing."

Draft placeholder text: *"With ECH enabled, App-ID loses one of its better signals: SNI is now hidden along with the payload. It leans more on traffic patterns, TLS fingerprinting, and the destination IP address itself, since that's still visible even though the hostname inside the handshake isn't."*

**Step 6 — Policy decision, Allow or deny** (`SCENARIOS.passthrough.steps[6].echBody`)

Facts:
- The existing text names "zone, address, port, and whatever App-ID could infer" as what a no-decryption policy evaluates on. Hostname-based rules specifically depended on that inferred (SNI-derived) value.
- With ECH on, address- and port-based rules are completely unaffected (they never depended on SNI). Hostname-based rules lose their input for this session.

Draft placeholder text: *"The rule is still evaluated on what's visible, zone, address, port, and whatever App-ID could infer, but with ECH enabled, hostname-based rules that depended on reading SNI in cleartext have nothing left to match against for this session. Address- and port-based rules are unaffected."*

**Scenario note** (`SCENARIOS.passthrough.echNote`)

Facts:
- Same underlying premise as the base note (no decryption configured, firewall never holds a private key or terminates anything) plus one added fact: with ECH on, the firewall doesn't even get the destination hostname in cleartext anymore.

Draft placeholder text: *"No SSL decryption is configured, and Encrypted Client Hello (ECH) is turned on. The firewall still watches the encrypted traffic go by without holding a private key or terminating anything itself, but now it doesn't even get the destination hostname in cleartext — ECH hides that too."*

**Steps 0, 2, 4, 5:** no `echBody`. Confirmed unaffected per §1.1 — don't add placeholder text for these; leave them undefined so the component falls back to `body`.

✅ **Resolved by the project owner (2026-07-24): include it.** Implemented as specified — rendered only for
step index 1, only in `passthrough`, reactive to `echOn`, no dot-masking. "Off" state uses
`text-ink-dim`/`font-mono text-xs` (the ordinary-legible treatment, matching the CLIENT/FIREWALL/SERVER role
captions' font family); "on" state uses `text-ink-faint` for the dim/muted treatment. Reuses the
`portal.netwise-example.test` domain already established in the Phase 1 certificate content, per this
section's continuity note.

### 3.4 Optional enhancement — SNI value line (not required to ship the mechanic)

Everything above is fully functional as text-only. As an optional, skippable enhancement (same status as Phase 1 §1.5's line-highlight feature — "worth doing if time allows, safe to skip if not"): render one short inline monospace line inside step 1's content area showing the literal SNI value and its state, giving the "field going dark" idea something concrete to look at rather than only reading about it:

- **ECH off:** `SNI: portal.netwise-example.test` — styled as ordinary legible monospace text (reuses the fictional domain already established in the Phase 1 doc's shared PKI story, for continuity).
- **ECH on:** `SNI: encrypted — not visible on the wire` — styled dim/muted (`text-ink-faint`), same visual family as the firewall-role captions already under the CLIENT/FIREWALL/SERVER boxes.

Deliberately **not** a dot-masked/redacted-character string (e.g. `●●●●●●●●●●●●`) — that reads poorly to screen readers and adds no teaching value over a plain dim-styled label; the "going dark" effect should come from styling (color/weight) and the word "encrypted," not from literal character redaction. If built, this line goes through the same conditional pattern as `displayedBody` (computed alongside it, rendered only for step 1, only in `passthrough`, only reactive to `ech` — no new state needed beyond what's already specified in §3.2).

If skipped, the mechanic is unaffected — §3.3's text already states the same fact in prose.

---

## 4. Cross-cutting notes

- **New acronym needed:** `SNI` is not currently in `src/data/acronyms.ts`, despite already appearing in `passthrough.steps[1]`'s existing body text today — that's a pre-existing gap, not something this design introduces, but this design adds several more mentions of it, so it's worth fixing regardless of whether the ECH toggle ships. `ECH` itself should also be added once the Content Strategist's parallel plan introduces it in prose. Recommend both: `SNI: 'Server Name Indication'`, `ECH: 'Encrypted Client Hello'`.
- **Glossary:** neither `SNI` nor `ECH` currently has a `src/data/glossary.ts` entry (`tls` category is the natural home for both, alongside `Certificate authority (CA)` etc.). Whether to add glossary entries is the Content Strategist's call, not a simulation-design decision, but flagging since this design's copy leans on both terms.
- **Fact-check note for the Content Strategist (not a design flag):** confirm current (2026) language around ECH deployment maturity/fallback behavior before finalizing copy — e.g. whether to caveat that ECH support/fallback varies by client and isn't yet universal. This affects wording only, not the mechanic specified above, which is correct regardless of adoption percentage.
- **No new color tokens, no new motion primitives.** The ECH toggle reuses the existing `Toggle` component verbatim (same as the `Scenario` toggle); the optional SNI line (§3.4) reuses existing text-color tokens (`text-ink-faint`) already used elsewhere in this same component.
- **Independently shippable.** If the optional §3.4 enhancement is cut, the toggle + text-swap mechanic (§3.1–3.3) stands on its own and fully satisfies the "SNI field going dark" teaching goal from `research-ideas.md`.

---

## 5. Summary of ⚠ needs-a-decision flags

None. Every question this brief raised — whether to build a 4th scenario, where to scope the toggle, which steps' copy changes, default state, reset behavior — has a confident recommendation with rationale above. The two "recommendation, skippable" items (§2's optional forward-proxy aside, §3.4's optional SNI value line) are scope options for the project owner/Content Strategist to take or leave, not unresolved design questions — the mechanic is fully specified and functional without either of them.

---

## 6. Implementer's resolution log (added 2026-07-24)

1. **§1.4 recommendation** — reject the 4th-scenario approach, build a toggle inside `passthrough` instead. — ✅ **Owner resolution: build as recommended. Implemented.**
2. **§2** — optional one-sentence `forwardproxy.note` caveat about enterprise interception needing to account for ECH separately. — ✅ **Owner resolution: include it. Implemented.**
3. **§3.1–3.3** — data shape changes, toggle state/behavior, and final polished copy for the three `echBody` fields plus `passthrough.echNote`. — ✅ **Implemented**, with the toggle deliberately styled as a secondary/modifier control (smaller label, indented, width-capped) per §3.2's explicit visual-weight requirement.
4. **§3.4** — optional inline SNI value line (off: fictional domain; on: "encrypted — not visible on the wire", dim-styled, no dot-masking). — ✅ **Owner resolution: include it. Implemented.**

All four items from this doc shipped; nothing was skipped. `src/data/acronyms.ts` (`SNI`, `ECH`, `DNS`) and
`src/data/glossary.ts` (three `tls` entries) were also updated, per `content-plan.md`'s own §5/§6 (not this
doc's scope, but required for the copy this doc adds to render with tooltips, per §4's cross-cutting note).
