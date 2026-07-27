**Implementation status (added by the Implementer agent, 2026-07-24): all three file changes in §3 (`acronyms.ts`, `glossary.ts`, `Chapter3Handshake.tsx`) are ✅ implemented exactly as specified. The project owner also resolved the §8 coordination note before implementation: the Simulation/Interaction Designer's ECH toggle DOES ship, integrated into the existing `HandshakeStepper`/`passthrough` scenario per `simulation-design.md` §1.4's recommendation, as a separate, complementary addition alongside this doc's new Card — not instead of it. See `simulation-design.md`'s own status block for that implementation's detail.**

# Content plan: research-ideas.md #1 → Chapter 3 (Encrypted Client Hello)

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).
Scope: research-ideas.md candidate **#1** ("Encrypted Client Hello (ECH) — TLS's next privacy layer"), landed
as a closing beat inside Chapter 3 (`src/components/chapters/Chapter3Handshake.tsx`).

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

A parallel Simulation/Interaction Designer agent is working the same topic area and may propose an interactive
treatment. See **§8 Coordination note** before implementing — this plan is written to slot in whether or not an
interactive ships alongside it, and names the placement an interactive would logically take if one is added.

---

## 1. Why Chapter 3, and why this is the right hook

Chapter 3's `passthrough` (no-decryption) scenario already teaches the exact fact ECH exists to change.
`src/data/handshakeSteps.ts`, `passthrough.steps[1].body` (current text, already shipped from a prior pass):

> "Client and server negotiate TLS. In TLS 1.2 the real server certificate is visible on the wire at this
> point; in TLS 1.3 (the common case today) it's encrypted, though the destination is still visible from the
> ClientHello's SNI field. Either way, the firewall watches this happen without being a party to it."

A reader who just stepped through that scenario has been told, explicitly, that TLS 1.3 already encrypts the
certificate but the destination hostname (SNI) still leaks in cleartext. That's the exact premise ECH exists to
close. Nothing else on the site sets this up as cleanly — this is genuinely the single best-prepared "what
changes next" moment on the site, which matches how research-ideas.md #1 itself frames the pitch ("it also
gives a concrete, current answer to 'so is TLS 1.3 the end of the story?'").

## 2. Placement decision (and why)

**Decision: a new `Card`, placed last — after the existing "A man-in-the-middle, on purpose" card, as the final
element in Chapter 3 — followed by a short closing bridge paragraph into Chapter 4, matching the site's
established end-of-chapter bridge convention.**

Reasoning:

- **Not before the MITM card, and not between "Three lenses" and MITM.** The MITM card's subject is
  certificate-trust legitimacy in forward proxy specifically ("Your organization deliberately installs the
  firewall's CA into your device's trust store..."). ECH doesn't extend that argument, it complicates it (see
  §4, point 3 below) — inserting it mid-chapter would break the MITM card's own internal argument, which needs
  to land fully before a reader is handed a new wrinkle. Closing beat means closing position.
- **Confirmed via `Chapter3Handshake.tsx`: nothing currently follows the MITM card.** The chapter's JSX ends
  right after `</Card>` for MITM, with no closing bridge paragraph into Chapter 4 at all today (Chapter 4 has a
  soft opening callback — "the 'key exchange' step you just watched" — but Chapter 3 has no matching close).
  This is an existing, unfilled gap. The new ECH card's closing paragraph fills it, so this change both adds
  the requested content *and* fixes a pre-existing missing bridge, without that being a separate ask.
- **Matches the site's own stated framing for this exact candidate.** research-ideas.md #1 explicitly proposes
  "a 'what changes next' closing beat," and the assignment scoping this work names "end of chapter as a bridge
  to Chapter 4" as one of the placement options under consideration. End-of-chapter is the option this plan
  selects.
