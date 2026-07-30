# Phase 4 — Simulation / Interaction Design: Chain-of-Trust Structural Diagram

**Author role:** Simulation/Interaction Designer (mechanics and visual structure only, no prose, no code changes to `src/`).
**Status:** Draft, awaiting project-owner review alongside the parallel Content & Flow Strategist's placement/prose doc for this same gap.
**Consumes:** `src/components/reference/CertificateTabs.tsx` (page structure), `src/components/reference/VerificationWalkthrough.tsx` and `CertificateFieldDecoder.tsx` (the two existing interactives on this page, read in full to avoid duplication), `src/data/certificates.ts`'s `CERT_LIFECYCLE_SECTIONS` (the content that currently assumes root/intermediate/leaf structure is already understood), `src/data/glossary.ts` (existing Root/Intermediate/Leaf certificate + Chain of trust definitions), `docs/integration/phase-1-certificates/simulation-design.md` (template/format and restraint precedent for this exact page).
**Produces:** this document — a recommendation on whether a foundational chain-of-trust visual is warranted, and if so, a code-complete mechanics spec for it.

---

## 0. Role boundary, restated

Everything below specifies **structure and behavior**, not copy. Any string shown in quotes (headings, captions, role-tags) is a draft placeholder written to prove the layout reads correctly — the Content Strategist and Implementer should treat these as content-requirements ("this fact must appear somewhere near this box"), not final wording. Where a decision is genuinely mine to make (layout shape, direction, whether to add state at all), I've made it and given the reasoning; where it depends on the parallel prose doc's specifics, I've flagged it as a coordination point rather than guessing.

---

## 1. The decision: is an interactive/visual element warranted here?

**Yes to a visual. No to an interactive (no state, no toggle, no select, no click-driven reveal).** This lands deliberately between the two extremes the brief offered: it isn't "just name the three tiers in prose and move on," but it also isn't a new stateful mechanic. Reasoning:

**Why prose alone falls short.** `CERT_LIFECYCLE_SECTIONS[0]` (heading: *"Not every certificate in the chain lives the same length of time"*) already has to introduce root, intermediate, and leaf by name in its very first bullet list, but it does so while simultaneously loading each one with a lifespan fact (root: ~20 years; intermediate: several years; leaf: shrinking toward 47 days). A reader meeting root/intermediate/leaf for the first time in that paragraph is being asked to absorb *structure* (who signs whom, who's self-signed, who's actually presented to a client) and *a numeric fact* about each, at the same time, in prose form. Splitting those two jobs, a picture for "what it structurally is," prose for "how long it lives", is a real comprehension win, not a cosmetic one. The glossary's four definitions (`Root certificate`, `Intermediate certificate`, `Leaf certificate`, `Chain of trust`) are accurate but sit behind a hover/lookup interaction elsewhere on the site; nothing on this page currently puts the three side by side so a reader can see the shape in one glance before the lifecycle prose starts using the terms.

**Why it doesn't need to be *interactive*, though.** Every other interactive on this page (and its closest site-wide relatives — `PolicyEvaluator`, `SessionTrackingViz`) earns its state because there's a genuine variable axis to explore: which traffic scenario matched, which certificate scenario passed or failed, whether the network roamed. A structural chain-of-trust diagram has no such axis. Root is always self-signed and always at the top of issuance; the leaf is always what's presented to a client; that never varies by user choice the way "which policy rule fires" or "did this cert get revoked" does. There are only three items, all short, and all worth showing simultaneously, there's no clutter problem that a click-to-reveal chip pattern (`CipherDecoder`, `CertificateFieldDecoder`) would be solving, because there's no long tail of fields to page through, just three. Adding a `useState` and a `<select>` here would be manufacturing interactivity for its own sake, exactly what the brief warns against, and it would dilute rather than sharpen the one thing this element needs to do: let the shape land in one glance.

**Why this doesn't duplicate `VerificationWalkthrough`.** That component already visually represents the chain, but its job is *sequential and evaluative*: "run these five checks, in this order, and see where a specific example breaks." Its five list items include two chain-signature checks and a root-trust check, but they're steps in a procedure applied to one hypothetical certificate at a time, not a standing picture of the chain's shape. A learner who hasn't yet been told what "intermediate" means structurally will find `VerificationWalkthrough`'s step 2 ("Intermediate signature valid?") opaque on first read; the diagram proposed here is specifically the thing that makes that step legible before the learner gets there. Concretely: this diagram teaches **structure** (three tiers, who signs whom, who's trusted directly, who's presented to a client), `VerificationWalkthrough` teaches **verification order and failure behavior** (the same three tiers, but walked bottom-up as a pass/fail procedure against a specific scenario). Same three nouns, two different jobs; one is a noun-picture, the other is a verb-procedure. No shared state, no shared component, and the diagram doesn't need to be touched for `VerificationWalkthrough` to keep working exactly as implemented.

