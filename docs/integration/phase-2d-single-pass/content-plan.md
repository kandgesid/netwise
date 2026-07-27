# Content plan: research-ideas.md #16 → Chapter 3 (single-pass parallel processing)

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).
Scope: research-ideas.md candidate **#16** ("Single pass (parallel processing) architecture — how a firewall
does all of it without becoming the bottleneck"), landed as one new `Card` inside Chapter 3
(`src/components/chapters/Chapter3Handshake.tsx`), directly after the existing "Three lenses the firewall
applies" `Card`.

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

A parallel Simulation/Interaction Designer agent is working the same topic area, doing **from-scratch design
work with no pre-suggested mechanic** — same situation as the QUIC phase before this one (`phase-2c-quic`), and
unlike the ECH and post-quantum phases, which each came with a specific interactive idea already sketched for
the Designer to react to. See **§7 Coordination note** before implementing — per the explicit correction carried
forward since Phase 1 ("do not unilaterally decide whether this topic gets an interactive treatment"), this plan
takes the same deliberately hands-off posture `phase-2c-quic/content-plan.md` §7 modeled, and does not assume a
small card-adjacent widget is the likely outcome.

**Vendor-attribution requirement, addressed up front:** "Single Pass Parallel Processing" and its abbreviation
"SP3" are Palo Alto Networks' specific branded name for this architecture, the exact same situation as
App-ID/User-ID/Content-ID (Chapter 3's existing "Three lenses" card already discloses that those three are "one
major firewall vendor's names for these capabilities... every modern firewall does some version of [this], but
the product-specific names differ vendor to vendor"). Every new passage below that names "single-pass parallel
processing" or "SP3" is written and disclosed the same way — see §4a's footnote paragraph specifically.

---

## 1. Where this content lands: Chapter 3 vs. a Sandbox aside

research-ideas.md #16 names two candidates: "near the existing vendor-attribution card in Chapter 3" or "as a
short aside introducing the Sandbox." Both were weighed directly against the actual chapter/component structure,
not defaulted to the first-listed option.

**Chapter 3, extending the "Three lenses" card's neighborhood — selected.**

- **It directly resolves a question that card already raises and doesn't answer.** `Chapter3Handshake.tsx`'s
  "Three lenses the firewall applies" `Card` (lines 72–88) lists App-ID, User-ID, and Content-ID, one sentence
  each, and its footnote discloses they're one vendor's branded names for capabilities every modern firewall
  implements somehow. What that card never addresses: a firewall doing forward proxy or inbound inspection is
  also decrypting that same traffic, on every packet, before any of those three lenses gets a look at it. A
  reader who's paying attention has a live, un-set-up-for question at exactly that point: *if it's doing this
  much work on every packet, why doesn't turning more of it on cost more time?* Landing the answer immediately
  after the question's natural trigger point is stronger than landing it somewhere the question hasn't just been
  raised.
- **Chapter 3 is the site's "reading" chapter for this material; the Sandbox is the "doing" one — and the
  Sandbox's own doing is already spoken for.** The Sandbox's `SectionHead` (`Sandbox.tsx` lines 122–127) states
  one tightly-scoped lesson: a port-based rule can be fooled, an App-ID-based rule can't, a User-ID-based rule
  can enforce more than either. That paragraph earns its focus by staying on exactly one point. Single-pass
  architecture is a different kind of claim (a performance/scaling fact about *how* the lenses run, not *what*
  they check), and folding it into that intro paragraph would blur the one clean idea the Sandbox's opening
  currently delivers without distraction.
- **A "short aside" in the Sandbox has nowhere uncontested to sit.** The Sandbox already carries one aside of
  almost exactly this shape and size — the existing italic footnote near the console output: *"Real firewalls
  usually need to see a few packets of a session before App-ID can confirm what's actually running. This sandbox
  shows the eventual verdict instantly, for clarity"* (`Sandbox.tsx` lines 276–279). That's a *related* but
  *different* simplification (session-based recognition timing, not multi-feature processing cost), and stacking
  a second, differently-scoped aside right next to it risks the two blurring into one another in a reader's mind
  — "the sandbox is instant for some reason involving performance" — rather than reading as two distinct, precise
  facts. Chapter 3 has room for a full `Card` with its own heading to keep this claim distinct instead of
  packed into existing footnote real estate.
- **Practical coordination reason, not just a content one.** The Designer's from-scratch mechanic for this same
  research-ideas.md entry might reasonably want to *live* in or near the Sandbox — a latency/pass-count
  visualization contrasting chained engines against one traversal is a very natural fit for the Sandbox's
  existing terminal-log feedback mechanism (see §7). Keeping this plan's static prose in Chapter 3 instead of
  also touching `Sandbox.tsx` leaves that file's structure untouched by anything but the Designer's eventual
  work, reducing the chance the two parallel plans collide over the same JSX. `phase-2c-quic/content-plan.md`
  §7 made an analogous call for the same reason.

**Why not somewhere else entirely (Chapter 1, Chapter 5, Chapter 6)?** Briefly considered and set aside. Chapter
1's "checkpoint, not wall" metaphor is about *what* a firewall decides, not the internal mechanics of running
several inspection engines on one packet — single-pass has no natural hook there. Chapter 5 (decryption policy)
and Chapter 6 (forward proxy deployment) are both about *when* and *how* decryption gets turned on for a category
of traffic, not about the performance mechanics of running decrypt-plus-inspect together once it's on — the
"three lenses plus decryption, together, cheaply" claim belongs with the three lenses themselves, which live in
Chapter 3 alone.

## 2. Placement decision inside Chapter 3

**Decision: one new `Card`, inserted immediately after the existing "Three lenses the firewall applies" `Card`'s
closing `</Card>` tag and before the existing "A man-in-the-middle, on purpose" `Card`. Neither existing `Card`
is edited.**

Reasoning:

- **Directly after "Three lenses," not after MITM or ECH, and not merged into the same `Card`.** The MITM card
  is about trust/authorization; the ECH card is about what becomes invisible; neither is what this content
  answers. Only "Three lenses" sets up the specific question this content resolves, so it belongs immediately
  next to it, preserving the "question, then its answer" adjacency. A separate `Card` (rather than appending
  onto "Three lenses" itself) matches this file's own established convention of one distinct kind of claim per
  `Card` — "what the three lenses are" and "why running all three plus decryption together doesn't cost more
  time per feature" are different kinds of facts, the same reasoning `phase-2c-quic/content-plan.md` §2 used to
  justify two separate `Card`s for QUIC's diagnosis and QUIC's response.
- **Not appended before the Chapter 4 bridge.** The Chapter 3 → Chapter 4 bridge paragraph (`Chapter3Handshake.tsx`
  lines 121–123) is specifically about ECH's key exchange and X25519, immediately following the ECH `Card`. Any
  new content landing right before that paragraph would break a bridge that's currently clean and specific — so
  this plan places its new `Card` earlier in the sequence instead, where it doesn't disturb that transition at
  all.
- **Sized to match the research doc's own sizing signal.** research-ideas.md #16 calls this a "small section," a
  "footnote" to mechanics the site already teaches, not a "meatier" topic on the scale of QUIC (which needed two
  full `Card`s). One `Card`, three short points, is proportionate — this is not a second ECH-sized addition to
  an already-dense chapter.
- **Chapter 3 density, checked.** After this addition, Chapter 3 carries `HandshakeStepper` plus four `Card`s
  ("Three lenses" → **new** → "MITM" → "ECH"). `phase-2c-quic/content-plan.md` §1 flagged Chapter 3's existing
  three-`Card` density as one reason to route QUIC's heavier, multi-card content to Chapter 6 instead. That
  concern doesn't transfer cleanly here: QUIC needed roughly two ECH-sized cards' worth of new material; this
  content is one card with three short points, directly extending a claim already on the page rather than
  introducing an unrelated topic. The proportionate response to "Chapter 3 is already the densest chapter" is to
  keep new additions small, not to refuse all future additions to it — and research-ideas.md #16 already sizes
  this as small.

## 3. Files to touch

1. `src/components/chapters/Chapter3Handshake.tsx` — add one new data array (`SINGLE_PASS_POINTS`) and one new
   `<Card>`, inserted between the existing "Three lenses the firewall applies" `Card` and the existing "A
   man-in-the-middle, on purpose" `Card`. No existing lines change.
2. `src/data/acronyms.ts` — add one new entry: `SP3`.
3. `src/data/glossary.ts` — add one new entry to the `firewall` category.

No other file needs to change. `src/components/sandbox/Sandbox.tsx` and `src/data/sandboxScenarios.ts` are **not**
touched — see §8 for why that's a deliberate scope call, not an oversight. Checked against a full read of
`src/data/acronyms.ts` and `src/data/glossary.ts` before writing this plan — `SP3` does not currently exist in
either file, and no existing key or term collides with it.

---

## 4. Exact change: `src/components/chapters/Chapter3Handshake.tsx`

### 4a. New data array

Insert this new `const` directly after the existing `PIPELINE_POINTS` array's closing `];` (after line 19) and
before the existing `const MITM_POINTS = [` line (line 21) — i.e., between `PIPELINE_POINTS` and `MITM_POINTS`:

```tsx
const SINGLE_PASS_POINTS = [
  {
    strong: 'The old model stacked a full pass per feature.',
    text: "Older firewalls ran each inspection job as its own separate engine: one pass for antivirus scanning, another for intrusion detection, another for application control, and so on, with traffic queued through every one of them in turn before it could move on. Switch on one more feature and you added one more full pass over the same traffic, so protection and delay scaled together.",
  },
  {
    strong: 'Single-pass parallel processing does the decoding once, then runs every check together.',
    text: "Decrypt the traffic once, decode it once, then run the policy match and all three lenses, App-ID, User-ID, and Content-ID, against that same single pass at the same time instead of one after another. Turning on User-ID doesn't add a second decrypt, and turning on Content-ID doesn't add a third pass behind it; everything enabled rides through in the same traversal the traffic was already making.",
  },
  {
    strong: 'It scales by running many sessions in parallel, not by cutting any one check short.',
    text: "None of this makes an individual check instant, more inspection checks running is still more computation happening somewhere. What changes is where that extra work lands: as more happening at once, across many sessions handled in parallel on dedicated hardware, instead of one more sequential pass every single session has to survive before it gets through.",
  },
];
```

Formatting notes:

- `strong` labels are short, period-terminated declarative phrases, matching `PIPELINE_POINTS`/`MITM_POINTS`/
  `ECH_POINTS`' convention exactly. Point 2's label is deliberately where the named architecture term first
  appears in running copy — mirroring how `PIPELINE_POINTS`' own labels ("App-ID.", "User-ID.", "Content-ID.")
  are themselves the vocabulary being taught, not just descriptions of it.
- Every acronym reused in this new copy (`App-ID`, `User-ID`, `Content-ID`) already exists in `ACRONYMS`
  (`src/data/acronyms.ts`) and needs no new entry. The one genuinely new term, `SP3`, is added in §5 below —
  **do not merge §4 without §5**, or `SP3` will render as plain, un-tooltipped text in the footnote paragraph
  (§4b).
- No other acronyms are introduced. Deliberately generic, unabbreviated phrasing is used for the older-model
  engines this content contrasts against — "antivirus scanning," "intrusion detection," "application control" —
  rather than introducing `AV`/`IDS`/`IPS` as new vocabulary the site would then need to define and maintain
  tooltips for. This matches the established restraint `phase-2a-ech/content-plan.md` §9 used in not naming
  HPKE, and `phase-2c-quic/content-plan.md` §8 used in not naming "Happy Eyeballs."
- `key={p.strong}` matches the existing `PIPELINE_POINTS.map` / `MITM_POINTS.map` / `ECH_POINTS.map` key
  strategy — safe here too since all three labels are unique.

### 4b. New JSX

Insert the following immediately after the existing "Three lenses the firewall applies" `Card`'s closing
`</Card>` tag (after line 88) and before the blank line that currently precedes the "A man-in-the-middle, on
purpose" `Card` (line 90):

```tsx
      <Card className="mb-6">
        <h3 className="font-sans font-semibold text-base mb-2">One pass, not one per feature</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Look back at those three lenses, then add one more thing this chapter already covers: a firewall doing forward proxy or inbound inspection is decrypting that traffic too, on every packet, before any of the three lenses even get a look at it. If a firewall is doing this much work on every packet, why doesn't switching more of it on make everything slower?" />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line mb-3.5">
          {SINGLE_PASS_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
        <p className="text-ink-faint text-[13px]">
          <AutoLink text="Single-pass parallel processing, sometimes abbreviated SP3, is this same vendor's branded name for this specific architecture, the same situation as App-ID, User-ID, and Content-ID above. Other firewalls run their own single-traversal designs under different names and different implementation details, but the general shape, doing this work together instead of stacking it in sequence, shows up across most modern firewall architectures in some form, not just this one." />
        </p>
      </Card>
```

Notes:

- This `Card` carries `className="mb-6"`, matching every other top-level `Card` in this file (`"Three lenses"`,
  `"MITM"`, `"ECH"` all use the same class) — spacing convention, not a new pattern.
- Structure deliberately mirrors "Three lenses the firewall applies" exactly: intro paragraph → bulleted list
  (with `mb-3.5` on the `<ul>` since a footnote follows it) → a smaller, `text-ink-faint text-[13px]`
  vendor-attribution footnote. This is the same shape for the same reason: both cards teach a vendor-branded
  concept and both need the disclosure to land right after the concept itself, not detached from it.
- The footnote's "above" reference ("the same situation as App-ID, User-ID, and Content-ID above") is accurate
  given this `Card`'s position directly following "Three lenses" — if the Implementer or a future edit ever
  moves this `Card` elsewhere, that wording needs to change to match (e.g. "earlier in this chapter").

### 4c. Resulting order inside `<section id="ch3">` after this change

1. `SectionHead` (unchanged)
2. `HandshakeStepper` (unchanged)
3. "Three lenses the firewall applies" `Card` (unchanged)
4. **New:** "One pass, not one per feature" `Card`
5. "A man-in-the-middle, on purpose" `Card` (unchanged)
6. "What changes next: Encrypted Client Hello" `Card` (unchanged)
7. Existing closing paragraph (Chapter 4 bridge, unchanged)

---

## 5. Exact change: `src/data/acronyms.ts`

Insert this one line immediately after the existing `'Content-ID': 'Content Identification',` line (currently
the last entry, line 34) and before the closing `};`:

```ts
  SP3: 'Single Pass Parallel Processing',
```

Resulting order for the bottom of the file: `...`, `'App-ID'`, `'User-ID'`, `'Content-ID'`, `SP3`. Grouped with
the other three vendor-branded firewall-architecture terms, matching the grouping rationale used in every prior
integration pass (keeping thematically adjacent terms visually adjacent for future editors; the dictionary is a
flat object so key order has no effect on `AutoLink`'s matching).

Verified no collision: `SP3` doesn't appear as a substring of any existing key, and no existing key appears as a
substring of `SP3`. `AutoLink`'s `\b` word-boundary regex matching (`src/lib/autoLink.tsx`) handles the digit
correctly the same way it already handles alphanumeric-mixed keys.

**Value choice:** `'Single Pass Parallel Processing'` is given as the plain tooltip value, matching every other
entry's flat historical-expansion-string convention (same two-tier pattern `phase-2c-quic/content-plan.md` §5
used for `QUIC`: compact `ACRONYMS` tooltip, richer vendor-attribution nuance in the Glossary instead, §6 below).

---

## 6. Exact change: `src/data/glossary.ts`

### 6a. `firewall` category

Insert this one new entry immediately after the existing `'Content-ID'` entry (line 15) and before the existing
`'Threat prevention'` entry (line 16):

```ts
    { term: 'SP3 (single pass parallel processing)', def: "Doing the networking lookup, policy match, App-ID, User-ID, Content-ID, and decryption for a piece of traffic together in one traversal, instead of a separate full pass per feature, with many sessions handled in parallel across dedicated hardware. SP3 is this same vendor's branded name for this specific architecture (see Chapter 3); other firewalls run their own single-traversal designs under different names." },
```

**Placement rationale:** directly after `Content-ID` (the last of the three-lenses trio) and before `Threat
prevention`, keeping the four App-ID/User-ID/Content-ID/SP3 entries — all describing pieces of the same
single-pass pipeline — contiguous in the glossary list, mirroring how `5-tuple` and `Connection ID` sit together
at the end of the same category for the same reason (adjacent facts about the same mechanism, filed next to each
other).

**Category choice:** `firewall`, not `tls`. Matches `App-ID`/`User-ID`/`Content-ID`/`Threat prevention`, all
firewall-internals/processing-pipeline facts, not certificate or handshake-crypto facts — the same category
split rationale `phase-2c-quic/content-plan.md` §6 used for `5-tuple`/`Connection ID` vs. `QUIC`/`UDP`/`HTTP/3`.

Verified against a full read of `glossary.ts`: `SP3` does not exist anywhere in any of the three categories
(`firewall`, `tls`, `vpn`) today.

**Implementer note on quoting:** the `def` string above uses double-quote delimiters with no inner double quotes
that need escaping (unlike `QUIC`'s or `UDP`'s glossary entries in the same file) — a plain double-quoted string
is correct as written, no special quoting handling required.

---

## 7. Coordination note (Simulation/Interaction Designer)

This plan's content stands on its own. The new `Card` in §4 is complete, self-contained prose requiring no other
component, exactly as written, regardless of what the Designer proposes or whether anything ships alongside it.

**No assumption is made about scale or shape, matching the posture `phase-2c-quic/content-plan.md` §7 took for
the same situation (a research-ideas.md entry with no pre-sketched mechanic).** research-ideas.md #16 itself
frames this material as a "how" footnote to mechanics the site already teaches, which could argue for no
interactive treatment at all — the prose alone may be sufficient, the same way `Chapter2WhatItDoes.tsx`'s static
bullets or Chapter 3's own MITM card carry their point without an interactive. But "small in prose" doesn't
necessarily mean "not interactive" — a visual contrast between chained sequential passes and one parallel
traversal (for example, an animated comparison of packets queuing through several boxes in series versus moving
through one box with several lookups happening inside it at once) is exactly the kind of before/after mechanic
that tends to land better shown than described, and the Sandbox's existing terminal-log feedback mechanism
(`Sandbox.tsx`'s `LogEntry`/console, the one place on the site motion is used as feedback rather than decoration
per `CLAUDE.md`) is a plausible natural home for a "how many passes did that take" readout if the Designer's
concept ends up needing a place to render results. All of this is genuinely open — this plan is not ranking these
possibilities or suggesting a small widget is the likely or preferred outcome, per the explicit instruction
carried forward from Phase 1 not to make that call unilaterally.

**If something is added, the natural slot inside this plan's own structure is directly below the new `Card` in
§4b and above the "A man-in-the-middle, on purpose" `Card`** — keeping any interactive payoff adjacent to the
prose that sets it up, the same adjacency principle §2 used to justify this `Card`'s own placement. That said, if
the Designer's concept is better served by living in or near the Sandbox instead (plausible, given the Sandbox's
console-log mechanism and its own existing "instant verdict" simplification footnote sit right next to this
material conceptually), that is entirely the Designer's and/or project owner's call — this plan's chapter
placement decision (§1–§2) is about where the *prose* belongs, not a constraint on where an *interactive* must
live.

