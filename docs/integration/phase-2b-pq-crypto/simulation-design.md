**Implementation status (added by the Implementer agent, 2026-07-24): the classical/hybrid key-exchange toggle
is ✅ implemented, scoped to `CipherDecoder` chip 0 only, exactly as recommended in §1.5, per explicit
project-owner resolution (ship as a separate, complementary addition alongside the parallel content plan's new
Chapter 4 Card, not instead of it). Also implemented: §4's optional wire-format aside line (`Wire format:
X25519MLKEM768`, dim monospace, under the hybrid explainer paragraph) and §5's suggested `AutoLink` fix for
`CipherDecoder`'s explainer panel, applied to all four chips, not just the new hybrid one, per explicit
project-owner resolution. One wording note: this doc's §5 `ML-KEM` acronym suggestion used slightly different
hyphenation than the parallel content plan's — the content plan's exact wording
(`'Module-Lattice-Based Key Encapsulation Mechanism'`) was designated authoritative and is what shipped in
`src/data/acronyms.ts`. See the inline ✅ notes in §1, §3.1, §3.2, §3.3, §3.4, and §5 below.**

# Phase 2b — Simulation / Interaction Design: Hybrid Post-Quantum Key Exchange & CipherDecoder

**Author role:** Simulation/Interaction Designer (game-design role — mechanics and states only, no prose, no code).
**Status:** Draft, awaiting project-owner review alongside the Content & Flow Strategist's parallel content plan for this topic.
**Consumes:** `docs/research-ideas.md` #2 ("Post-quantum key exchange (hybrid ML-KEM)") for subject-matter grounding; `src/components/chapters/CipherDecoder.tsx` + `src/data/cipherSuite.ts` (the component and data this design extends); `src/components/chapters/Chapter4KeyExchange.tsx` (surrounding chapter context); `docs/integration/phase-1-certificates/simulation-design.md` and `docs/integration/phase-2a-ech/simulation-design.md` as process precedent (state facts, not final prose; quoted strings are draft/placeholder only; Phase 2a specifically as the precedent for rejecting a brief's own suggested mechanic after checking it against the real code).
**Produces:** this document. Owns mechanics, exact data-shape changes, and the *facts* each new piece of copy must convey — not the polished sentences themselves. A parallel content plan owns final prose and any placement/framing decisions outside this component.

---

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string in quotes (chip labels, toggle labels, explainer text) is a **draft/placeholder written to prove the mechanic reads correctly** — the Implementer should treat these as content-requirements to match against the Content Strategist's voice, not paste them in verbatim as final copy. Where I mean "these exact facts must appear, wording is not mine to decide," I've written that as a bullet list of facts instead of a sentence.

---

## 1. The hypothesis: does hybrid PQ deserve a 5th chip?

`research-ideas.md`'s own fit note for this topic suggests extending `CipherDecoder` with a 5th chip representing hybrid key exchange, showing something like `X25519+ML-KEM`. I evaluated this against how the component and data file are actually built, and against how the underlying protocol actually works, rather than assuming it's right. **Recommendation: reject the 5th-chip approach. Build hybrid key exchange as a toggle scoped to the existing "Key exchange" chip (index 0) instead.** Below is the reasoning; nothing here is an open flag, this is a resolved design decision — the same posture Phase 2a's ECH design took toward its own brief.

### 1.1 What `CipherDecoder` actually models

`CIPHER_PARTS` is not four unrelated facts — it's one cipher-suite string (`ECDHE_RSA_AES_256_GCM_SHA384`) decomposed into its four independent axes, and the component's own intro copy says so explicitly: *"A cipher suite name looks cryptic, but it's really just four separate questions about the same connection, answered once each and bundled into one string."* Each `CipherPart.code` is a literal substring of that one string, in order: key exchange, authentication, bulk encryption, integrity. Four chips, four *slots* in one name. This is the load-bearing structural fact the whole component is built on, and it's the test any proposed new chip has to pass: **does it fill a slot that doesn't exist yet, or does it just put a different value into a slot that already exists?**

### 1.2 What a 5th chip would actually contain

| Candidate 5th-chip content | Is it a new independent axis, or a restatement of chip 1 (Key exchange)? |
|---|---|
| A chip showing `X25519+ML-KEM` or `ML-KEM` as its "code" | This **is** the key-exchange group value — the same "how do we agree on a secret" question chip 1 already answers, just answered with a hybrid value instead of a classical one. It doesn't add a fifth question; it changes the answer to the first one. |
| A chip explaining "post-quantum cryptography" as a standalone concept, decoupled from any suite-string value | Breaks the one property every existing chip shares: `part.code` is a literal piece of a real cipher-suite/handshake value, something a learner could in principle go find in real negotiated-connection output. A chip whose code isn't actually part of any real string is structurally the odd one out — not "clickable piece of this string" the way the other four are, closer to a stray FAQ entry bolted onto the side. |

Either way the result is the same: **0% of a proposed 5th chip's content would be new-axis material.** Compare this to Phase 2a's own duplication table for the rejected 4th `HandshakeStepper` scenario, where at least 3 of 7 steps *did* need genuinely new content (just not enough to justify a whole parallel scenario). Here it's starker — 100% overlap with chip 1, 0% new axis.

### 1.3 Confirmation from the protocol itself, not just the component's code shape

This isn't only a UI-modeling argument — it's also true of the wire protocol `CipherDecoder` is teaching. TLS 1.3 cipher suite names (e.g. `TLS_AES_256_GCM_SHA384`) don't even carry a key-exchange-group field in the name at all; groups are negotiated separately, via the `supported_groups`/`key_share` extensions (this is exactly what `CipherDecoder`'s own intro sentence already discloses: *"TLS 1.3 negotiates these same four decisions separately instead of bundling them into one name"*). A hybrid group (classical + ML-KEM combined) is negotiated through that same `supported_groups`/`key_share` mechanism, filling the exact same conceptual "group" slot a classical-only group like X25519 fills today. There is no protocol-level 5th slot for hybrid key exchange to occupy — it's a new *value* for an existing negotiation, not a new negotiation. The component's 4-axis structure and the real protocol's structure agree with each other here, which is a stronger confirmation than either alone.

### 1.4 Does this conflict with the site's "one interactive per concept" rule?

No — same conclusion Phase 2a reached for ECH, for the same reason. That rule (Phase 1 doc §0) is about not merging *distinct* concepts into one component. Hybrid key exchange is not a distinct concept from what chip 1 already teaches ("this is the key exchange group; here's what fills that role") — it's a variant of that exact concept. Folding it into chip 1 as a toggle is *more* consistent with that rule than standing up a 5th chip that just re-answers question 1 under a different button would be.

### 1.5 Conclusion

Build a **key-exchange-mode toggle**, scoped to chip 0 ("Key exchange") only. `CIPHER_PARTS` stays a 4-entry array — no 5th entry, no change to how many chips render. This requires a small structural change to `CipherDecoder.tsx` (a new conditionally-rendered control, not just new data), within the same CLAUDE.md exception Phase 2a's toggle relied on ("edit component only if layout itself needs to change") — the rest of this design is written to keep that structural surface as small as possible, mirroring Phase 2a's own minimal-diff discipline.

---

✅ **Owner resolution: build as recommended. Implemented.** The 5th-chip approach was not built; the toggle
was scoped to chip 0 exactly as concluded in §1.5.

## 2. Why the toggle is scoped to chip 0 only (not shown for all 4 chips)

Confident scoping decision, not a flag — same posture as Phase 2a §2's scoping of the ECH toggle to `passthrough` only:

- **Authentication (RSA), Bulk encryption (AES_256_GCM), and Integrity (SHA384) are untouched by this.** The industry's current post-quantum migration in live TLS traffic is specifically a key-exchange-only change today. Server authentication still overwhelmingly uses classical RSA/ECDSA signatures; a parallel post-quantum signature migration (NIST's ML-DSA) exists but is at a much earlier, far-less-deployed stage. Showing the toggle while chips 1–3 are active would misleadingly imply it affects content it has no effect on.
- **This is the same reasoning Phase 2a used to keep the ECH toggle out of `forwardproxy`/`inbound`:** a control that has zero effect on what's currently on screen invites the misconception that toggling will change what's currently displayed. Scoping visibility to chip 0 avoids that entirely, at zero cost to the mechanic — a learner who wants to compare simply clicks chip 0 first, same click-cost as clicking any other chip.
- **Rejected alternative: always-visible toggle, disabled/grayed out on chips 1–3.** Considered and rejected — this is strictly worse than hiding it outright (a visible-but-disabled control still has to be explained, and explaining "this control doesn't do anything right now" is more UI surface than just not showing it). Hide-not-disable, matching the Phase 2a precedent exactly.

---

## 3. Exact spec

### 3.1 Data shape changes — `src/data/cipherSuite.ts`

Extend the existing interface with two optional fields (no new array entry, no change to array length):

```ts
export interface CipherPart {
  code: string;
  label: string;
  text: string;
  hybridCode?: string; // shown on the chip button instead of `code` when the key-exchange
                        // toggle is set to 'hybrid'. Only defined on CIPHER_PARTS[0]
                        // ("Key exchange" / ECDHE). Absent on the other three entries —
                        // they have nothing to swap.
  hybridText?: string;  // shown in the explainer panel instead of `text`, only when the
                         // active chip is index 0 AND the toggle is 'hybrid'. Only defined
                         // on CIPHER_PARTS[0].
}
```

Only `CIPHER_PARTS[0]` (the `ECDHE` / "Key exchange" entry) gets `hybridCode` and `hybridText` populated. `CIPHER_PARTS[1]` (RSA), `[2]` (AES_256_GCM), `[3]` (SHA384) need **no changes at all** — same "touch only what's actually affected" discipline as Phase 2a's `Step`/`ScenarioData` extension, which left `forwardproxy`/`inbound` completely untouched.

- `hybridCode`: recommend `'X25519+ML-KEM'` — see §3.4 for the naming rationale.
- `hybridText`: see §3.3 for the required facts; draft placeholder prose included there.

✅ **Implemented.** `hybridCode?`/`hybridText?` added to `CipherPart` exactly as specified; only
`CIPHER_PARTS[0]` populates them, entries `[1]`–`[3]` unchanged.

### 3.2 Component state and behavior — `src/components/chapters/CipherDecoder.tsx`

New local state, alongside the existing `active`:

```ts
type KeyExchangeMode = 'classical' | 'hybrid';
const KEY_EXCHANGE_MODE_OPTIONS: { value: KeyExchangeMode; label: string }[] = [
  { value: 'classical', label: 'Classical' },
  { value: 'hybrid', label: 'Hybrid (post-quantum)' },
];
const [kexMode, setKexMode] = useState<KeyExchangeMode>('classical');
```

**Default is `'classical'`, deliberately.** Every other chip already defaults to showing today's still-dominant value (RSA, AES_256_GCM, SHA384) — none of them default to a forward-looking variant. Defaulting chip 0 to classical keeps that same "the default view is today's baseline" convention consistent across all four chips; hybrid is the thing a learner opts into, not the thing they're shown unprompted. This is a real decision point (research-ideas.md itself notes hybrid is now *default-on* in mainstream browsers), but I'm confident enough in the pedagogical-consistency argument above to make this a firm recommendation, not a flag.

Behavior rules:

1. **Visibility:** the toggle renders only when `active === 0`. Not disabled-and-visible on the other three chips — not rendered at all (per §2).
2. **No reset condition exists to specify**, and that's intentional: unlike `HandshakeStepper`'s `ech` state (which resets on scenario switch because `HandshakeStepper` has a scenario concept), `CipherDecoder` has no analogous secondary mode to switch between — there's only ever one decoder. `kexMode` is simply never reset after mount. Clicking to a different chip and back to chip 0 must **not** reset `kexMode` to `'classical'` — a learner who set it to hybrid, looked at the other three chips, and returned to chip 0 should still see hybrid.
3. **Instant, no button, no transition delay.** Same as every other state change already in this component (clicking a chip is already instant).

Rendering logic (illustrative, not literal source):

```ts
// Chip row — index 0's displayed code depends on kexMode regardless of which chip is
// currently active, so the row stays internally consistent even while chip 1/2/3 is open:
{CIPHER_PARTS.map((part, idx) => {
  const showHybrid = idx === 0 && kexMode === 'hybrid';
  const chipLabel = showHybrid && part.hybridCode ? part.hybridCode : part.code;
  return (
    <button key={part.code} onClick={() => setActive(idx)} /* existing className logic unchanged */>
      {chipLabel}
    </button>
  );
})}

