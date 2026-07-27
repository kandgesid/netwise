**Implementation status (added by the Implementer agent, 2026-07-24): all three file changes in this plan
(`acronyms.ts`, `glossary.ts`, `Chapter4KeyExchange.tsx`) are ✅ implemented exactly as specified, with one
wording resolution from the project owner: this plan's §4 `ML-KEM` hyphenation (`'Module-Lattice-Based Key
Encapsulation Mechanism'`) was designated authoritative over `simulation-design.md`'s slightly different
hyphenation, and that exact string is what shipped. The project owner also resolved the §7 coordination note:
the Simulation/Interaction Designer's classical/hybrid toggle DOES ship, integrated into the existing
`CipherDecoder` scoped to chip 0 only, per `simulation-design.md` §1.5's recommendation, as a separate,
complementary addition alongside this doc's new Card, not instead of it. See `simulation-design.md`'s own
status block for that implementation's detail. Two additional owner-directed items also shipped while touching
these files: a one-sentence forward-pointer added to the "Key exchange groups" Card's "Common groups in use
today" bullet (see `simulation-design.md` §5), and an `AutoLink` wrap fix applied to `CipherDecoder`'s
pre-existing explainer panel (see `simulation-design.md` §5).**

# Content plan: research-ideas.md #2 → Chapter 4 (post-quantum hybrid key exchange)

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).
Scope: research-ideas.md candidate **#2** ("Post-quantum key exchange (hybrid ML-KEM)"), landed as a new
closing-beat `Card` inside Chapter 4 (`src/components/chapters/Chapter4KeyExchange.tsx`).

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

A parallel Simulation/Interaction Designer agent is working the same topic area and may propose an interactive
treatment — research-ideas.md #2 explicitly points at `CipherDecoder` as a plausible reuse target ("the site
already has a UI pattern... built for exactly this kind of 'decode the parts of a negotiated suite' teaching
moment"). See **§7 Coordination note** before implementing. This plan does not decide whether an interactive
ships; it names where one would slot in if the Designer proposes one, and states this agent's opinion only as a
flag, per the process correction from Phase 1.

---

## 1. Why Chapter 4, and why this placement inside it

Chapter 4 already teaches exactly the two things post-quantum hybrid key exchange extends:

- The **"Key exchange groups"** `Card` (`Chapter4KeyExchange.tsx` lines 23–45) names `ECDHE`/`DHE`, explains
  forward secrecy, and names the two concrete groups in use today: `X25519` and `secp256r1`. Hybrid key
  exchange is a new option in that exact same "which group" slot — not a new concept, a new answer to a
  question the chapter has already posed.
- The chapter's own stakes paragraph (lines 15–21, added in a prior integration pass) already primes the
  reader on *why* ephemeral exchange matters against a delayed attacker: *"picture... an attacker who's been
  quietly recording your encrypted traffic for later. If [they] get[] hold of the server's long-term private
  key down the line, ephemeral exchange means it still buys them nothing..."* A reader who just read that
  sentence has been set up perfectly for the one genuine complication post-quantum key exchange introduces:
  forward secrecy defends against a *stolen key*, not against the underlying *math being broken outright* — a
  quantum computer capable of solving that math doesn't need a stolen key at all, a recorded handshake's public
  values are enough on their own. This plan's new content makes that distinction explicit (§3, `PQ_POINTS[0]`)
  rather than leaving the chapter's existing forward-secrecy framing looking like it already covers this threat
  when it doesn't.

**Decision: a new `Card`, placed last in the chapter — after `<CipherDecoder />` and before the existing
closing bridge paragraph into Chapter 5.**

Reasoning:

- **Not between "Key exchange groups" and `CipherDecoder`.** `CipherDecoder`'s own `ECDHE` chip
  (`cipherSuite.ts` line 8) explicitly says *"This is the ephemeral elliptic-curve exchange from earlier in
  this chapter"* — a callback to the "Key exchange groups" `Card`. Inserting new content between that `Card`
  and `CipherDecoder` would put a paragraph about quantum computers and hybrid negotiation directly in the path
  of that callback, and would force the reader to context-switch from "classical groups, plain" to
  "here's what breaks them" and back to "now decode a classical, non-hybrid suite string" in three consecutive
  beats. Closing-beat placement avoids that whiplash entirely.