`docs/integration/phase-2d-single-pass/` contained no other files when this plan was written — the parallel
Designer's output doesn't exist yet, or wasn't visible to this agent.

This agent is not offering an opinion on whether an interactive treatment is warranted here, matching
`phase-2c-quic/content-plan.md` §7's final posture for the identical situation (a topic with no pre-suggested
mechanic) rather than the earlier two phases' practice of flagging a preferred-but-not-decided option.

## 8. Deliberate scope calls made in this plan (flagging so nothing reads as an oversight)

- **`Sandbox.tsx` and `sandboxScenarios.ts` are untouched.** §1 explains the content reasoning (the Sandbox's
  `SectionHead` is a tightly-scoped single point, and it already carries a related-but-distinct footnote of
  almost the same size and shape); §7 adds the coordination reasoning (leaving the file's structure free of
  anything but the Designer's eventual work, if any). No cross-reference or footnote addition to `Sandbox.tsx`
  is proposed by this plan — if a future pass wants a one-line pointer from the Sandbox's existing "real
  firewalls usually need to see a few packets..." footnote back to this new Chapter 3 `Card`, that's a small,
  separate, easy addition, not included here since neither passage requires it to read correctly on its own.
- **No specific vendor hardware or product name is used anywhere in the new copy** ("dedicated hardware,"
  "processing cores," never a specific chip, appliance, or dataplane name) — matching the established pattern
  from every prior integration pass of not naming a specific product beyond the already-established App-ID/
  User-ID/Content-ID/SP3 vocabulary itself, and not making claims that go stale as vendor hardware changes.
- **`AV`/`IDS`/`IPS` are deliberately not introduced as new acronym vocabulary.** The "old model" point (§4a,
  point 1) describes antivirus scanning, intrusion detection, and application control in full, unabbreviated
  words specifically to avoid adding three new `ACRONYMS` entries this content doesn't otherwise need — see
  §4a's formatting notes for the precedent this follows.
- **The claim is deliberately not "more inspection is free."** §4a's third point states plainly that more checks
  running is still more computation happening, and only the *sequential-pass* cost, not all cost, goes away.
  This was checked against the site's established discipline around not overstating what a mechanism actually
  buys you (`content-strategy.md` Findings C3-2 and C3-4 flagged exactly this failure mode elsewhere in Chapter
  3's existing content before it was corrected) — this plan does not repeat that mistake for a brand-new claim.
- **Networking/zone lookup is folded into "policy match" rather than named as its own separate step.** The
  research doc's own framing lists "networking lookup, policy match, application identification, and threat/
  content signature matching" as four separate pipeline stages. This plan's copy compresses that to the three
  lenses (already-taught vocabulary) plus decryption plus policy match, deliberately not introducing "networking
  lookup" or "zone lookup" as new unexplained terminology this chapter has no other reason to define — the goal
  is answering the reader's live question about the three lenses plus decryption, not a complete pipeline
  inventory.

---

## 9. Full draft prose (final copy, for reference — identical to what's embedded in §4's code)

**Card heading:** One pass, not one per feature

**Card intro paragraph:**

> Look back at those three lenses, then add one more thing this chapter already covers: a firewall doing forward proxy or inbound inspection is decrypting that traffic too, on every packet, before any of the three lenses even get a look at it. If a firewall is doing this much work on every packet, why doesn't switching more of it on make everything slower?

**Card points:**

- **The old model stacked a full pass per feature.** Older firewalls ran each inspection job as its own separate engine: one pass for antivirus scanning, another for intrusion detection, another for application control, and so on, with traffic queued through every one of them in turn before it could move on. Switch on one more feature and you added one more full pass over the same traffic, so protection and delay scaled together.
- **Single-pass parallel processing does the decoding once, then runs every check together.** Decrypt the traffic once, decode it once, then run the policy match and all three lenses, App-ID, User-ID, and Content-ID, against that same single pass at the same time instead of one after another. Turning on User-ID doesn't add a second decrypt, and turning on Content-ID doesn't add a third pass behind it; everything enabled rides through in the same traversal the traffic was already making.
- **It scales by running many sessions in parallel, not by cutting any one check short.** None of this makes an individual check instant, more inspection checks running is still more computation happening somewhere. What changes is where that extra work lands: as more happening at once, across many sessions handled in parallel on dedicated hardware, instead of one more sequential pass every single session has to survive before it gets through.

**Card footnote (vendor attribution):**

> Single-pass parallel processing, sometimes abbreviated SP3, is this same vendor's branded name for this specific architecture, the same situation as App-ID, User-ID, and Content-ID above. Other firewalls run their own single-traversal designs under different names and different implementation details, but the general shape, doing this work together instead of stacking it in sequence, shows up across most modern firewall architectures in some form, not just this one.

No new closing bridge paragraph is added — this `Card` sits between two existing `Card`s and doesn't touch
either of their surrounding transitions.

---

## 10. Order of implementation (for the Implementer)

1. `src/data/acronyms.ts` — add the one `SP3` entry (§5).
2. `src/data/glossary.ts` — add the one `firewall`-category entry (§6a).
3. `src/components/chapters/Chapter3Handshake.tsx` — add `SINGLE_PASS_POINTS` (§4a), then insert the new `Card`
   (§4b) between the existing "Three lenses the firewall applies" and "A man-in-the-middle, on purpose" `Card`s.
4. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
5. Visual check in `npm run dev`: confirm the new card renders as the second `Card` in Chapter 3, after "Three
   lenses the firewall applies" and before "A man-in-the-middle, on purpose"; confirm hovering `App-ID`,
   `User-ID`, `Content-ID` (inside the new copy) and `SP3` (inside the footnote) all show correct tooltips;
   confirm nothing in the existing "Three lenses," "MITM," or "ECH" cards visually changed; confirm the
   Chapter 3 → Chapter 4 bridge paragraph at the very end of the chapter still renders immediately after the ECH
   card, undisturbed.

---

## 11. Implementation status

All of this plan was implemented as written, with two deliberate additions beyond this doc's original text —
both owner-approved, not oversights, flagged here the same way `phase-2c-quic/content-plan.md` flags its own
deviations.

- ✅ Implemented — `src/data/acronyms.ts`: `SP3` entry added exactly as specified in §5.
- ✅ Implemented — `src/data/glossary.ts`: the one `firewall`-category `SP3` entry added exactly as specified in
  §6a, in the placement described there (directly after `Content-ID`, before `Threat prevention`).
- ✅ Implemented — `src/components/chapters/Chapter3Handshake.tsx`: `SINGLE_PASS_POINTS` (§4a) and the new "One
  pass, not one per feature" `Card` (§4b) added verbatim, in the exact position specified (between "Three lenses
  the firewall applies" and "A man-in-the-middle, on purpose").
- ✅ Implemented (owner addition, beyond this plan's original scope) — **`SinglePassViz` placed directly below
  the new `Card`, inside Chapter 3, per project-owner resolution.** §7's coordination note (and §1's own
  reasoning) deliberately left open whether the parallel Designer's interactive belonged here or near the
  Sandbox, and §7 explicitly floated the Sandbox as a plausible home if the Designer's concept ended up shaped
  that way. The Designer's simulation-design.md §5 did in fact recommend the Sandbox intro. The project owner
  resolved that open question in favor of Chapter 3 instead — directly below this plan's new `Card` and above
  "A man-in-the-middle, on purpose" — to keep the prose and its interactive payoff adjacent, matching the
  locality pattern every prior phase in this series has used (ECH's toggle + card both in Chapter 3, PQ crypto's
  toggle + card both in Chapter 4, QUIC's viz + cards all in Chapter 6). This is a resolution of an
  intentionally-open question, not a deviation from a decided one.
- ✅ Implemented (owner addition, beyond this plan's original scope) — **one-line forward-reference added to
  `src/components/sandbox/Sandbox.tsx`'s existing italic footnote**, pointing back to Chapter 3's new content.
  §8 explicitly named this as "a small, separate, easy addition" this plan chose not to include, not a gap in
  the reasoning — the project owner asked for exactly that small addition once the Designer's simulation-design.md
  §3.5 identified that the new component's caveat text pays off this same footnote. `Sandbox.tsx` and
  `sandboxScenarios.ts` remain otherwise untouched, consistent with §8's original scope call.
- ✅ Verified — `npx tsc -b`, `npm run lint` (oxlint), and `npm run build` all pass clean with no errors.
