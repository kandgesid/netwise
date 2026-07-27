# Content plan: research-ideas.md #4 → Chapter 7 (Zero Trust Architecture)

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).
Scope: research-ideas.md candidate **#4** ("Zero Trust Architecture (a genuine Chapter 7 candidate)"), landed
as a genuine new chapter — `src/components/chapters/Chapter7ZeroTrust.tsx`, inserted into the page between
Chapter 6 (Forward Proxy) and the Sandbox.

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

---

## Implementation status (Implementer, post project-owner review)

All items below were executed. Three owner resolutions were applied on top of this plan and the parallel
`simulation-design.md`; see each item for which resolution governed it.

- **Owner resolution — placement synthesis (applies to §4/§10 as a whole):** neither this doc nor
  `simulation-design.md` alone specifies the final combined Card/interactive order — this was resolved by the
  project owner. The five `Card`s below stay in the order this doc specifies in §4, but
  `simulation-design.md`'s two new interactives are inserted between them:
  `SectionHead` → Card 1 → **`ContinuousVerificationViz`** → Card 2 → Card 3 → **`TrustSignalsViz`** → Card 4 →
  Card 5 → closing bridge paragraph (unchanged). This supersedes §4's originally-shipped code block, which
  predates the Designer's output and contains no interactives. Implemented as
  `src/components/chapters/Chapter7ZeroTrust.tsx`.
- §6c (`src/data/acronyms.ts`, add `MFA`) — ✅ Implemented.
- §6c (`ZTA`) — ❌ Skipped (reason: per owner resolution #3 — this chapter's actual shipped prose, per §4/§9,
  never abbreviates to "ZTA," it always writes "Zero Trust" in full, so per `simulation-design.md` §6.3's own
  contingent framing ("add it only if the prose ends up using the bare initialism more than once"), the
  contingency never triggered).
- §6d (`src/data/glossary.ts`, `zerotrust` category + union member) — ✅ Implemented.
- §6e (`src/components/reference/Glossary.tsx`, new `CAT_OPTIONS` entry) — ✅ Implemented.
- §4 (`src/components/chapters/Chapter7ZeroTrust.tsx`) — ✅ Implemented, with the placement-synthesis resolution
  above applied instead of §4's original un-modified Card order.
- §5 (`src/App.tsx` import + render) — ✅ Implemented.
- §6 (`src/components/layout/Header.tsx` nav link) — ✅ Implemented.
- §6a (`src/components/chapters/Chapter6ForwardProxy.tsx` closing paragraph) — ✅ Implemented.
- §6b (`src/components/sandbox/Sandbox.tsx` `SectionHead` clause) — ✅ Implemented.
- §9 (full draft prose) — ✅ Implemented verbatim as shipped chapter copy.

`npx tsc -b`, `npm run lint` (oxlint), and `npm run build` all pass clean after these changes.

**This phase is different in kind from Phases 1 and 2a–2d.** Those four were section-level additions to chapters
that already existed. This is the first genuinely new chapter since the original six shipped. It has no existing
"neighborhood" to slot into — the whole chapter has to earn its place the way Chapters 1–6 originally did, per
`docs/content-strategy.md`'s standard.

**Hard scope boundary, honored throughout this plan:** research-ideas.md's own summary table notes entry #7
("ZTNA vs. VPN — modernizing remote access") "pairs with #4," but #7 is marked `NOT NOW` by the project owner and
is out of scope for this or any phase. This chapter does not mention VPN, remote access, tunnels, or ZTNA
anywhere, and does not assume that pairing exists. It stands completely alone. See §8 for the specific checks run
to confirm this.