- **After `CipherDecoder`, not replacing anything in it.** `CipherDecoder`'s own intro paragraph already
  distinguishes TLS 1.2-style four-part naming from TLS 1.3's separately-negotiated pieces (`CipherDecoder.tsx`
  lines 12–20) — the new `Card`'s closing point (§3, `PQ_POINTS[4]`) leans on that exact distinction ("TLS
  already negotiates the key exchange group as one named value, separate from the rest of the cipher suite")
  rather than re-explaining it, so `CipherDecoder` needs to have already been read for that point to land
  cleanly.
- **Before the existing closing paragraph, not after it.** `Chapter4KeyExchange.tsx`'s existing final `<p>`
  (lines 49–53) — *"All of this, key exchange, authentication, encryption, integrity, only happens because
  something told the firewall to decrypt this traffic in the first place. That instruction is next: decryption
  policy."* — is Chapter 4's bridge into Chapter 5, added in a prior integration pass specifically to fix a
  missing-bridge finding. It names the chapter's four pillars generically (not "the four things you just
  clicked") and stays accurate as the chapter's true final line regardless of what's added above it. No edit
  to this paragraph is needed or proposed — inserting the new `Card` directly above it, unchanged, is the
  complete fix.
- **Matches the freshest structural precedent on the site.** `Chapter3Handshake.tsx`'s own most recent
  addition (`ECH_POINTS`, from the phase-2a integration pass) is a `Card` titled `"What changes next: Encrypted
  Client Hello"`, placed last in its chapter, built from a local `{ strong, text }[]` array rendered as
  `<strong>{p.strong}</strong> <AutoLink text={p.text} />` inside a `<ul>`. This plan reuses that exact shape
  (§3) rather than either of Chapter 4's older, less-reusable patterns (the hand-typed inline-`<strong>`
  bullets in "Key exchange groups," or `CipherDecoder`'s click-through chips) — see the note in §3 on why.

## 2. Files to touch