If the project owner disagrees and wants zero new visual surface area at all, the fallback is legitimate too: name the three tiers in the `CERT_LIFECYCLE_BRIDGE` sentence or the section's own intro copy, in order, once, and skip building anything. That's the Content Strategist's call to make if they'd rather solve this with one well-placed clause. §1.7 below gives the absolute-minimum version of the visual (a bare breadcrumb, no new component file) as a middle option if the owner wants *some* visual but not even a small dedicated component.

---

## 2. The proposed element — Chain of Trust Diagram

### 2.1 What it is, structurally

A static, always-fully-visible row of three small boxes (Root CA → Intermediate CA → Leaf certificate), connected by directional "signs" arrows, each box carrying a one-line structural role-tag. No button, no click target, no hover-to-reveal, no state at all beyond React needing none. Every fact it conveys is visible the instant the page renders, exactly like `data.flow` (the existing "your device → firewall (proxy) → internet site" breadcrumb already rendered at the top of this same file, `CertificateTabs.tsx` lines 31–38) is always visible, never something a reader has to interact with to see.

### 2.2 Layout direction (a deliberate choice, not arbitrary)

Root → Intermediate → Leaf, left to right, arrows pointing in the **issuance/signing** direction (root signs intermediate, intermediate signs leaf). This is intentionally the *opposite* direction from `VerificationWalkthrough`'s step order, which runs leaf → intermediate → root (a client verifies bottom-up: "does the leaf's signature check out, does the intermediate's, is the root trusted"). That inversion is worth naming explicitly rather than leaving implicit, because a reader who does both interactives in sequence should come away understanding *why* the arrows run opposite ways: one shows how the chain was built, the other shows how a client walks it to check it. A one-line caption under the diagram flagging this (draft: *"A certificate authority builds this chain top-down, root signs intermediate, intermediate signs leaf. A client checks it bottom-up: the walkthrough below starts at the leaf and works back to the root."*) is the kind of connective sentence I'd suggest the Content Strategist consider, though the exact wording is their call.

**Why a small dedicated component instead of reusing `CertificateTabs.tsx`'s existing horizontal flow-chip idiom verbatim:** that exact chip-arrow-chip pattern already appears at the top of this same page meaning something else entirely (a packet's network path: device → firewall → internet site). Reusing the identical visual for a structurally different concept (a signing hierarchy, not a traffic path) directly above/below it on the same page risks a reader conflating the two, "wait, is this the same kind of diagram as the one above?" A small dedicated box-and-arrow treatment, visually related but distinguishable (boxes with two lines of content instead of bare single-line chips), avoids that ambiguity at low cost. See §2.7 for the even-lighter fallback if the owner disagrees with this call.

### 2.3 Exact placement + coordination note

Strong candidate: directly before `CERT_LIFECYCLE_SECTIONS` renders, i.e., in `CertificateTabs.tsx`, between the `CERT_LIFECYCLE_BRIDGE` paragraph (current line 53–55) and the `{CERT_LIFECYCLE_SECTIONS.map(...)}` block (current line 57). Concretely:

```tsx
<p className="text-ink-dim text-[14.5px] mt-6 mb-5 max-w-[70ch]">
  <AutoLink text={CERT_LIFECYCLE_BRIDGE} />
</p>

<ChainOfTrustDiagram />   {/* new */}

{CERT_LIFECYCLE_SECTIONS.map((section) => (
  ...
))}
```

This sits it right where `CERT_LIFECYCLE_SECTIONS` starts needing root/intermediate/leaf as known terms, immediately after the bridge sentence that pivots the page from "where a cert sits" (the three tabs) to "how long each cert lives" (the lifecycle cards). **Coordination flag:** I don't have visibility into the parallel Content Strategist's actual prose plan for this gap. If their new copy restructures or replaces `CERT_LIFECYCLE_BRIDGE` itself, or introduces its own transitional sentence, the diagram's placement should move with it, the intent is "immediately before the lifecycle content starts assuming tier-structure knowledge," not "immediately after this exact existing paragraph" if that paragraph itself changes. If their prose plan instead front-loads a structural explanation of its own higher up the page (e.g., inside the three-tab `Card`, or right after `SectionHead`), that may make this diagram redundant with their prose the same way I ruled out redundancy with `VerificationWalkthrough` above, in that case, the diagram should be dropped or relocated to wherever their explanation isn't, not stacked on top of it.

