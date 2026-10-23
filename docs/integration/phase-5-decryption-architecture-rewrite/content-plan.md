# Content plan: SSL/TLS decryption architecture rewrite — Chapters 3, 4, 5 + new Chapter 7

Author: Content & Flow Strategist agent (analysis/copy/structure only; no `src/` files touched).

Source material: `/Users/sidkandge/Documents/SSL:TLS_Decryption_architecture.md` (the project owner's own doc,
read in full), compared against the live content of `Chapter3Handshake.tsx`, `Chapter4KeyExchange.tsx`,
`Chapter5DecryptionPolicies.tsx`, `HandshakeStepper.tsx`/`handshakeSteps.ts`, `CipherDecoder.tsx`/
`cipherSuite.ts`, `Chapter6ForwardProxy.tsx`, `routes.tsx`, `routeMeta.ts`, `Chapter7ZeroTrust.tsx`,
`Sandbox.tsx`/`sandboxScenarios.ts`, `acronyms.ts`, and `glossary.ts`, all read in full before writing this
plan.

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should
be able to execute it without guessing. It gives exact files, exact insertion points, and exact new
text/code. A parallel Simulation/Interaction Designer agent is working the same material — see
**Coordination note** at the end.

---

# Part A — Restructuring Chapters 3, 4, 5

## A0. The App-ID / User-ID / Content-ID question (answered once, up front, since it affects all three chapters)

**Recommendation: keep the three-capability framing and keep the vendor-branded names, with one small
reinforcement (a short disclosure line added to `Sandbox.tsx`). Do not drop or rename them to plain English.**

### Full blast radius, verified by `grep -rn "App-ID\|User-ID\|Content-ID" src/`