1. `src/components/chapters/Chapter4KeyExchange.tsx` — add a new `PQ_POINTS` array (same file-local pattern as
   `Chapter3Handshake.tsx`'s `ECH_POINTS`) and a new `<Card>` rendering it, inserted between `<CipherDecoder />`
   and the existing closing `<p>`. No new imports needed — `Card` and `AutoLink` are already imported in this
   file.
2. `src/data/acronyms.ts` — add two new entries: `ML-KEM`, `NIST`.
3. `src/data/glossary.ts` — add three new entries to the existing `tls` category: `ML-KEM`, `Hybrid key
   exchange`, `Harvest now, decrypt later`.

No other file needs to change. `src/data/cipherSuite.ts` and `CipherDecoder.tsx` are **not** touched by this
plan — see §7 on why that's left to the parallel Interaction Designer's judgment. Checked against a full read
of `src/data/glossary.ts` and `src/data/acronyms.ts` before writing this plan — none of `ML-KEM`, `NIST`,
`Hybrid key exchange`, or `Harvest now, decrypt later` currently exist in either file.

✅ **Amended by project-owner resolution (2026-07-24): `src/data/cipherSuite.ts` and `CipherDecoder.tsx` WERE
also touched**, implementing `simulation-design.md`'s toggle. See that doc's own status notes for the exact
changes — this doc's own three files (below) are unaffected by that addition.

---

✅ **Implemented.** `PQ_POINTS` array added directly above `Chapter4KeyExchange()`, and the new Card inserted
directly after `<CipherDecoder />` and before the existing closing bridge `<p>`, exactly as specified below.
One addition beyond this plan's original scope, per project-owner resolution: a one-sentence forward-pointer
was also added to the existing "Key exchange groups" Card's "Common groups in use today" bullet (see
`simulation-design.md` §5's suggested touchpoint) — that edit is not part of this plan's §3a/§3b but landed in
the same file while it was already open.

## 3. Exact change: `src/components/chapters/Chapter4KeyExchange.tsx`

### 3a. New data array

Add this directly above the `export function Chapter4KeyExchange()` line (i.e. as a new top-level const in the
file, same position `ECH_POINTS` occupies relative to `Chapter3Handshake` in its own file):

```tsx
const PQ_POINTS = [
  {
    strong: 'Not the same threat as forward secrecy.',
    text: "Forward secrecy above defends against a stolen key: an attacker who gets the server's long-term private key years later still can't unlock old sessions, because the one-time keys that protected them are already gone. A quantum computer breaking the underlying math is a different failure entirely, no key theft required. A recorded handshake's public values would be enough on their own, whether the key behind them was ephemeral or not.",
  },
  {
    strong: 'Harvest now, decrypt later.',
    text: "None of this makes today's traffic unsafe today. The concern is what happens to traffic that's already been captured and quietly stored, on the bet that whatever's unreadable now stays unreadable forever. If the math protecting it is ever broken, that stored traffic doesn't need to be captured again, it just needs to be decrypted with whatever broke it.",
  },
  {
    strong: "ML-KEM is the industry's answer.",
    text: "Standardized by NIST in 2024 after years of public scrutiny, ML-KEM is a key-establishment algorithm built on a different kind of hard problem, one believed to hold up even against a quantum computer. It works a little differently than the groups above: instead of both sides combining public values into the same secret, one side publishes a public key and the other uses it to wrap a freshly chosen secret and sends the wrapped result back to be unwrapped. Different mechanism, same outcome: both sides end up holding one identical secret neither one ever sent directly.",
  },
  {
    strong: 'The real move is hybrid, not replace.',
    text: "TLS doesn't swap X25519 out for ML-KEM, it negotiates both in the same handshake and combines the two resulting secrets into the one real session key, so the connection stays safe unless both are broken. That's as much a hedge as a quantum defense: ML-KEM hasn't had anywhere near the decades of scrutiny the classical math above has, so pairing it with a proven classical group means an unnoticed flaw in the new algorithm doesn't sink the connection either.",
  },
  {
    strong: 'Where it stands today.',
    text: "TLS already negotiates the key exchange group as one named value, separate from the rest of the cipher suite, and a hybrid group is just a new option on that same list, its name reflecting both halves at once (commonly written as something like X25519MLKEM768). This isn't a future roadmap item either: hybrid key exchange is already the default for a meaningful share of real HTTPS traffic right now, the same quiet way TLS 1.3 itself became the default, an upgrade to what a connection falls back to, not something a typical user or admin switches on by hand.",
  },
];
```

**Implementer note on quoting:** `PQ_POINTS[2].strong` ("ML-KEM is the industry's answer.") and several `text`
fields above use double-quote string delimiters specifically because their content contains a straight
apostrophe (industry'*s*, today'*s*, etc.) — the snippet above already has this right throughout. Keep that
delimiter choice as-is; don't mechanically reformat these to single-quoted strings, which would break on the
embedded apostrophes.

Formatting notes, matching `Chapter3Handshake.tsx`'s `ECH_POINTS` convention exactly (chosen over Chapter 4's
own older "Key exchange groups" `Card`, which hand-writes bullets inline with no array — see §1's last bullet
for why the newer pattern was chosen instead):
- `strong` labels are short, period-terminated declarative phrases, not colon-terminated (that's
  `certificates.ts`'s `CertPoint` convention, not this one).
- `strong` labels are rendered as plain `<strong>` text, **not** passed through `AutoLink` — this matches
  existing precedent exactly: `PIPELINE_POINTS`' labels are literally `'App-ID.'`, `'User-ID.'`,
  `'Content-ID.'` (all three are known acronyms) and are rendered unlinked in `Chapter3Handshake.tsx` today.
  `PQ_POINTS[2].strong` containing "ML-KEM" without a tooltip is the same accepted limitation, not a new
  inconsistency — and `ML-KEM` still gets its tooltip everywhere it appears inside a `text` field, since those
  *are* passed through `AutoLink`.
- Every acronym used here — `TLS`, `ML-KEM`, `NIST` — must exist in `ACRONYMS` (`src/data/acronyms.ts`) before
  this renders correctly. `TLS` already exists. `ML-KEM` and `NIST` do not yet — added in §4 below. **Do not
  merge §3 without §4**, or `ML-KEM`/`NIST` will render as plain, un-tooltipped text.
- No word-boundary collision risk: `AutoLink`'s regex (`src/lib/autoLink.tsx`) is case-sensitive with `\b`
  word boundaries and matches on exact substrings. `ML-KEM` (with its literal hyphen) will not match inside
  `X25519MLKEM768` (no hyphen present in that string), so that example name renders as plain, unlinked text —
  intentional, it's an illustrative literal, not a term needing its own tooltip. `NIST` has no existing
  lowercase or partial-word collision in the site's copy.
- `key={p.strong}` matches `ECH_POINTS.map`'s own key strategy in the same codebase — safe here too since all
  five `PQ_POINTS` labels are unique.

### 3b. New JSX

Insert immediately after the existing `<CipherDecoder />` line and before the closing `<p className="text-ink-faint text-[13.5px] mt-4">` bridge paragraph:

```tsx
      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">What changes next: post-quantum key exchange</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Every group named above, X25519 and secp256r1 included, gets its safety from the same kind of guarantee: a math problem that's hard to reverse today, on any computer that exists. A powerful enough quantum computer would break that guarantee outright, not gradually, and the industry isn't waiting to find out when that happens to start defending against it." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {PQ_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>
```

Notes:
- `className="mb-5"` matches Chapter 4's own local spacing convention (the "Key exchange groups" `Card` above
  it also uses `mb-5`), not Chapter 3's `mb-6` — kept consistent with this file rather than the file the
  pattern's shape was borrowed from.