### 2.4 Component file, data shape, full sketch

New file: `src/components/reference/ChainOfTrustDiagram.tsx`. No new data file needed, three static items is well within the "keep data inline" precedent `VerificationWalkthrough.tsx` already set (its `VERIFICATION_STEPS`/`VERIFICATION_SCENARIOS` are inline, not in `data/certificates.ts`).

```tsx
import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { AutoLink } from '../../lib/autoLink';

/**
 * Chain of Trust Diagram — a static, non-interactive structural picture of the three-tier
 * root/intermediate/leaf hierarchy. Deliberately has no state: unlike every other interactive on
 * this page, there's no variable axis to toggle or select (the structure doesn't change), so this
 * intentionally does NOT adopt CipherDecoder's chip-click or PolicyEvaluator/VerificationWalkthrough's
 * reactive-on-select pattern. All three tiers are always visible at once.
 * See docs/integration/phase-4-chain-of-trust-basics/simulation-design.md §2.
 */

interface ChainTier {
  id: 'root' | 'intermediate' | 'leaf';
  label: string;
  roleTag: string; // draft placeholder — Content Strategist to finalize wording
}

const CHAIN_TIERS: ChainTier[] = [
  {
    id: 'root',
    label: 'Root CA',
    roleTag: 'Self-signed. Trusted directly by the OS/browser trust store.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate CA',
    roleTag: "Signed by the root. Does the CA's day-to-day signing.",
  },
  {
    id: 'leaf',
    label: 'Leaf certificate',
    roleTag: "Signed by the intermediate. The one a client actually sees.",
  },
];

export function ChainOfTrustDiagram() {
  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2.5">The shape of a chain of trust</h3>
      {/* draft placeholder — one short sentence framing what's below; Content Strategist's wording */}
      <p className="text-ink-dim text-[14.5px] mb-4">
        <AutoLink text="Every certificate in this reference sits somewhere in this three-tier chain." />
      </p>
      <div className="flex items-stretch gap-2 overflow-x-auto">
        {CHAIN_TIERS.map((tier, idx) => (
          <div key={tier.id} className="flex items-center gap-2 shrink-0">
            <div className="rounded-md border border-line-soft bg-bg-deep px-4 py-3 w-[170px]">
              <div className="font-mono text-[13px] text-accent mb-1">{tier.label}</div>
              <div className="text-[12px] text-ink-dim leading-snug">{tier.roleTag}</div>
            </div>
            {idx < CHAIN_TIERS.length - 1 && (
              <div className="flex flex-col items-center text-ink-faint shrink-0 px-0.5">
                <ArrowRight size={16} />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">signs</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
```

Notes on the sketch:
- `overflow-x-auto` on the row is a mobile safety net (three 170px boxes + two arrow gaps is roughly 560–600px, wider than a narrow phone viewport); this mirrors how `CertificateFieldDecoder`'s preview `<pre>` block already handles overflow on this same page.
- Icon choice (`ArrowRight` from `lucide-react`) is arbitrary within "whatever's already a project dependency," consistent with how `VerificationWalkthrough`'s icon choice was left to the Implementer in the phase-1 doc.
- No `useState`, no props, no event handlers. This is as close to a pure presentational component as anything on the page.

### 2.5 Visual / motion notes

No new color tokens, no new motion. `border-line-soft` / `bg-bg-deep` / `text-accent` are the same treatment `VerificationWalkthrough`'s "not-reached" rows and `CertificateFieldDecoder`'s preview block already use elsewhere on this exact page. Zero animation, this isn't a state transition or feedback stream, so neither of the site's two motion tiers (restrained Framer Motion elsewhere, terminal-log in Sandbox) applies; it's simply static layout, same tier as the always-visible `data.flow` breadcrumb already in `CertificateTabs.tsx`.

### 2.6 How this avoids duplicating `VerificationWalkthrough`

Restated concretely against the two components side by side:

