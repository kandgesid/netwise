**Implementation status (added by the Implementer agent, 2026-07-24): §4 (`Chapter6ForwardProxy.tsx`) and §6 (`glossary.ts`) are ✅ implemented exactly as specified. §5 (`acronyms.ts`) is ✅ implemented for `UDP` only — the project owner resolved the QUIC-acronym question in `simulation-design.md`'s favor: `QUIC` was deliberately ❌ skipped from `ACRONYMS`, a conscious deviation from this doc's own instruction, not an oversight (see the inline note at §5 below). §7's coordination note is resolved: the Designer's `SessionTrackingViz` ships, placed in Chapter 6 directly after this doc's two new Cards and before the chapter's existing closing paragraphs, per explicit project-owner placement decision. See `simulation-design.md`'s own status block for that component's implementation detail.**

# Content plan: research-ideas.md #3 → Chapter 6 (QUIC / HTTP-3 and what it does to inspection)

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).
Scope: research-ideas.md candidate **#3** ("QUIC / HTTP/3 and what it does to inspection"), landed as two new
closing-beat `Card`s inside Chapter 6 (`src/components/chapters/Chapter6ForwardProxy.tsx`).

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

A parallel Simulation/Interaction Designer agent is working the same topic area, doing **from-scratch design
work with no pre-suggested mechanic** (unlike the ECH and post-quantum phases before this one, which each had a
design-spec suggestion to react to). See **§7 Coordination note** before implementing — that section
deliberately leaves more open-ended room than the equivalent section in the two prior phases' plans, per
explicit instruction not to assume a small card-adjacent widget is the likely outcome here.

---

## 1. Why Chapter 6, and not Chapter 2 or Chapter 3

research-ideas.md #3 names Chapter 2 and Chapter 6 as "plausible homes," and its own bullet list (the
transport-layer change, the more-encrypted handshake, connection IDs replacing the 5-tuple, SNI/ECH's
interaction with QUIC, and what firewalls actually do about it) touches material spread across Chapters 1, 3,
5, and 6. Both named candidates, plus a third option this plan considered on its own (Chapter 3), were weighed
directly against the site's actual structure before picking one.

**Chapter 2 — rejected.** `Chapter2WhatItDoes.tsx` is three short bullets (encryption, decryption, SSL-vs-TLS)
positioned immediately after Chapter 1 and before the reader has seen a single handshake, a certificate, SNI,
a cipher suite, a decryption policy, or forward proxy in action. Every one of QUIC's disruptions is a
disruption *of* something taught later: the TCP handshake the stepper shows in Chapter 3, the SNI/ECH material
also in Chapter 3, the decrypt-and-inspect technique built out across Chapters 3, 5, and 6. Landing this content
in Chapter 2 would mean either forward-referencing concepts the reader hasn't earned yet (the exact "guided
discovery" violation this site's own prior integration passes have repeatedly flagged and fixed — see
`content-strategy.md`'s Findings C3-1 and C4-1) or re-explaining those concepts shallowly out of order. Neither
serves the reader; Chapter 2's own job (encryption exists, SSL vs. TLS) is complete as written and doesn't need
this weight added to it.

**Chapter 3 — seriously considered, then set aside in favor of Chapter 6.** Chapter 3 is, on paper, where most
of the *technical* disruption lives: `handshakeSteps.ts` names "TCP handshake, SYN / SYN-ACK / ACK" as literally
the first labeled step in all three of the stepper's scenarios, and Chapter 3's existing ECH `Card` already
teaches SNI and Encrypted Client Hello — QUIC's SNI story is a natural sibling to that exact content, and
research-ideas.md #3 itself calls QUIC and ECH "a natural pair to teach together." A version of this plan
that lands in Chapter 3 is defensible. Two things tipped the decision to Chapter 6 instead:

- Chapter 3 already carries a `HandshakeStepper` plus three substantial `Card`s (`PIPELINE_POINTS`,
  `MITM_POINTS`, `ECH_POINTS`). QUIC's material is described in the assignment itself as "meatier" than ECH or
  post-quantum key exchange, and needs at minimum two cards of its own (see §3) to avoid compressing it — adding
  that much to a chapter that's already the densest one on the site risked exactly the "textbook-dry, no
  breathing room" failure mode `content-strategy.md`'s Finding C4-1 diagnosed in Chapter 4 before that chapter
  was lightened.