- **Structural precedent:** this is the same shape as the existing "Three lenses" and "MITM" cards — a
  `<h3>` heading, an intro `<p>`, a bulleted list of `{ strong, text }` objects rendered through `AutoLink`, all
  inside one `<Card>` — plus a closing `<p className="text-ink-faint text-[13.5px] mt-4">` bridge, which is the
  exact class string already used for the Ch1→Ch2, Ch4→Ch5, and Ch6→Sandbox closing bridges (confirmed via
  `grep` across `src/components/chapters/*.tsx`). No new visual idiom.

## 3. Files to touch

1. `src/components/chapters/Chapter3Handshake.tsx` — add a new `ECH_POINTS` array (same file-local pattern as
   the existing `PIPELINE_POINTS`/`MITM_POINTS`, **not** a new data file — see the note in §4 on why this stays
   consistent with the file's own established convention rather than `CLAUDE.md`'s general data-file guidance),
   plus a new `<Card>` and a closing bridge `<p>`.
2. `src/data/acronyms.ts` — add three new entries: `SNI`, `ECH`, `DNS`.
3. `src/data/glossary.ts` — add three new entries to the existing `tls` category.

No other file needs to change. `src/data/handshakeSteps.ts` and `HandshakeStepper.tsx` are **not** touched by
this plan — see §8 on why the stepper itself is left to the parallel Interaction Designer's judgment.

---

✅ **Implemented.** `ECH_POINTS` array added directly below `MITM_POINTS`, and the new `Card` plus closing
bridge paragraph added directly after the MITM `<Card>`, both exactly as specified below.

## 4. Exact change: `src/components/chapters/Chapter3Handshake.tsx`

### 4a. New data array

Add this after the existing `MITM_POINTS` array (i.e. directly below it, before the `export function
Chapter3Handshake()` line):

```tsx
const ECH_POINTS = [
  {
    strong: 'What it actually does.',
    text: "The client folds two ClientHellos into one message: an outer one, generic and unencrypted, carrying a placeholder name instead of the real destination, and an inner one, carrying the real SNI and the rest of the real handshake, encrypted with a public key the destination already published in DNS ahead of time. Only the server holding that key can unwrap the inner hello, everyone else on the wire, including a passively-watching firewall, sees only the outer one.",
  },
  {
    strong: 'Passthrough loses its one crumb of visibility.',
    text: "This chapter's no-decryption scenario was quietly leaning on that one visible field, SNI, to make any destination-aware decision at all without decrypting anything. Once ECH is in play on a connection, that field is gone, and the same category-based policy rules from Chapter 5 that assumed they could read a destination before deciding whether to decrypt lose the input they were reading.",
  },
  {
    strong: "Forward proxy doesn't get a pass either.",
    text: "It's tempting to assume forward proxy sidesteps this since it already terminates the real handshake, but the trust that lets it do that, the client accepting a forged certificate because the firewall's CA is installed ahead of time, doesn't extend to ECH. The key protecting the inner ClientHello belongs to the real destination, published through DNS, not anything a locally-installed CA touches. A firewall can't forge its way past that the way it forges past certificate trust, so the practical answer today is the same lever already used to install that CA in the first place: push a policy disabling ECH on managed devices via GPO or MDM, from Chapter 6, rather than trying to intercept it.",
  },
  {
    strong: 'Inbound inspection barely notices.',
    text: "It was never reading SNI to begin with, it already holds the server's own private key and decrypts a copy directly, regardless of what an outside client reveals about its destination on the way in.",
  },
  {
    strong: 'Where it stands today.',
    text: "ECH's core specification only recently finished years of draft status, and it's already active in some major browsers and rolled out by some large content platforms. Not everywhere yet, but live production traffic, not a future hypothetical.",
  },
];
```