| File | What's there |
|---|---|
| `src/data/acronyms.ts` | 3 entries: `App-ID`, `User-ID`, `Content-ID` (plus `SP3`, the same vendor's name for single-pass architecture) |
| `src/data/glossary.ts` (`firewall` category) | 4 entries: `App-ID`, `User-ID`, `Content-ID`, `SP3 (single pass parallel processing)` — each already carries the "one vendor's branded name" disclosure inline |
| `src/components/chapters/Chapter3Handshake.tsx` | `PIPELINE_POINTS` (introduces the 3 names), the disclosure paragraph under "Three lenses," `SINGLE_PASS_POINTS`' intro line, and the SP3 disclosure paragraph |
| `src/components/chapters/SinglePassViz.tsx` | `FEATURES` array (`['App-ID', 'User-ID', 'Content-ID', 'Decryption']`), `FEATURE_COUNT_OPTIONS` labels, `INTRO` text, `CAVEAT_BEFORE` text, a doc comment |
| `src/components/chapters/Chapter7ZeroTrust.tsx` | `SIGNAL_POINTS`' first bullet, the `#signals` Card's intro paragraph, the `#coexist` Card's intro paragraph — 3 separate prose references |
| `src/components/chapters/SessionTrackingViz.tsx` | `INTRO` text (one reference, as an example of "every session... quietly assumes...") |
| `src/data/handshakeSteps.ts` | step titles/bodies across all three scenarios: `passthrough` ("App-ID (pattern-based)," "User-ID," "Content-ID (limited)," plus `echBody` variants), `forwardproxy` ("App-ID, User-ID, Content-ID"), `inbound` (one reference, retained in this plan's §A1 rewrite below) |
| `src/components/sandbox/Sandbox.tsx` | `ruleHint()` (2 branches), `sendPacket()` detail strings (2 branches), the "Match on" `Toggle`'s `App-ID`/`User-ID` option labels, the User/group select's label text, and the italic footnote under "Send test traffic" |

That's **8 files**, and critically, it's not just prose in most of them — `Sandbox.tsx`'s entire "Match on"
mechanic (`MatchMode = 'port' | 'appid' | 'userid'`, from `sandboxScenarios.ts`) *is* the three-capability
idea, not a description of it. Chapter 3's own text says the Sandbox is "built entirely around them." Dropping
the branded names would mean renaming a live interactive mechanic's UI labels and every piece of narration
pointing at it, not editing a handful of sentences.

### Reasoning for keeping them

1. **The disclosure mechanism already exists, is accurate, and is reused correctly.** Chapter 3 states plainly
   that App-ID/User-ID/Content-ID are "one major firewall vendor's names for these capabilities," that "every
   modern firewall does some version" of the three jobs under different names, and that the site uses one
   vendor's naming "for consistency, since the underlying ideas transfer regardless of which product you
   eventually work with." `Chapter7ZeroTrust.tsx` and `SinglePassViz.tsx` both correctly point back to that
   disclosure ("Chapter 3's User-ID already introduced...") rather than re-asserting the names as if they were
   universal. This is the same pattern the site already uses for `SP3` — name it once, disclose it once, point
   back to that disclosure everywhere else. It isn't an oversight that needs fixing; it's a deliberate,
   consistently-applied exception to the site's vendor-neutral rule, and the rule itself says *why* it's the
   one exception.
2. **Real transfer value, which is the stated reason the disclosure exists at all.** A reader who eventually
   works with a real firewall product — this vendor's or another one's — will run into something shaped like
   App-ID/User-ID/Content-ID: identify the real application regardless of port, map traffic to an actual
   signed-in identity, inspect payload content once it's visible. Teaching the shape under names that actually
   show up in real product documentation (with the disclosure that the names are vendor-specific, the
   underlying jobs aren't) has more real-world payoff than inventing neutral synonyms that a reader would then
   have to re-translate back into whatever vocabulary their actual tooling uses.
3. **The plain-English alternative doesn't remove any complexity, it just removes a label.** "Identify the
   app, identify the user, inspect the content" is already exactly what the disclosure text and every
   `SIGNAL_POINTS`/`PIPELINE_POINTS` bullet says the capability *is*; the branded name is additive vocabulary,
   not an extra concept layered on top. Removing the name wouldn't simplify the lesson, it would just make the
   lesson's new a word for it "App identification" instead of "App-ID," at the cost of rewriting 8 files and
   losing the real-world-recognizable term.
4. **The blast radius itself is a signal.** Something this deeply load-bearing for the Sandbox's core
   three-way comparison (port vs. app vs. user, the exact lesson the Sandbox exists to teach) isn't a
   decoration that can be swapped painlessly. If it were genuinely adding vendor-flavored complexity without
   payoff, it would be easy to excise from one or two chapters and leave the Sandbox alone; instead it's the
   Sandbox's actual mechanic, which argues it's pulling real weight, not just along for the ride.

### The one real gap found, and its fix

The disclosure only appears in Chapter 3. A reader who opens the Sandbox directly (it's a top-level tool
route, not gated behind reading the chapters in order) sees "App-ID" and "User-ID" as Toggle option labels
with zero explanation that they're one vendor's branded names, not a universal standard. Fix:

**File:** `src/components/sandbox/Sandbox.tsx`
**Insertion point:** immediately after the "Match on" `Toggle` block closes (after the `</div>` that follows
the `Toggle` with `port`/`appid`/`userid` options, i.e. right after line 165's closing of that `<div
className="mb-3.5">` block, before the `{ruleMode === 'port' && (...)}` conditional that follows).

```tsx
          <p className="text-[11.5px] text-ink-faint mb-3.5 -mt-1">
            <AutoLink text="App-ID and User-ID are one firewall vendor's branded names for capabilities most firewalls implement in some form — Chapter 3 has the full disclosure note." />
          </p>
```

No change to `MatchMode`, the Toggle's `value`/`onChange`, or any other Sandbox logic.

---

## A1. Chapter 3 — Handshake

### What stays as-is
- The overall shape: `ChapterTOC` → `HandshakeStepper` → "Three lenses" Card → "One pass" Card + `SinglePassViz`
  → "MITM, on purpose" Card → "ECH" Card → closing bridge to Chapter 4.
- `MITM_POINTS`, `ECH_POINTS`, the App-ID/User-ID/Content-ID disclosure, the SP3 disclosure — all untouched
  per §A0 and per the explicit instruction to keep ECH, single-pass, and cross-references.
- The `forwardproxy` scenario in `handshakeSteps.ts` — not touched by this plan; the source document's
  forward-proxy coverage (§3 Mode 1) is already matched or exceeded by the current two-leg, cert-substitution
  narrative.

### What gets restructured
**New Card: "TLS 1.2 vs. TLS 1.3, the actual sequence."** This is the chapter's clearest opportunity to adopt
the source document's step-numbered, low-prose-density style for material the site currently only touches in
one dense sentence (`handshakeSteps.ts`'s `passthrough` scenario, step 2's `body`: "In TLS 1.2 the real server
certificate is visible on the wire at this point; in TLS 1.3... it's encrypted..."). The owner's complaint —
"did not give clear idea on how handshake actually happens in easy way" — lands squarely here: the Stepper
walks through a handshake, but never shows the reader the actual TLS 1.2-vs-1.3 message sequence side by side
the way source doc §5 does. This closes that gap without duplicating the Stepper.

**File:** `src/components/chapters/Chapter3Handshake.tsx`

**1. Add to `TOC_ITEMS`** (insert as the new first item, since it continues straight out of the Stepper):

```tsx
const TOC_ITEMS = [
  { id: 'tls-versions', label: 'TLS 1.2 vs 1.3' },
  { id: 'three-lenses', label: 'Three lenses' },
  { id: 'single-pass', label: 'One pass, not one per feature' },
  { id: 'mitm', label: 'MITM, on purpose' },
  { id: 'ech', label: 'Encrypted Client Hello' },
];
```

**2. Add two new data arrays**, placed near the top of the file alongside the existing `PIPELINE_POINTS` etc.:

```tsx
const TLS12_STEPS = [
  'ClientHello — proposes the TLS version, random bytes, and which cipher suites it supports.',
  "ServerHello — server picks one cipher suite from that list and sends its own random bytes.",
  'Certificate — server sends its certificate, in the clear.',
  "ServerKeyExchange — server's ephemeral public key, signed with its long-term private key. Only shows up at all if the chosen cipher suite is ECDHE or DHE.",
  "ClientKeyExchange — client sends its own half of the key exchange.",
  'Both sides independently compute the same shared secret from what they just exchanged.',
  'ChangeCipherSpec + Finished, both directions — a last integrity check, and the first thing actually sent encrypted.',
];

const TLS13_STEPS = [
  "ClientHello — now carries the client's key share up front, not just a list of cipher suite options.",
  "ServerHello — server's key share comes back immediately. Both sides derive the shared secret right here.",
  'Everything from this point on is encrypted, including the certificate itself.',
  'EncryptedExtensions, Certificate, CertificateVerify, Finished — sent as one encrypted block.',
  "Client's own Finished closes out the handshake.",
];
```

**3. Insert a new Card** immediately after the closing `</div>` of the `<HandshakeStepper />` wrapper (i.e.
right before `<Card id="three-lenses" ...>`):

```tsx
      <Card id="tls-versions" className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">TLS 1.2 vs. TLS 1.3, the actual sequence</h3>
        <p className="text-ink-dim text-[14.5px] mb-3.5">
          <AutoLink text="The stepper above shows one firewall-centric path through a handshake. Here's the handshake itself, message by message, both versions side by side." />
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-3.5">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-faint mb-2">TLS 1.2 — 2 round trips</h4>
            <ol className="pl-4 text-ink-dim text-[13.5px] space-y-1.5 list-decimal marker:text-line">
              {TLS12_STEPS.map((s, i) => (
                <li key={i}><AutoLink text={s} /></li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-faint mb-2">TLS 1.3 — 1 round trip</h4>
            <ol className="pl-4 text-ink-dim text-[13.5px] space-y-1.5 list-decimal marker:text-line">
              {TLS13_STEPS.map((s, i) => (
                <li key={i}><AutoLink text={s} /></li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-ink-faint text-[13px]">
          <AutoLink text="Fewer messages, encryption starting earlier, and one path removed entirely: TLS 1.3 only allows the ephemeral kind of key exchange, so static RSA key exchange has nowhere left to run. That's exactly why one path through the inbound-inspection scenario above, a server that's negotiated TLS 1.3, always lands on the active-participant mechanism rather than a quiet decrypt." />
        </p>
      </Card>
```

This is prose-and-list only, matching the register of `Chapter6ForwardProxy.tsx`'s stacked Cards — no new
component, no new interactive state.

### Gap #1 — PFS/ECDHE during inbound inspection (confirmed real gap, closed here)

**File:** `src/data/handshakeSteps.ts`. Replace the entire `inbound` entry in `SCENARIOS` with the following.
This is additive to the existing 6-step sequence (adds one step, rewrites two, leaves the rest untouched) —
not a redesign of the stepper's mechanics.

```ts
  inbound: {
    label: 'Inbound inspection',
    note: "The firewall isn't spoofing anything here. It holds the real server's own private key the whole time, and what that key actually buys depends on which key exchange the server negotiates: a quiet decrypt with the same key everyone else derives, or something more active. The next few steps walk through both.",
    steps: [
      { pos: 18, label: 'TCP handshake', title: 'Client ↔ server', body: 'Client opens a TCP connection addressed to the real server the whole time. The firewall sits inline but doesn\'t terminate anything itself.' },
      { pos: 32, label: 'TLS handshake', title: 'ClientHello', body: 'Client sends ClientHello, addressed to the real server.' },
      { pos: 46, label: 'TLS handshake', title: 'ServerHello + the real certificate', body: 'The server responds with its actual, valid public certificate, exactly what the client would see with no firewall involved at all.' },
      { pos: 56, label: 'Key derivation', title: 'Two different paths from here', body: "Which path plays out depends entirely on the cipher suite the server picked. Static RSA (the older path): the client encrypts a secret with the server's public key, and since the firewall was handed the matching private key ahead of time, it decrypts that secret directly and derives the same session key everyone else does, no third party inserted into the handshake, nothing more than a very well-informed listener. ECDHE/DHE (what TLS 1.3 requires, and most TLS 1.2 traffic uses today): there's no encrypted secret here for a private key to unlock. Both sides just exchange disposable public values and compute a shared secret from those directly, the forward-secrecy mechanism Chapter 4 covers. A key that only knows how to decrypt is suddenly useless for that, which is what the next step is about." },
      { pos: 64, label: 'Key derivation', title: 'Becoming an active participant, not a passive key-holder', body: "Useless for decrypting, not useless for proving identity. The private key still signs, and signing is enough to stay in the middle: the firewall runs its own ephemeral key exchange with the client, signs its half using the server's real private key so the client's signature check passes exactly like it would against the real server, and runs a second, separate ephemeral key exchange with the server, standing in as the client this time. Two independent Diffie-Hellman exchanges, two independent shared secrets, the firewall in the middle of both, the same shape as forward proxy's two stitched-together legs above, minus any forged certificate anywhere in the picture." },
      { pos: 74, label: 'Session established', title: 'One decrypt, or two sessions stitched together', body: 'With static RSA, this is one session: the firewall derived the same key everyone else did and decrypts a copy of it in place, invisible to both ends. With ECDHE, it\'s two sessions, client-to-firewall and firewall-to-server, each with its own key, the same structure as forward proxy, just with the server\'s genuine certificate instead of a generated one. Either way, the firewall now runs full App-ID, User-ID, and Content-ID inspection on the plaintext it holds.' },
      { pos: 85, label: 'Policy decision', title: 'Delivered unchanged', body: 'Traffic reaches the server exactly as sent, whichever path produced it. The client and server never see anything different from a normal, direct connection.' },
    ],
  },
```

No changes needed to `HandshakeStepper.tsx` itself — it already renders `scenario.steps` generically, so a
7th step in `inbound` requires zero component logic changes. (One flag for the Interaction Designer below:
this would be an even better fit for a small toggle, like the existing ECH toggle on `passthrough`, that lets
a reader pick "static RSA" or "ECDHE" and skip straight to the relevant path instead of reading both
back-to-back in one step. See Coordination note.)

---

## A2. Chapter 4 — Key exchange

### What stays as-is
- The intro paragraph, `CipherDecoder`/`cipherSuite.ts` entirely, and the whole post-quantum (`PQ_POINTS`)
  Card. None of this overlaps the source document — it's exactly the kind of valuable, non-overlapping
  content the owner said to keep, and the source document has nothing to say about ML-KEM, hybrid key
  exchange, or cipher-suite decoding at all.

### What gets restructured
**The "Key exchange groups" Card currently states conclusions without ever walking through the mechanism.**
It says ECDHE/DHE are ephemeral, that this gives forward secrecy, and names the common groups — all true, but
it never shows the actual step-by-step exchange the way source doc §6 does ("1. Generate ephemeral key pair...
2. Exchange public keys... 3. Compute shared secret... 4. Derive session keys... 5. Destroy ephemeral private
keys"). This is exactly the kind of "states the conclusion, skips the mechanism" density the owner is
describing. Rewrite it into the same step-by-step shape.

**File:** `src/components/chapters/Chapter4KeyExchange.tsx`

Replace the existing "Key exchange groups" `<Card>` (the one directly after the intro paragraph and before
`<CipherDecoder />`) with:

```tsx
      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2.5">Key exchange groups</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          Both sides combine public values so each can independently compute the same shared secret, without
          ever sending that secret over the wire. Here's the actual mechanism, step by step:
        </p>
        <ol className="pl-4 text-ink-dim text-[14.5px] space-y-1.5 list-decimal marker:text-line mb-3">
          <li>Each side generates its own ephemeral key pair, brand new, just for this one connection.</li>
          <li>Both sides send their public key across, in the clear, right inside the handshake.</li>
          <li>
            Each side combines its own private key with the other side's public key. Because of how
            elliptic-curve math works, both land on the exact same shared secret, without that secret itself
            ever crossing the wire.
          </li>
          <li>That shared secret feeds a key-derivation function, producing the actual encryption and integrity keys used for the rest of the session.</li>
          <li>Both ephemeral private keys get thrown away immediately after. Nothing is left anywhere that could reconstruct this session's keys later.</li>
        </ol>
        <p className="text-ink-dim text-[14.5px]">
          <AutoLink text="That's what the \"E\" in ECDHE and DHE stands for, ephemeral, and step 5 above is the whole mechanism behind forward secrecy: there's nothing left to steal after the fact. Common groups in use today: X25519 and secp256r1 (also called P-256). The decoder below lets you toggle the first chip to see what a post-quantum-hybrid version of X25519 looks like." />
        </p>
      </Card>
```

(Reuses the exact phrase "secp256r1 (also called P-256)" from the original card and the exact "toggle the
first chip" sentence pointing at `CipherDecoder` — nothing downstream of this Card needs to change.)

### Gap #2 — what a stolen key still enables under PFS (confirmed real gap, closed here)

**New Card**, inserted immediately after the rewritten "Key exchange groups" Card and before `<CipherDecoder
/>`. Chapter 4 currently states (correctly) that forward secrecy protects *finished* sessions from a future
key theft, and stops there — leaving an open door for a reader to conclude a stolen key is harmless once PFS
is involved. Source doc §8 ("What Happens When Private Key is Stolen?") is the fix, rewritten vendor-neutral.

**File:** `src/components/chapters/Chapter4KeyExchange.tsx`

```tsx
const STOLEN_KEY_POINTS = [
  {
    strong: "The key's job changed, it didn't disappear.",
    text: "Under ECDHE, the server's long-term private key is never used to encrypt or decrypt anything in the handshake. It's used to sign the server's ephemeral key share, proving \"yes, this really is the server you think you're talking to.\" That's the exact mechanism Chapter 3's inbound-inspection scenario relies on to legitimately stay in the middle even with PFS in play.",
  },
  {
    strong: 'Past sessions stay safe.',
    text: 'Every session that already finished used its own disposable key pair, thrown away the moment the handshake ended. A private key stolen years later has nothing left to unlock; the key that actually protected that traffic no longer exists anywhere.',
  },
  {
    strong: "Future sessions don't.",
    text: "A stolen private key still signs just as convincingly as the real server did. An attacker holding it can stand up a fake server, sign brand-new ECDHE exchanges with it, and any client checking the certificate has no way to tell the difference. The key didn't stop proving identity just because it stopped being used to decrypt.",
  },
];
```

```tsx
      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">What forward secrecy doesn't protect</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Forward secrecy above is specifically about sessions that already finished. It says nothing about what a stolen key still lets an attacker do going forward, and conflating the two is an easy way to end up thinking a stolen key is basically harmless once PFS is involved. It isn't." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line mb-3.5">
          {STOLEN_KEY_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-line-soft rounded-md overflow-hidden text-[13px] mb-2">
          <div className="bg-bg-deep p-3"></div>
          <div className="bg-bg-deep p-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">Past traffic</div>
          <div className="bg-bg-deep p-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">Future traffic</div>
          <div className="bg-bg-deep p-3 text-ink">With PFS (ECDHE)</div>
          <div className="bg-bg-deep p-3 text-success">Protected — ephemeral keys are already gone</div>
          <div className="bg-bg-deep p-3 text-danger">At risk — the key can still sign, so it can still impersonate</div>
          <div className="bg-bg-deep p-3 text-ink">Without PFS (static RSA)</div>
          <div className="bg-bg-deep p-3 text-danger">Exposed — the same key decrypts everything ever recorded</div>
          <div className="bg-bg-deep p-3 text-danger">At risk — same impersonation risk either way</div>
        </div>
        <p className="text-ink-faint text-[13px]">
          Real example: Heartbleed (2014) leaked private keys from live servers and exposed years of past
          traffic specifically because most of the web was still running static RSA key exchange at the time.
          The same bug today, against a server running ECDHE, would still hand an attacker the ability to
          impersonate that server going forward, just not a time machine into its past traffic.
        </p>
      </Card>
```

Note on the 2x2 grid: this is a new visual shape not used elsewhere on the site (no existing Table-like
primitive in `components/ui/`). The content/structure above is the deliverable; whoever implements this
should sanity-check the exact Tailwind classes against the live design system rather than copy them
verbatim, since this plan's author has copy/structure authority, not final visual authority. A `text-danger`
cell appearing twice in the same row (both "future traffic" outcomes) is intentional — it's the point the
source table makes (PFS fixes one axis, not both).

### App-ID/User-ID/Content-ID in this chapter
Not referenced in Chapter 4 at all — nothing to change here. See §A0 for the sitewide recommendation.

---

## A3. Chapter 5 — Policies

### What stays as-is
- The `ACTIONS` grid (Decrypt/No decrypt/Bypass), "The general flow" Card, and `PolicyEvaluator` — this
  chapter is already the least text-heavy of the three and already uses a procedural, numbered-flow style.
  The source document has no real decryption-policy-rule-evaluation content of its own to merge in (its §11
  PANW configuration summary is implementation-specific and explicitly out of scope per the vendor-neutral
  decision).

### What gets restructured (discretionary, not one of the two confirmed gaps — flagged as such)
The `ACTIONS` grid's `Bypass` description already name-drops certificate pinning in passing ("an app is known
to break under interception, like ones that pin certificates") but never explains *why* pinning or mTLS defeat
decryption, or that they're not just a policy preference but a technical wall. Source doc §10 ("What Cannot Be
Decrypted") covers this cleanly and is currently underused on the site. This strengthens the existing Bypass
action with the "why" rather than introducing new concepts.

**File:** `src/components/chapters/Chapter5DecryptionPolicies.tsx`

New data array, placed near `ACTIONS`/`FLOW`:

```tsx
const UNDECRYPTABLE_POINTS = [
  {
    strong: 'Certificate pinning.',
    text: "Some apps, mobile banking apps are the common example, hardcode which exact certificate they'll accept from a given server, instead of trusting anything a normal chain of trust would validate. Forward proxy's usual move, presenting a different, firewall-signed certificate in place of the real one, gets rejected outright by a pinned app, the same way it would reject an actual attacker's fake certificate. No policy setting fixes this; the fix is a Bypass exception for that specific app.",
  },
  {
    strong: 'Mutual TLS (mTLS).',
    text: "Normal decryption only requires the firewall to impersonate the server. mTLS asks the server to also demand a certificate from the client, and the firewall doesn't have the client's private key any more than an attacker would, so it can't complete that half of the handshake either, in forward proxy or inbound inspection. Same outcome: Bypass, not a setting to tune.",
  },
];
```

New Card, inserted immediately after the `ACTIONS` grid's closing `</div>` and before the existing "The
general flow" `<Card>`:

```tsx
      <Card className="mb-7">
        <h3 className="font-sans font-semibold text-base mb-2.5">Two cases where decryption isn't actually optional</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Bypass above usually reads like a policy choice: performance, compatibility, compliance. Two specific cases aren't a choice at all, the firewall technically cannot complete a normal decrypt no matter what the policy says." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2.5 list-disc marker:text-line">
          {UNDECRYPTABLE_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>
```

**Supporting vocabulary additions** (needed for `AutoLink`/glossary coverage of "mTLS," which doesn't
currently exist anywhere on the site):

`src/data/acronyms.ts` — insert alongside the other TLS-related entries:
```ts
  mTLS: 'Mutual TLS',
```

`src/data/glossary.ts`, `tls` category — append:
```ts
    { term: 'mTLS (mutual TLS)', def: "TLS where the server also requires the client to present its own certificate, authenticating both directions instead of just the server. A firewall doing forward proxy or inbound inspection has no way to supply the client's private key, so mTLS traffic is a Bypass, not a decryption policy setting." },
    { term: 'Certificate pinning', def: "An app hardcoding which exact certificate (or public key) it will accept from a server, instead of trusting anything a normal chain of trust validates. Rejects a firewall's substitute certificate the same way it would reject an attacker's, so pinned apps need a Bypass exception rather than a decryption rule." },
```

(Verified: neither `mTLS` nor `Certificate pinning` currently exists in either file.)

### App-ID/User-ID/Content-ID in this chapter
Not referenced in Chapter 5 at all — nothing to change here.

---

# Part B — New Chapter 7: "Key protection"

## B1. Placement decision and why

**Decision: insert as a new Chapter 7, between the current Chapter 6 (Forward proxy) and the current Chapter
7 (Zero Trust), which becomes Chapter 8. One chapter, not a split.**

### Why after Chapter 6, not after Chapter 4
The new material is fundamentally about *protecting a private key the firewall is already holding for a
deployment reason* — and the site doesn't finish introducing *which* private keys those are until Chapter 6.
Chapter 3 (as restructured above) establishes the server's own signing key during inbound inspection and the
active-DH-participant mechanism. Chapter 4 establishes ephemeral/session keys and what stealing the
*long-term* key does and doesn't expose. Chapter 6 is the chapter that actually hands the firewall a
standing, deployment-level key to hold: step 1 of "How it's actually deployed" is "Generate or import a CA
certificate on the firewall... the Forward Trust CA that will sign every fake certificate it presents." That
CA's private key, plus the server private keys from Chapter 3, are the two concrete things this new chapter
is about protecting. Placing it any earlier means asking the reader to care about protecting a key they
haven't been shown yet.

### Why before Chapter 8 (Zero Trust), not after
The task's own framing says Zero Trust should stay last, and that holds up structurally too: key protection is
still a "who can reach this box, and how guarded is that access" question — the same possession-and-location
frame the rest of the course has been using. Zero Trust's whole point is asking what changes once that frame
stops being sufficient on its own. Key protection is a refinement within the old frame; Zero Trust is the
chapter that steps outside it. That ordering (refine the old frame fully, then introduce the frame that
supersedes it) is also exactly how Chapter 6 already closes into Chapter 7 today ("You've now read through
every piece firewalls use to make a decision when trust follows a connection's location... Chapter 7 asks what
changes once location by itself stops being enough") — this plan preserves the shape of that transition, it
just slots one more link into the chain before it.

### Why one chapter, not a split
The owner asked to consider whether "protecting the keys" should be its own chapter or split further. Source
doc §8 (HSM, Master Key encryption, rotation, subordinate-CA practice, access control) and §9 (hardware vs.
software vs. cloud key-protection tradeoffs) read, structurally, as **one question asked twice**: "how do you
keep this key safe" first answered mechanism-by-mechanism, then re-answered through the lens of which box the
firewall happens to run on. That's the same relationship Chapter 6 already has between its own sections
("How it's actually deployed" then "What changes next: QUIC and HTTP/3" — one topic, a core treatment plus an
extension) and it's a comfortable size match: 5 Cards plus a closing paragraph, in the same range as Chapter 3
(4 Cards + TOC + 2 interactives) and Chapter 6 (5 Cards + TOC + 1 interactive). Splitting §8 and §9 into two
separate chapters would mean a four-Card chapter and a two-Card chapter, both thinner than every other
chapter in the course, for what is genuinely one idea viewed from two angles.

### Title, route, and metadata

**File:** `src/routeMeta.ts`

Insert a new entry after the `forward-proxy` entry and before `zero-trust`, and bump `zero-trust`'s `order`
and `chapterNumber` from 7 to 8:

```ts
  {
    path: '/chapters/key-protection',
    navLabel: 'Key protection',
    description: "Why the keys a firewall now holds, the forward-trust CA and the server's own signing key, are worth protecting as hard as anything they protect — HSMs, master-key encryption, and short-lived certificates, and what hardware, software, and cloud form factors each change about that.",
    group: 'course',
    order: 7,
    chapterNumber: 7,
  },
  {
    path: '/chapters/zero-trust',
    navLabel: 'Zero Trust',
    description: 'What changes once being inside a zone stops being proof of anything by itself.',
    group: 'course',
    order: 8,
    chapterNumber: 8,
  },
```

(Everything else in `ROUTE_META` — `firewall` through `forward-proxy`, and all of `tools` — is unchanged.
Sidebar, home grid, and prev/next all recompute automatically from this file per `CLAUDE.md`'s routing
section; no other metadata file needs to change.)

### Required rename: `Chapter7ZeroTrust.tsx` → `Chapter8ZeroTrust.tsx`

Every existing chapter component is named `Chapter<N><Name>.tsx` matching its `chapterNumber`. Inserting a
new chapter 7 in front of the old one breaks that convention unless the old file is renamed. Verified via
`grep -rn "Chapter 7\|Chapter7" src/` — the complete list of places that reference the old numbering:

1. **Rename** `src/components/chapters/Chapter7ZeroTrust.tsx` → `src/components/chapters/Chapter8ZeroTrust.tsx`.
   Inside that file:
   - `export function Chapter7ZeroTrust()` → `export function Chapter8ZeroTrust()`
   - `<ChapterPage title="Chapter 7: Zero Trust">` → `<ChapterPage title="Chapter 8: Zero Trust">`
   - `<SectionHead eyebrow="Chapter 7" title="Zero Trust: verify every time">` → `eyebrow="Chapter 8"`
   - No other text inside that file says "Chapter 7" — verified by full read.

2. **`src/routes.tsx`**:
   ```tsx
   import { Chapter7KeyProtection } from './components/chapters/Chapter7KeyProtection';
   import { Chapter8ZeroTrust } from './components/chapters/Chapter8ZeroTrust';
   ```
   and in the `ELEMENTS` map:
   ```tsx
     '/chapters/key-protection': <Chapter7KeyProtection />,
     '/chapters/zero-trust': <Chapter8ZeroTrust />,
   ```
   (replacing the single old `Chapter7ZeroTrust` import/line).

3. **`src/components/chapters/Chapter6ForwardProxy.tsx`**, closing paragraph — currently bridges straight to
   Zero Trust by number. Rewrite to bridge into the new chapter instead (exact replacement below, §B3).

4. **`src/components/sandbox/Sandbox.tsx`**, line 124 — `"the same one Chapter 7's Zero Trust reframing"` →
   `"the same one Chapter 8's Zero Trust reframing"`.

No other files reference "Chapter 7" or the Zero Trust chapter by number (`ContinuousVerificationViz.tsx`'s
doc comment references "Chapter 6" for `SessionTrackingViz`, which is unaffected by this renumbering).

### New component file

**File (new):** `src/components/chapters/Chapter7KeyProtection.tsx`. No new `src/data/*.ts` file is required —
this chapter's content is static prose/lists, the same shape as `Chapter6ForwardProxy.tsx`'s inline
`DEPLOY_STEPS`/`QUIC_POINTS` arrays, which also live directly in the component file rather than a separate
data module. (Chapters only get a dedicated `data/*.ts` file when an interactive stepper/decoder needs one, per
`CLAUDE.md`; this chapter has no interactive of its own in this plan — see Coordination note for where one
could go.)

---

## B2. Full content outline and draft prose for Chapter 7 ("Key protection")

```tsx
import { Link } from 'react-router-dom';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { ChapterTOC } from '../ui/ChapterTOC';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';
import { AutoLink } from '../../lib/autoLink';

const TOC_ITEMS = [
  { id: 'why-matters', label: 'Why this is its own problem' },
  { id: 'hsm', label: 'Hardware security modules' },
  { id: 'master-key', label: 'Master key encryption' },
  { id: 'practices', label: 'Other standing practices' },
  { id: 'formfactor', label: 'Hardware vs software vs cloud' },
];
```

**SectionHead:**
> eyebrow: "Chapter 7", title: "Protecting the keys the firewall now holds"
>
> body: "Chapter 3 and Chapter 6 both handed the firewall something extremely sensitive to hold onto: a
> signing key for inbound inspection, a CA key for forward proxy. Neither chapter asked what happens if either
> one leaks. This one does."

**Card `#why-matters` — "Why this is its own problem"**

```tsx
const STAKES_POINTS = [
  {
    strong: 'Stealing a session key costs you one session.',
    text: "Chapter 4 already covered this: an ephemeral key pair dies with the handshake it was generated for. Stealing one, if that were even possible after the fact, buys an attacker nothing beyond the single session it belonged to.",
  },
  {
    strong: 'Stealing the signing key costs you every future session, and everyone who trusts it.',
    text: "The Forward Trust CA key from Chapter 6 and the server's own private key from Chapter 3 are different: they're long-lived, reused across every session, and used specifically to prove identity. Steal the Forward Trust CA key and you can sign a convincing certificate for any domain, to anyone whose device already trusts that CA, not just the one organization that issued it. Steal the server's key and you can impersonate that real server to anyone, going forward, the exact exposure Chapter 4's stolen-key table above just walked through.",
  },
  {
    strong: "That asymmetry is why this gets separate engineering attention.",
    text: "A key this consequential doesn't get protected by the same casual handling as an ephemeral one. The rest of this chapter is what \"separate engineering attention\" actually looks like in practice.",
  },
];
```

**Card `#hsm` — "Hardware security modules"**

> intro: "A Hardware Security Module (HSM) is a physical, tamper-resistant device built for one job:
> generate, store, and use cryptographic keys without ever letting the key itself leave in a form that could
> be copied."

```tsx
const HSM_POINTS = [
  {
    strong: 'What actually changes.',
    text: "Without an HSM, a private key sits somewhere in the firewall's own memory or config, in a form the firewall itself can read and use directly. With an HSM, the firewall instead sends the HSM a request, \"sign this\" or \"decrypt this,\" the HSM performs that one operation internally, using a key that never leaves it, and hands back only the result. The key material itself never crosses that boundary, not even to the device that's using it.",
  },
  {
    strong: "Independent of brand.",
    text: "Every major firewall vendor supports pairing with some kind of HSM, an on-premises network appliance or a cloud-hosted equivalent. Which specific product sits behind that connection matters far less than the fact that a connection exists at all: the key living somewhere other than the firewall that uses it.",
  },
  {
    strong: 'Independently certified, not just marketed as secure.',
    text: "The relevant benchmark here is FIPS 140, a US government cryptographic-hardware standard with multiple certification levels. It isn't one vendor's claim about its own product, it's a third party actually testing the physical device and publishing the result, the same kind of vendor-neutral credibility NIST's Zero Trust standard carries later in this course.",
  },
];
```

**Card `#master-key` — "Master key encryption, the software-side equivalent"**

> intro: "Not every deployment justifies a standalone HSM for every key. For keys stored directly on the
> firewall, encrypting all of them at rest under one master key is the baseline most vendors fall back to."

```tsx
const MASTER_KEY_POINTS = [
  {
    strong: 'How it works.',
    text: 'Every private key stored on the firewall, the Forward Trust CA key, every server key imported for inbound inspection, gets wrapped in encryption under one master key. Without that master key decrypted first, none of the keys underneath it are usable.',
  },
  {
    strong: 'Local vs. HSM-protected master key.',
    text: "A local master key is the simplest option: it lives on the same box as everything it protects, which means stealing the device can be enough on its own. An HSM-protected master key is the stronger version of the same idea: the master key itself only unlocks through a request to the HSM, so a stolen device without that HSM connection is just an encrypted box with nothing usable inside it.",
  },
  {
    strong: "Layered, not either/or.",
    text: "An HSM and master-key encryption aren't competing choices. Master-key encryption protects everything stored on the box, as a baseline. An HSM is the extra step for the smaller set of especially sensitive keys that justify it. Most real deployments run both at once.",
  },
];
```

**Card `#practices` — "Other standing practices"**

```tsx
const STANDING_PRACTICES = [
  {
    strong: 'Subordinate, never root.',
    text: "Chapter 6's first deployment step says to generate or import a CA certificate, but never says why it should be an intermediate rather than the organization's actual root. Here's why: a root CA's job is being trusted by every device, rarely touched, rarely at risk. Handing a root's own key to a firewall to sign fake certificates on the fly all day puts that key into constant, active use, the worst possible place for the single most trusted credential an organization has. An intermediate absorbs that risk instead. If it's ever compromised, only that one intermediate has to be revoked and replaced; the root underneath it, and everything else it's ever signed, never has to move.",
  },
  {
    strong: 'Short-lived certificates, for the same reason leaf certificates are shrinking everywhere else.',
    text: "The Certificates reference page already covers why ordinary leaf certificates keep getting shorter-lived: a credential that only lives for weeks instead of years gives a leaked copy a much smaller window to do real damage. The same logic applies to anything this chapter is protecting. Rotating the Forward Trust CA's own certificate, and any server certificate imported for inbound inspection, on a schedule rather than leaving it static for years, is the same tradeoff: less convenient, much smaller blast radius if something goes wrong.",
  },
  {
    strong: 'Access control and audit.',
    text: "Who can actually export a private key, or even view the configuration that references one, should be a short, deliberately small list, and every access, successful or not, worth logging. A key protected by an HSM and encrypted at rest can still be misused by someone with legitimate administrative access to the box asking for it; this is the layer that limits and watches that access specifically.",
  },
  {
    strong: 'Watching for misuse of your own public certificates.',
    text: "Certificate Transparency logs are a public, append-only record of certificates issued for real, publicly-trusted domains. They're not relevant to an internal Forward Trust CA, which is privately trusted and was never meant to be public. They are relevant to the actual public certificates an organization owns, the ones used for a public-facing server under inbound inspection: monitoring CT logs for a certificate issued for your own domain that your organization didn't request is one of the only ways to catch a different CA mis-issuing on your behalf.",
  },
];
```

(Note: the "Watching for misuse" bullet deliberately narrows and corrects the source document's framing — see
**Deliberate scope calls** below.)

**Card `#formfactor` — "Hardware vs. software vs. cloud: the same question, three environments"**

> intro: "Whatever firewall is running, physical appliance, virtual machine, or cloud-hosted instance, it
> needs access to these keys to do its job. The question is always how guarded that access is, and the
> answer looks different in each of these three environments."

```tsx
const FORM_FACTOR_POINTS = [
  {
    strong: 'A physical appliance.',
    text: "Dedicated hardware, often with its own crypto-acceleration built in, and no hypervisor layer sitting underneath it to compromise. The realistic risks are physical ones: someone stealing the device, or getting console access through stolen credentials.",
  },
  {
    strong: 'A virtual machine on a hypervisor.',
    text: "The keys live in a virtual disk and in ordinary memory, which means whoever administers the hypervisor has reach a hardware appliance's administrator never gets: a VM snapshot captures memory, keys included, cloning the VM clones everything in it, and the virtual disk can be inspected directly, bypassing whatever access control the guest OS itself enforces. The real mitigation is the same HSM connection described above, pointed at a network or cloud HSM so the key never actually lives inside the VM at all, plus disabling snapshots for anything running this role.",
  },
  {
    strong: 'A cloud-hosted instance.',
    text: "Runs under a shared-responsibility model: the cloud provider secures the physical hardware and hypervisor, the organization is still responsible for how the keys inside it are managed and accessed. Most major providers offer a dedicated, single-tenant HSM option and a way for the organization to supply and control its own keys rather than relying solely on the provider's own key management. The added considerations are less technical and more organizational: which jurisdiction the data physically sits in, and what a multi-tenant environment means for isolation guarantees.",
  },
  {
    strong: 'The question never actually changes.',
    text: "Regardless of form factor, the firewall must have access to these keys, full stop. What changes is how many other things, and which people, also have a path to that same access, and that's the thing every mitigation above is actually narrowing.",
  },
];
```

**Closing paragraph** (bridge to Chapter 8):

> "Protecting the key the firewall holds is still a possession-and-location question: who can physically or
> administratively reach it. Chapter 8 asks a related but different question: even once the box itself is
> trusted, should trust stop there?"

```tsx
      <p className="text-ink-faint text-[13.5px] mt-4">
        <AutoLink text="Protecting the key the firewall holds is still a possession-and-location question: who can physically or administratively reach it. " />
        <Link to="/chapters/zero-trust" className={TOOL_LINK_CLASS}>Chapter 8</Link>
        <AutoLink text=" asks a related but different question: even once the box itself is trusted, should trust stop there?" />
      </p>
```

---

## B3. Updating Chapter 6's closing paragraph to bridge into the new chapter

**File:** `src/components/chapters/Chapter6ForwardProxy.tsx`

Replace the final `<p>` (currently ending "...Chapter 7 asks what changes once location by itself stops being
enough.") with:

```tsx
      <p className="text-ink-faint text-[13.5px] mt-2">
        <AutoLink text="You've now read through every piece firewalls use to make a decision when trust follows a connection's location: which zone it's in, which policy rule it matches, which certificate gets presented. One thing all of that quietly assumes: that the Forward Trust CA's private key, the one generated in step 1 above, stays exactly as secret as it needs to be. Chapter 7 is about making sure that's actually true." />
      </p>
```

---

## B4. Vocabulary additions for Chapter 7

**File:** `src/data/acronyms.ts` — insert:
```ts
  HSM: 'Hardware Security Module',
  FIPS: 'Federal Information Processing Standards',
```
(Verified: neither key currently exists.)

**File:** `src/data/glossary.ts`, `firewall` category — append (placed near the existing `App-ID`/`SP3`
entries, since these are firewall-platform capabilities in the same vein, not TLS protocol terms):
```ts
    { term: 'HSM (hardware security module)', def: 'A physical, tamper-resistant device that generates, stores, and uses cryptographic keys without ever letting the key itself leave in a usable form. The firewall sends it a "sign this" or "decrypt this" request and gets back only the result.' },
    { term: 'Master key encryption', def: 'Encrypting every private key stored on the firewall under one master key, so none of them are usable without that master key first being unlocked. Can itself be protected locally or by an HSM, and is typically layered with one rather than used instead of one.' },
```

---

# Deliberate scope calls

- **App-ID/User-ID/Content-ID: kept, not dropped.** See §A0 for the full reasoning and the one reinforcement
  (a short disclosure line added to `Sandbox.tsx`). This was the single most consequential open question in
  the brief and is answered with a real recommendation, not a rubber stamp — flagging here so it doesn't read
  as skipped.
- **The Chapter 3 "TLS 1.2 vs 1.3" card deliberately doesn't try to visually animate the sequence.** It's a
  static two-column numbered list, the same register as `Chapter6ForwardProxy.tsx`'s stacked Cards, not a new
  interactive. If the Interaction Designer wants to turn this into something that actually steps through both
  sequences side by side (closer to a true recreation of source doc §5's two diagrams), that's additive to this
  plan's content, not a replacement for it — see Coordination note.
- **The Chapter 4 stolen-key grid is new visual territory for this site** (no existing table-like primitive).
  Content and structure are the deliverable; exact Tailwind styling should be sanity-checked against the live
  design system before shipping rather than copied verbatim from this doc.
- **Certificate Transparency is narrowed from the source document's framing, on purpose.** Source doc §8 lists
  "Monitor CT logs for unauthorized certificates" as a way to protect the Forward Trust CA specifically. That's
  not accurate: Certificate Transparency only covers publicly-trusted certificates submitted to public CT
  logs, and a privately-trusted internal Forward Trust CA used purely for interception is never enrolled in
  CT at all. This plan's "Watching for misuse" bullet (§B2, `STANDING_PRACTICES`) corrects this: CT monitoring
  is framed as protecting the organization's own *public* certificates (the ones in front of inbound
  inspection) against mis-issuance by any CA, not as a Forward Trust CA safeguard. Flagging this explicitly
  since it's a real correction to the source material, not a simplification.
- **"Subordinate CA" is written as "intermediate" throughout the new chapter**, matching the vocabulary the
  Certificates reference page (`CERT_LIFECYCLE_SECTIONS`/`CERT_CHAIN_SECTIONS` in `certificates.ts`, added by
  the phase-1 and phase-4 plans) already established for root/intermediate/leaf, rather than introducing
  "subordinate" as a second, near-duplicate term for the same thing. The source document uses "subordinate"
  throughout; this plan treats that as PANW house style being stripped along with the rest of the
  vendor-specific framing, not a concept the site needs a second name for.
- **PANW-specific material fully dropped, as instructed**: model numbers (PA-3200/5400/7000/etc.), Thales
  Luna/Entrust nShield/AWS CloudHSM by name, Prisma Access/CN-Series/VM-Series naming, the "12 certificates
  per decryption rule" and "TAP mode not supported" PAN-OS specifics from source doc §11, and the Zscaler
  "weekly rotation" detail. None of this appears anywhere in this plan's draft prose.
- **Source doc §11 (PANW decryption configuration summary) isn't merged in anywhere.** It's entirely
  implementation-specific to one product's configuration UI (Decryption Policy objects, Decryption Profiles,
  interface-mode requirements) with nothing vendor-neutral left once the product specifics are stripped out.
  Chapter 5 already covers the vendor-neutral version of "what a decryption policy actually does" via its
  existing `ACTIONS`/`FLOW`/`PolicyEvaluator` content; there's nothing left in §11 worth adding on top of that.
- **No `data/*.ts` file for the new Chapter 7.** Flagged explicitly in §B1 in case the Interaction Designer's
  plan calls for one (e.g., if an HSM-request/response or hardware/software/cloud toggle gets built, it would
  likely want its own data module the same way `handshakeSteps.ts`/`cipherSuite.ts` back their chapters).
- **The new chapter's route slug is `/chapters/key-protection`**, not `/chapters/key-security` or
  `/chapters/hsm`. Chosen to read as a clear sibling of `/chapters/key-exchange` (same first word, parallel
  structure, Chapter 4 → Chapter 7 callback is intentional) rather than for any other reason. Easy to rename if
  the owner prefers different wording — it's a one-line change in `routeMeta.ts` and the corresponding key in
  `routes.tsx`'s `ELEMENTS` map, nothing else references the literal path string.

---

# Coordination note (for the parallel Simulation/Interaction Designer agent)

This plan is prose, data, and placement only — it does not design new interactive mechanics, and in a few
places it explicitly says where one would help without specifying how:

1. **Chapter 3, `inbound` scenario (§A1, Gap #1 fix).** The new two-step split ("Two different paths from
   here" / "Becoming an active participant") currently asks the reader to read both the static-RSA and
   ECDHE explanations back to back, in one linear pass through the stepper, the same way every other step in
   this scenario works today. A toggle mirroring the existing ECH toggle on the `passthrough` scenario (an
   `echBody`-style alternate-text field, keyed off a new "cipher suite: static RSA / ECDHE" toggle scoped to
   `inbound` the way ECH is scoped to `passthrough`) would let a reader pick one path and skip the other, or
   see the position-dot visually diverge into two legs the way `forwardproxy` already does. This plan's two
   new steps are written to work correctly with or without that toggle — if you build it, the body text may
   need light re-splitting across the toggle's two states rather than reading as one continuous two-path
   paragraph.
2. **Chapter 4's stolen-key Past/Future × With-PFS/Without-PFS matrix (§A2, Gap #2 fix).** Currently a static
   2×2 grid. A click-to-reveal or toggle-driven version (e.g., "simulate a key theft" that visually ages a
   past session into "safe" while a new connection attempt turns red) would dramatize the same point the
   static grid currently just states. The content and the four cell outcomes in this plan are the ground
   truth either way.
3. **Chapter 7's hardware/software/cloud comparison (§B2, `#formfactor` Card).** This plan renders it as four
   prose bullets. A three-column toggle or comparison view (physical / VM / cloud), similar in spirit to
   `SessionTrackingViz`'s two-column reactive comparison, is a natural fit if you're looking for a new
   interactive to anchor this chapter — this chapter currently has zero interactives in this plan, unlike
   every other course chapter, which is a reasonable gap for you to fill rather than this plan inventing a
   mechanic outside its scope.
4. **If your plan proposes anything that conflicts with the exact JSX/data structures specified in this
   doc** (for instance, a different number or order of steps in the `inbound` scenario, or a different Card
   layout for Chapter 7), the project owner needs to reconcile the two before an Implementer executes either
   one — this plan's content is written to stand on its own if no interactive is added on top, so nothing
   here is wasted if your plan supersedes a specific placement choice, but the two should not be applied
   verbatim in parallel without that reconciliation, the same caution the phase-1 and phase-4 plans flagged for
   their own overlapping areas.
5. **This plan does not touch `CertificateFieldDecoder.tsx`, `VerificationWalkthrough.tsx`, or anything under
   `components/reference/`.** If your material for this phase touches the Certificates page (e.g., because
   Chapter 7's "short-lived certificates" bullet above cross-references it), that page's content was already
   extended by the phase-1 and phase-4 plans and isn't re-opened here.