**Coordination posture, carried forward from `phase-2c-quic` §7 and `phase-2d-single-pass` §7:** this topic has no
pre-suggested interactive mechanic, and a parallel Simulation/Interaction Designer is independently evaluating
whether one belongs here. Per the explicit correction carried since Phase 1 ("do not unilaterally decide whether
this topic gets an interactive treatment"), this plan takes the same hands-off posture on that question — see §7.

---

## 1. Narrative arc: how this chapter reframes Chapters 1–6 without repudiating them

**The core design problem, stated plainly:** Chapters 1–6 build an entire mental model around location. Chapter
1's `Zone` glossary entry defines "inside" and "outside" as *the* thing a firewall's policy is built around.
Chapter 5's decryption policy and the Sandbox's port/App-ID/User-ID rules all still, implicitly, take for granted
that a connection's place in the topology (which zone, which interface, which side of the perimeter) is a
meaningful starting signal. Zero Trust's actual claim is narrower and more specific than "the perimeter model was
wrong" — it's that **location was always a proxy for trust, not trust itself**, and that proxy stopped being good
enough on its own. This chapter has to land that distinction honestly or it reads as saying the first six chapters
taught something false, which they didn't.

**How the chapter avoids that trap, concretely:**

- **Card 1 opens by saying so directly**, before making any Zero Trust argument at all: *"None of this is a knock
  on the zone model from Chapter 1. Zones, perimeters, and the whole decrypt-and-inspect pipeline from Chapters 2
  through 6 are still exactly how a huge amount of real traffic gets decided on, today, in production."* This is
  stated first, not appended as a caveat afterward, so the reader never has a window where they might reasonably
  conclude the earlier chapters were wrong.
- **Card 5 closes the chapter by resolving it a second time, explicitly and mechanically**, not just as a
  reassuring sentiment: it names exactly which earlier mechanisms (Chapter 5's decryption policy rule, Chapter 3's
  App-ID/User-ID/Content-ID, Chapter 1's zones) are "still doing real, necessary work," and states plainly that
  Zero Trust is usually *implemented using those same enforcement points*, not a separate box that replaces them.
  This is the single most load-bearing content decision in the chapter, given the assignment's explicit
  instruction not to imply the first six chapters taught something wrong.
- **The throughline concept the whole chapter hangs on is one the reader already has:** Chapter 3's `User-ID`
  ("maps traffic to an actual signed-in user identity, so policy can target a specific person rather than just an
  IP address") is already, quietly, a Zero-Trust-shaped idea sitting inside a zone-based chapter. Card 3 names this
  explicitly ("Chapter 3's User-ID already answered one piece of this") rather than introducing identity-based
  policy as if it were a brand-new concept. This is the guided-discovery move `content-strategy.md`'s intro
  describes as the site's best pattern: the reader isn't told something wholly new out of nowhere, they're shown
  that a piece they already have generalizes further than they'd been told.
- **The Sandbox's own closing argument is retroactively framed as evidence, not decoration.** The Sandbox's
  `SectionHead` already states, unprompted, that "a rule written for a specific person can enforce things neither
  of the others can" (port and App-ID). That's Zero Trust's central claim (identity beats location/port as a trust
  signal), already sitting on the page, already provable by clicking a button, before this chapter was ever
  written. Chapter 7's closing bridge (§4, final paragraph) and a light touch to the Sandbox's own opening (§6)
  make that connection explicit instead of leaving it as an unremarked coincidence.

**Why this is sized as a full chapter, not a section bolted onto Chapter 1 or Chapter 6:** research-ideas.md #4
itself calls this "the most conceptually significant thing a Chapter 6 graduate hasn't been told yet" and sizes it
as "Full new chapter (natural 'Chapter 7')." Checked against the actual chapter structure before accepting that
sizing: Zero Trust needs (a) the boundary/motivation problem, (b) the reframe itself, (c) what actually gets
checked, (d) what "smaller than a zone" means in practice, and (e) the honest coexistence statement — five
distinct claims, each needing room, matching the density of Chapter 6 (also five `Card`s) rather than the
single-card additions the four prior phases made. Bolting this onto Chapter 1 would force the coexistence
resolution (which depends on everything Chapters 2–6 taught) to live before those chapters exist; bolting it onto
Chapter 6 would bury a capstone-scale reframe inside a chapter that's already specifically about forward-proxy
mechanics, not architecture-level framing.

---

## 2. Chapter structure and pacing

Five `Card`s, each a single distinct claim, ordered so each one earns the next (per `content-strategy.md`'s
stated bar):

1. **When location stops being proof** — the motivating problem. Recaps the zone model honestly, then names three
   concrete ways location-based trust breaks down. No solution yet, only the crack.
2. **Verify every request, not just the first one** — the reframe itself. Defines Zero Trust, names its
   "never trust, always verify" shorthand, and states the one structural change that actually matters: checked
   continuously instead of once at the edge. Grounds it as a vendor-neutral, NIST-formalized architecture
   (contrast with App-ID/User-ID/Content-ID/SP3, which needed vendor-attribution disclaimers — this doesn't).
3. **Three signals, checked every time** — what actually gets evaluated: identity, device posture, context.
   Explicitly built on top of Chapter 3's `User-ID` rather than introduced cold. This is the card most likely to
   be a natural home for an interactive if the Designer wants one (see §7) — three independently-toggleable
   signals feeding one pass/fail outcome is a similar shape to the Sandbox's own port/App-ID/User-ID toggle.
4. **Smaller than a zone** — least privilege and micro-segmentation, i.e. what changes about *scope* once identity
   and device are the checked signals instead of just "which zone." Explicitly reuses Chapter 1's `Zone` concept
   rather than introducing scope as an unrelated new idea.
5. **Zero Trust doesn't replace the firewall** — the honest coexistence resolution the assignment specifically
   requires. Names the exact earlier mechanisms (Ch1 zones, Ch3 App-ID/User-ID/Content-ID, Ch5 decryption policy)
   that keep doing real work, and states plainly that Zero Trust is usually implemented through those same
   enforcement points, continuously re-asked, not a separate replacement system.

This mirrors the "one idea earns the next" pattern `content-strategy.md` credits Chapter 1 (checkpoint metaphor →
immediately paid off) and Chapter 3 (MITM question raised → resolved by trust/authorization) with doing well, and
explicitly avoids the failure mode it flags in Chapter 4 (dense back-to-back claims with no connective tissue) —
every card here opens by referencing something the reader already has (Chapter 1's zone, Chapter 3's User-ID,
Chapter 5's rule mechanism) before adding anything new.

No chapter-specific `src/data/*.ts` file is created — see §9 for why.

---

## 3. Exact chapter identity, nav wiring, and page placement

| Item | Value |
|---|---|
| Section `id` | `ch7` |
| `SectionHead eyebrow` | `Chapter 7` |
| `SectionHead title` | `Zero Trust: verify every time` |
| Nav label (`Header.tsx`) | `Zero Trust` |
| Nav href | `#ch7` |
| Component file | `src/components/chapters/Chapter7ZeroTrust.tsx` |
| Component export | `export function Chapter7ZeroTrust()` |
| Page position | Between `<Chapter6ForwardProxy />` and `<Sandbox />` in `src/App.tsx` |
| Nav position | Between the `#ch6` link and the `#sandbox` link in `NAV_LINKS` |

`scroll-margin-top` needs no new CSS — `src/index.css`'s existing `section[id] { scroll-margin-top: 88px; }` rule
already applies to any `section` with an `id`, per CLAUDE.md's "mechanical" recipe.

---

## 4. New file: `src/components/chapters/Chapter7ZeroTrust.tsx`

Full file contents, ready to create as-is:

```tsx
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { AutoLink } from '../../lib/autoLink';

const BOUNDARY_POINTS = [
  {
    strong: "A device doesn't stay trustworthy just because it's inside.",
    text: "A laptop that passed every check on the way in can still get compromised after it's already inside the zone: phished, infected, or handed to someone it shouldn't have been handed to. The zone it's sitting in has no way to notice that anything changed.",
  },
  {
    strong: "Being 'inside' has usually meant broad reach, not narrow reach.",
    text: "Once a device or user cleared the perimeter, most zone-based designs granted access to a lot of what else lived in that same zone, not just the one thing that device actually needed. Convenient to configure, expensive the moment anything inside goes wrong, since whatever's compromised can usually reach far more than it should be able to.",
  },
  {
    strong: 'A stolen identity walks straight through, zone and all.',
    text: "A phished password or a reused login doesn't care which zone it's presented from. Once it's accepted, the zone treats it exactly like it would treat the legitimate person it's impersonating.",
  },
];

const VERIFY_POINTS = [
  {
    strong: 'Checked every time, not once.',
    text: "A zone-based rule typically gets evaluated once, when a connection starts. Zero Trust keeps asking the same question for as long as that access lasts, not just at the start of it, so a device or identity that stops looking trustworthy partway through doesn't keep coasting on a decision made minutes or hours earlier.",
  },
  {
    strong: 'Location becomes one input, not the deciding one.',
    text: "Being inside the office network or a trusted zone can still be one thing a policy weighs, it just stops being sufficient on its own. A request from inside the building with no valid identity behind it gets treated the same as one with no valid identity from anywhere else.",
  },
  {
    strong: 'Formalized, not improvised.',
    text: "This isn't one vendor's marketing framing. NIST published a formal Zero Trust architecture standard, SP 800-207, years ago now, describing the same core model in vendor-neutral terms, and it's treated as baseline enterprise guidance today, not an emerging idea.",
  },
];

const SIGNAL_POINTS = [
  {
    strong: "Identity: who's actually asking.",
    text: "The same idea Chapter 3's User-ID already introduced, extended to every request instead of being one lens among several. Proven with more than a password alone where possible, MFA being the common concrete example, since a password by itself is exactly what a stolen identity from the last card gets through with.",
  },
  {
    strong: "Device posture: what they're asking from.",
    text: "Not just who's logged in, but whether the device they're using is in a state worth trusting: patched, encrypted, running whatever security software the organization requires, not one that's been tampered with. The same identity, on a healthy managed laptop versus an unpatched personal phone, isn't treated as the same request.",
  },
  {
    strong: 'Context: does this specific request make sense right now.',
    text: "The same identity, on the same healthy device, requesting the same resource it requests every day, reads differently than that identity suddenly requesting something it's never touched before, at an hour it's never logged in at, from somewhere it's never logged in from. None of those signals alone proves much. Together, continuously, they're what a one-time perimeter check never had a chance to see.",
  },
];

const SCOPE_POINTS = [
  {
    strong: 'Least privilege: access to the one thing needed, not everything nearby.',
    text: "Instead of a zone-wide allow once someone's in, access gets scoped to the specific application or resource a task actually requires. Nothing broader, by default.",
  },
  {
    strong: 'Micro-segmentation: zones, cut much smaller.',
    text: "The same idea Chapter 1's Zone already covers, applied at a far finer grain, down to individual applications or resources rather than a handful of broad network segments, so reaching one thing doesn't imply reaching whatever else happens to sit nearby.",
  },
  {
    strong: 'Why it matters if any single check above fails.',
    text: "A stolen identity or a compromised device that gets through anyway still only reaches the one narrow thing it was granted, not everything else that used to share a zone with it. Identity, device posture, and context are each individually beatable. Keeping any one failure small is the actual payoff here, not preventing every failure outright.",
  },
];

const COEXIST_POINTS = [
  {
    strong: 'Zero Trust is a stance about when and for whom, not a replacement box.',
    text: "It isn't a product that swaps out for a firewall. It's a set of ordering and scope decisions layered onto enforcement points that, in a lot of real deployments, are the exact same firewalls, proxies, and policy engines this site already walked through, now factoring in identity and device signals continuously instead of checking a zone once.",
  },
  {
    strong: 'The same enforcement points, asked to check more, more often.',
    text: "A decryption policy rule from Chapter 5 that used to match on category or app can just as easily match on a verified identity and a device-posture signal too, then get re-evaluated on a schedule instead of once per session. The mechanism, an ordered rule list, first match wins, isn't new. What changes is what goes into a match, and how often that decision gets re-asked.",
  },
  {
    strong: 'Zones and Zero Trust solve different-sized problems, side by side.',
    text: "A zone is still a reasonable way to describe what a whole network segment is for. Zero Trust is the finer-grained layer underneath it, deciding whether one specific request, from one specific identity and device, should be trusted with one specific resource, right now. Most real deployments run both at once, not one instead of the other.",
  },
];

export function Chapter7ZeroTrust() {
  return (
    <section id="ch7" className="max-w-[1080px] mx-auto px-8 py-18">
      <SectionHead eyebrow="Chapter 7" title="Zero Trust: verify every time">
        Chapter 1 opened with a firewall deciding what counts as 'inside' a zone versus 'outside' it,
        then trusting a lot of what happens next based on that answer alone. Chapters 2 through 6 were
        about what a firewall does once traffic reaches that boundary: decrypting it, inspecting it,
        deciding what to do with it. This chapter asks what changes once being inside the zone stops
        being proof of anything by itself.
      </SectionHead>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">When location stops being proof</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="None of this is a knock on the zone model from Chapter 1. Zones, perimeters, and the whole decrypt-and-inspect pipeline from Chapters 2 through 6 are still exactly how a huge amount of real traffic gets decided on, today, in production. The problem is narrower than 'the old way was wrong': location was always a proxy for trust, not trust itself, and the gap between the two got more expensive to ignore." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {BOUNDARY_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Verify every request, not just the first one</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Zero Trust is the industry's name for closing that gap. The core idea, sometimes summarized as 'never trust, always verify': no request gets automatic trust just because of where it came from, inside the zone or outside it. Every access attempt gets checked against who's actually asking and what they're asking from, every time, not once at the edge and then coasted on for the rest of the session." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {VERIFY_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Three signals, checked every time</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Chapter 3's User-ID already answered one piece of this: knowing who's actually sending traffic, not just where it came from. Zero Trust asks the same kind of question of every request, and adds two more signals alongside it." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {SIGNAL_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Smaller than a zone</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Chapter 1's Zone answered a broad question: what's inside versus outside. Zero Trust asks a narrower one underneath it: even inside a zone that's already been let in, should this specific identity, on this specific device, reach this specific resource, or just some of what happens to share its zone?" />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {SCOPE_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Zero Trust doesn't replace the firewall</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Every rule the last six chapters covered is still doing real, necessary work. A decryption policy from Chapter 5 still has to run before anything downstream can be inspected at all. App-ID, User-ID, and Content-ID from Chapter 3 are still how a firewall answers what actually is this, who's actually sending it, and is anything in it dangerous. Zones from Chapter 1 haven't gone anywhere either." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {COEXIST_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-ink-faint text-[13.5px] mt-4">
        You've now seen both halves: the zone-based, decrypt-and-inspect model from Chapters 1 through
        6, and the identity-and-device-checked model this chapter adds on top of it. Time to build a
        rule yourself and watch the difference between a check keyed to a port and one keyed to an
        actual identity.
      </p>
    </section>
  );
}
```

Formatting notes:

- Every `Card` uses `className="mb-5"`, matching `Chapter6ForwardProxy.tsx`'s spacing convention exactly (the
  chapter this one reads immediately after).
- Every acronym used (`MFA`, `NIST`) needs an `ACRONYMS` entry — `NIST` already exists; `MFA` is new, added in §6c.
  `App-ID`, `User-ID`, `Content-ID` already exist and need no changes.
- `key={p.strong}` matches the `.map` key convention used in every other chapter file (`PIPELINE_POINTS`,
  `MITM_POINTS`, `ECH_POINTS`, `QUIC_POINTS`, `PQ_POINTS`) — safe here too, all `strong` labels in each array are
  unique.
- No literal double-quote (`"`) characters appear anywhere in rendered copy or in any `<AutoLink text="...">`
  literal-string attribute — every nested emphasis phrase (`'inside'`, `'the old way was wrong'`, `'never trust,
  always verify'`) uses single quotes instead, so no JSX-attribute-string escaping is needed anywhere in this file.
  Every `const` array below uses double-quote (`"`) string delimiters throughout, since most of the copy contains
  contractions (`doesn't`, `isn't`, `it's`) — this matches the delimiter choice already used for `MITM_POINTS` and
  `ECH_POINTS` in `Chapter3Handshake.tsx` for the same reason.
- No new visual/interactive component is created or referenced by this file — see §7. If the Designer's concept
  ends up living inside this chapter, §7 names the specific insertion point.

---

## 5. Exact modification: `src/App.tsx`

Two one-line changes.

**Add the import**, immediately after the existing `Chapter6ForwardProxy` import (currently line 9) and before the
`Sandbox` import (currently line 10):

```tsx
import { Chapter7ZeroTrust } from './components/chapters/Chapter7ZeroTrust';
```

**Add the render**, immediately after `<Chapter6ForwardProxy />` (currently line 28) and before `<Sandbox />`
(currently line 29):

```tsx
      <Chapter7ZeroTrust />
```

Resulting page order: `Header` → `Hero` → `Chapter1Firewall` → `Chapter2WhatItDoes` → `Chapter3Handshake` →
`Chapter4KeyExchange` → `Chapter5DecryptionPolicies` → `Chapter6ForwardProxy` → **`Chapter7ZeroTrust`** →
`Sandbox` → `CertificateTabs` → `Glossary` → `Footer`.

---

## 6. Exact modification: `src/components/layout/Header.tsx`

One line, inserted into `NAV_LINKS` immediately after the `#ch6` entry and before the `#sandbox` entry:

```tsx
  { href: '#ch7', label: 'Zero Trust' },
```

Resulting `NAV_LINKS` order:

```tsx
const NAV_LINKS = [
  { href: '#ch1', label: 'Firewall' },
  { href: '#ch2', label: 'What it does' },
  { href: '#ch3', label: 'Handshake' },
  { href: '#ch4', label: 'Key exchange' },
  { href: '#ch5', label: 'Policies' },
  { href: '#ch6', label: 'Forward proxy' },
  { href: '#ch7', label: 'Zero Trust' },
  { href: '#sandbox', label: 'Sandbox' },
  { href: '#reference', label: 'Reference' },
  { href: '#glossary', label: 'Glossary' },
];
```

`'Zero Trust'` (11 characters) is comparable in length to `'Forward proxy'` (14) and `'What it does'` (13), so it
doesn't risk breaking the nav's `no-scrollbar` horizontal layout differently than the existing longest labels
already do.

---

## 6a. Exact modification: `src/components/chapters/Chapter6ForwardProxy.tsx`

**Why this needs to change:** Chapter 6 currently closes with *"You've now read through every piece firewalls use
to make a decision. Time to build one yourself and see it decide in real time."* — a direct bridge straight into
the Sandbox. Once Chapter 7 is inserted between them, that promise ("time to build one yourself," immediately
next) becomes inaccurate: the Sandbox is no longer the very next thing on the page. Chapter 7's own closing
paragraph (§4, final `<p>`) now carries that "time to build one yourself" job instead, so Chapter 6's closing needs
to bridge into Chapter 7 instead of skipping past it.

**Exact change** — replace the second closing `<p>` (currently the last two lines of the component, right after
the "Skip the trust-store step..." paragraph):

Current:
```tsx
      <p className="text-ink-faint text-[13.5px] mt-2">
        You've now read through every piece firewalls use to make a decision. Time to build one yourself
        and see it decide in real time.
      </p>
```

New:
```tsx
      <p className="text-ink-faint text-[13.5px] mt-2">
        You've now read through every piece firewalls use to make a decision when trust follows a
        connection's location: which zone it's in, which policy rule it matches, which certificate gets
        presented. Chapter 7 asks what changes once location by itself stops being enough.
      </p>
```

Nothing else in `Chapter6ForwardProxy.tsx` changes. The first closing paragraph ("Skip the trust-store step...")
is untouched.

---

## 6b. Exact modification: `src/components/sandbox/Sandbox.tsx`

**Why this needs to check out:** per the assignment, this file's opening needs to be checked for whether it still
reads correctly once Chapter 7 is inserted directly before it in the page flow. Read in full: the Sandbox's
`SectionHead` (currently lines 122–127) never names "the previous chapter" explicitly — it opens with "This is the
core idea firewalls are built on," a generic claim, not a callback to Chapter 6 specifically. So it does not
technically break or contradict anything with Chapter 7 inserted before it; it still reads correctly as-is.

However, `content-strategy.md`'s cross-cutting bridging finding established a site-wide convention: every chapter
transition should acknowledge the section immediately preceding it, extended by a clause rather than left generic,
the same treatment applied to Chapter 5 and Chapter 6's opening callbacks. The Sandbox's own core lesson (a rule
keyed to identity enforces things a port- or app-based rule can't) is, concretely, Zero Trust's exact argument —
this is too clean a connection to leave as an unremarked coincidence, and it's a one-clause addition, not a
rewrite.

**Exact change** — extend the first sentence of the `SectionHead`'s body (currently lines 123–124):

Current:
```tsx
      <SectionHead eyebrow="Practice" title="Build a rule. Break it. Fix it.">
        This is the core idea firewalls are built on: a rule written for a port number can be fooled, a
        rule written for an actual application identity can't, and a rule written for a specific person can
        enforce things neither of the others can. Build a rule, choose whether it allows or blocks, then
        send test traffic through it.
      </SectionHead>
```

New:
```tsx
      <SectionHead eyebrow="Practice" title="Build a rule. Break it. Fix it.">
        This is the core idea firewalls are built on, and the same one Chapter 7's Zero Trust reframing
        leans on hardest: a rule written for a port number can be fooled, a rule written for an actual
        application identity can't, and a rule written for a specific person can enforce things neither
        of the others can. Build a rule, choose whether it allows or blocks, then send test traffic
        through it.
      </SectionHead>
```

Nothing else in `Sandbox.tsx` changes. `sandboxScenarios.ts` is untouched — this is a one-clause copy edit only,
not a scope or mechanic change to the Sandbox itself.

---

## 6c. Exact modification: `src/data/acronyms.ts`

One new entry. `NIST` already exists in this file and needs no change. Insert immediately after the existing
`SP3: 'Single Pass Parallel Processing',` line (currently the last entry) and before the closing `};`:

```ts
  MFA: 'Multi-Factor Authentication',
```

Verified against a full read of `acronyms.ts`: `MFA` does not currently exist, and doesn't collide as a substring
with any existing key or vice versa. `AutoLink`'s `\b` word-boundary regex handles it the same way it handles
every other three-letter key (`CRL`, `PSK`, `NAT`, etc.).

---

## 6d. Exact modification: `src/data/glossary.ts`

**New category added: `zerotrust`.** Reasoning for a new category rather than folding these terms into an
existing one: `firewall` is internals/mechanics (Zone, NAT, 5-tuple, App-ID); `tls` is certificate/handshake
crypto; `vpn` is explicitly off-limits for this phase (see §8). None of those is an honest home for Zero Trust's
own vocabulary, which is architecture-level, not a mechanism belonging to any one of the existing three buckets.
A new category is the same kind of mechanical, low-risk change as any other single-line data addition — one
`GlossaryCategory` union member, one new array, one new tab option in `Glossary.tsx` (§6e).

**Change 1 — the type union.** Currently:
```ts
export type GlossaryCategory = 'firewall' | 'tls' | 'vpn';
```
New:
```ts
export type GlossaryCategory = 'firewall' | 'tls' | 'vpn' | 'zerotrust';
```

**Change 2 — the new category array.** Insert as a new key in the `GLOSSARY` object, after the existing `vpn: [
... ],` block and before the object's closing `};`:

```ts
  zerotrust: [
    { term: 'Zero Trust', def: "An architectural stance, not a product: no request gets automatic trust just because of where it came from, inside a zone or outside it. Every access attempt gets checked against identity, device posture, and context, continuously, not just once at the perimeter. Formalized by NIST as a vendor-neutral standard (SP 800-207), not one company's branded framework." },
    { term: 'Device posture', def: "The measurable state of the device making a request: patched, encrypted, running required security software, not tampered with. One of the signals a Zero Trust policy checks before granting access. The same identity looks like a different request depending on what device it's coming from." },
    { term: 'Least privilege', def: "Granting access to only the specific resource a task actually needs, nothing broader by default. The opposite of a zone-wide allow once someone's already inside." },
    { term: 'Micro-segmentation', def: "Dividing access far more finely than a traditional zone (see Chapter 1), down to individual applications or resources, so reaching one thing doesn't imply reaching whatever else happens to sit nearby." },
    { term: 'MFA (multi-factor authentication)', def: "Proving identity with more than one factor, something you know plus something you have or are, instead of a password alone. One concrete way identity gets verified continuously, since a stolen password by itself is exactly what a single-factor check lets through." },
  ],
```

Verified against a full read of `glossary.ts`: none of `Zero Trust`, `Device posture`, `Least privilege`,
`Micro-segmentation`, or `MFA (multi-factor authentication)` exist anywhere in the `firewall`, `tls`, or `vpn`
categories today.

**The existing `vpn` category is not touched, reordered, or referenced by any new entry above.** See §8.

---

## 6e. Exact modification: `src/components/reference/Glossary.tsx`

One new line in `CAT_OPTIONS`, appended after the existing `vpn` entry:

```tsx
const CAT_OPTIONS: { value: GlossaryCategory; label: string }[] = [
  { value: 'firewall', label: 'Firewall basics' },
  { value: 'tls', label: 'Certificates & TLS' },
  { value: 'vpn', label: 'VPN' },
  { value: 'zerotrust', label: 'Zero Trust' },
];
```

Nothing else in `Glossary.tsx` changes — `GLOSSARY[cat]` already works generically for any valid `GlossaryCategory`
key, so no other logic in this component needs to change for the new tab to render correctly.

---

## 7. Coordination note (Simulation/Interaction Designer)

This plan's content stands on its own. Chapter 7 as written in §4 is complete, self-contained prose requiring no
other component, exactly as written, regardless of what the Designer proposes or whether anything ships alongside
it.

**No assumption is made about scale, shape, or even whether an interactive belongs here at all** — matching the
posture `phase-2c-quic/content-plan.md` §7 and `phase-2d-single-pass/content-plan.md` §7 both took for the
identical situation (a topic with no pre-sketched mechanic). This phase has *more* open room than either of those,
not less: this is a brand-new chapter rather than a retrofit into an already-dense existing one, so there's no
existing card density this plan needs to protect (contrast `phase-2d-single-pass/content-plan.md` §2's explicit
check against Chapter 3's density before deciding to keep its addition small).

Some observations offered as raw material, not a recommendation or a ranking:

- **Card 3 ("Three signals, checked every time") has the most natural shape for an interactive**, if the Designer
  wants one: three independently-toggleable inputs (identity verified? device healthy? context normal?) driving
  one pass/fail outcome is structurally similar to the Sandbox's own port/App-ID/User-ID toggle, and to Chapter
  5's `PolicyEvaluator`. If something is added there, it would sit directly below Card 3 and above Card 4, keeping
  the interactive payoff adjacent to the prose that sets it up, the same adjacency principle every prior phase in
  this series has used.
- **The whole chapter could also stay fully static**, the way Chapter 2 does today — Chapter 2 has no interactive
  element at all and nothing in `content-strategy.md`'s review flagged that as a problem for that specific chapter.
  Whether Chapter 7 needs one is a judgment call about this specific content, not a rule that every chapter must
  have one.
- **An interactive could also live near the Sandbox instead of inside Chapter 7**, given how directly Card 3's
  identity signal and the Sandbox's User-ID rule already overlap conceptually — `phase-2d-single-pass`'s owner
  resolution ultimately chose to keep that phase's interactive in-chapter rather than in the Sandbox even though
  the Designer's own recommendation was the Sandbox, so this is genuinely the project owner's call to make once
  both plans exist, not something either agent should decide unilaterally in advance.

`docs/integration/phase-3-zero-trust/` contained no other files when this plan was written — the parallel
Designer's output doesn't exist yet, or wasn't visible to this agent.

---

## 8. Deliberate scope calls (flagging so nothing reads as an oversight)

- **No mention of VPN, remote access, tunnels, or ZTNA anywhere in this chapter's copy.** Checked every sentence
  in §4 against this constraint specifically. The chapter's examples (a laptop, a phished password, an internal
  application/resource) are deliberately generic rather than routed through "connecting in from home" or "remote
  worker" framing, specifically so nothing here implicitly assumes or gestures at the excluded ZTNA-vs-VPN pairing
  research-ideas.md #7 describes. If a future, separate phase eventually takes on #7, it can build on this chapter
  without this chapter needing to change, and this chapter reads completely correctly today with #7 never having
  been written.
- **The existing `vpn` glossary category is untouched** — not reordered, not cross-referenced from the new
  `zerotrust` category, no new entry added to it. Confirmed by re-reading `glossary.ts` after drafting §6d: none
  of the five new `zerotrust` entries reference `VPN`, `IPSec`, `IKE`, `Site-to-site VPN`, `Remote-access VPN`, or
  `Pre-shared key (PSK)` by name. Those six terms remain exactly as orphaned (no chapter home) as they were before
  this phase — giving them one is explicitly out of scope here, per the assignment.
- **No vendor-attribution disclaimer is added for "Zero Trust" itself**, unlike App-ID/User-ID/Content-ID/SP3
  (Chapter 3) which all needed one. This is a deliberate, checked decision, not an oversight: those four terms are
  one specific vendor's product branding for capabilities other vendors implement under different names. "Zero
  Trust" is not that — it's industry-wide terminology with a formal, vendor-neutral government standard behind it
  (NIST SP 800-207), named as such in Card 2's "Formalized, not improvised" point. `App-ID`, `User-ID`, and
  `Content-ID` are still used in Card 5, still correctly wrapped in `AutoLink`, and still refer to the same
  Chapter 3 vendor-branded terms — this chapter doesn't repeat their names without context, it explicitly points
  back to where they were first disclosed.
- **No new `src/data/*.ts` file for this chapter's static content.** Checked against the site's existing pattern
  for when a chapter needs one: `handshakeSteps.ts` and `cipherSuite.ts` exist because `HandshakeStepper` and
  `CipherDecoder` are mode-driven, reusable interactive components consuming structured step/chip data. Chapters
  that are SectionHead-plus-Card static prose (Chapter 1, Chapter 2, Chapter 5's static portions, Chapter 6) keep
  their point-lists file-local as plain `const` arrays, the same pattern `Chapter3Handshake.tsx`'s `MITM_POINTS`
  and `ECH_POINTS` use. Chapter 7 as specified in §4 is entirely the second kind of chapter — five `Card`s of
  static point-lists, no stepper, no decoder — so a data file isn't warranted for the content itself. If the
  Designer's eventual interactive needs its own structured data, that's a file the Designer's plan should
  introduce, not something this plan should pre-empt (see §7).
- **`MFA` is introduced as a new acronym; `AV`/`IDS`/`IPS`-style unnecessary new acronyms are not.** `MFA` earns
  its place because it's the one concrete, unambiguous example Card 3 needs to make "identity" feel like something
  provable rather than an abstract claim (the same reasoning the site already applies elsewhere: X25519 and
  secp256r1 named concretely in Chapter 4 rather than left as "a key exchange group"). No other new acronym is
  introduced anywhere in this chapter.
- **No specific vendor product, platform, or company name appears anywhere in this chapter's copy** — "device
  posture," "security software," "policy engines" stay generic, matching the restraint already established in
  `phase-2d-single-pass/content-plan.md` §8 ("no specific vendor hardware or product name... not making claims
  that go stale as vendor hardware changes").
- **The chapter does not introduce microservices, service mesh, mTLS, SASE, or passkeys**, all Tier 2/3
  research-ideas.md candidates that could plausibly gesture toward Zero Trust territory (#8, #9, #13). Deliberately
  out of scope for the same reason ZTNA is: this phase is research-ideas.md #4 only, not an invitation to fold in
  adjacent candidates that haven't been separately scoped or approved.

---

## 9. Full draft prose (quick-reference copy, identical to what's embedded in §4's code)

**SectionHead:**

> Chapter 1 opened with a firewall deciding what counts as 'inside' a zone versus 'outside' it, then trusting a lot of what happens next based on that answer alone. Chapters 2 through 6 were about what a firewall does once traffic reaches that boundary: decrypting it, inspecting it, deciding what to do with it. This chapter asks what changes once being inside the zone stops being proof of anything by itself.

**Card 1 — When location stops being proof**

> None of this is a knock on the zone model from Chapter 1. Zones, perimeters, and the whole decrypt-and-inspect pipeline from Chapters 2 through 6 are still exactly how a huge amount of real traffic gets decided on, today, in production. The problem is narrower than 'the old way was wrong': location was always a proxy for trust, not trust itself, and the gap between the two got more expensive to ignore.

- **A device doesn't stay trustworthy just because it's inside.** A laptop that passed every check on the way in can still get compromised after it's already inside the zone: phished, infected, or handed to someone it shouldn't have been handed to. The zone it's sitting in has no way to notice that anything changed.
- **Being 'inside' has usually meant broad reach, not narrow reach.** Once a device or user cleared the perimeter, most zone-based designs granted access to a lot of what else lived in that same zone, not just the one thing that device actually needed. Convenient to configure, expensive the moment anything inside goes wrong, since whatever's compromised can usually reach far more than it should be able to.
- **A stolen identity walks straight through, zone and all.** A phished password or a reused login doesn't care which zone it's presented from. Once it's accepted, the zone treats it exactly like it would treat the legitimate person it's impersonating.

**Card 2 — Verify every request, not just the first one**

> Zero Trust is the industry's name for closing that gap. The core idea, sometimes summarized as 'never trust, always verify': no request gets automatic trust just because of where it came from, inside the zone or outside it. Every access attempt gets checked against who's actually asking and what they're asking from, every time, not once at the edge and then coasted on for the rest of the session.

- **Checked every time, not once.** A zone-based rule typically gets evaluated once, when a connection starts. Zero Trust keeps asking the same question for as long as that access lasts, not just at the start of it, so a device or identity that stops looking trustworthy partway through doesn't keep coasting on a decision made minutes or hours earlier.
- **Location becomes one input, not the deciding one.** Being inside the office network or a trusted zone can still be one thing a policy weighs, it just stops being sufficient on its own. A request from inside the building with no valid identity behind it gets treated the same as one with no valid identity from anywhere else.
- **Formalized, not improvised.** This isn't one vendor's marketing framing. NIST published a formal Zero Trust architecture standard, SP 800-207, years ago now, describing the same core model in vendor-neutral terms, and it's treated as baseline enterprise guidance today, not an emerging idea.

**Card 3 — Three signals, checked every time**

> Chapter 3's User-ID already answered one piece of this: knowing who's actually sending traffic, not just where it came from. Zero Trust asks the same kind of question of every request, and adds two more signals alongside it.

- **Identity: who's actually asking.** The same idea Chapter 3's User-ID already introduced, extended to every request instead of being one lens among several. Proven with more than a password alone where possible, MFA being the common concrete example, since a password by itself is exactly what a stolen identity from the last card gets through with.
- **Device posture: what they're asking from.** Not just who's logged in, but whether the device they're using is in a state worth trusting: patched, encrypted, running whatever security software the organization requires, not one that's been tampered with. The same identity, on a healthy managed laptop versus an unpatched personal phone, isn't treated as the same request.
- **Context: does this specific request make sense right now.** The same identity, on the same healthy device, requesting the same resource it requests every day, reads differently than that identity suddenly requesting something it's never touched before, at an hour it's never logged in at, from somewhere it's never logged in from. None of those signals alone proves much. Together, continuously, they're what a one-time perimeter check never had a chance to see.

**Card 4 — Smaller than a zone**

> Chapter 1's Zone answered a broad question: what's inside versus outside. Zero Trust asks a narrower one underneath it: even inside a zone that's already been let in, should this specific identity, on this specific device, reach this specific resource, or just some of what happens to share its zone?

- **Least privilege: access to the one thing needed, not everything nearby.** Instead of a zone-wide allow once someone's in, access gets scoped to the specific application or resource a task actually requires. Nothing broader, by default.
- **Micro-segmentation: zones, cut much smaller.** The same idea Chapter 1's Zone already covers, applied at a far finer grain, down to individual applications or resources rather than a handful of broad network segments, so reaching one thing doesn't imply reaching whatever else happens to sit nearby.
- **Why it matters if any single check above fails.** A stolen identity or a compromised device that gets through anyway still only reaches the one narrow thing it was granted, not everything else that used to share a zone with it. Identity, device posture, and context are each individually beatable. Keeping any one failure small is the actual payoff here, not preventing every failure outright.

**Card 5 — Zero Trust doesn't replace the firewall**

> Every rule the last six chapters covered is still doing real, necessary work. A decryption policy from Chapter 5 still has to run before anything downstream can be inspected at all. App-ID, User-ID, and Content-ID from Chapter 3 are still how a firewall answers what actually is this, who's actually sending it, and is anything in it dangerous. Zones from Chapter 1 haven't gone anywhere either.

- **Zero Trust is a stance about when and for whom, not a replacement box.** It isn't a product that swaps out for a firewall. It's a set of ordering and scope decisions layered onto enforcement points that, in a lot of real deployments, are the exact same firewalls, proxies, and policy engines this site already walked through, now factoring in identity and device signals continuously instead of checking a zone once.
- **The same enforcement points, asked to check more, more often.** A decryption policy rule from Chapter 5 that used to match on category or app can just as easily match on a verified identity and a device-posture signal too, then get re-evaluated on a schedule instead of once per session. The mechanism, an ordered rule list, first match wins, isn't new. What changes is what goes into a match, and how often that decision gets re-asked.
- **Zones and Zero Trust solve different-sized problems, side by side.** A zone is still a reasonable way to describe what a whole network segment is for. Zero Trust is the finer-grained layer underneath it, deciding whether one specific request, from one specific identity and device, should be trusted with one specific resource, right now. Most real deployments run both at once, not one instead of the other.

**Closing bridge (into the Sandbox):**

> You've now seen both halves: the zone-based, decrypt-and-inspect model from Chapters 1 through 6, and the identity-and-device-checked model this chapter adds on top of it. Time to build a rule yourself and watch the difference between a check keyed to a port and one keyed to an actual identity.

---

## 10. Order of implementation

1. `src/data/acronyms.ts` — add the one `MFA` entry (§6c).
2. `src/data/glossary.ts` — add `'zerotrust'` to the `GlossaryCategory` union and the new `zerotrust` array (§6d).
3. `src/components/reference/Glossary.tsx` — add the new `CAT_OPTIONS` entry (§6e).
4. `src/components/chapters/Chapter7ZeroTrust.tsx` — create new file, full contents per §4.
5. `src/App.tsx` — add the import and the `<Chapter7ZeroTrust />` render line (§5).
6. `src/components/layout/Header.tsx` — add the `#ch7` nav link (§6).
7. `src/components/chapters/Chapter6ForwardProxy.tsx` — replace the closing bridge paragraph (§6a).
8. `src/components/sandbox/Sandbox.tsx` — extend the `SectionHead`'s opening sentence by one clause (§6b).
9. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
10. Visual check in `npm run dev`:
    - Confirm `Zero Trust` appears in the header nav between `Forward proxy` and `Sandbox`, and clicking it
      scrolls to the new chapter with correct offset (no content hidden under the sticky header).
    - Confirm Chapter 7 renders as five `Card`s in the order specified in §2, between Chapter 6 and the Sandbox.
    - Confirm hovering `User-ID`, `App-ID`, `Content-ID`, `NIST`, and `MFA` all show correct tooltips inside the
      new chapter's copy.
    - Confirm Chapter 6's new closing paragraph reads correctly and no longer promises the Sandbox is immediately
      next.
    - Confirm the Sandbox's `SectionHead` reads correctly with its new clause.
    - Confirm the Glossary's new "Zero Trust" tab appears after "VPN," and that its five entries render with
      working tooltips inside their own definitions (`NIST`, `MFA` in particular).
    - Confirm nothing in Chapters 1–6, the Sandbox's mechanics, `CertificateTabs`, or the existing three Glossary
      tabs changed in any way not specified above.