Formatting notes, matching the file's own existing convention (not `certificates.ts`'s `CertPoint` convention,
which uses colon-terminated labels — this file uses period-terminated short declarative labels, e.g.
`'Trust.'`, `'No trust, for an attacker.'` in `MITM_POINTS`):
- `strong` labels are short, period-terminated declarative phrases.
- No manual acronym spell-outs inside `text` beyond the one intentional exception noted in §4b (the site's
  established convention, per `Chapter6ForwardProxy.tsx`'s `"GPO or MDM"` and `Chapter4KeyExchange.tsx`'s
  `"ECDHE or DHE"`, is to use the bare acronym and let `AutoLink` supply the tooltip, not spell out the full name
  in running prose).
- Every acronym used here — `SNI`, `ECH`, `DNS`, `CA`, `GPO`, `MDM` — must exist in `ACRONYMS`
  (`src/data/acronyms.ts`) before this renders correctly. `CA`, `GPO`, `MDM` already exist. `SNI`, `ECH`, `DNS`
  do not yet — added in §5 below. **Do not merge §4 without §5**, or `SNI`/`ECH`/`DNS` will render as plain,
  un-tooltipped text, silently breaking the site's own stated architecture convention (`CLAUDE.md`: "Any body
  copy that might contain a known acronym should be rendered via `<AutoLink text={...} />`").
- No word-boundary collision risk: `AutoLink`'s regex (`src/lib/autoLink.tsx`) is case-sensitive with `\b`
  boundaries, so `ECH` cannot accidentally match inside lowercase words like "each," and `SNI`/`DNS` have no
  existing lowercase collisions either.
- **Why a file-local array instead of a new `src/data/*.ts` file:** `CLAUDE.md`'s general guidance is "content
  lives in `data/*.ts`," but this exact file already departs from that for its two existing point lists
  (`PIPELINE_POINTS`, `MITM_POINTS` are both defined directly in `Chapter3Handshake.tsx`, not in
  `handshakeSteps.ts` or a new file). `ECH_POINTS` matches that established in-file precedent rather than
  introducing a third, inconsistent pattern. If a future refactor ever moves `PIPELINE_POINTS`/`MITM_POINTS`
  into a data file, `ECH_POINTS` should move with them, but that's out of scope here.

### 4b. New JSX

Insert immediately after the existing MITM `<Card>...</Card>` block (i.e. directly below its closing `</Card>`
tag) and before the section's closing `</section>` tag:

```tsx
      <Card className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">What changes next: Encrypted Client Hello</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="One piece of the handshake was never covered by any of this: the SNI field in the very first message, ClientHello, where the client states which hostname it's trying to reach, sent in the clear even under TLS 1.3, the version this chapter otherwise treats as the modern default. Encrypted Client Hello (ECH) is the extension that closes that last gap, and it changes what each of this chapter's three scenarios actually gets to see." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {ECH_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-ink-faint text-[13.5px] mt-4">
        <AutoLink text="The public key that makes ECH's encryption possible has to come from somewhere the two sides agreed on ahead of time, without ever exchanging it directly on this connection. That's the same asymmetric-key idea Chapter 4 covers next, and in most real ECH deployments today, it runs on X25519, the same curve Chapter 4 names as one of the two in common use." />
      </p>
```

Notes:
- `key={p.strong}` matches the existing `PIPELINE_POINTS.map` / `MITM_POINTS.map` pattern in this same file
  (both key off `p.strong`) — safe here too since all five `ECH_POINTS` labels are unique.