- More importantly: research-ideas.md #3's own framing says this content "builds entirely on concepts already
  taught," and by the time a reader reaches Chapter 3, only *some* of the relevant concepts are actually in
  place yet — decryption policy (Chapter 5) and forward proxy's real deployment mechanics (Chapter 6 itself)
  haven't happened yet. Placing this at the very end of the narrative arc, after Chapter 6, means every single
  piece this content leans on (TCP handshake and SNI/ECH from Chapter 3, decryption actions from Chapter 5,
  forward proxy's actual deployment steps from Chapter 6) is already on the table. That's a materially stronger
  "wait, does this break everything I just learned" payoff than a mid-arc placement can deliver, and it matches
  the way research-ideas.md #3 itself is written: as a capstone-flavored "what's next after the browser you're
  securing changes" beat, not a mid-chapter aside.

**Chapter 6 — selected.** It's the last narrative chapter, sitting directly before the Sandbox, and its entire
subject is the operational reality of running forward proxy: CA setup, trust-store distribution, decryption
policy, certificate-pinning exceptions. QUIC's most concrete, "so what do you actually do" payload — block
UDP/443 outright, or decrypt-and-inspect it directly — is a direct extension of that exact deployment story, not
a tangent from it. Placing new content at the end of Chapter 6, after its existing three `Card`s and before its
existing closing paragraphs, follows the same "what changes next" pattern already used twice on this site (the
ECH `Card` closing Chapter 3, the post-quantum `Card` closing Chapter 4) — this is that pattern's third and,
per the sizing signal in research-ideas.md itself (QUIC is tiered as a "section addition," same as ECH and
post-quantum, not a "full new chapter" the way Zero Trust or ZTNA-vs-VPN are), almost certainly last instance
for the foreseeable set of research candidates already reviewed.

## 2. Placement decision inside Chapter 6

**Decision: two new `Card`s, inserted after the existing "Two things that aren't a one-time step" `Card` and
before the chapter's existing two closing `<p>` paragraphs. The existing closing paragraphs are left completely
untouched.**

Reasoning:

- **Two cards, not one.** The material has two genuinely distinct payloads — *what breaks* (transport, the
  handshake's transport-level exposure, connection IDs, SNI/ECH) and *what a deployment does in response*
  (block UDP/443 vs. decrypt-and-inspect directly). Chapter 6 already establishes precedent for splitting
  distinct kinds of content into separate `Card`s rather than one long list (`DEPLOY_STEPS` vs.
  `DEPLOY_CONSIDERATIONS`, per this site's own prior C6-1 finding) — this plan follows that same instinct for
  the same reason: cramming diagnosis and response into one list would imply they're the same kind of fact when
  they aren't.
- **After "Two things," not before or between.** "Where it's used" → "How it's actually deployed" → "Two
  things that aren't a one-time step" is a complete, self-contained account of *ordinary* TCP+TLS forward
  proxy. QUIC content belongs after that account is finished, as a "here's a wrinkle on top of everything
  above," not interleaved with it.
- **Existing closing paragraphs untouched, not edited.** Both remaining paragraphs ("Skip the trust-store
  step..." and "You've now read through every piece firewalls use to make a decision...") stay accurate exactly
  as written regardless of what's added above them — the first is a specific field note about trust-store
  rollout that has nothing to do with QUIC, and the second is a general "you've now covered every piece" close
  into the Sandbox that remains true in spirit (the Sandbox's own mechanics aren't being changed by this plan).
  This matches the explicit precedent set by the post-quantum plan for Chapter 4, which left that chapter's own
  final bridge paragraph unedited for the identical reason. No proposed edit here.
- **Card-internal formatting matches the sitewide "what changes next" convention, not Chapter 6's own
  `DEPLOY_STEPS`/`DEPLOY_CONSIDERATIONS` convention.** Chapter 6's existing two arrays are raw JSX-fragment
  arrays with no bold lead-in label (appropriate for short 2–3 item lists of plain sequential facts). The new
  content has four and three *distinct* technical claims apiece and benefits from the same bold-label
  `{ strong, text }` scanning structure Chapter 3's `ECH_POINTS` and Chapter 4's `PQ_POINTS` already use for
  exactly this genre of content (a dense "here's what changes" list) — see §3a for the exact shape. This is a
  deliberate departure from this one file's own older convention, made because the new content is closer in
  kind to Ch3/Ch4's "what changes next" cards than to Ch6's own step lists, not an inconsistency.

## 3. Files to touch

1. `src/components/chapters/Chapter6ForwardProxy.tsx` — add two new data arrays (`QUIC_POINTS`,
   `QUIC_RESPONSE_POINTS`) and two new `<Card>`s, inserted between the existing "Two things that aren't a
   one-time step" `Card` and the chapter's closing `<p>` paragraphs. One existing line changes: the "Two
   things..." `Card`'s opening tag gains a `className="mb-5"` (it's no longer the last `Card` in the chapter, so
   it needs the same bottom margin its two siblings above it already have).
2. `src/data/acronyms.ts` — add two new entries: `UDP`, `QUIC`.
3. `src/data/glossary.ts` — add two new entries to the `firewall` category (`5-tuple`, `Connection ID`) and
   three new entries to the `tls` category (`QUIC`, `UDP`, `HTTP/3`).

No other file needs to change. `src/data/sandboxScenarios.ts` and `Sandbox.tsx` are **not** touched — the
Sandbox's port-matching mechanic stays TCP/port-flavored; see §8 for why that's a deliberate scope call, not an
oversight. Checked against a full read of `src/data/acronyms.ts` and `src/data/glossary.ts` before writing this
plan — none of `QUIC`, `UDP`, `HTTP/3`, `5-tuple`, or `Connection ID` currently exist in either file. `TCP`,
`HTTP`, `HTTPS`, `TLS`, `SNI`, and `ECH` all already exist and are reused as-is.

---

## 4. Exact change: `src/components/chapters/Chapter6ForwardProxy.tsx`

✅ **Implemented.** `QUIC_POINTS` and `QUIC_RESPONSE_POINTS` added exactly as specified in §4a, the "Two
things..." `Card` gained `className="mb-5"` per §4b, and both new `Card`s were inserted in the exact order
described in §4c. One addition beyond this section's own instructions, made necessary by the project owner's
placement resolution (§7): the second new `Card` ("How a forward proxy deployment adapts") also carries
`className="mb-5"`, not left bare as §4b's original note said, because `<SessionTrackingViz />` now renders
directly below it before the chapter's closing paragraphs — it's no longer the last element in the chapter, so
it needs the same bottom margin its siblings carry. `<SessionTrackingViz />` itself is imported and rendered
immediately after the second new `Card`, per `simulation-design.md`'s spec and the project owner's placement
decision.

### 4a. New data arrays

Add these two arrays directly after the existing `DEPLOY_CONSIDERATIONS` array (i.e. after its closing `];`)
and before the `export function Chapter6ForwardProxy()` line:

```tsx
const QUIC_POINTS = [
  {
    strong: 'A different transport underneath, not just a different look.',
    text: "Every scenario in Chapter 3's stepper opens with the same first step: a TCP handshake, SYN, SYN-ACK, ACK, that a firewall watches happen before anything else. QUIC, the transport HTTP/3 runs on, skips that step entirely. It drops TCP and rides on UDP instead, so there's no three-way handshake to observe, and no stable source IP, source port, destination IP, destination port, and protocol combination, usually called the 5-tuple, sitting still long enough for a firewall to key its session tracking off the way it always has.",
  },
  {
    strong: 'More of the transport itself is hidden, not just the payload.',
    text: "TCP was never encrypted to begin with, only whatever TLS wrapped around it was. A firewall watching an ordinary TCP-plus-TLS connection could always see the TCP layer doing its job in the clear: sequence numbers, acknowledgments, retransmissions, the connection closing. QUIC folds a TLS 1.3 handshake into its own packets and then encrypts most of that transport-level signaling too, not because TLS suddenly hides more than it already did, but because the layer underneath TLS finally does as well.",
  },
  {
    strong: 'Connection ID replaces the address a firewall used to key off.',
    text: "Instead of identifying a connection by its 5-tuple, QUIC has both sides agree on a connection ID during the handshake and carry it forward from there. Because that ID travels with the connection rather than being derived from the network path, the same connection can survive a client's network changing entirely, moving from Wi-Fi to cellular mid-session, for instance, without restarting anything. That's a genuinely new mechanic, not just the same session hidden behind more encryption, and a firewall built around 5-tuple tracking has no direct equivalent to fall back on.",
  },
  {
    strong: "SNI didn't go anywhere, and neither did ECH.",
    text: "The destination hostname still shows up in cleartext in QUIC's handshake the same way it does in ordinary TLS, unless the connection also uses Encrypted Client Hello from Chapter 3. SNI-based policy isn't automatically dead here, it's exactly as exposed, or exactly as closed off, as it already was, just riding on a transport that isn't TCP anymore.",
  },
];

const QUIC_RESPONSE_POINTS = [
  {
    strong: 'Block UDP/443 outright.',
    text: "The blunt, early answer. Browsers only try QUIC as an upgrade and fall straight back to HTTP/2 over ordinary TCP if UDP/443 gets no response, so blocking it doesn't break the connection, it just forces it back onto the transport this chapter's decryption policy already knows how to handle.",
  },
  {
    strong: 'Decrypt and inspect QUIC directly.',
    text: "The newer approach, and conceptually the same move this chapter already teaches: present a substitute identity, decrypt a copy, inspect it, forward it. What's different is everything underneath that move, terminating a UDP-based, connection-ID-tracked, more thoroughly protected handshake instead of a TCP one, which is a heavier lift than the forward proxy setup earlier in this chapter, not a free extension of it.",
  },
  {
    strong: "Neither option is free, and this isn't a hypothetical anymore.",
    text: "Blocking UDP/443 gives up whatever QUIC actually improves, lower latency and better behavior on unreliable networks, for any traffic that has to fall back. Decrypting it directly means extending everything this chapter's deployment steps already cover to a transport they weren't originally written for. QUIC and HTTP/3 already carry a substantial and growing share of ordinary web traffic, so this is a decision most real deployments are already making one way or another, not an edge case a rollout might never run into.",
  },
];
```

Formatting notes:

- `strong` labels are short, period-terminated declarative phrases, matching `ECH_POINTS`/`PQ_POINTS`'
  convention exactly (see §2's last bullet for why this file departs from its own `DEPLOY_STEPS` convention
  here specifically).
- Every acronym used in this new copy — `TCP`, `QUIC`, `HTTP`, `UDP`, `TLS`, `SNI`, `ECH` — must exist in
  `ACRONYMS` (`src/data/acronyms.ts`) before this renders with tooltips. `TCP`, `HTTP`, `TLS`, `SNI`, `ECH`
  already exist. `QUIC` and `UDP` do not yet — added in §5 below. **Do not merge §4 without §5**, or
  `QUIC`/`UDP` will render as plain, un-tooltipped text.
  ❌/✅ **Owner resolution (2026-07-24): only half of this held.** `UDP` was added to `ACRONYMS` and renders
  tooltipped, exactly as this note anticipated. `QUIC` was deliberately **not** added — see §5's inline note —
  so `QUIC` renders as plain, un-tooltipped text throughout this new copy. That's the intended final state, not
  a merge-order bug.
- `HTTP/3` and `HTTP/2` are used as literal strings in this copy and are **not** added as their own `ACRONYMS`
  keys. `AutoLink`'s regex (`src/lib/autoLink.tsx`) uses `\b` word boundaries and `/` is a non-word character,
  so the existing `HTTP` key already matches correctly inside both strings (tooltipping just the `HTTP` portion,
  leaving `/2` and `/3` as plain trailing text) — this is the same behavior the site's existing copy already
  relies on for "TLS 1.2" / "TLS 1.3" (`handshakeSteps.ts`, `passthrough.steps[1].body`), so no new acronym
  entries are needed or proposed for either version string. Confirmed no double-match risk: `HTTPS` (5 letters)
  sorts before `HTTP` (4 letters) in `ACRONYM_KEYS`, but neither `HTTP/2` nor `HTTP/3` contains the letter `S`,
  so only `HTTP` can ever match inside them.
- `UDP/443` behaves the same way: `UDP` gets tooltipped, `/443` stays plain, matching how `port 443` reads
  elsewhere on the site without a dedicated "443" glossary concept.
- `5-tuple` and `Connection ID` are used as plain, un-tooltipped text throughout this new copy, matching how
  `Hybrid key exchange` and `Harvest now, decrypt later` (both multi-word phrases, neither a true acronym) are
  handled in the post-quantum pass: defined once, clearly, in running prose, and given a permanent Glossary
  entry (§6) without being added to `ACRONYMS`, since `AutoLink`'s tooltip mechanic is reserved for compact
  acronym/initialism tokens, not descriptive phrases.
- `key={p.strong}` matches the existing `ECH_POINTS.map` / `PQ_POINTS.map` key strategy — safe here too since
  all seven labels across both new arrays are unique (and don't need to be unique *across* the two arrays,
  since each `.map()` call only needs uniqueness within its own list).

### 4b. New JSX

First, change the existing "Two things that aren't a one-time step" `Card`'s opening tag from:

```tsx
      <Card>
        <h3 className="font-sans font-semibold text-base mb-2.5">Two things that aren't a one-time step</h3>
```

to:

```tsx
      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">Two things that aren't a one-time step</h3>
```

(This is the only edit to existing content in this file — needed because that `Card` is no longer the last one
in the chapter, and its two siblings above it both already carry `className="mb-5"` for the same spacing
reason.)

Then, insert the following immediately after that `Card`'s closing `</Card>` tag and before the existing
`<p className="text-ink-faint text-[13.5px] mt-4">` closing paragraph:

```tsx
      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">What changes next: QUIC and HTTP/3</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Every deployment step above assumes the traffic riding through it looks the same underneath: a TCP connection, then TLS layered on top of it. HTTP/3 doesn't make that assumption anymore. It runs over QUIC, a transport built without a firewall looking over its shoulder in mind, and it still shows up on the familiar port 443, just over UDP instead of TCP." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {QUIC_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-sans font-semibold text-base mb-2.5">How a forward proxy deployment adapts</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="None of that makes HTTP/3 traffic invisible, it just means the tools this chapter already covers aren't enough on their own anymore. Real deployments handle it one of two ways." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {QUIC_RESPONSE_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>
```

Notes:

- The first new `Card` carries `className="mb-5"` (it has a sibling below it); the second does **not** (it's
  now the last `Card` in the chapter, matching the exact convention the original "Two things..." `Card` used
  before this change — spacing down to the closing paragraphs is handled by their own `mt-4`/`mt-2` classes,
  unchanged).
- No changes needed to `<CipherDecoder />`-style components — Chapter 6 has none; this chapter is `SectionHead`
  + stacked `Card`s only, and that shape is preserved.

### 4c. Resulting order inside `<section id="ch6">` after this change

1. `SectionHead` (unchanged)
2. "Where it's used" `Card` (unchanged)
3. "How it's actually deployed" `Card` (unchanged)
4. "Two things that aren't a one-time step" `Card` (one class attribute changed: `mb-5` added)
5. **New:** "What changes next: QUIC and HTTP/3" `Card`
6. **New:** "How a forward proxy deployment adapts" `Card`
7. Existing closing paragraph ("Skip the trust-store step...") (unchanged)
8. Existing closing paragraph ("You've now read through every piece...") (unchanged)

---

## 5. Exact change: `src/data/acronyms.ts`

✅ **`UDP` implemented** exactly as specified (added immediately after `TCP`, before `HTTPS`).
❌ **`QUIC` deliberately skipped — a resolved deviation from this section's instruction, not an oversight.**
The parallel `simulation-design.md` (§5) flagged that RFC 9000 states QUIC is not an acronym, and that adding a
tooltip implying an expansion would contradict the more accurate nuance the Glossary entry (§6b below) already
correctly states. The project owner reviewed both docs and resolved the conflict in the Designer's favor: `QUIC`
does **not** get an `ACRONYMS` entry, and renders as plain, un-tooltipped text everywhere it appears in this
chapter's new copy — the same treatment already given to `5-tuple` and `Connection ID`. `UDP: 'User Datagram
Protocol'` still shipped, since both docs agreed on that one.

Insert these two lines immediately after the opening `TCP: 'Transmission Control Protocol',` line and before
`HTTPS: 'Hypertext Transfer Protocol Secure',` — grouping the three transport-layer protocols (`TCP`, `UDP`,
`QUIC`) together at the very top of the file, ahead of the application-layer/security cluster
(`HTTPS`/`HTTP`/`TLS`/`SSL`) that already follows. Purely cosmetic grouping — the dictionary is a flat object
and key order has no effect on `AutoLink`'s matching — but it keeps the three protocols this new content leans
on hardest visually adjacent for future editors, matching the grouping rationale used in every prior
integration pass.

```ts
  UDP: 'User Datagram Protocol',
  QUIC: 'Quick UDP Internet Connections',
```

Resulting order for the top of the file: `TCP`, `UDP`, `QUIC`, `HTTPS`, `HTTP`, `TLS`, `SSL`, ... (unchanged
from there on).

Verified neither key currently exists in `ACRONYMS` (full file read before writing this plan — the existing 30
entries run `TCP` through `Content-ID`, none of them `UDP` or `QUIC`).

**Note on `QUIC`'s tooltip value:** `'Quick UDP Internet Connections'` is given as the `ACRONYMS` tooltip
because every other entry in this dictionary is a plain historical-expansion string, and this plan follows that
established two-tier pattern (compact `ACRONYMS` value for the hover tooltip; the fuller, more precise nuance —
that IETF standardized "QUIC" as a name in its own right, not a literal acronym — belongs in the Glossary entry
instead, §6, matching how `SNI`'s and `ECH`'s richer explanations already live in `glossary.ts` rather than in
their one-line `ACRONYMS` tooltips).

---

## 6. Exact change: `src/data/glossary.ts`

✅ **Implemented in full.** Both §6a's two `firewall`-category entries and §6b's three `tls`-category entries
shipped exactly as specified, including the `QUIC` entry itself — the owner resolution in §5 only withholds
`QUIC` from `ACRONYMS` (the hover-tooltip dictionary); the Glossary entry, which states the accurate RFC 9000
nuance that QUIC is not a literal acronym, was always the correct home for that nuance and is unaffected.

### 6a. `firewall` category

Add two new entries to the end of the existing `firewall` array (after the `'Threat prevention'` entry, before
the array's closing `],`):

```ts
    { term: '5-tuple', def: "The source IP, source port, destination IP, destination port, and protocol combination a firewall has traditionally used to identify one ongoing connection and track its state, built around TCP and UDP's fixed address-and-port model. QUIC's connection ID exists specifically because that model doesn't hold for it." },
    { term: 'Connection ID', def: "QUIC's own way of naming an ongoing connection, agreed on by both sides during the handshake instead of derived from IP addresses and ports. Because the ID travels with the connection rather than the network path, the same connection can survive a client's network changing entirely, moving from Wi-Fi to cellular mid-session, for instance, without restarting the handshake." },
```

### 6b. `tls` category

Add three new entries to the end of the existing `tls` array (after the `'Harvest now, decrypt later'` entry,
before the array's closing `],`):

```ts
    { term: 'QUIC (quick udp internet connections)', def: 'The transport HTTP/3 runs on, built directly on UDP instead of TCP, with a TLS 1.3 handshake folded into its own packets instead of layered on top of an already-open connection. The name started as a backronym, "Quick UDP Internet Connections," but the standard treats QUIC as a name in its own right, not a literal acronym.' },
    { term: 'UDP (user datagram protocol)', def: "A connectionless alternative to TCP: packets go out with no three-way handshake and no built-in tracking of an ongoing session. Whatever counts as a \"session\" is left entirely to whatever protocol runs on top of it, QUIC included." },
    { term: 'HTTP/3', def: 'The current version of HTTP. The one change from HTTP/2 that actually matters here: it runs over QUIC instead of TCP, and inherits everything that changes about session tracking and handshake visibility as a result.' },
```

**Category split, explained:** `5-tuple` and `Connection ID` are filed under `firewall` (alongside `Zone`,
`Security policy rule`, `NAT` — all existing entries about how a firewall identifies and tracks a connection),
not `tls`, because they're session-tracking mechanics, not certificate/handshake-crypto facts. `QUIC`, `UDP`,
and `HTTP/3` are filed under `tls` (alongside `SNI`, `ECH`, `DNS` — none of which are TLS *concepts* either,
strictly speaking, but are precedent for this category already holding adjacent-protocol facts a TLS-focused
reader needs) since they're protocol-identity facts, matching the closest existing precedent rather than
inventing a fourth `GlossaryCategory`. See §8 for why a new category was considered and rejected.

**Implementer note on quoting:** `QUIC`'s glossary `def` above uses a mix of double-quote delimiter and escaped
inner double-quotes (`\"Quick UDP Internet Connections\"`) because it needs to contain a literal quoted phrase.
`UDP`'s `def` does the same for `\"session\"`. Keep these exactly as written — don't mechanically convert to
single-quoted strings or drop the inner quotation marks.

Verified against a full read of `glossary.ts`: none of `QUIC`, `UDP`, `HTTP/3`, `5-tuple`, or `Connection ID`
exist anywhere in any of the three categories (`firewall`, `tls`, `vpn`) today.

---

## 7. Coordination note (Simulation/Interaction Designer)

✅ **Resolved by the project owner (2026-07-24): build it, placed in this chapter.** The Designer's from-scratch
design work (`simulation-design.md` §1–§3) concluded a new component, `SessionTrackingViz`, was the one genuine
"aha" this material supports (connection-ID persistence across a network change). The project owner reviewed
both docs and placed it exactly where this section's own note flagged as the natural slot if something were
added: directly below this doc's two new `Card`s (§4b) and above the chapter's existing closing paragraphs. See
`simulation-design.md`'s status block for the component's implementation detail, and §4's inline note above for
the one existing-content ripple effect (the second new `Card` gaining `mb-5`) that this placement required.

`docs/integration/phase-2c-quic/` contained no other files when this plan was written — the parallel Designer's
output doesn't exist yet, or wasn't visible to this agent.

**This phase is explicitly different from the two before it.** The ECH and post-quantum research entries each
came with a specific interactive idea already sketched in outside notes for the Designer to react to (a toggle
inside `HandshakeStepper`, a chip inside `CipherDecoder`). Candidate #3 has no such suggestion anywhere in
`research-ideas.md` — the Designer is doing genuine from-scratch design work this round, deciding both *whether*
an interactive treatment belongs here at all and, if so, *what shape it takes*. Per the explicit correction
carried forward from Phase 1 ("do not unilaterally decide whether this topic gets an interactive treatment"),
compounded this time by there being no pre-existing suggestion to lean on, this plan takes a deliberately more
hands-off posture than either prior phase's coordination note:

- **This plan's content stands on its own.** The two `Card`s in §4 are complete, self-contained prose requiring
  no other component, exactly as written, regardless of what the Designer proposes or whether anything ships
  alongside it.
- **No assumption is made about scale or shape.** The two prior phases' coordination notes each floated a
  specific small, card-adjacent widget as "probably the safer-scoped option." This plan deliberately does not
  do that here. The material this phase covers — a transport-layer swap, a session-identity mechanic
  (`Connection ID`) that has no equivalent anywhere else on the site, and an operational block-vs-inspect
  decision — is different in kind from a single toggle or a single new chip on an existing decoder, and might
  reasonably call for something structurally different: a new small standalone visual contrasting 5-tuple
  tracking against connection-ID tracking; an extension to `HandshakeStepper`/`SCENARIOS` adding a fourth QUIC
  mode alongside `passthrough`/`forwardproxy`/`inbound`; something built around the block-UDP-443-vs-decrypt
  decision specifically; or a conclusion that no interactive is warranted here at all and the prose alone
  carries the chapter's final beat, the same way `Chapter5DecryptionPolicies.tsx`'s static `FLOW` list did
  before `PolicyEvaluator` was added. All of these are genuinely open — this plan is not ranking them.
- **If something is added, the natural slot inside this plan's own structure is directly below the two new
  `Card`s in §4b and above the chapter's existing closing paragraphs** — matching the placement pattern
  `PolicyEvaluator` uses in Chapter 5 (static content first, a hands-on payoff last, right before the chapter's
  own close). That said, if the Designer's concept is better served by living inside Chapter 3 instead (for
  example, a fourth `HandshakeStepper` mode, which would sit far from this chapter entirely), that is entirely
  the Designer's and/or project owner's call to make — this plan's chapter placement decision (§1) is about
  where the *prose* belongs, not a constraint on where an *interactive* must live. The two don't have to be in
  the same chapter if the Designer's concept is better served elsewhere.
- **This agent is not offering an opinion this time**, unlike the two prior phases' coordination notes, which
  each closed with "this agent's opinion, offered only as a flag." Given the explicit instruction to leave more
  room than usual on this phase specifically, doing so here would work against that instruction rather than
  just supplement it.

## 8. Deliberate scope calls made in this plan (flagging so nothing reads as an oversight)

- **No fourth `GlossaryCategory` was introduced**, even though `QUIC`/`UDP`/`HTTP/3`/`5-tuple`/`Connection ID`
  don't cleanly belong to any of `firewall` / `tls` / `vpn` on strict subject-matter grounds. Introducing a
  fourth category is a real architecture change (new `GlossaryCategory` union member, a new `CAT_OPTIONS` entry
  and label in `Glossary.tsx`) disproportionate to five term additions, and the site already has precedent for
  filing adjacent-but-not-strictly-matching terms into the closest existing category rather than fragmenting
  further (`DNS` lives in `tls` despite DNS not being a TLS protocol either). This plan follows that precedent
  rather than opening a new one.
- **The Sandbox (`Sandbox.tsx`, `sandboxScenarios.ts`) is untouched.** Its "Match on: Port / App-ID / User-ID"
  mechanic and its traffic scenarios are all implicitly TCP/port-flavored (`'finance:web-browsing:443'`, etc.)
  and stay that way. Whether the Sandbox should ever grow a UDP/QUIC-flavored scenario is a real feature
  question, not a copy edit, and squarely out of scope for a content-only pass — flagged here only so it reads
  as a conscious decision rather than a gap nobody noticed.
- **`Chapter3Handshake.tsx`'s existing `ECH_POINTS` card is not edited to mention QUIC**, even though the two
  topics are thematically close (per research-ideas.md #3's own framing, "a natural pair to teach together").
  Chapter 3's ECH card is complete and accurate as it stands for the TCP+TLS world it describes; folding a QUIC
  aside into it would be exactly the kind of un-requested scope creep into a chapter this plan deliberately
  didn't select (§1) as this content's home. If a future integration pass wants to add a one-line forward
  pointer from Chapter 3's ECH card to Chapter 6's new QUIC content (mirroring how `ECH_POINTS[2]` already
  forward-references Chapter 6 for a different reason), that's a small, separate, easy addition — not included
  here since it wasn't necessary for either card to read correctly on its own.
- **No specific browser, CDN, or vendor is named** anywhere in the new copy, deliberately, matching the
  established pattern from all three prior integration passes (`phase-1-certificates`, `phase-2a-ech`,
  `phase-2b-pq-crypto`) of avoiding claims that go stale the moment one product's rollout status changes. "A
  substantial and growing share of ordinary web traffic" (`QUIC_RESPONSE_POINTS[2]`) is deliberately
  unquantified for the same reason `phase-2b-pq-crypto/content-plan.md` §8 gives for not citing a specific
  adoption percentage for hybrid key exchange.
- **The QUIC Initial-packet nuance is simplified.** In real QUIC, the very first packet (carrying ClientHello,
  including SNI) uses "Initial" packet protection derived from a public, unkeyed process specifically so
  on-path observers, firewalls included, can still read it — it's closer to obfuscation than real secrecy, the
  same practical exposure TLS-over-TCP's ClientHello already has. `QUIC_POINTS[1]`'s claim is deliberately
  scoped to *transport-level signaling after the first packet* (sequence numbers, acks, retransmissions,
  connection close) rather than claiming the handshake itself somehow hides more than TLS 1.3 already did —
  this distinction was checked carefully against the research doc's own bullet ("encrypts nearly everything
  after the very first packet") to avoid restating it in a way that overclaims, matching the site's established
  discipline around not overstating what's actually hidden (see `content-strategy.md` Findings C3-2 and C3-4,
  both about exactly this failure mode in Chapter 3's own existing content). `QUIC_POINTS[3]` states the SNI
  exposure explicitly and correctly ("still shows up in cleartext... the same way it does in ordinary TLS") so
  the two points don't contradict each other.
- **"Happy Eyeballs"-style QUIC-to-TCP fallback behavior is described in plain terms, not named.** The specific
  IETF term for how browsers race/fall back between QUIC and TCP isn't introduced as new vocabulary
  (`QUIC_RESPONSE_POINTS[0]` just says "browsers only try QUIC as an upgrade and fall straight back... if
  UDP/443 gets no response"), matching the site's established restraint about not introducing every available
  protocol-level term just because it exists (the same judgment call `phase-2a-ech/content-plan.md` §9 made
  about not naming HPKE).

## 9. Full draft prose (final copy, for reference — identical to what's embedded in §4's code)

**Card 1 heading:** What changes next: QUIC and HTTP/3

**Card 1 intro paragraph:**

> Every deployment step above assumes the traffic riding through it looks the same underneath: a TCP connection, then TLS layered on top of it. HTTP/3 doesn't make that assumption anymore. It runs over QUIC, a transport built without a firewall looking over its shoulder in mind, and it still shows up on the familiar port 443, just over UDP instead of TCP.

**Card 1 points:**

- **A different transport underneath, not just a different look.** Every scenario in Chapter 3's stepper opens with the same first step: a TCP handshake, SYN, SYN-ACK, ACK, that a firewall watches happen before anything else. QUIC, the transport HTTP/3 runs on, skips that step entirely. It drops TCP and rides on UDP instead, so there's no three-way handshake to observe, and no stable source IP, source port, destination IP, destination port, and protocol combination, usually called the 5-tuple, sitting still long enough for a firewall to key its session tracking off the way it always has.
- **More of the transport itself is hidden, not just the payload.** TCP was never encrypted to begin with, only whatever TLS wrapped around it was. A firewall watching an ordinary TCP-plus-TLS connection could always see the TCP layer doing its job in the clear: sequence numbers, acknowledgments, retransmissions, the connection closing. QUIC folds a TLS 1.3 handshake into its own packets and then encrypts most of that transport-level signaling too, not because TLS suddenly hides more than it already did, but because the layer underneath TLS finally does as well.
- **Connection ID replaces the address a firewall used to key off.** Instead of identifying a connection by its 5-tuple, QUIC has both sides agree on a connection ID during the handshake and carry it forward from there. Because that ID travels with the connection rather than being derived from the network path, the same connection can survive a client's network changing entirely, moving from Wi-Fi to cellular mid-session, for instance, without restarting anything. That's a genuinely new mechanic, not just the same session hidden behind more encryption, and a firewall built around 5-tuple tracking has no direct equivalent to fall back on.
- **SNI didn't go anywhere, and neither did ECH.** The destination hostname still shows up in cleartext in QUIC's handshake the same way it does in ordinary TLS, unless the connection also uses Encrypted Client Hello from Chapter 3. SNI-based policy isn't automatically dead here, it's exactly as exposed, or exactly as closed off, as it already was, just riding on a transport that isn't TCP anymore.

**Card 2 heading:** How a forward proxy deployment adapts

**Card 2 intro paragraph:**

> None of that makes HTTP/3 traffic invisible, it just means the tools this chapter already covers aren't enough on their own anymore. Real deployments handle it one of two ways.

**Card 2 points:**

- **Block UDP/443 outright.** The blunt, early answer. Browsers only try QUIC as an upgrade and fall straight back to HTTP/2 over ordinary TCP if UDP/443 gets no response, so blocking it doesn't break the connection, it just forces it back onto the transport this chapter's decryption policy already knows how to handle.
- **Decrypt and inspect QUIC directly.** The newer approach, and conceptually the same move this chapter already teaches: present a substitute identity, decrypt a copy, inspect it, forward it. What's different is everything underneath that move, terminating a UDP-based, connection-ID-tracked, more thoroughly protected handshake instead of a TCP one, which is a heavier lift than the forward proxy setup earlier in this chapter, not a free extension of it.
- **Neither option is free, and this isn't a hypothetical anymore.** Blocking UDP/443 gives up whatever QUIC actually improves, lower latency and better behavior on unreliable networks, for any traffic that has to fall back. Decrypting it directly means extending everything this chapter's deployment steps already cover to a transport they weren't originally written for. QUIC and HTTP/3 already carry a substantial and growing share of ordinary web traffic, so this is a decision most real deployments are already making one way or another, not an edge case a rollout might never run into.

No new closing bridge paragraph is added — Chapter 6's existing two closing paragraphs (§2's third bullet)
already do that job unchanged, immediately after Card 2.

---

## 10. Order of implementation (for the Implementer)

1. `src/data/acronyms.ts` — add the two entries (§5).
2. `src/data/glossary.ts` — add the two `firewall`-category entries and three `tls`-category entries (§6a, §6b).
3. `src/components/chapters/Chapter6ForwardProxy.tsx` — add `QUIC_POINTS` and `QUIC_RESPONSE_POINTS` (§4a),
   change the "Two things that aren't a one-time step" `Card`'s class attribute (§4b), then add the two new
   `Card`s (§4b), keeping the quoting choices noted in §4a and §6 intact.
4. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
5. Visual check in `npm run dev`: confirm the two new cards render as the last two `Card`s in Chapter 6, after
   "Two things that aren't a one-time step" and before the two existing closing paragraphs; confirm hovering
   `TCP`, `QUIC`, `HTTP` (inside both "HTTP/3" and "HTTP/2"), `UDP` (inside both "QUIC" prose and "UDP/443"),
   `TLS`, `SNI`, and `ECH` anywhere in the new copy shows the correct tooltip; confirm `5-tuple` and
   `Connection ID` render as plain, un-tooltipped text (expected — see §4a); confirm nothing in "Where it's
   used," "How it's actually deployed," or the now-`mb-5` "Two things..." `Card` visually changed apart from
   its own spacing; confirm the two untouched closing paragraphs still render immediately after the second new
   `Card`.

---

## 11. Final implementation summary (added by the Implementer agent, 2026-07-24)

- ✅ `src/data/acronyms.ts` — `UDP` added; `QUIC` **not** added (owner-resolved deviation, see §5's inline note
  and the matching note in `simulation-design.md` §5).
- ✅ `src/data/glossary.ts` — all five entries added exactly as specified (§6a, §6b), `QUIC`'s entry included.
- ✅ `src/components/chapters/Chapter6ForwardProxy.tsx` — `QUIC_POINTS`, `QUIC_RESPONSE_POINTS`, the `mb-5`
  class change, and both new `Card`s all shipped per §4, plus one additional `mb-5` on the second new `Card`
  and a `<SessionTrackingViz />` import/render, both required by the project owner's §7 placement resolution.
- ✅ `src/components/chapters/SessionTrackingViz.tsx` — new file, built per `simulation-design.md` §3 in full,
  including resolution #3's connection-ID-rotation caveat sentence.
- `npx tsc -b`, `npm run lint` (oxlint), and `npm run build` all passed clean. Visually verified in
  `npm run dev`: the toggle drives both rows in place, `5-tuple`/`Connection ID`/`QUIC` render untooltipped,
  and `TCP`/`UDP`/`TLS`/`HTTP`/`SNI`/`ECH`/`App-ID` render tooltipped throughout the new copy.
