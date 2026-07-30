# Content plan: chain-of-trust basics → Reference → Certificates

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).

Scope: the Certificates reference page (`src/components/reference/CertificateTabs.tsx`, route `/certificates`)
uses "root," "intermediate," and "leaf" certificate constantly — in `CERT_LIFECYCLE_SECTIONS`
(`src/data/certificates.ts`) and in `VerificationWalkthrough.tsx`'s 5-step chain — without ever explaining what
those three tiers structurally are or why a three-tier chain of trust exists. Definitions already exist in
`src/data/glossary.ts`'s `tls` category, but that's a separate route (`/glossary`) a reader has no reason to
visit first. This plan adds one new block of teaching prose directly on the Certificates page, ahead of the
content that currently assumes the reader already knows these terms.

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

A parallel Simulation/Interaction Designer agent is working the same problem area and does not share context
with this plan — see **§10 Coordination note** at the very end before implementing.

---

## 1. Placement decision (and why)

**Decision: a new bridge paragraph + one new `Card`, inserted immediately after the existing tabbed `Card`
(the one with the `Toggle` and the three deployment-job tabs) and immediately before the existing
`CERT_LIFECYCLE_BRIDGE` paragraph. Not a fourth tab, not attached to `CertificateFieldDecoder`, not at the very
top of the page.**

### Current structure of `CertificateTabs.tsx`, for reference