- No changes needed to `<CipherDecoder />` itself or to the existing closing `<p>` bridge — both render exactly
  as they do today, immediately before and after this new `Card` respectively.

### 3c. Resulting order inside `<section id="ch4">` after this change

1. `SectionHead` (unchanged)
2. Stakes paragraph ("Here's why 'ephemeral' specifically is worth caring about...") (unchanged)
3. "Key exchange groups" `Card` (unchanged)
4. `CipherDecoder` (unchanged)
5. **New:** "What changes next: post-quantum key exchange" `Card`
6. Existing closing bridge paragraph into Chapter 5 (unchanged)

---

✅ **Implemented.** Both entries added exactly as specified (in the same position, ahead of the App-ID/User-ID/
Content-ID cluster). This plan's exact `ML-KEM` wording (`'Module-Lattice-Based Key Encapsulation Mechanism'`)
was designated authoritative by the project owner over `simulation-design.md` §5's slightly different
hyphenation, resolving the one wording conflict between the two docs.

## 4. Exact change: `src/data/acronyms.ts`

Insert these two lines immediately after the `DHE: 'Diffie-Hellman Ephemeral',` line and before `'App-ID':
'Application Identification',` — keeping the crypto-algorithm cluster (`MAC`, `GCM`, `RSA`, `ECDHE`, `DHE`,
then these two) contiguous and ahead of the vendor-branded App-ID/User-ID/Content-ID cluster that already
follows it. Purely cosmetic grouping — the dictionary is a flat object and order has no functional effect on
`AutoLink` — but it keeps related terms visually clustered for future editors, matching the grouping rationale
used in both prior integration passes.

```ts
  'ML-KEM': 'Module-Lattice-Based Key Encapsulation Mechanism',
  NIST: 'National Institute of Standards and Technology',
```

Verified neither key currently exists in `ACRONYMS` (full file read before writing this plan — the existing 28
entries run `TCP` through `Content-ID`, none of them `ML-KEM` or `NIST`).

---

✅ **Implemented.** Three entries added to the end of the `tls` array, exactly as specified.

## 5. Exact change: `src/data/glossary.ts`