| | This diagram | `VerificationWalkthrough` |
|---|---|---|
| Question it answers | "What are the three tiers, structurally?" | "Does *this* certificate check out?" |
| State | None, always fully visible | `scenarioValue`, reactive on `<select>` |
| Direction shown | Root → Leaf (issuance/signing) | Leaf → Root (verification order) |
| What varies | Nothing, one fixed picture | Five scenarios, pass/fail per step |
| Depends on the other to make sense | No, self-contained | Benefits from it (step 2's "intermediate" label lands better once a reader has seen this diagram), but doesn't require it, `VerificationWalkthrough` already ships and reads fine standalone today |

If a future edit ever made these two show near-identical content, that would be the signal to cut one, not maintain both. Right now they don't: one is a noun (shape), the other is a verb (procedure), and removing either loses distinct information the other doesn't carry.

### 2.7 Lighter-weight fallback (if the owner wants even less new surface area)

If a dedicated component with role-tag captions feels like more than this gap warrants, the absolute-minimum version is: skip the new file entirely, and inline a bare breadcrumb directly in `CertificateTabs.tsx`, reusing the *exact* existing `data.flow` chip-arrow-chip JSX pattern (lines 31–38) verbatim, just with a new static array (`['Root CA', 'Intermediate CA', 'Leaf certificate']`) instead of `data.flow`. This drops the role-tag captions (so it stops short of explaining *why* each tier matters, purely establishes naming and order) and drops the visual-conflation concern from §2.2 becomes moot since it'd be openly reusing the same idiom, which some may read as a feature (consistency) rather than a bug. I don't recommend this over §2.4's version, the role-tags are doing real teaching work for very little extra code, but it's the correct answer if the owner's bar is "as close to zero new component surface as possible."

---

## 3. Cross-cutting notes

- **No new acronyms.** `CA` is already in `src/data/acronyms.ts`. Nothing in this diagram introduces a term `AutoLink` doesn't already resolve.
- **Glossary cross-references, already exist, no new entries needed:** `Root certificate`, `Intermediate certificate`, `Leaf certificate`, `Chain of trust` are all already defined in `src/data/glossary.ts` (lines 23–26) with wording that's consistent with the role-tags drafted in §2.4, this diagram is a visual restatement of definitions the site already has, not new subject matter.
- **Independently shippable.** This diagram has no dependency on `CertificateFieldDecoder` or `VerificationWalkthrough`, and neither of those depends on it. It can ship alone, alongside, or not at all without breaking anything already on the page.
- **Nothing here requires new Tailwind classes, new color tokens, or new motion primitives.** Every visual treatment above already exists in the codebase.

## 4. Open flags

- ⚠ **needs a decision:** §2.7's lighter-weight bare-breadcrumb fallback vs. §2.4's dedicated component with role-tags. Recommend: build §2.4 (the dedicated component), the role-tags are the part actually doing new teaching work; a bare tier-name breadcrumb without them is barely more informative than the prose gap this whole doc is trying to close. But this is a legitimate scope call for the project owner, not a technical constraint either way.
- ⚠ **needs coordination, not a decision:** exact placement (§2.3) is contingent on the parallel Content Strategist's actual prose plan, which I have no visibility into. Flagging the dependency rather than guessing at their structure.

---

## Coordination note

A parallel Content & Flow Strategist agent is independently drafting the actual prose and placement decisions for this same "chain of trust structural gap" on `/certificates`. That agent's output and this document were produced without visibility into each other. In particular:

- If the Content Strategist's prose plan already solves the structural gap adequately in text (e.g., a well-sequenced paragraph that names and orders all three tiers before using them), their solution and this diagram may be redundant, the project owner should pick one, not both. §1 above is written so the "no visual needed" outcome is fully defensible if that's what their prose turns out to do.
- If both a diagram and new prose ship, §2.3's placement recommendation (directly before `CERT_LIFECYCLE_SECTIONS`, after `CERT_LIFECYCLE_BRIDGE`) may need to move to match wherever their new transitional copy actually lands.
- Draft strings in this doc (headings, role-tag captions, the directional caption suggested in §2.2) are placeholders proving the layout reads correctly, not final copy, the Content Strategist owns final wording for anything that ships.

These two outputs need reconciling by the project owner before implementation, the same reconciliation step phase-1's `content-plan.md` §10 performed for `CertificateFieldDecoder`/`VerificationWalkthrough`'s placement.
