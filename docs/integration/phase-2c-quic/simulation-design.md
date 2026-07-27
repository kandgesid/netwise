**Implementation status (added by the Implementer agent, 2026-07-24): `SessionTrackingViz` is ✅ implemented,
built at `src/components/chapters/SessionTrackingViz.tsx` exactly per §3's spec, and wired into
`Chapter6ForwardProxy.tsx` per the project owner's placement resolution (directly below the content plan's two
new "What changes next" / "How a forward proxy deployment adapts" Cards, above the chapter's existing closing
paragraphs). §3.6's required accuracy caveat about connection-ID rotation is ✅ implemented as one sentence,
placed as a small aside beneath the two-row grid (one of the two placements this doc's own note left open). The
`QUIC`-is-not-an-acronym flag in §5 is ✅ heeded — the project owner resolved the cross-doc conflict with
`content-plan.md` §5 in this doc's favor; `QUIC` was not added to `ACRONYMS`. `UDP: 'User Datagram Protocol'`
was added, per this doc's own §5 recommendation. See the inline ✅ notes in §1.4, §2.2, §3, and §5 below.**

# Phase 2c — Simulation / Interaction Design: QUIC / HTTP-3 and What It Does to Inspection

**Author role:** Simulation/Interaction Designer (game-design role — mechanics and states only, no prose, no code).
**Status:** Draft, awaiting project-owner review alongside the Content & Flow Strategist's parallel content plan for this topic.
**Consumes:** `docs/research-ideas.md` #3 ("QUIC / HTTP/3 and what it does to inspection") for subject-matter grounding; `src/components/chapters/FirewallCheckpointViz.tsx`, `src/components/chapters/HandshakeStepper.tsx` + `src/data/handshakeSteps.ts`, `src/components/chapters/CipherDecoder.tsx` + `src/data/cipherSuite.ts`, `src/components/sandbox/Sandbox.tsx`, `src/components/chapters/Chapter5DecryptionPolicies.tsx`'s `PolicyEvaluator` (the site's full existing interactive vocabulary); `docs/integration/phase-1-certificates/simulation-design.md`, `docs/integration/phase-2a-ech/simulation-design.md`, and `docs/integration/phase-2b-pq-crypto/simulation-design.md` as process precedent.
**Produces:** this document. Owns mechanics, exact data-shape, and the *facts* each new piece of copy must convey — not the polished sentences themselves. A parallel content plan owns final prose and placement/framing decisions.

---

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string in quotes (labels, status messages, captions) is a **draft/placeholder written to prove the mechanic reads correctly** — the Implementer should treat these as content-requirements to match against the Content Strategist's voice, not paste them in verbatim as final copy. Where I mean "these exact facts must appear, wording is not mine to decide," I've written that as a bullet list of facts instead of a sentence.

**Difference from Phase 2a/2b, stated up front:** those two briefs each arrived with the research doc's own suggested mechanic (a 4th `HandshakeStepper` scenario for ECH; a 5th `CipherDecoder` chip for hybrid key exchange), and the job was to evaluate that specific suggestion against the real code. `research-ideas.md` #3 makes no such suggestion — it states facts about QUIC and stops. So this document does the full exercise from scratch: decide what the one "aha" moment is, decide whether it fits the site's existing interactive vocabulary, and only reach for something new if it genuinely doesn't.

---

## 1. What's actually being taught, and picking the one "aha"

`research-ideas.md` #3 gives five facts: (a) transport moves from TCP to UDP entirely, (b) far more of the handshake is encrypted, (c) connections are identified by a connection ID instead of the IP/port 5-tuple, and survive a network change because of it, (d) SNI can still leak the destination unless ECH is also in play, (e) firewalls today either block UDP/443 outright or decrypt-and-inspect QUIC directly. Five facts, but a beginner-level interactive shouldn't try to dramatize all five — that's how a component ends up doing too much at once (the exact failure mode Phase 1's own design doc opens by warning against merging distinct concepts). I evaluated each against "does this deserve its own mechanic, does it fit one already on the site, or is it better served by prose."

### 1.1 Fact (d) — SNI/ECH interaction: no new mechanic, already built

QUIC's ClientHello carries SNI the same way TCP+TLS's does, unless ECH is layered on top, in which case it's hidden the same way. This is not a new lesson — it's the **exact same lesson** `HandshakeStepper`'s ECH toggle (Phase 2a) already teaches, just on a different transport underneath. Building a second "watch SNI go dark" interactive for QUIC would be near-total content overlap with a mechanic that already ships. **Decision: no mechanic. One sentence of prose is enough** — "QUIC doesn't change the SNI/ECH story from Chapter 3; the same field, the same fix, just riding on UDP instead of TCP" — and that's the Content Strategist's line to write, not mine to spec further.

### 1.2 Fact (b) — far more of the handshake is encrypted: no new mechanic, same reasoning

This is a generalization of the same "field visibility" axis fact (d) already covers — QUIC folding TLS 1.3 into its own handshake and encrypting nearly everything after the first packet is the same *kind* of fact as "SNI is now encrypted," just a bigger blast radius. Dramatizing this as its own before/after visible-fields interactive (the first candidate the brief asked me to weigh) would mean building a second component whose entire job is "here's a field that used to be visible, now it's dark" — a job `HandshakeStepper`'s ECH toggle already does. **Decision: reject a dedicated visible-fields comparison mechanic.** The one sentence from §1.1 covers the general point too; if the Content Strategist wants one concrete supporting detail, "under TCP+TLS, everything before the Finished message travels in the clear even without ECH; QUIC's version of that same handshake is encrypted from much earlier" is a fact for prose, not for a UI toggle.

### 1.3 Fact (e) — block UDP/443 outright vs. decrypt-and-inspect QUIC directly: no new mechanic, wrong shape

This looks superficially like `PolicyEvaluator`'s or `Chapter5DecryptionPolicies`'s territory (an ordered decision a firewall makes), but it isn't actually an *ordered-rule-matching* problem — there's no priority list where one option "wins" over another based on matching a scenario. It's two named operational postures an organization picks between, with a static tradeoff each. That's the same shape as `Chapter5DecryptionPolicies`'s existing `ACTIONS` grid (Decrypt / No decrypt / Bypass, three static cards, no state, no interaction) — a **content grid, not an interactive**. **Decision: no mechanic.** Recommend the Content Strategist render this as a small two-item static card pair (mirroring the `ACTIONS` grid pattern already established), not as anything I need to specify state for.

### 1.4 Fact (c) — the 5-tuple has no QUIC equivalent, and connection IDs survive a network change: the one genuine "aha"

This is different in kind from (b) and (d), not just in degree. Every teaching moment on the site up to this point has quietly assumed that "this is still the same connection" is something a firewall gets to know for free, by watching source/destination IP and port stay constant (`HandshakeStepper`'s "session key," `Sandbox`'s "this simulates one rule inside a larger policy" against one identified flow, `Chapter5DecryptionPolicies`'s policy match persisting for "this session"). None of that machinery is named on the site today (a genuine gap this design's copy has to fill, not extend — see §5), but it's the load-bearing assumption underneath all of it. QUIC breaking that assumption — by replacing the thing a firewall keys a session on with something that's deliberately *not* tied to network location — is a structurally new mechanic, not a re-skin of encryption-does-more-hiding. It's also the fact `research-ideas.md` itself calls out as different in kind: *"That's a genuinely new mechanic, not just 'the same thing but encrypted.'"*

**Decision: this is the one interactive worth building.** The rest of this document specs it.

✅ **Owner resolution (2026-07-24): build as recommended. Implemented.**

---

## 2. Does connection-ID persistence fit an existing pattern, or does it need something new?

Checked against all four patterns named in the brief, the same fit-check discipline Phase 2a/2b applied before proposing a toggle:

| Existing pattern | What it structurally models | Does the connection-identity comparison fit it? |
|---|---|---|
| `FirewallCheckpointViz` (Chapter 1) | A single checkpoint, a stream of packets, each one resolved pass/fail on its own, replay-triggered. | No independent axis to compare — there's one checkpoint and one outcome per packet, not two protocols' differing response to the same event. The green-allowed/red-blocked color convention it establishes is worth reusing, though (see §4). |
| `HandshakeStepper` + a new toggle (the ECH precedent) | A fixed, ordered sequence of steps at fixed `pos` values, walked forward/backward; a toggle swaps *body text* on specific steps without touching step count or step identity. | **Checked seriously, rejected — see §2.1 below.** Unlike ECH (1 of 7 steps' body text changed, rest byte-identical), a QUIC toggle would need to restructure step *labels and titles*, not just body text, on at least 3 of 7 steps, and the underlying event this design cares about (a network change happening *sometime after* the handshake completes) isn't a point in a connect→handshake→inspect→decide sequence at all — it's a comparison across an event outside that sequence. The extension mechanism Phase 2a built (`echBody?` swapping body text at a fixed step) has no clean way to express "this step doesn't structurally exist the same way on this transport." |
| `CipherDecoder` + a toggle (the hybrid-PQ precedent) | A single string decomposed into independent axes; a chip's code is a literal substring of that string. | Fails the same litmus test Phase 2b used for rejecting a 5th chip: there's no "one string" here for a 5-tuple or a connection ID to be a substring of. Structurally foreign to this pattern from the start. |
| `PolicyEvaluator` / `Sandbox` | Ordered checks or rule-matching against a picked scenario, first-match-wins, or button-triggered send-and-log. | No ordering or matching involved — nothing here is "which rule fires first." Rejected in §1.3 already, for the same reason. |

### 2.1 The HandshakeStepper duplication check, done the way Phase 2a did it for its own 4th-scenario question

Applying Phase 2a §1.1's exact method (walk every step of `passthrough`, ask whether QUIC content changes it) to check whether a QUIC "Transport" toggle belongs on `HandshakeStepper` instead of a new component:

| # | Step | Would a QUIC toggle need to change this step, and how much? |
|---|---|---|
| 0 | TCP handshake (SYN/SYN-ACK/ACK) | **Yes, structurally.** QUIC has no separate transport-only handshake step — transport setup and the TLS 1.3 handshake are the same exchange. The step's *label and title*, not just its body, stop being accurate. |
| 1 | TLS handshake — ClientHello → ServerHello + certificate | **Yes, structurally.** Folds into the same combined exchange as step 0 under QUIC — there may not be a clean second "step" here at all. |
| 2 | TLS handshake — Key exchange + Finished | **Yes, structurally,** same reason as 0–1. |
| 3 | App-ID (pattern-based) | Body-text-only change (weaker signal, per §1.2) — this one *would* fit the existing `echBody`-style swap cleanly. |
| 4 | User-ID | No change. |
| 5 | Content-ID (limited) | No change. |
| 6 | Policy decision | Body-text-only change, similar to step 3. |

Where Phase 2a found 4 of 7 steps untouched and only 1 needing a real content change (making a toggle the obviously smaller diff than a 4th scenario), this table finds the **opposite shape of problem**: 3 of 7 steps need structural changes to `label`/`title`, not just `body` — a bigger surface than the `Step.echBody?` extension point was designed for — while the genuinely new fact (connection-ID persistence across a network change) doesn't correspond to any single step in this sequence at all, because "the client's network changes" isn't an event that happens *during* a handshake walkthrough; it's something that can happen at any point after a connection is already established. Forcing it into a `pos`-indexed step sequence would misrepresent it as a moment in the handshake rather than what it actually is: a resilience property that only shows up once you compare two protocols' response to the same external event. **Conclusion confirmed: this doesn't fit `HandshakeStepper`, even as a toggle.**

### 2.2 Conclusion

Build one new, small component. Keep it in the same weight class as the smallest existing pieces of the palette (`FirewallCheckpointViz` is the closest precedent in size and shape: one `Card`, one small piece of local state, no data file, no props) — not a multi-scenario, multi-step production. It reuses `Card`, `Toggle`, and the existing `accent`/`success`/`danger`/`ink-*` color tokens exactly as-is; nothing new to `index.css`, nothing new to `Toggle.tsx`.

✅ **Implemented exactly as scoped.** `SessionTrackingViz.tsx` is one `Card`, one `useState`, no data file, no
props — reuses `Card`, `Toggle`, `clsx`, and `lucide-react`'s `CheckCircle2`/`XCircle`/`MinusCircle` (already a
dependency via `VerificationWalkthrough`). No changes to `index.css` or `Toggle.tsx`.

---

## 3. Exact spec

✅ **Implemented in full.** Component name/path (§3.1), fictional RFC 5737 values (§3.2), state shape (§3.3),
two-row always-visible rendering (§3.4), the accessibility requirement that no state relies on color alone
(§3.5), and final polished intro/closing prose informed by §3.6's required fact lists (§3.6) all shipped as
specified. Row headers use plain, undecorated text ("TCP + TLS", "QUIC (UDP)"), matching the `ACTIONS`/`TYPES`
tag convention this doc cited rather than running them through `AutoLink` — a judgment call for a short label,
not a fact requirement.

### 3.1 Component

**Suggested name/path:** `src/components/chapters/SessionTrackingViz.tsx` — mirrors `FirewallCheckpointViz.tsx`'s naming shape (concept + `Viz`) and lives in the same directory as every other chapter visualization, regardless of which exact chapter number ends up hosting it (see §5 on placement).

**No separate data file.** The two states' values (below) are a handful of fixed strings — one destination, two source snapshots, one connection ID. This is smaller and less reusable-elsewhere than `cipherSuite.ts` or `handshakeSteps.ts` ever were, and closer in scale to `PolicyEvaluator`'s and `VerificationWalkthrough`'s inline data — both of which the Phase 1 doc explicitly kept inline rather than externalizing. Follow that precedent: constants live at the top of the component file, not in `src/data/`.

**Self-contained, zero props.** Same reasoning Phase 2b gave for rejecting a cross-highlight into a sibling card: no other component needs to read or drive this one's state, so don't lift anything.

### 3.2 Fictional example values

Continuing the project's established "obviously fictional, can't collide with anything real" naming discipline (Phase 1 used the `.test` TLD for exactly this reason):

- **Addresses use the IETF's documentation-reserved ranges** ([RFC 5737](https://www.rfc-editor.org/rfc/rfc5737)) — `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` — the IP-literal equivalent of `.test`, reserved specifically so they can never resolve to real infrastructure. Stronger continuity fit than picking arbitrary-looking IPs.
- **Destination stays `192.0.2.10:443` throughout** (both rows, both states) — this is "the server," unmoving. Recommend describing it in prose as `portal.netwise-example.test`'s address, reusing the exact fictional hostname Phase 1 established and Phase 2a's SNI-value line already reused, for the same continuity reason.
- **Client source address on the original network:** `203.0.113.42:51422`.
- **Client source address after roaming:** `198.51.100.77:60110`. Both source IP *and* source port change together — realistic, since roaming to a new network is typically also a new interface/NAT mapping, not just a new IP with the same port.
- **QUIC connection ID:** `a3f9e21c88b04dd1` (8 bytes / 16 hex characters — a realistic length for a real QUIC short-form CID). **Identical string in both network states** — that identity is the entire mechanic.

### 3.3 State and data shape

```ts
type NetworkState = 'same' | 'roamed';

const NETWORK_OPTIONS: { value: NetworkState; label: string }[] = [
  { value: 'same', label: 'Same network' },
  { value: 'roamed', label: 'Client roams (Wi-Fi → cellular)' },
];

interface AddressSnapshot {
  srcIp: string;
  srcPort: string;
}

const DEST = { ip: '192.0.2.10', port: '443' };

const CLIENT_ADDRESS: Record<NetworkState, AddressSnapshot> = {
  same:   { srcIp: '203.0.113.42',  srcPort: '51422' },
  roamed: { srcIp: '198.51.100.77', srcPort: '60110' },
};

const QUIC_CONNECTION_ID = 'a3f9e21c88b04dd1'; // constant regardless of NetworkState

const [network, setNetwork] = useState<NetworkState>('same');
```

**Default is `'same'`, deliberately** — same "baseline first, learner opts into the changed state" convention Phase 2a's `ech` default and Phase 2b's `kexMode` default both established. Nothing has diverged yet on load; the learner has to click to make the comparison happen, which is the actual teaching moment (watching the two rows react differently to the identical click), not something dumped on them unprompted.

**No reset condition to specify.** Same reasoning Phase 2b gave for `kexMode`: there's no parent scenario or sibling mode for this component to reset against — it's the only state in the component, so it simply persists until the user clicks the other option, the entire time the component is mounted.

**Instant, no transition delay, no button.** Same as every other state change already in the palette (`ech`, `kexMode`, `mode`, `scenarioValue` — none of them animate or debounce). Clicking `NETWORK_OPTIONS` recomputes both rows synchronously.

### 3.4 Rendering — two rows, always both visible

Both rows render simultaneously at all times (not one-at-a-time, not requiring a second click to reveal the comparison row) — this is the direct lesson of Phase 2a §1.2's "adjacent, not a memory exercise" argument: the whole point is watching one identical trigger (the `Toggle`) produce two different, side-by-side outcomes in the same glance, not requiring the learner to hold one state in memory while flipping to see the other.

Suggested layout: `Card` containing, top to bottom: intro paragraph (§3.6) → `Toggle` (labeled, same visual treatment as every other top-level `Toggle` on the site, e.g. `Sandbox`'s "Action"/"Match on" — this is the component's *only* control, so it should read as primary-weight, unlike the ECH/`kexMode` sub-toggles which are deliberately demoted because they sit beside other primary controls) → the two rows, in a `grid md:grid-cols-2 gap-4` (same responsive-grid pattern already used by `Chapter1Firewall`'s `TYPES` grid and `Chapter5DecryptionPolicies`'s `ACTIONS` grid — stacks to one column on mobile, no new CSS needed) → closing caption (§3.6).

**Row 1 — TCP + TLS:**
- Header: `"TCP + TLS"` (draft label — matches the transport this whole site has taught through Chapter 6).
- Address line, monospace, recomputed from `CLIENT_ADDRESS[network]`: `{srcIp}:{srcPort} → {DEST.ip}:{DEST.port} · TCP`.
- Status line, always present, text content and styling depend on `network`:
  - `network === 'same'`: neutral styling (`text-ink-dim`, no border/background tint — matching `VerificationWalkthrough`'s `not-reached` neutral treatment, since nothing has happened to evaluate yet). Draft text: *"This address pair is the 5-tuple the firewall keys this session on."*
  - `network === 'roamed'`: **danger** styling (`border-danger`/`bg-danger/10`/`text-danger`, reusing exactly the treatment `VerificationWalkthrough`'s `fail` state and `FirewallCheckpointViz`'s blocked-packet color already established for "blocked/broken," per CLAUDE.md's reservation of danger-red for exactly that meaning). Draft text: *"Source changed → this no longer matches the 5-tuple the firewall had on file. It reads as a brand-new connection: the TCP handshake restarts, and whatever this session had already established (App-ID's identification, whether decryption applied, which policy rule matched) is gone with it."*

**Row 2 — QUIC (UDP):**
- Header: `"QUIC (UDP)"` (draft label).
- Address line, monospace, same source: `{srcIp}:{srcPort} → {DEST.ip}:{DEST.port} · UDP` — **deliberately shown changing identically to Row 1's address line** on roam. This is what makes the comparison legible as "same real-world event, different consequence," not two unrelated facts — both rows must visibly react to the same click.
- Connection ID line, monospace, **always** `Connection ID: a3f9e21c88b04dd1`, styled with an accent tint (`text-accent` or `bg-accent/10` inline, implementer's call) to visually mark it as "the value that matters here, and it isn't the one above."
- Status line, same pattern as Row 1:
  - `network === 'same'`: neutral. Draft text: *"The firewall keys this session on the Connection ID below, not the address above."*
  - `network === 'roamed'`: **success** styling (`border-accent`/`bg-accent/10`, matching `VerificationWalkthrough`'s `pass` treatment and CLAUDE.md's documented accent/success hue-sharing for "allowed"). Draft text: *"Address changed, but the Connection ID didn't. The firewall — and the server — still recognize this as the same ongoing connection. No restart."*

### 3.5 Accessibility note (binding, not optional)

Neither row's status may rely on color alone — both the neutral/danger/success states already specify accompanying text (§3.4), which satisfies this by construction. If the Implementer adds an icon (lucide-react, already a dependency, same discretion Phase 1 §2.4 left for `VerificationWalkthrough`'s pass/fail/not-reached glyphs), pair it with the text, don't replace the text with it.

### 3.6 Required facts — intro paragraph and closing caption

**Intro paragraph** (draft placeholder, facts firm):
- Every session-tracking mechanic taught so far (App-ID/User-ID/Content-ID matching in Chapter 3, policy matching in Chapter 5, "this session" language throughout) has quietly assumed a firewall can tell "same connection, still going" apart from "brand-new connection" for free, by watching one thing: the 5-tuple — source IP, source port, destination IP, destination port, protocol.
- QUIC identifies a connection differently: a connection ID, chosen when the connection starts, independent of IP or port.
- This isn't a hypothetical edge case — a phone moving from Wi-Fi to cellular mid-session is common, and that's exactly the event simulated below.

Draft text: *"Every session the earlier chapters describe — App-ID identifying an app, a decryption policy matching traffic, a rule catching a specific person — quietly assumes the firewall can tell this is still the same connection. It does that by watching one thing: the 5-tuple, source IP, source port, destination IP, destination port, and protocol, staying constant. QUIC identifies a connection differently, with a connection ID chosen up front instead. Toggle the network below and watch the same event play out two different ways."*

**Closing caption** (draft placeholder, facts firm — ties the mechanic back to fact (e) from §1.3 without building a second interactive for it):
- This is exactly why some firewalls today just block UDP/443 outright rather than solve session tracking for QUIC: refusing the protocol is a smaller lift than replicating what the 5-tuple used to do for free.
- The other real answer — decrypting and inspecting QUIC directly — means the firewall becomes an actual QUIC endpoint itself, the same conceptual move Chapter 6 already teaches for TCP+TLS forward proxy, adapted to a transport not designed with a middlebox in mind.

Draft text: *"This is the practical reason some firewalls today just block UDP/443 outright — refusing the protocol is simpler than rebuilding session tracking around a connection ID. The alternative, decrypting and inspecting QUIC directly, means the firewall becomes an actual QUIC endpoint itself, the same move Chapter 6 already covers for ordinary TLS, just aimed at a transport that wasn't built with a middlebox in mind."*

**Required accuracy caveat, one sentence, not a second toggle state:** a real QUIC connection can deliberately rotate to a *new* connection ID mid-session for unlinkability/privacy — negotiated in advance as a small pool of valid IDs, not sprung on the receiver — so "the CID literally never changes for the life of the connection" would overclaim. State this plainly so the mechanic doesn't teach a falsehood dressed up as a simplification; one sentence is enough, no new state required. Suggested placement: appended to Row 2's status line or as a small aside beneath the two-row grid, implementer's/Content Strategist's call on exact placement, not mine.

✅ **Owner resolution (2026-07-24): include it. Implemented.** One sentence — "One simplification worth naming:
a real QUIC connection ID can also deliberately rotate to a new value mid-session, negotiated in advance, for
privacy, so it isn't a fingerprint that literally never changes for the life of a connection, just stable enough
to survive the roam simulated above." — placed as a small `text-ink-faint` aside directly beneath the two-row
grid, no new state added.

### 3.7 Visual / motion notes

No new color tokens (`accent`, `success`/`danger`, `ink-dim`/`ink-faint` cover everything). No new motion — value swaps on toggle are instant, matching every other toggle-driven state change already in the palette; this explicitly is **not** a `Sandbox`-style accumulating log (nothing here is a triggered action producing a new event each time — it's a static two-row comparison that re-renders in place, structurally the same non-animated, reactive-on-select category `PolicyEvaluator` and `VerificationWalkthrough` both fall into, not the category CLAUDE.md reserves terminal/cursor motion for). Reuses `Card`, `Toggle`, `clsx`-driven conditional className logic exactly as `CipherDecoder` and `VerificationWalkthrough` already do it.

---

## 4. Why the green/red convention transfers cleanly here

Worth stating explicitly since it's doing real teaching work: CLAUDE.md documents that `--color-success` and `--color-accent` intentionally share one hue, and `--color-danger` is reserved specifically for "errors, blocked traffic." `FirewallCheckpointViz` already trains a learner, from Chapter 1 onward, that green-moving-packets survive and red-moving-packets get an ✕. Row 2 (QUIC) turning success-green on roam and Row 1 (TCP) turning danger-red on the exact same click reuses that same learned color vocabulary for a new but related judgment — "did this connection survive" — rather than introducing a new color meaning for the learner to pick up. No new token, and no new *meaning* for an existing token either.

---

## 5. Cross-cutting notes

- **New acronym needed:** `UDP` is not currently in `src/data/acronyms.ts`, despite `TCP` already being there — recommend `UDP: 'User Datagram Protocol'`. This design's copy uses it repeatedly (both row labels, the intro paragraph), and the Content Strategist's parallel prose almost certainly will too.
  ✅ **Implemented.** `UDP: 'User Datagram Protocol'` added to `ACRONYMS`.
- **`QUIC` is not an acronym — flagging so it isn't added as one by mistake.** Unlike `TCP`/`UDP`/`SNI`/`ECH`, the IETF's own QUIC RFC (RFC 9000) states outright that QUIC is not an acronym, just the protocol's name (despite an early, informal "Quick UDP Internet Connections" backronym that circulated before standardization and is not the standardized position). Do **not** add a `QUIC` entry to `ACRONYMS` implying an expansion — if the Content Strategist wants a one-line aside about the name's informal origin, that's prose, not a tooltip dictionary entry.
  ✅ **Heeded, and resolved in this doc's favor across a cross-doc conflict.** `content-plan.md` §5 had
  instructed adding a `QUIC` tooltip entry; the project owner reviewed both docs and sided with this doc's
  warning, so `QUIC` was deliberately **not** added to `ACRONYMS`. It renders as plain, un-tooltipped text
  everywhere it appears in the new Chapter 6 copy and inside `SessionTrackingViz`, the same treatment as
  `5-tuple` and `Connection ID`.
- **`Connection ID` recommendation: spell it out, don't add a `CID` acronym entry.** Real QUIC documentation commonly abbreviates this to "CID," but nothing on this site currently needs that shorthand, and introducing an acronym only this one component uses adds a tooltip for a term the copy can just spell out in full every time at negligible cost. Recommend against adding `CID` to `ACRONYMS` unless the Content Strategist's prose independently starts using the bare abbreviation.
- **`5-tuple` is new terminology for the entire site, not an extension of something partially taught already.** Worth flagging plainly (not as an open design flag — the mechanic doesn't depend on how it's introduced) because this is a bigger content lift than Phase 2a/2b faced: ECH extended a term (`SNI`) already named in prose before that toggle shipped, and hybrid key exchange extended a term (`X25519`) already named in Chapter 4's prose. Nothing on the site has ever named "5-tuple" before this design, even though the TCP handshake steps in `HandshakeStepper` have implicitly relied on the concept since Phase 0. The intro paragraph in §3.6 defines it inline (`"the 5-tuple, source IP, source port, destination IP, destination port, and protocol"`) specifically so the component doesn't depend on prose elsewhere having introduced it first — but the Content Strategist should know this term has zero prior footprint on the site to build from.
- **Glossary suggestion (Content Strategist's call, not mine):** `src/data/glossary.ts` has no entry for `5-tuple`, `Connection ID`, or `QUIC` itself. The `firewall` category (which already holds `NAT`, a similarly "how a firewall keeps track of traffic" concept) reads as the natural home for a `5-tuple` entry specifically; `Connection ID` and `QUIC` sit less cleanly in any of the three existing categories (`firewall` | `tls` | `vpn`) since they're transport-layer terms none of the three quite covers — flagging the awkward fit rather than recommending a new `GlossaryCategory` value myself, since that's a data-shape call outside this design's scope.
- **Placement is explicitly not my call**, per the same role split every prior phase in this series has honored. `research-ideas.md` #3 suggests Chapter 2 or Chapter 6 or a short standalone capstone. One observation worth passing along: Chapter 2 ("What a firewall actually does") currently has **zero** interactive components — it's the one earlier chapter that's pure prose — which makes it a plausible, low-friction slot for this design's single new interactive without contending with an existing one on the same page. Not a requirement, just a fact the Content Strategist may find useful when deciding.
  ✅ **Resolved by the project owner (2026-07-24): Chapter 6, not Chapter 2.** Placed in
  `Chapter6ForwardProxy.tsx`, directly after the content plan's two new "What changes next" / "How a forward
  proxy deployment adapts" Cards and before the chapter's existing two closing paragraphs — the exact slot
  `content-plan.md` §7 itself named as the natural fit if an interactive were added.
- **No new color tokens, no new motion primitives, no new file under `src/data/`.** Confirmed in §3.1 and §3.7.
- **Independently shippable.** Nothing in Chapters 1–6, `Sandbox`, or the certificate reference depends on this component existing; if it's cut, nothing else in this design or on the site breaks.

---

## 6. Summary of ⚠ needs-a-decision flags

None. Every question this brief raised has a confident, resolved recommendation with rationale above:

- Whether to build a before/after visible-fields comparison (§1.2) — **rejected**, near-total overlap with the already-shipped ECH toggle.
- Whether to build an interactive for "block UDP/443 vs. decrypt-and-inspect" (§1.3) — **rejected**, wrong shape (static tradeoff, not ordered matching); recommend a static two-item card grid instead, mirroring the existing `ACTIONS` pattern.
- Whether connection-ID persistence fits an existing component as a toggle, specifically `HandshakeStepper` (§2.1) — **rejected**, with the same step-by-step duplication-table method Phase 2a used, reaching the opposite conclusion (too structurally different, not too similar) for the opposite reason (a toggle's extension point is too narrow, not too wide).
- Component scope, data shape, default state, reset behavior, row content, and exact fictional values (§3) — all specified, with default (`'same'`) and no-reset behavior justified against the same conventions Phase 2a's `ech` and Phase 2b's `kexMode` already established.
- New acronym/glossary handling, including the specific trap of treating `QUIC` as an acronym it isn't (§5) — resolved with a recommendation and an explicit warning, not left open.

The only two items explicitly deferred are placement (§5, always the Content Strategist's call in this series, not a flag) and the accuracy-caveat sentence's exact wording/placement (§3.6, a copy decision within a fact I've already specified as required — not an open mechanic question).

---

## 7. Final implementation summary (added by the Implementer agent, 2026-07-24)

- ✅ `SessionTrackingViz.tsx` built at `src/components/chapters/SessionTrackingViz.tsx`, per §3 in full.
- ✅ Wired into `Chapter6ForwardProxy.tsx`, placed per the project owner's resolution of the two deferred
  placement questions (this doc's own §5, and `content-plan.md` §7's coordination note).
- ✅ §3.6's required accuracy caveat about connection-ID rotation implemented as one sentence, placed as a
  small aside beneath the two-row grid.
- ✅ `UDP` added to `ACRONYMS`; ❌ `QUIC` deliberately withheld from `ACRONYMS`, per this doc's own §5 warning,
  resolved in this doc's favor over `content-plan.md` §5's conflicting instruction — see that doc's own §5 for
  the matching note.
- Verified in a running `npm run dev` session: both rows update in place on toggle, the address line changes
  identically in both rows, the Connection ID stays constant, Row 1 turns danger-red and Row 2 turns
  success-green on "Client roams," and `5-tuple`/`Connection ID`/`QUIC` render with no tooltip while
  `TCP`/`UDP`/`TLS`/`App-ID` do.