Add three new entries to the end of the existing `tls` array (after the `'DNS (domain name system)'` entry
added in the prior integration pass, before the array's closing `],`):

```ts
    { term: 'ML-KEM (module-lattice-based key encapsulation mechanism)', def: "A NIST-standardized key-establishment algorithm built to resist attacks from a sufficiently powerful quantum computer, not just classical ones. Works differently from ECDHE: one side wraps a secret using the other's public key instead of both sides combining public values directly." },
    { term: 'Hybrid key exchange', def: "Running a classical key exchange group (like X25519) and a post-quantum one (like ML-KEM) in the same handshake and combining both resulting secrets into one session key, so the connection stays safe unless both are broken. The industry's actual answer to the quantum threat, not a straight swap to ML-KEM alone." },
    { term: 'Harvest now, decrypt later', def: "An attacker recording encrypted traffic today, with nothing decryptable yet, on the bet that the classical math protecting it eventually becomes breakable and the recording can be decrypted retroactively. The main reason post-quantum key exchange is being deployed years before a quantum computer capable of breaking today's math actually exists." },
```

Style notes:
- `'ML-KEM (module-lattice-based key encapsulation mechanism)'` matches the existing `'SNI (server name
  indication)'` / `'ECH (encrypted client hello)'` pattern (acronym first, lowercase expansion in parens) — the
  form actually used in this new running prose.
- `'Hybrid key exchange'` and `'Harvest now, decrypt later'` get no parenthetical since neither is an acronym,
  matching how `'Revocation'` and `'Chain of trust'` are entered plainly elsewhere in the same category.

Verified against a full read of `glossary.ts`: none of `ML-KEM`, `Hybrid key exchange`, or `Harvest now,
decrypt later` exist anywhere in any of the three categories (`firewall`, `tls`, `vpn`) today.

---

## 6. Full draft prose (final copy, for reference — identical to what's embedded in §3's code)

**Card heading:** What changes next: post-quantum key exchange

**Intro paragraph:**

> Every group named above, X25519 and secp256r1 included, gets its safety from the same kind of guarantee: a math problem that's hard to reverse today, on any computer that exists. A powerful enough quantum computer would break that guarantee outright, not gradually, and the industry isn't waiting to find out when that happens to start defending against it.

**Points:**

- **Not the same threat as forward secrecy.** Forward secrecy above defends against a stolen key: an attacker who gets the server's long-term private key years later still can't unlock old sessions, because the one-time keys that protected them are already gone. A quantum computer breaking the underlying math is a different failure entirely, no key theft required. A recorded handshake's public values would be enough on their own, whether the key behind them was ephemeral or not.
- **Harvest now, decrypt later.** None of this makes today's traffic unsafe today. The concern is what happens to traffic that's already been captured and quietly stored, on the bet that whatever's unreadable now stays unreadable forever. If the math protecting it is ever broken, that stored traffic doesn't need to be captured again, it just needs to be decrypted with whatever broke it.
- **ML-KEM is the industry's answer.** Standardized by NIST in 2024 after years of public scrutiny, ML-KEM is a key-establishment algorithm built on a different kind of hard problem, one believed to hold up even against a quantum computer. It works a little differently than the groups above: instead of both sides combining public values into the same secret, one side publishes a public key and the other uses it to wrap a freshly chosen secret and sends the wrapped result back to be unwrapped. Different mechanism, same outcome: both sides end up holding one identical secret neither one ever sent directly.
- **The real move is hybrid, not replace.** TLS doesn't swap X25519 out for ML-KEM, it negotiates both in the same handshake and combines the two resulting secrets into the one real session key, so the connection stays safe unless both are broken. That's as much a hedge as a quantum defense: ML-KEM hasn't had anywhere near the decades of scrutiny the classical math above has, so pairing it with a proven classical group means an unnoticed flaw in the new algorithm doesn't sink the connection either.
- **Where it stands today.** TLS already negotiates the key exchange group as one named value, separate from the rest of the cipher suite, and a hybrid group is just a new option on that same list, its name reflecting both halves at once (commonly written as something like X25519MLKEM768). This isn't a future roadmap item either: hybrid key exchange is already the default for a meaningful share of real HTTPS traffic right now, the same quiet way TLS 1.3 itself became the default, an upgrade to what a connection falls back to, not something a typical user or admin switches on by hand.

No closing bridge paragraph is added — the chapter's existing one (§1, §3c) already does the job unchanged.

---

✅ **Resolved by the project owner (2026-07-24): ship both, as separate, complementary additions — not
alternatives.** This doc's Card and `simulation-design.md`'s chip-0 toggle both shipped. See §1 of this doc's
top status block for the exact resolution.

## 7. Coordination note (Simulation/Interaction Designer)

`docs/integration/phase-2b-pq-crypto/` contained no other files when this plan was written — the parallel
Interaction Designer's output doesn't exist yet, or wasn't visible to this agent. Per the explicit correction
from Phase 1 ("do not unilaterally decide whether this topic gets an interactive treatment"), this plan does
**not** assume whether an interactive ships alongside it. Both of the following are true regardless of what the
Designer proposes:

- **This plan's content stands on its own.** If no interactive is added, the new `Card` in §3 is complete,
  self-contained content requiring no other component.
- **This plan leaves room for one, and names where it would go.** If the Designer proposes a small,
  self-contained interactive specific to hybrid key exchange, the natural slot is **directly below the new
  "What changes next" `Card` and above the chapter's existing closing bridge paragraph** — matching the
  placement pattern `PolicyEvaluator` already uses in `Chapter5DecryptionPolicies.tsx` and the same slot
  `phase-2a-ech/content-plan.md` named for a possible ECH interactive (static cards first, a small interactive
  as the last hands-on payoff before the chapter moves on).
- **The most obvious larger-lift option is extending `CipherDecoder` itself** (`CipherDecoder.tsx` /
  `cipherSuite.ts`), since research-ideas.md #2 explicitly names it as a plausible reuse target: e.g. a toggle
  or fifth chip showing a hybrid group's two-part structure (X25519 half + ML-KEM half, each contributing a
  secret) the way the existing four chips each answer one question about a classical suite. That's a real
  component/data decision — whether `CipherDecoder`'s existing four-chip, single-suite framing should grow a
  hybrid mode, and how — squarely the Interaction Designer's and/or project owner's call, not something this
  content-only plan decides unilaterally. Flagging it here only so it's visible, not recommending it over the
  smaller option above.