- The closing bridge paragraph's claim ("most real ECH deployments today... runs on X25519") is accurate and
  specific: ECH's encryption layer (HPKE) most commonly uses an X25519-based key encapsulation mechanism in
  practice, and `Chapter4KeyExchange.tsx` already names X25519 explicitly ("Common groups in use today:
  **X25519** and **secp256r1**"), so this is a genuine, checkable connection to the very next chapter's content,
  not a forced transition. If greater hedging is wanted, `"in most real ECH deployments today"` can be tightened
  further, but it should not be dropped to an unqualified "ECH uses X25519" (other KEMs are possible under the
  spec, X25519 is simply the dominant deployed choice).
- This paragraph is the chapter's only Chapter 3 → Chapter 4 bridge; no changes to `Chapter4KeyExchange.tsx`
  are needed or proposed, since Chapter 4's existing opening line ("Two things were doing the real work during
  the 'key exchange' step you just watched...") already reads naturally as the receiving end of this bridge
  without modification.

### 4c. Resulting order inside `<section id="ch3">` after this change

1. `SectionHead` (unchanged)
2. `HandshakeStepper` (unchanged)
3. "Three lenses the firewall applies" `Card` (unchanged)
4. "A man-in-the-middle, on purpose" `Card` (unchanged)
5. **New:** "What changes next: Encrypted Client Hello" `Card`
6. **New:** closing bridge paragraph into Chapter 4

---

✅ **Implemented.** Three lines added after the `SSL` line and before `CA`, exactly as specified.

## 5. Exact change: `src/data/acronyms.ts`

Insert these three lines immediately after the `SSL: 'Secure Sockets Layer',` line and before `CA: 'Certificate
Authority',` — keeping the handshake-protocol cluster (`TCP`, `HTTPS`, `HTTP`, `TLS`, `SSL`, then these three)
contiguous and separate from the certificate-lifecycle cluster (`CA`, `SAN`, `ACME`, `OCSP`, `CRL`) that already
follows it. Purely cosmetic grouping — the dictionary is a flat object and order has no functional effect on
`AutoLink` — but it keeps related terms visually clustered for future editors, matching how the certificate
lifecycle terms were grouped together in the prior integration pass.

```ts
  SNI: 'Server Name Indication',
  ECH: 'Encrypted Client Hello',
  DNS: 'Domain Name System',
```

Verified none of these three keys currently exist in `ACRONYMS` (full file read before writing this plan — the
existing 25 entries run `TCP` through `Content-ID`, none of them `SNI`, `ECH`, or `DNS`). This is also, notably,
a pre-existing gap fix: `SNI` is already used in body copy today (`handshakeSteps.ts`,
`passthrough.steps[1].body`, quoted in §1 above) and has been rendering with no tooltip this whole time because
the acronym was never added when that sentence was written. This plan closes that gap as a side effect.

---

✅ **Implemented.** Three entries added to the end of the `tls` array, exactly as specified.

## 6. Exact change: `src/data/glossary.ts`

Add three new entries to the end of the existing `tls` array (after the `'Revocation'` entry added in the
prior integration pass, before the array's closing `],`):

```ts
    { term: 'SNI (server name indication)', def: "The field in ClientHello where a client states which hostname it's trying to reach, sent in the clear even when the rest of the handshake is encrypted. How a server hosting multiple sites behind one address knows which certificate to present, and how a passively-watching firewall can normally tell which destination traffic is headed to." },
    { term: 'ECH (encrypted client hello)', def: 'A TLS extension that encrypts SNI and the rest of the real ClientHello, using a public key the destination already published in DNS ahead of time, so anyone just watching the wire sees only a generic placeholder hello instead of the real one.' },
    { term: 'DNS (domain name system)', def: "The system that turns a hostname like example.com into the IP address a client actually connects to. Also where a server can publish extra configuration for clients to fetch ahead of time, like the public key ECH depends on." },
```

Style note: matches the existing `'SAN (subject alternative name)'` / `'OCSP (online certificate status
protocol)'` pattern (acronym first, lowercase expansion in parens) — the form actually used in this new running
prose, same rationale the prior integration pass used for its own additions.

Verified against a full read of `glossary.ts`: none of `SNI`, `ECH`, or `DNS` exist anywhere in any of the
three categories (`firewall`, `tls`, `vpn`) today.

---

## 7. Full draft prose (final copy, for reference — identical to what's embedded in §4's code)

**Card heading:** What changes next: Encrypted Client Hello

**Intro paragraph:**

> One piece of the handshake was never covered by any of this: the SNI field in the very first message, ClientHello, where the client states which hostname it's trying to reach, sent in the clear even under TLS 1.3, the version this chapter otherwise treats as the modern default. Encrypted Client Hello (ECH) is the extension that closes that last gap, and it changes what each of this chapter's three scenarios actually gets to see.

**Points:**

- **What it actually does.** The client folds two ClientHellos into one message: an outer one, generic and unencrypted, carrying a placeholder name instead of the real destination, and an inner one, carrying the real SNI and the rest of the real handshake, encrypted with a public key the destination already published in DNS ahead of time. Only the server holding that key can unwrap the inner hello, everyone else on the wire, including a passively-watching firewall, sees only the outer one.
- **Passthrough loses its one crumb of visibility.** This chapter's no-decryption scenario was quietly leaning on that one visible field, SNI, to make any destination-aware decision at all without decrypting anything. Once ECH is in play on a connection, that field is gone, and the same category-based policy rules from Chapter 5 that assumed they could read a destination before deciding whether to decrypt lose the input they were reading.
- **Forward proxy doesn't get a pass either.** It's tempting to assume forward proxy sidesteps this since it already terminates the real handshake, but the trust that lets it do that, the client accepting a forged certificate because the firewall's CA is installed ahead of time, doesn't extend to ECH. The key protecting the inner ClientHello belongs to the real destination, published through DNS, not anything a locally-installed CA touches. A firewall can't forge its way past that the way it forges past certificate trust, so the practical answer today is the same lever already used to install that CA in the first place: push a policy disabling ECH on managed devices via GPO or MDM, from Chapter 6, rather than trying to intercept it.
- **Inbound inspection barely notices.** It was never reading SNI to begin with, it already holds the server's own private key and decrypts a copy directly, regardless of what an outside client reveals about its destination on the way in.
- **Where it stands today.** ECH's core specification only recently finished years of draft status, and it's already active in some major browsers and rolled out by some large content platforms. Not everywhere yet, but live production traffic, not a future hypothetical.

**Closing bridge paragraph (into Chapter 4):**

> The public key that makes ECH's encryption possible has to come from somewhere the two sides agreed on ahead of time, without ever exchanging it directly on this connection. That's the same asymmetric-key idea Chapter 4 covers next, and in most real ECH deployments today, it runs on X25519, the same curve Chapter 4 names as one of the two in common use.

---

✅ **Resolved by the project owner (2026-07-24): both ship.** The project owner reviewed this plan alongside
`simulation-design.md` and confirmed the two are complementary, not alternatives — this doc's prose `Card` plus
closing bridge, and the Designer's ECH toggle integrated into the existing `HandshakeStepper`/`passthrough`
scenario (§1.4 of that doc), both shipped. The toggle sits inside `HandshakeStepper` itself (above this chapter's
new `Card`, per the component's existing position in the chapter), not "directly below the new Card" as this
section's smaller-option sketch below speculated — that placement note predates the Designer's own doc and is
superseded by it.

## 8. Coordination note (Simulation/Interaction Designer)

`docs/integration/phase-2a-ech/` contained no other files when this plan was written — the parallel
Interaction Designer's output doesn't exist yet, or wasn't visible to this agent. This plan does **not** assume
whether an interactive ships alongside this content. Both of the following are true regardless of what the
Designer proposes:

- **This plan's content stands on its own.** If no interactive is added, the new `Card` plus closing bridge
  paragraph in §4 is complete, self-contained content requiring no other component.
- **This plan leaves room for one, and names where it would go.** If the Designer proposes a small,
  self-contained interactive specific to ECH (for example: a toggle showing "what the firewall sees" with ECH
  off vs. on — the outer ClientHello's placeholder name next to the real one it's hiding), the natural slot is
  **directly below the new "What changes next" `Card` and above the closing bridge paragraph**, matching the
  placement pattern `PolicyEvaluator` already uses in `Chapter5DecryptionPolicies.tsx` (static cards first, a
  small interactive as the last hands-on payoff before the chapter moves on). It should sit *after* the prose
  card, not before it or interleaved with `ECH_POINTS`, since the prose establishes the outer/inner split (point
  1) that any such visual would depend on the reader already having read.
- **A larger-lift option exists but is explicitly not this plan's call:** extending `HandshakeStepper` /
  `SCENARIOS` (`handshakeSteps.ts`) with a fourth mode, or an ECH on/off toggle inside the existing `passthrough`
  mode, would let a reader step through an ECH-enabled handshake the same way they already step through the
  three existing scenarios. That's a real feature addition (data + component work, and a decision about whether
  a 4th toggle option changes the stepper's established three-mode rhythm), squarely the Interaction Designer's
  and/or project owner's call to make, not something this content-only plan decides unilaterally. Flagging it
  here only so it's visible, not recommending it over the smaller option above.

**This agent's opinion, offered only as a flag, not a decision:** the smaller, card-adjacent interactive
(outer-vs-inner ClientHello toggle) is probably the better-scoped option for this phase — it's a small, honest
payoff for content that's inherently about "what becomes visible vs. invisible," without taking on the larger
question of whether the stepper's three-scenario structure should become four. But this is the parallel
Designer's evaluation to make, not this plan's.

---

## 9. Deliberate scope calls made in this plan (flagging so nothing reads as an oversight)

- **HPKE is never named.** The actual cryptographic mechanism ECH uses is HPKE (Hybrid Public Key Encryption,
  RFC 9180). This plan deliberately describes its effect ("encrypted with a public key the destination already
  published in DNS ahead of time") without naming HPKE or introducing it as a fourth new acronym, matching the
  site's existing restraint elsewhere (e.g. Chapter 4 names `ECDHE`/`DHE`/`X25519` concretely but doesn't walk
  through elliptic-curve math). If deeper protocol fidelity is wanted later, HPKE can be added as a glossary
  term without touching this plan's Chapter 3 prose.
- **No specific browser or CDN is named** in the "Where it stands today" point, deliberately, matching the
  established pattern from the certificate-lifecycle content plan (`phase-1-certificates/content-plan.md` §8)
  of not naming a specific vendor/organization unless it's load-bearing for the point being made, and avoiding
  a claim that goes stale the moment one product's support status changes.
- **The DNS mechanism (HTTPS/SVCB resource records) is simplified to "published in DNS."** A fully precise
  description would name the specific DNS record type ECH configuration is published under. This plan treats
  that as one layer of detail deeper than a beginner-facing site needs, consistent with the site's existing
  register (e.g. Chapter 3 already treats "the firewall was given the server's private key ahead of time"
  without describing PKCS#12/PEM file mechanics). The new `DNS` glossary entry (§6) is written generically
  enough to remain accurate without needing that detail either.
- **`handshakeSteps.ts`'s `passthrough.note` and `passthrough.steps` are not modified.** They already say
  everything this plan's Chapter 3 hook needs (quoted in §1). Editing them was considered and rejected —
  they're accurate as written and don't need an ECH mention inserted into the stepper's existing steps for this
  plan's card to make sense; the card explicitly references "this chapter's no-decryption scenario" as a
  callback instead, avoiding a scope creep into the stepper mechanics that §8 explicitly reserves for the
  Interaction Designer's judgment.

---

## 10. Order of implementation (for the Implementer)

1. `src/data/acronyms.ts` — add the three entries (§5).
2. `src/data/glossary.ts` — add the three entries (§6).
3. `src/components/chapters/Chapter3Handshake.tsx` — add `ECH_POINTS` (§4a), then the new `Card` and closing
   bridge paragraph (§4b).
4. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
5. Visual check in `npm run dev`: confirm the new card renders as the last element in Chapter 3, after the MITM
   card; confirm the closing bridge paragraph renders below it; confirm hovering `SNI`, `ECH`, `DNS`, `CA`,
   `GPO`, and `MDM` anywhere in the new copy shows the correct tooltip; confirm nothing in the existing
   `HandshakeStepper`, "Three lenses" card, or MITM card changed.