1. `SectionHead` ("A certificate isn't one thing used one way... three different jobs")
2. Tabbed `Card` (`Toggle` + flow chips + title + `CERT_DATA[tab].points`) — forward/inbound/vpn
3. `CERT_LIFECYCLE_BRIDGE` paragraph ("The three tabs above are about where... The two things below are about
   time...")
4. `CERT_LIFECYCLE_SECTIONS.map(...)` — two `Card`s: "Not every certificate in the chain lives the same length
   of time" (uses `Root:` / `Intermediate:` / `Leaf:` as bullet labels, unexplained) and "Expiry and revocation
   aren't the same problem"
5. `CERT_LIFECYCLE_CLOSING` paragraph
6. `<CertificateFieldDecoder />` — decodes one fictional leaf certificate's fields, mentions in passing that
   it's "signed by a fictional intermediate CA"
7. `<VerificationWalkthrough />` — 5-step chain: leaf signature → intermediate signature → root trusted →
   validity window → revocation

### Why this exact slot, and not the alternatives

- **The first, heaviest unexplained use of these terms is item 4 (`CERT_LIFECYCLE_SECTIONS`), not item 6 or
  7.** Its very first `Card` opens with "Root, intermediate, and leaf certificates aren't just different links
  in the same chain of trust, they're built to live on entirely different clocks" and then uses `Root:` /
  `Intermediate:` / `Leaf:` as bullet labels with zero structural explanation, immediately assuming the reader
  already knows what those three words refer to. This is the single earliest point in the page's reading order
  where the gap actually bites. Anything placed after item 4 arrives too late.
- **This rules out tying the explainer to `CertificateFieldDecoder` (item 6).** `CertificateFieldDecoder`
  already mentions "signed by a fictional intermediate CA" in passing, which looks at first glance like a
  natural anchor point — but it sits *after* `CERT_LIFECYCLE_SECTIONS` and `VerificationWalkthrough`'s own
  step labels never even reach it in the current layout (`VerificationWalkthrough` is item 7, after the
  Decoder). A reader hits the unexplained terms at item 4 well before they'd reach an explainer parked at item
  6. Anchoring here would fix the Decoder's own passing mention while leaving the actual first offender
  (item 4) still unexplained.
- **This also rules out placing it at the very top of the page, before the tabbed `Card` (item 2).** The one
  soft counter-argument for "as early as possible" is that the `forward` tab (the default-selected tab on
  page load) contains one unexplained use of the term "leaf certificate" ("the firewall generates a fake leaf
  certificate on the fly, signed by that internal CA"). But that bullet's point is about the firewall
  substituting a certificate on the fly, not about chain hierarchy — a reader can follow it without yet
  knowing what "leaf" formally means, the same way a reader can follow "the firewall holds the actual server
  certificate" in the `inbound` tab without a structural definition. Leading with a structural explainer before
  the page's own stated thesis ("three different jobs") would bury that thesis under theory the `SectionHead`
  hasn't set up yet, and would work against the section's own opening framing. The one soft exposure in the
  `forward` tab is an acceptable, non-blocking gap; the hard blocker is `CERT_LIFECYCLE_SECTIONS`.
- **This also rules out inserting between `CERT_LIFECYCLE_BRIDGE` and `CERT_LIFECYCLE_SECTIONS` (i.e., after
  the existing bridge paragraph rather than before it).** `CERT_LIFECYCLE_BRIDGE` reframes the reader from
  "job" (the tabs) to "time" (the two lifecycle cards) in one sentence: *"The three tabs above are about where
  a certificate sits... The two things below are about time..."* Landing a structural chain-of-trust explainer
  in between that reframing sentence and the "time" content it promises would interrupt a promise the page
  just made, one paragraph after making it. Placing the new content *before* that bridge instead means the
  reader gets structure, then a clean, uninterrupted "job → time" transition exactly as it reads today.
- **Precedent for the shape itself:** `Chapter6ForwardProxy.tsx` already stacks multiple `<Card>`s with their
  own `<h3>` and list under one shared `SectionHead`, and `CERT_LIFECYCLE_SECTIONS` already renders as exactly
  this shape on this exact page. The new content reuses the identical, already-proven pattern — no new visual
  idiom.
- No new top-level section, no new nav entry, no `App.tsx`/`routes.tsx` change. This extends the existing
  reference page rather than adding a new one.

**One consequence of this decision:** `CERT_LIFECYCLE_BRIDGE`'s existing text ("The three tabs above are about
where a certificate sits...") stays accurate after this change — the tabs are still "above," just no longer
*immediately* above. No edit to that string is needed (see §8).

**Resulting order inside `CertificateTabs.tsx`'s returned JSX after this change:**

1. `SectionHead` (unchanged)
2. Tabbed `Card` (unchanged)
3. **New:** `CERT_CHAIN_BRIDGE` paragraph
4. **New:** "A certificate is trusted because of the chain behind it, not on its own" `Card`
5. `CERT_LIFECYCLE_BRIDGE` paragraph (unchanged)
6. `CERT_LIFECYCLE_SECTIONS` cards (unchanged, now correctly primed)
7. `CERT_LIFECYCLE_CLOSING` paragraph (unchanged)
8. `<CertificateFieldDecoder />` (unchanged, its "signed by a fictional intermediate CA" aside now lands as a
   reinforcement of an already-taught term rather than a first exposure)
9. `<VerificationWalkthrough />` (unchanged, its leaf → intermediate → root step order now matches something
   the reader was already told to expect — see the new card's fourth bullet, §7)

---

## 2. Files to touch

1. `src/data/certificates.ts` — add new exported data (content only, no component logic). Reuses the existing
   `LifecycleSection` interface (added in the phase-1 plan) as-is — no new interface needed, since the new
   card is structurally identical (heading + intro + labeled bullet points).
2. `src/components/reference/CertificateTabs.tsx` — extend one import line, add one paragraph + one `.map()`
   block.
3. `src/data/acronyms.ts` — **no change.** See §5 for the reasoning.
4. `src/data/glossary.ts` — **no change.** The four relevant entries (`Root certificate`, `Intermediate
   certificate`, `Leaf certificate`, `Chain of trust`) already exist in the `tls` category and are not touched
   or redefined by this plan; the new on-page prose is written independently of them (see §7's note on this).

---

## 3. Exact change: `src/data/certificates.ts`

Append the following after the existing `export const CERT_LIFECYCLE_CLOSING = ...;` line (i.e. at the end of
the file, after everything added by the phase-1 plan). Does not touch `CERT_DATA`, `CertPoint`, `CertTab`,
`CertTabData`, `LifecycleSection`, `CERT_LIFECYCLE_BRIDGE`, `CERT_LIFECYCLE_SECTIONS`, or
`CERT_LIFECYCLE_CLOSING` — all existing exports are left exactly as they are today.

```ts
// --- Chain of trust basics (phase-4) ---
// What root/intermediate/leaf structurally are, and why the chain is checked leaf-up-to-root. Lives above
// CERT_LIFECYCLE_SECTIONS because that content (and VerificationWalkthrough further down the page) both
// assume this vocabulary already. See content-plan.md.

export const CERT_CHAIN_BRIDGE =
  "Whichever job a certificate is doing above, it never stands alone. Every certificate on this page is " +
  "actually the bottom of a three-tier chain, and the terms that chain runs on are worth pinning down " +
  "before going further.";

export const CERT_CHAIN_SECTIONS: LifecycleSection[] = [
  {
    heading: 'A certificate is trusted because of the chain behind it, not on its own',
    intro:
      "That chain has three tiers, root, intermediate, and leaf, and each one exists to solve a different " +
      "problem: who a client trusts blindly, who does the actual day-to-day signing, and who's actually " +
      "being identified.",
    points: [
      {
        strong: 'Root:',
        text:
          "the top of the chain, and the only certificate in it that isn't signed by anyone else, it's " +
          "self-signed. A fixed set of these comes pre-installed in every operating system and browser as " +
          "a trust anchor: something the client already trusts by default, because whoever built the OS or " +
          "browser decided it should. Nothing vouches for a root; that's what makes it one.",
      },
      {
        strong: 'Intermediate:',
        text:
          "signed by a root, and it exists mainly to keep the root out of everyday use. If a root's own key " +
          "had to sign every server certificate directly, that key would be in constant, active use, which " +
          "makes it a bigger target and makes a compromise catastrophic, recovering means getting every " +
          "device on the internet to stop trusting that root and pick up a new one. An intermediate absorbs " +
          "that risk instead. It does the routine signing, and if it's ever compromised, only that " +
          "intermediate has to be revoked and replaced. The root underneath it never has to move.",
      },
      {
        strong: 'Leaf:',
        text:
          "the certificate that actually identifies one specific server, portal.netwise-example.test, or " +
          "whatever site is actually being connected to. It's signed by an intermediate, not a root, and " +
          "it's the only certificate in the chain a client hasn't already decided to trust ahead of time. " +
          "Everything else in the chain exists to justify trusting this one.",
      },
      {
        strong: 'Why leaf-to-root:',
        text:
          "a client can't start from something it already trusts and work forward, because it has no way " +
          "to know in advance which leaf certificate a given site is about to present. What it does know " +
          "ahead of time is a fixed list of trusted roots. So it starts at the one certificate it just " +
          "received, the leaf, confirms that certificate's signature actually traces to the intermediate " +
          "that issued it, confirms that intermediate's own signature traces to a root, and only trusts the " +
          "connection if that walk lands on a root already sitting in its trust store. That's the exact " +
          "order the walkthrough further down this page runs the check in.",
      },
    ],
  },
];
```

Notes on this snippet, for the Implementer:
- Long string literals are split with `+` purely for line-length readability in this plan doc; collapse to
  single-line string literals to match the existing file's convention (both `CERT_DATA` and the phase-1
  `CERT_LIFECYCLE_SECTIONS` addition use single-line strings, not template literals or multi-line
  concatenation — match that, not the multi-line form shown here).
- `strong` labels stay short (2–3 words) and end in `:`, matching this file's existing convention
  (`'Root:'`, `'Intermediate:'`, `'Leaf:'` are lifted verbatim from `CERT_LIFECYCLE_SECTIONS`'s own first
  card, which already uses exactly these three labels — reusing them here rather than inventing new wording
  keeps the two cards feeling like one voice).
- Body text deliberately says bare "the root" / "the intermediate" / "the leaf," not "the root CA" /
  "the intermediate CA," to match `CERT_LIFECYCLE_SECTIONS`'s own phrasing in this same file (e.g. "sitting
  between the root and the leaf specifically so the root itself can stay locked away"). Note that
  `VerificationWalkthrough.tsx` uses the longer "root CA" / "intermediate CA" phrasing in its own step
  messages — both forms already coexist on this page today; this addition matches the nearer, same-file
  neighbor rather than trying to reconcile the two.
- `portal.netwise-example.test` is the exact fictional hostname already used in
  `src/data/certificateFields.ts` / rendered by `CertificateFieldDecoder.tsx`. Reusing it here (rather than
  inventing a new example domain) is deliberate, so the reader sees the same concrete example reinforced
  when they reach the Decoder further down the page.
- `CA` is the only token in this new copy that collides with an existing `ACRONYMS` key (it doesn't actually
  appear here — this copy avoids the string "CA" entirely, see the bullet above), so there's nothing to
  double-check against `AutoLink`'s regex for this particular addition. No other acronym tokens are
  introduced by this text.

---

## 4. Exact change: `src/components/reference/CertificateTabs.tsx`

**Import line** — extend the existing import to also pull in the two new exports:

```tsx
import { CERT_DATA, CERT_LIFECYCLE_BRIDGE, CERT_LIFECYCLE_SECTIONS, CERT_LIFECYCLE_CLOSING, CERT_CHAIN_BRIDGE, CERT_CHAIN_SECTIONS, type CertTab } from '../../data/certificates';
```

**JSX** — insert the following immediately after the existing tabbed `<Card>...</Card>` block (the one
containing the `Toggle`, flow chips, title, and points list) and immediately before the existing
`CERT_LIFECYCLE_BRIDGE` paragraph:

```tsx
      <p className="text-ink-dim text-[14.5px] mt-6 mb-5 max-w-[70ch]">
        <AutoLink text={CERT_CHAIN_BRIDGE} />
      </p>

      {CERT_CHAIN_SECTIONS.map((section) => (
        <Card key={section.heading} className="mb-5">
          <h3 className="font-sans font-semibold text-base mb-2">
            <AutoLink text={section.heading} />
          </h3>
          <p className="text-ink-dim text-[14.5px] mb-2.5">
            <AutoLink text={section.intro} />
          </p>
          <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2.5 list-disc marker:text-line">
            {section.points.map((p, idx) => (
              <li key={idx}>
                {p.strong && <strong className="text-ink">{p.strong} </strong>}
                <AutoLink text={p.text} />
              </li>
            ))}
          </ul>
        </Card>
      ))}
```

Everything after this (the existing `CERT_LIFECYCLE_BRIDGE` paragraph, `CERT_LIFECYCLE_SECTIONS.map(...)`,
`CERT_LIFECYCLE_CLOSING` paragraph, `<CertificateFieldDecoder />`, `<VerificationWalkthrough />`) is
**unchanged** — do not edit any of it, just insert the block above ahead of it.

This is a direct copy of the JSX shape `CertificateTabs.tsx` already uses one paragraph down for
`CERT_LIFECYCLE_SECTIONS` — same `.map()` structure, same class names, same `CertPoint`-list rendering
(`p.strong` + `AutoLink`). Rendering a one-element array via `.map()` (rather than hand-writing a single
`Card` inline) is deliberate: it keeps this block visually and structurally identical to its neighbor and
costs nothing, and it means a second card can be appended to `CERT_CHAIN_SECTIONS` later (if ever) with a
pure data change and no JSX change.

No changes are needed to the `Toggle`, `TAB_OPTIONS`, `useState`, or the existing tabbed `Card` — they render
exactly as they do today, unmodified, above this new content. No changes to `CertificateFieldDecoder.tsx` or
`VerificationWalkthrough.tsx` either; both already read correctly once this new block exists above them on the
page, no code in either file needs to change.

---

## 5. Should these terms also become `AutoLink`/`ACRONYMS` tooltips? — Recommendation: no

**Recommendation: do not add "Root certificate," "Intermediate certificate," "Leaf certificate," or "Chain of
trust" to `src/data/acronyms.ts`.** Keep the glossary entries in `src/data/glossary.ts` exactly as they are,
untouched, and let the new prose in §3 carry the teaching load on this page instead.

Reasoning:

- **`ACRONYMS` has zero precedent for space-containing multi-word keys today.** A full read of the file
  (37 entries) shows every key is either a bare short acronym (`TCP`, `CA`, `SNI`, ...) or a hyphenated
  compound with no space (`App-ID`, `User-ID`, `Content-ID`, `ML-KEM`). `AutoLink`'s regex mechanism
  (`src/lib/autoLink.tsx`) technically works on any dictionary key via `\b(...)\b` word-boundary matching, so
  a phrase key like `'Root certificate'` would compile and run — but it would be the first entry of this
  shape in the dictionary, a real precedent change, not a mechanical extension of the existing pattern.
- **Case sensitivity makes phrase keys fragile in practice, and the file already has a documented failure
  mode of exactly this kind.** `ACRONYM_REGEX` has no `i` flag, so matching is exact-case. The new prose in
  §3 (and the existing `CERT_LIFECYCLE_SECTIONS` prose) almost never writes these terms capitalized
  mid-sentence — it's "the root," "an intermediate," "the leaf," lowercase, as a bare noun, not the
  capitalized bigram "Root certificate." A key of `'Root certificate'` would silently fail to match the vast
  majority of actual usage on this page. The phase-1 content plan already hit this exact problem with
  `CRL`/`CRLs` (a plural has no word boundary between "certificate" and a trailing "s" the way the regex
  needs one) and explicitly worked around it by rewording body copy to avoid the unmatched form. Solving that
  same problem for four *phrase* keys, across every place they're used in body copy sitewide, would mean
  auditing and likely rewriting existing prose in `certificates.ts`, `VerificationWalkthrough.tsx`, and
  possibly other chapters, which is a much bigger, riskier change than this phase's actual scope.
- **A bare single-word fallback (`Root`, `Intermediate`, `Leaf` as standalone keys) is worse, not better.**
  It would catch more real usage, but at the cost of tooltipping "leaf" or "root" as ordinary English words in
  any future, unrelated sentence that happens to contain them — a much easier accident to introduce later than
  it is to catch in review, since nothing about `AutoLink`'s mechanism flags a semantically-wrong match.
- **The new prose in §3 already does the actual teaching job, and does it better than a tooltip could.**
  The existing glossary one-liners are terse by design (that's the right register for a lookup glossary) —
  which is precisely why a first-time reader hitting them cold, with no surrounding context, doesn't come away
  understanding *why* a three-tier chain exists at all. A hover tooltip would surface that same terse
  one-liner in place, not fix the underlying gap. The new `Card` in §3 is the actual fix; a tooltip on top of
  it would be redundant with content the reader is about to read one paragraph later anyway.
- **This isn't a permanent "never."** If a future phase wants sitewide hover coverage for these four terms
  specifically, the more defensible path is extending `AutoLink`'s matching to be case-insensitive (or adding
  a second, phrase-aware tooltip mechanism) as its own scoped change, reviewed on its own, rather than smuggling
  a new key-shape into `ACRONYMS` as a side effect of this content addition.

**No change to `src/data/acronyms.ts` or `src/data/glossary.ts` in this plan.**

---

## 6. (Reserved — no glossary.ts change)

Per §2 and §5: `src/data/glossary.ts`'s existing `Root certificate` / `Intermediate certificate` / `Leaf
certificate` / `Chain of trust` entries in the `tls` category are left exactly as they are. Verified against a
full read of the file before writing this plan: no wording conflict between those four existing definitions
and the new prose in §3 (the new prose is longer and teaches *why*, the glossary entries stay terse
lookup-style *what*, the two are complementary, not duplicative, and neither needs to change to keep saying
that).

---

## 7. Full draft prose (final copy, for reference — identical to what's embedded in §3's code)

**Bridge paragraph** (sits between the existing tabbed `Card` and the new `Card`):

> Whichever job a certificate is doing above, it never stands alone. Every certificate on this page is actually the bottom of a three-tier chain, and the terms that chain runs on are worth pinning down before going further.

**Card — "A certificate is trusted because of the chain behind it, not on its own"**

> That chain has three tiers, root, intermediate, and leaf, and each one exists to solve a different problem: who a client trusts blindly, who does the actual day-to-day signing, and who's actually being identified.

- **Root:** the top of the chain, and the only certificate in it that isn't signed by anyone else, it's self-signed. A fixed set of these comes pre-installed in every operating system and browser as a trust anchor: something the client already trusts by default, because whoever built the OS or browser decided it should. Nothing vouches for a root; that's what makes it one.
- **Intermediate:** signed by a root, and it exists mainly to keep the root out of everyday use. If a root's own key had to sign every server certificate directly, that key would be in constant, active use, which makes it a bigger target and makes a compromise catastrophic, recovering means getting every device on the internet to stop trusting that root and pick up a new one. An intermediate absorbs that risk instead. It does the routine signing, and if it's ever compromised, only that intermediate has to be revoked and replaced. The root underneath it never has to move.
- **Leaf:** the certificate that actually identifies one specific server, portal.netwise-example.test, or whatever site is actually being connected to. It's signed by an intermediate, not a root, and it's the only certificate in the chain a client hasn't already decided to trust ahead of time. Everything else in the chain exists to justify trusting this one.
- **Why leaf-to-root:** a client can't start from something it already trusts and work forward, because it has no way to know in advance which leaf certificate a given site is about to present. What it does know ahead of time is a fixed list of trusted roots. So it starts at the one certificate it just received, the leaf, confirms that certificate's signature actually traces to the intermediate that issued it, confirms that intermediate's own signature traces to a root, and only trusts the connection if that walk lands on a root already sitting in its trust store. That's the exact order the walkthrough further down this page runs the check in.

This does not restate the four existing glossary one-liners verbatim (compare against `src/data/glossary.ts`'s
`tls` category) — it teaches the mechanism (why an intermediate exists, why verification runs bottom-up)
rather than just naming the three tiers, which is the actual gap this plan is closing.

---

## 8. Deliberate scope calls made in this plan (flagging so nothing reads as an oversight)

- **`CERT_LIFECYCLE_BRIDGE`'s existing text is left untouched even though a new `Card` now sits between it and
  the tabbed `Card` it references.** It still reads correctly ("the three tabs above" is still true, just not
  immediately above anymore), and editing content that shipped under a previous phase's plan is out of this
  phase's scope unless it's actually wrong. Flagged here so it doesn't look like a missed edit.
- **No second `Card`, and no separate paragraph for the "why leaf-to-root" point.** That point is folded in as
  the new card's fourth bullet instead of its own `Card`, deliberately, to match `CERT_LIFECYCLE_SECTIONS`'s
  own first card, which is also a single card carrying five bullets. Splitting "what the three tiers are" and
  "why verification runs bottom-up" into two separate cards would add visual weight this page doesn't need for
  what's fundamentally one idea told in two parts.
- **"Root CA" / "intermediate CA" vs. bare "root" / "intermediate" is left inconsistent across the page.**
  `VerificationWalkthrough.tsx`'s step messages already say "the intermediate CA's public key" and "the root
  CA's public key," while this new card and the existing `CERT_LIFECYCLE_SECTIONS` both say bare "the
  intermediate" / "the root." This plan matches the nearer neighbor (`CERT_LIFECYCLE_SECTIONS`, same file) on
  purpose rather than rewriting `VerificationWalkthrough.tsx` to reconcile the two, since that file belongs to
  the parallel Interaction Designer's area (see §10) and editing it isn't in this plan's scope.
- **The one soft pre-existing exposure to "leaf certificate" inside the `forward` tab of `CERT_DATA` (the
  default-selected tab) is left as-is.** See §1's placement reasoning — that single mention doesn't block
  comprehension of the bullet it's in, and moving the new explainer any earlier than "right after the tabbed
  Card" would bury the page's stated "three different jobs" thesis under structural theory before it's even
  introduced. Worth a second look only if user feedback specifically flags that one line as confusing.
- **No "jump to the Glossary" cross-reference link was added.** `Chapter1Firewall.tsx` has precedent for an
  inline `<Link to="/certificates">` cross-page reference, and a similar `<Link to="/glossary">` here was
  considered. Rejected because `Glossary.tsx`'s category selection is local `useState` with no route param or
  hash support (checked: no anchor `id`s, no `?cat=` handling), so a bare `/glossary` link would land on the
  `firewall` category by default, not the `tls` category where these four terms live — a low-value link that
  requires an extra click to even reach the right tab. If category-aware deep-linking is ever added to
  `Glossary.tsx`, revisit this as a one-line addition; not worth doing as a standalone change here.
- **No interactive element proposed.** This plan is prose-only, consistent with the reference section's
  existing register (`CERT_LIFECYCLE_SECTIONS` is static prose; only `CertificateFieldDecoder` and
  `VerificationWalkthrough` are interactive, and both already exist). If the parallel Interaction Designer
  proposes a chain-of-trust visualization (a tree diagram, a root→intermediate→leaf zoom, etc.), see §10.

---

## 9. Order of implementation (for the Implementer)

1. `src/data/certificates.ts` — append `CERT_CHAIN_BRIDGE` and `CERT_CHAIN_SECTIONS` (§3).
2. `src/components/reference/CertificateTabs.tsx` — update the import and insert the new paragraph + `.map()`
   block between the tabbed `Card` and the existing `CERT_LIFECYCLE_BRIDGE` paragraph (§4).
3. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
4. Visual check in `npm run dev`: confirm the tab `Toggle` still switches `forward`/`inbound`/`vpn` content
   unchanged; confirm the new bridge paragraph and card render directly below the tabbed `Card` and directly
   above the existing "three tabs above... time..." paragraph; confirm `CERT_LIFECYCLE_SECTIONS`,
   `CERT_LIFECYCLE_CLOSING`, `CertificateFieldDecoder`, and `VerificationWalkthrough` all still render below
   it, unchanged, in their existing order.

No changes to `src/data/acronyms.ts` or `src/data/glossary.ts` in this plan (§5, §6) — skip those files
entirely.

---

## 10. Coordination note

A separate Simulation/Interaction Designer agent is working the same "chain of trust basics" gap in parallel
and does not share context with this plan. This plan is prose-and-placement only (§8's last bullet) — it does
not propose, and does not assume, any interactive or visual treatment (a chain diagram, a root/intermediate/leaf
zoom, an animated signature-walk, etc.) for this content.

If that agent's output proposes an interactive treatment for this same root/intermediate/leaf material, the
Implementer and/or project owner needs to reconcile the two plans before execution:

- If the interactive is additive (e.g., a visual sitting alongside or below the prose `Card` from this plan,
  the same relationship `CertificateFieldDecoder` and `VerificationWalkthrough` already have to
  `CERT_LIFECYCLE_SECTIONS`), both can likely land together with no conflict — insert the interactive after
  the `Card` from §4, following the same "prose first, hands-on after" placement precedent §1 documents for the
  rest of this page.
- If the interactive is meant to *replace* the prose explanation rather than sit alongside it, that's a
  product decision outside either agent's authority — flag it to the project owner rather than picking one
  plan over the other unilaterally. This plan's own content (the four-bullet `Card` in §3/§7) is written to
  stand on its own regardless of that outcome, so nothing here is wasted if an interactive is chosen instead;
  the prose can be trimmed or dropped without touching `CERT_LIFECYCLE_SECTIONS` or `VerificationWalkthrough`,
  since neither of those depends on this plan's exact wording, only on the concepts being introduced somewhere
  before they're used.

This plan assumes a fully static, prose-only addition (§1, §8) and should not be applied verbatim alongside a
conflicting interactive plan for the same block without that reconciliation happening first.