**This agent's opinion, offered only as a flag, not a decision:** the smaller, card-adjacent interactive is
probably the safer-scoped option, for the same reason ECH's was — it doesn't touch `CipherDecoder`'s existing,
already-working four-chip mental model, which decodes a specific classical (non-hybrid) suite string
correctly and doesn't need to be complicated by TLS 1.3's separately-negotiated group. But this is the parallel
Designer's evaluation to make, not this plan's.

---

## 8. Deliberate scope calls made in this plan (flagging so nothing reads as an oversight)

- **The mechanism name "KEM" (key encapsulation mechanism) is used only inside the full term "ML-KEM," never
  introduced as its own standalone acronym or glossary concept.** `PQ_POINTS[2]`'s text describes what a KEM
  *does* mechanically (one side wraps a secret, the other unwraps it) without naming the general category
  separately from the specific algorithm, matching the site's existing restraint elsewhere (Chapter 4 already
  names `ECDHE`/`DHE`/`X25519` concretely without walking through elliptic-curve math; `phase-2a-ech`'s plan
  made the same call about HPKE). If deeper mechanism fidelity is ever wanted, `KEM` can be added as its own
  acronym/glossary entry without touching this plan's Chapter 4 prose.
- **No specific browser or cloud provider is named** in the "Where it stands today" point, deliberately,
  matching the established pattern from both prior integration passes (`phase-1-certificates/content-plan.md`
  §8, `phase-2a-ech/content-plan.md` §9) of not naming a specific vendor/organization unless it's load-bearing
  for the point being made, and avoiding a claim that goes stale the moment one product's rollout status
  changes.
- **NIST is named explicitly, unlike the CA/Browser Forum in the certificates pass or the ECH spec's standards
  body in the ECH pass.** This is a deliberate exception, not an inconsistency: naming NIST is load-bearing
  here in a way naming those other bodies wasn't — it directly answers the question a wary reader is likely to
  have about a comparatively new cryptographic algorithm ("who actually vetted this, and how"), the same way
  the reader isn't expected to just trust "ML-KEM" on faith. `AES` and `RSA`, both already used elsewhere in
  this chapter's `CipherDecoder`, went through comparable public standardization processes but the site never
  says so — this plan doesn't retroactively add that framing to `cipherSuite.ts`, since that's out of scope
  here, but flags the asymmetry so it's a conscious choice, not an oversight.
- **The 2024 ML-KEM standardization date is stated as a fact of the past, not a rolling target** (contrast with
  `phase-1-certificates/content-plan.md`'s explicit hedging on the phased-in 47-day certificate-lifetime
  figure, which was future policy at time of writing). FIPS 203 (ML-KEM) was finalized and published in August
  2024, so this is a settled historical fact as of this plan's writing date, not a forward-looking claim that
  needs hedged phrasing. Still worth a periodic accuracy check by whoever maintains this content, same as any
  date-sensitive claim on the site.
- **`X25519MLKEM768` is used as the one concrete example of a hybrid group name, spelled exactly as it is
  written in real deployments** (no hyphen, no separating punctuation between the two halves). This is the
  single most protocol-literal detail in this plan's copy — considered necessary rather than excess detail,
  since without one concrete example the "a hybrid group is just a new option on that same list" claim in
  `PQ_POINTS[4]` would have nothing tangible to point at, the same way Chapter 4's existing copy already names
  `X25519` and `secp256r1` concretely rather than describing them only in the abstract.

---

## 9. Order of implementation (for the Implementer)

1. `src/data/acronyms.ts` — add the two entries (§4).
2. `src/data/glossary.ts` — add the three entries (§5).
3. `src/components/chapters/Chapter4KeyExchange.tsx` — add `PQ_POINTS` (§3a), then the new `Card` (§3b),
   keeping the quoting choices noted in §3a intact.
4. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
5. Visual check in `npm run dev`: confirm the new card renders as the last element in Chapter 4, after
   `CipherDecoder` and before the existing "All of this, key exchange, authentication..." closing paragraph;
   confirm hovering `TLS`, `ML-KEM`, and `NIST` anywhere in the new copy shows the correct tooltip; confirm
   nothing in the existing "Key exchange groups" `Card` or `CipherDecoder` changed.