// Explainer panel — only substitutes text when chip 0 is the active one:
const hybridActive = active === 0 && kexMode === 'hybrid';
const explainerText = hybridActive && CIPHER_PARTS[0].hybridText
  ? CIPHER_PARTS[0].hybridText
  : CIPHER_PARTS[active].text;
```

Note the two conditions are evaluated independently: the chip-row swap depends only on `idx === 0` (so the string display is always consistent regardless of what's currently open), while the explainer-panel swap additionally requires `active === 0` (so text from a different chip's slot never gets contaminated by hybrid copy). This mirrors Phase 2a's `displayedBody`/`displayedNote` split, which similarly computed two independent derived values rather than one shared flag.

**Placement:** the toggle sits directly below the chip row and above the explainer panel's bordered box, rendered conditionally per rule 1. It must read as a **secondary/modifier control**, not a co-equal peer of the four main chips — smaller label text, width-capped (e.g. ~200–220px, not full width), the same visual-weight demotion Phase 2a specified for the ECH toggle relative to the `Scenario` toggle. Exact spacing/typography is implementer discretion; the requirement is only that it not look like a 5th chip in disguise — that would quietly reintroduce the exact "false 5th chip" framing §1 rejects.

Suggested label above the toggle: `"Key exchange algorithm"` (draft — Content Strategist's call on final wording).

✅ **Implemented.** `kexMode` state, `KEY_EXCHANGE_MODE_OPTIONS`, visibility (rendered only when `active === 0`),
no-reset-on-chip-switch behavior, and the chip-row/`explainerText` derivation all added exactly as specified.
The toggle uses the suggested label `"Key exchange algorithm"` verbatim. It's rendered as a `Toggle` block
indented under a left border (`border-l border-line-soft`), width-capped to 220px, with a smaller
`text-[10.5px]` label — mirroring the Phase 2a ECH toggle's visual-weight treatment in `HandshakeStepper.tsx`
(secondary/modifier control, not a co-equal peer of the four chips), per this section's explicit visual-weight
requirement and the project owner's citation of that precedent.

### 3.3 Content facts required for `hybridText` (draft string included per the established convention — quotes are placeholder, bullets are firm)

Facts the copy must convey, in rough teaching order:

- **What hybrid key exchange is, mechanically:** two independent key-exchange algorithms run in the same handshake, and their two outputs are combined into one shared secret — the classical elliptic-curve algorithm already named earlier in this chapter (X25519, from the "Common groups in use today" line in `Chapter4KeyExchange.tsx`), run alongside ML-KEM, a lattice-based algorithm with an unrelated mathematical foundation.
- **The core security property, stated explicitly:** the combined secret is only breakable if *both* algorithms are broken. A future break of either one alone (a flaw found in lattice-based math, or a quantum computer breaking elliptic-curve math) doesn't compromise the connection on its own.
- **What threat this defends against, and why it's a *different* threat than forward secrecy** (this chapter already taught forward secrecy — the two must not be conflated):
  - Forward secrecy protects against a future *stolen key* — even if a server's long-term private key leaks later, already-finished sessions used one-time keys that are already gone.
  - This protects against a future *broken algorithm* — "harvest now, decrypt later": an adversary can record today's encrypted traffic and decrypt it years from now if a sufficiently powerful quantum computer eventually exists that breaks the classical math involved. Forward secrecy's ephemeral keys don't help here, because the ephemeral exchange itself is still just classical elliptic-curve math, equally breakable by that same future quantum computer. Perfect forward secrecy today provides zero protection against this specific threat.
- **Deployment status — not hypothetical:** hybrid key exchange (X25519+ML-KEM specifically) is live, default-on infrastructure today in mainstream browsers and large cloud/CDN providers, for a meaningful share of TLS 1.3 connections already.
- **What ML-KEM is:** a NIST-standardized (FIPS 203) post-quantum key-encapsulation mechanism, commonly deployed at the ML-KEM-768 parameter size; developed under the earlier project name CRYSTALS-Kyber during NIST's standardization process — worth a one-line note since "Kyber" still appears in some current tooling and vendor documentation.
- **Required scope-limiting note — don't let this overclaim:** this hybrid upgrade covers key exchange only. The other three chips in this same decoder (Authentication/RSA, Bulk encryption/AES_256_GCM, Integrity/SHA384) are unaffected by this toggle — server authentication in particular is still done almost entirely with classical RSA/ECDSA signatures today; a separate post-quantum signature migration (NIST's ML-DSA) exists but is at a much earlier, less-deployed stage. State this plainly so a learner doesn't conclude "the whole connection is now quantum-safe" from one toggle on one chip.
- **Optional supporting detail, include only if space allows:** real TLS 1.3 wire format writes the combined group as one concatenated codepoint name (e.g. `X25519MLKEM768`), not with a "+" separator — the "+" used on this chip is this decoder's own readability simplification, consistent with the component's own existing disclosure that its whole 4-part naming scheme is "the classic TLS 1.2-style way of writing it," itself already a pedagogical simplification rather than literal wire format.

Draft placeholder text (not final copy): *"With hybrid key exchange, two algorithms run side by side instead of one: X25519 (the classical elliptic-curve group named earlier in this chapter) and ML-KEM, a NIST-standardized post-quantum algorithm built on entirely different math (lattice-based, not elliptic-curve). Their two outputs combine into one shared secret, so the connection stays safe unless both algorithms are broken. This defends against a different threat than forward secrecy: forward secrecy protects already-finished sessions from a future stolen private key, but does nothing against a future quantum computer that breaks the classical math itself — an adversary recording today's traffic could still decrypt it years later. Hybrid key exchange like this is already live and default-on in mainstream browsers and major cloud providers today, not a future plan. One important limit: this only upgrades key exchange. Authentication, encryption, and integrity above are untouched — server authentication in particular is still almost entirely classical RSA/ECDSA today."*

✅ **Implemented.** Final polished copy written for `CIPHER_PARTS[0].hybridText`, covering every required fact
above (mechanism, combined-secret security property, the forward-secrecy-vs-broken-math distinction, harvest
now/decrypt later, ML-KEM-768/CRYSTALS-Kyber naming history, live default-on deployment status, and the
scope-limiting note that only key exchange is affected), matching the Content Strategist's established voice
for this chapter rather than the draft placeholder verbatim.

### 3.4 Chip code choice — `'X25519+ML-KEM'`

Confident recommendation, not a flag. Rationale:

- Matches `research-ideas.md`'s own suggested display string for this concept.
- Ties directly to existing Chapter 4 prose, which already names `X25519` by name ("Common groups in use today: X25519 and secp256r1") — reusing that exact identifier keeps the toggle legible as "the same X25519 you just read about, now paired with something new," rather than introducing a new, disconnected classical-algorithm name.
- Keeps the chip short and legible as a UI element; the real wire-format concatenated name (`X25519MLKEM768`) is mentioned as supporting detail in the explainer text (§3.3) rather than crammed onto the button itself.
- The parameter size (`-768`) is deliberately left off the chip label for brevity and included in the explainer prose instead, where there's room to explain what it means.

✅ **Implemented.** `hybridCode: 'X25519+ML-KEM'` shipped exactly as recommended.

---

## 4. Visual / motion notes

No new tokens, no new motion, no new component. Reuses `CipherDecoder`'s existing Tailwind classes for the chip row (chip 0's button just renders different text conditionally) and the existing `Toggle` component (`src/components/ui/Toggle.tsx`) already used by `HandshakeStepper` for exactly this kind of secondary control (`ECH_OPTIONS`) — no changes needed to `Toggle` itself. Chip 0's button will visibly grow when hybrid is on (`ECDHE`, 5 characters, → `X25519+ML-KEM`, 14 characters); this is expected and requires no layout change — the chip row already uses `flex-wrap`, and `AES_256_GCM` (11 characters) already demonstrates the row handles a chip of comparable length today.

**Rejected enhancement:** cross-highlighting the "Common groups in use today: X25519 and secp256r1" line in the surrounding `Chapter4KeyExchange.tsx` card when the toggle is set to hybrid. Not recommended — `CipherDecoder` is rendered today with zero props (`<CipherDecoder />`) and is fully self-contained; lifting toggle state up to a parent (via props or context) to drive a visual effect in a sibling block is real structural cost for a marginal, non-essential payoff. Skip this.

**Optional, skippable enhancement** (same status as Phase 1 §1.5's line-highlight and Phase 2a §3.4's SNI-value-line — "worth doing if time allows, safe to skip if not"): render one short inline monospace aside inside the hybrid explainer text showing the literal wire-format codepoint name, e.g. `Wire format: X25519MLKEM768`, styled as ordinary dim monospace (`text-ink-faint`), directly under the main explainer paragraph. If skipped, §3.3's prose already states the same fact — nothing is lost mechanically.

✅ **Resolved by the project owner (2026-07-24): include it.** Implemented as specified — rendered only when
`hybridActive` (chip 0 active and toggle set to hybrid), styled `font-mono text-xs text-ink-faint`, directly
under the explainer paragraph.

---

## 5. Cross-cutting notes

- **New acronyms this design introduces:** `ML-KEM` is not currently in `src/data/acronyms.ts` — recommend `'ML-KEM': 'Module-Lattice-Based Key-Encapsulation Mechanism'`, following the existing hyphenated-key pattern already used for `App-ID`/`User-ID`/`Content-ID`. If the Content Strategist's parallel prose also uses the bare terms `KEM` or `PQC`, those would need their own entries too (`KEM: 'Key-Encapsulation Mechanism'`, `PQC: 'Post-Quantum Cryptography'`) — not decided here, flagging so it isn't dropped if the two docs land slightly out of sync, same pattern Phase 2a used for `SNI`/`ECH`.

  ✅ **Resolved by the project owner (2026-07-24): `ML-KEM` added, using `content-plan.md` §4's exact wording
  (`'Module-Lattice-Based Key Encapsulation Mechanism'`, no hyphen before "Key") as authoritative over this
  doc's slightly different hyphenation — the one wording conflict between the two docs.** `NIST` also added
  per `content-plan.md` §4. `KEM` and `PQC` were **not** added as standalone entries — neither bare term
  appears in either doc's final shipped prose, so this flagged contingency didn't materialize.
- **Pre-existing gap, not introduced by this design:** `CipherDecoder`'s explainer panel (`CipherDecoder.tsx` line ~36) renders `{CIPHER_PARTS[active].text}` as a raw string, not wrapped in `<AutoLink text={...} />` — unlike most other body copy on the site, none of `CipherDecoder`'s existing four explainers get automatic acronym tooltips today. This design's new `hybridText` inherits that same gap; it isn't something this design creates, but worth flagging exactly the way Phase 2a flagged the pre-existing `SNI` acronym-tooltip gap in `HandshakeStepper` — fixing it (wrapping that div in `AutoLink`) is a one-line, low-risk change the Implementer could make while already touching this file, but it's outside this design's scope to mandate.

  ✅ **Resolved by the project owner (2026-07-24): include it.** `CipherDecoder`'s explainer panel now renders
  `<AutoLink text={explainerText} />` instead of a raw string, applied to all four chips' explainers (not just
  the new hybrid one), fixing the pre-existing gap while the file was already open.
- **Glossary:** no current `src/data/glossary.ts` entry for hybrid key exchange, ML-KEM, or post-quantum cryptography generally. The `tls` category is the natural home (alongside `Cipher suite`, `SNI`, `ECH`). Whether to add glossary entries, and their wording, is the Content Strategist's call, not a simulation-design decision — flagging since this design's copy leans on both `ML-KEM` and the broader "post-quantum" framing repeatedly.

  ✅ **Implemented** — see `content-plan.md` §5: `ML-KEM`, `Hybrid key exchange`, and `Harvest now, decrypt
  later` all added to the `tls` category.
- **Suggested touchpoint for the Content Strategist (not a mechanic, not my call):** a one-sentence forward-pointer in `Chapter4KeyExchange.tsx`'s existing "Common groups in use today: X25519 and secp256r1" bullet, hinting that the decoder below can show what a post-quantum-hybrid version of that same group looks like — same spirit as Phase 2a's optional `forwardproxy.note` sentence, entirely skippable, no state or mechanic required either way.

  ✅ **Resolved by the project owner (2026-07-24): include it.** One sentence appended to that bullet in
  `Chapter4KeyExchange.tsx`: "The decoder below lets you toggle the first chip to see what a
  post-quantum-hybrid version of X25519 looks like."
- **No new color tokens, no new motion primitives.** The toggle reuses the existing `Toggle` component verbatim; the chip row reuses its existing conditional-className logic unchanged.
- **Independently shippable.** If this toggle is cut entirely, `CipherDecoder` is unaffected — nothing else in this design depends on it, and nothing about the existing four chips changes if `hybridCode`/`hybridText` are simply never added to `CIPHER_PARTS[0]`.

---

## 6. Summary of ⚠ needs-a-decision flags

None. Every question this brief raised — whether to build a 5th chip (rejected, with both a component-structure argument and an independent protocol-structure argument), where to scope the toggle, which chip's data needs new fields, default toggle state, reset behavior, and the exact chip-label string — has a confident recommendation with rationale above. The one optional, skippable item (§4's wire-format aside line) is a scope option for the project owner/Content Strategist to take or leave, not an unresolved design question — the mechanic is fully specified and functional without it.
