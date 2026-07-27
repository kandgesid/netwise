**Implementation status (added by the Implementer agent, 2026-07-24): all four file changes in §2 (`acronyms.ts`, `glossary.ts`, `certificates.ts`, `CertificateTabs.tsx`) are ✅ implemented exactly as specified. The owner resolved the §10 coordination note and the §8 "no interactive element" bullet before implementation: both interactives from `simulation-design.md` ARE in scope for this phase, placed below the two new prose `Card`s added by this doc, inside `<section id="reference">`, per `simulation-design.md` §2.6's own suggested placement. See the inline notes against §8 and §10 below, and `simulation-design.md`'s own status block for the interactives' implementation detail.**

# Content plan: research-ideas.md #5 + #17 → Reference → Certificates

Author: Content & Flow Strategist agent (analysis/copy only; no `src/` files touched).
Scope: research-ideas.md candidates **#5** ("Short-lived certificates and automated renewal (ACME)") and **#17**
("Root certificate longevity and how expiry actually gets handled"), landed as one cohesive addition to the
existing certificate reference (`src/components/reference/CertificateTabs.tsx` / `src/data/certificates.ts`).

This doc is self-contained. An Implementer who has read only this file (not the parent conversation) should be
able to execute it without guessing. It gives exact files, exact insertion points, and exact new text/code.

A parallel Simulation/Interaction Designer agent is working the same topic area — see **Coordination note** at
the very end before implementing, in case that agent's plan proposes an interactive treatment for this same
block.

---

## 1. Placement decision (and why)

**Decision: this is a new static block appended below the existing tabbed `Card`, inside the same
`<section id="reference">`. It is *not* a fourth tab in the `Toggle`.**

Reasoning, grounded in the actual structure of `CertificateTabs.tsx` and `certificates.ts`:

- The existing `TAB_OPTIONS` (`forward` / `inbound` / `vpn`) partition content by **deployment job** — the
  section's own `SectionHead` says so explicitly: *"A certificate isn't one thing used one way. Where it sits
  and who holds the private key changes completely depending on whether the firewall is watching outbound
  browsing, protecting an inbound server, or authenticating a VPN tunnel."* Each tab answers "when does this
  apply, what does the firewall hold, what's the catch" for one specific job.
- Root/leaf lifespan and the OCSP→CRL shift are **not job-specific**. A root certificate is long-lived and a
  leaf certificate expires in weeks whether that leaf is sitting in front of a forward proxy, an inbound
  server, or a VPN gateway. Forcing this into a fourth `Toggle` option would either duplicate the same content
  three times over (once per existing tab) or misrepresent a cross-cutting fact as if it were a fourth
  "job," which breaks the section's own stated thesis.
- The site already has precedent for exactly this shape of addition: `Chapter6ForwardProxy.tsx` stacks three
  separate `<Card>`s (`Where it's used` / `How it's actually deployed` / `Two things that aren't a one-time
  step`) under one shared `SectionHead`, each with its own `<h3>` and list. `CertificateTabs.tsx` can take the
  identical approach — keep the one existing `SectionHead`, keep the existing tabbed `Card` untouched, and add
  new sibling `Card`s below it inside the same `<section>`.
- No new top-level section, no new nav entry, no `App.tsx` or `Header.tsx` change. This extends the existing
  `#reference` section rather than adding a new one — the "adding a new chapter is mechanical" flow in
  `CLAUDE.md` does not apply here since nothing new is being added to the page list.

**One consequence of this decision:** the existing `SectionHead` copy ("the same certificate concept, three
different jobs") only frames the tabbed `Card`, not the new block. A short bridging paragraph (drafted below)
sits between the tabbed `Card` and the new `Card`s to re-frame the reader from "job" to "time," the same way
the site already uses one-sentence bridges between chapters.

---

## 2. Files to touch

1. `src/data/certificates.ts` — add new exported data (content only, no component logic).
2. `src/components/reference/CertificateTabs.tsx` — add JSX to render that data, placed after the existing
   `<Card>` and before the closing `</section>`.
3. `src/data/acronyms.ts` — add three new acronym entries (`ACME`, `OCSP`, `CRL`) so `AutoLink` picks them up
   everywhere, per `CLAUDE.md`'s stated architecture.
4. `src/data/glossary.ts` — add four new entries to the existing `tls` category.

No other file needs to change. Checked against `src/data/glossary.ts` and `src/data/acronyms.ts` in full
before writing this plan — none of the terms below currently exist anywhere in either file.

---

✅ **Implemented.** Appended `LifecycleSection`, `CERT_LIFECYCLE_BRIDGE`, `CERT_LIFECYCLE_SECTIONS`, and
`CERT_LIFECYCLE_CLOSING` to `src/data/certificates.ts` exactly as specified below, collapsed to single-line
string literals per this section's own formatting note (matching the existing `CERT_DATA` convention).

## 3. Exact change: `src/data/certificates.ts`

Append the following after the closing `};` of the existing `CERT_DATA` object (i.e. at the end of the file).
Reuses the existing `CertPoint` interface as-is — no changes to the existing `CERT_DATA`, `CertTab`, or
`CertTabData` types.

```ts
// --- Certificate lifecycle & revocation (research-ideas.md #5 + #17) ---
// Cross-cutting facts that apply regardless of which tab (forward/inbound/vpn) is selected above,
// which is why this lives outside CERT_DATA rather than as a fourth tab. See content-plan.md.

export interface LifecycleSection {
  heading: string;
  intro: string;
  points: CertPoint[];
}

export const CERT_LIFECYCLE_BRIDGE =
  "The three tabs above are about where a certificate sits and who holds the private key. The two things " +
  'below are about time: how long each certificate in the chain actually gets to live, and what happens ' +
  'when one has to die earlier than planned.';

export const CERT_LIFECYCLE_SECTIONS: LifecycleSection[] = [
  {
    heading: 'Not every certificate in the chain lives the same length of time',
    intro:
      "Root, intermediate, and leaf certificates aren't just different links in the same chain of trust, " +
      "they're built to live on entirely different clocks, and the reason comes down to how disruptive " +
      'replacing each one is.',
    points: [
      {
        strong: 'Root:',
        text:
          'commonly valid for around twenty years. Every browser and operating system ships with a fixed ' +
          'list of root certificates it already trusts, installed ahead of time, so swapping one out means ' +
          'waiting for a replacement to reach that trust list on essentially every device in use first. ' +
          "That kind of rollout is slow by nature, which is exactly why roots are issued to last a long " +
          'time and retired on a schedule planned years in advance.',
      },
      {
        strong: 'Intermediate:',
        text:
          'typically valid for several years, sitting between the root and the leaf specifically so the ' +
          'root itself can stay locked away and rarely touched. Rotation happens with deliberate overlap, ' +
          'a new intermediate is already trusted well before the old one expires, so nothing downstream ' +
          'ever has to wait on one exact expiry date.',
      },
      {
        strong: 'Leaf:',
        text:
          'the shortest-lived by far, and still shrinking. Public certificate lifetimes that were commonly ' +
          'around a year until recently are being cut down in scheduled stages under current industry ' +
          'rules, with the endpoint as low as 47 days.',
      },
      {
        strong: 'The tradeoff:',
        text:
          'a shorter-lived leaf certificate narrows how long a stolen or wrongly issued one can cause ' +
          "damage before it simply stops working, but it costs convenience. Renewing a certificate by hand " +
          "once a year was already easy to forget; renewing one every few weeks by hand isn't something " +
          'any real organization can keep up with.',
      },
      {
        strong: 'How it renews itself:',
        text:
          'ACME defines a standard, scripted conversation between a small agent running on a server and a ' +
          'CA: prove control of the domain, receive a freshly signed certificate, install it, and repeat ' +
          "automatically, well before the current one runs out. It's the same mechanism behind several " +
          "widely used free certificate authorities, and it's the reason certificate lifetimes can keep " +
          'shrinking without renewal turning into a full-time job for someone.',
      },
    ],
  },
  {
    heading: "Expiry and revocation aren't the same problem",
    intro: 'A certificate can stop being trusted in two different ways, and only one of them is on a schedule.',
    points: [
      {
        strong: 'Expiry:',
        text:
          'scheduled and absolute. Every certificate carries a hard end date, and the moment it passes, ' +
          'every browser blocks the connection, no grace period and no exceptions.',
      },
      {
        strong: 'Revocation:',
        text:
          'a certificate being invalidated before its stated expiry, usually because something went wrong, ' +
          'a private key was exposed, or the domain it covers changed hands. The certificate itself ' +
          "hasn't expired; it's just been declared untrustworthy ahead of schedule.",
      },
      {
        strong: 'Checking has meant OCSP:',
        text:
          'a live, real-time query to the CA asking whether one specific certificate has been revoked, ' +
          'made fresh on every connection.',
      },
      {
        strong: "Now it's shifting to CRLs:",
        text:
          'the industry is moving away from those real-time OCSP lookups and back toward CRL-based ' +
          'checking, downloading a list of everything currently revoked on a schedule and checking it ' +
          'locally instead of querying a server live. Shrinking leaf certificate lifespans are a direct ' +
          'part of why: a certificate that only lives for weeks instead of a year gives a ' +
          'compromised-but-not-yet-expired certificate a much smaller window to do damage, which makes the ' +
          'always-on infrastructure real-time checking requires less load-bearing than it used to be.',
      },
    ],
  },
];

export const CERT_LIFECYCLE_CLOSING =
  "Put the two together and it's really one story: roots stay put for decades because replacing one is " +
  'disruptive everywhere at once, leaves now live for weeks because renewing one got automated, and ' +
  'revocation checking is being redesigned around exactly that same shift.';
```

Notes on this snippet, for the Implementer:
- Long string literals are split with `+` purely for line-length readability in this plan doc; collapse to
  single-line strings or template literals to match whatever the file's existing formatting convention is
  (the existing `CERT_DATA` uses single-line string literals — prefer matching that over the multi-line form
  shown here).
- `strong` labels deliberately end in `:` and stay short (2–4 words), matching the existing `CertPoint` usage
  in `CERT_DATA` (`'When it applies:'`, `'The catch:'`, `'The upside:'`) — **not** the longer period-terminated
  label style used in `Chapter3Handshake.tsx`'s `MITM_POINTS`/`PIPELINE_POINTS`. Keep this file's own
  convention.
- Avoid writing `CRLs` (plural, glued to the acronym) inside any `.text` field that will be rendered through
  `AutoLink` — `AutoLink`'s regex matches acronyms on `\b` word boundaries, and `CRLs` does not have a
  boundary between `L` and `s`, so it would silently fail to get a tooltip. The draft above already avoids
  this by using "CRL-based checking" instead of "CRLs" inside body text. `strong` labels are fine either way
  since they are never passed through `AutoLink` (see `CertificateTabs.tsx`, they render as plain
  `<strong>{p.strong}</strong>`).

---

✅ **Implemented.** Import line and JSX block added exactly as specified, immediately after the existing
tabbed `Card` and before the section's closing tag. Per the owner's resolution of the §10 coordination note,
two further additions were made below the closing paragraph (still inside `<section id="reference">`, still
before `</section>`): `<CertificateFieldDecoder />` and `<VerificationWalkthrough />`, the two interactives
from `simulation-design.md`. See that doc for their implementation. The "Resulting order" list below this
point is superseded by that addition — final order is items 1–6 as listed, then 7. Certificate Field
Decoder, then 8. Verification Walkthrough.

## 4. Exact change: `src/components/reference/CertificateTabs.tsx`

**Import line** — extend the existing import to pull in the three new exports:

```tsx
import { CERT_DATA, CERT_LIFECYCLE_BRIDGE, CERT_LIFECYCLE_SECTIONS, CERT_LIFECYCLE_CLOSING, type CertTab } from '../../data/certificates';
```

**JSX** — insert the following immediately after the existing `<Card>...</Card>` block (the one containing the
`Toggle`, flow chips, title, and points list) and before the section's closing `</section>` tag:

```tsx
      <p className="text-ink-dim text-[14.5px] mt-6 mb-5 max-w-[70ch]">
        <AutoLink text={CERT_LIFECYCLE_BRIDGE} />
      </p>

      {CERT_LIFECYCLE_SECTIONS.map((section) => (
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

      <p className="text-ink-faint text-[13.5px] mt-2">
        <AutoLink text={CERT_LIFECYCLE_CLOSING} />
      </p>
```

This is a direct copy of three patterns already in the codebase, recombined, not a new visual idiom:
- The stacked-`Card`-with-`h3`-and-`<ul>` shape is exactly `Chapter6ForwardProxy.tsx`'s `DEPLOY_STEPS`/
  `DEPLOY_CONSIDERATIONS` cards.
- The `CertPoint`-list-inside-a-`<ul>` rendering (`p.strong` + `AutoLink`) is copied verbatim from
  `CertificateTabs.tsx`'s own existing `data.points.map(...)`.
- The `text-ink-faint text-[13.5px]` closing-footnote paragraph style matches the closing lines in
  `Chapter6ForwardProxy.tsx` and the `S1` footnote in `Sandbox.tsx`.

No changes are needed to the `Toggle`, `TAB_OPTIONS`, `useState`, or the existing tabbed `Card` — they render
exactly as they do today, unmodified, above this new content.

**Resulting order inside `<section id="reference">` after this change:**
1. `SectionHead` (unchanged)
2. Tabbed `Card` (Toggle + flow chips + title + points) (unchanged)
3. **New:** bridge paragraph
4. **New:** "Not every certificate in the chain lives the same length of time" `Card`
5. **New:** "Expiry and revocation aren't the same problem" `Card`
6. **New:** closing tie-together paragraph

---

✅ **Implemented.** Three lines added after the `SAN` entry as specified.

## 5. Exact change: `src/data/acronyms.ts`

Insert these three lines. Suggested location: after the `SAN: 'Subject Alternative Name',` line, keeping the
certificate-related acronyms grouped together (purely cosmetic — the dictionary is a flat object and order has
no functional effect on `AutoLink`).

```ts
  ACME: 'Automatic Certificate Management Environment',
  OCSP: 'Online Certificate Status Protocol',
  CRL: 'Certificate Revocation List',
```

Verified none of these three keys currently exist in `ACRONYMS` (full file read before writing this plan).

---

✅ **Implemented.** Four entries added to the end of the `tls` array as specified.

## 6. Exact change: `src/data/glossary.ts`

Add four new entries to the end of the existing `tls` array (after the `Cipher suite` entry, before the
array's closing `],`):

```ts
    { term: 'ACME (automatic certificate management environment)', def: 'The standard automated conversation between a server and a CA that proves domain control and issues a fresh certificate without a human doing it by hand. What makes very short-lived certificates practical at scale.' },
    { term: 'OCSP (online certificate status protocol)', def: 'A live, real-time check asking a CA whether one specific certificate has been revoked. Being phased out industry-wide in favor of CRLs.' },
    { term: 'CRL (certificate revocation list)', def: 'A periodically downloaded list of every currently revoked certificate, checked locally instead of queried live. The direction revocation checking is shifting toward as OCSP use declines.' },
    { term: 'Revocation', def: 'A certificate being invalidated before its scheduled expiry, usually because a private key leaked or the domain changed hands. A different failure mode than expiry, which is scheduled and unavoidable.' },
```

Style note: this matches the existing `'SAN (subject alternative name)'` / `'PSK (pre-shared key)'` pattern
(acronym first, lowercase expansion in parens) rather than the `'Certificate authority (CA)'` pattern (full
term first) — chosen because ACME/OCSP/CRL are the forms actually used in the new running prose (see §3),
same as SAN and PSK are the forms used in their respective tabs' prose. `Revocation` gets no parenthetical
since it isn't an acronym, matching `Zone` and `Chain of trust`.

Verified against a full read of `glossary.ts`: none of `ACME`, `OCSP`, `CRL`, or `Revocation` exist anywhere
in any of the three categories (`firewall`, `tls`, `vpn`) today. `Root certificate`, `Intermediate
certificate`, `Leaf certificate`, and `Chain of trust` already exist in `tls` and are **not** touched or
redefined by this plan — the new content in §3 relies on those existing definitions rather than restating
them.

---

## 7. Full draft prose (final copy, for reference — identical to what's embedded in §3's code)

**Bridge paragraph** (plain text, sits between the existing tabbed `Card` and the new content):

> The three tabs above are about where a certificate sits and who holds the private key. The two things below are about time: how long each certificate in the chain actually gets to live, and what happens when one has to die earlier than planned.

**Card 1 — "Not every certificate in the chain lives the same length of time"**

> Root, intermediate, and leaf certificates aren't just different links in the same chain of trust, they're built to live on entirely different clocks, and the reason comes down to how disruptive replacing each one is.

- **Root:** commonly valid for around twenty years. Every browser and operating system ships with a fixed list of root certificates it already trusts, installed ahead of time, so swapping one out means waiting for a replacement to reach that trust list on essentially every device in use first. That kind of rollout is slow by nature, which is exactly why roots are issued to last a long time and retired on a schedule planned years in advance.
- **Intermediate:** typically valid for several years, sitting between the root and the leaf specifically so the root itself can stay locked away and rarely touched. Rotation happens with deliberate overlap, a new intermediate is already trusted well before the old one expires, so nothing downstream ever has to wait on one exact expiry date.
- **Leaf:** the shortest-lived by far, and still shrinking. Public certificate lifetimes that were commonly around a year until recently are being cut down in scheduled stages under current industry rules, with the endpoint as low as 47 days.
- **The tradeoff:** a shorter-lived leaf certificate narrows how long a stolen or wrongly issued one can cause damage before it simply stops working, but it costs convenience. Renewing a certificate by hand once a year was already easy to forget; renewing one every few weeks by hand isn't something any real organization can keep up with.
- **How it renews itself:** ACME defines a standard, scripted conversation between a small agent running on a server and a CA: prove control of the domain, receive a freshly signed certificate, install it, and repeat automatically, well before the current one runs out. It's the same mechanism behind several widely used free certificate authorities, and it's the reason certificate lifetimes can keep shrinking without renewal turning into a full-time job for someone.

**Card 2 — "Expiry and revocation aren't the same problem"**

> A certificate can stop being trusted in two different ways, and only one of them is on a schedule.

- **Expiry:** scheduled and absolute. Every certificate carries a hard end date, and the moment it passes, every browser blocks the connection, no grace period and no exceptions.
- **Revocation:** a certificate being invalidated before its stated expiry, usually because something went wrong, a private key was exposed, or the domain it covers changed hands. The certificate itself hasn't expired; it's just been declared untrustworthy ahead of schedule.
- **Checking has meant OCSP:** a live, real-time query to the CA asking whether one specific certificate has been revoked, made fresh on every connection.
- **Now it's shifting to CRLs:** the industry is moving away from those real-time OCSP lookups and back toward CRL-based checking, downloading a list of everything currently revoked on a schedule and checking it locally instead of querying a server live. Shrinking leaf certificate lifespans are a direct part of why: a certificate that only lives for weeks instead of a year gives a compromised-but-not-yet-expired certificate a much smaller window to do damage, which makes the always-on infrastructure real-time checking requires less load-bearing than it used to be.

**Closing paragraph** (ties the two cards together as one story, per the research doc's own framing):

> Put the two together and it's really one story: roots stay put for decades because replacing one is disruptive everywhere at once, leaves now live for weeks because renewing one got automated, and revocation checking is being redesigned around exactly that same shift.

---

## 8. Deliberate scope calls made in this plan (flagging so nothing reads as an oversight)

- **The CA/Browser Forum is never named.** The research doc's source material attributes the leaf-lifetime
  reduction to "the industry body that sets browser/CA rules." This plan refers to it only as "current
  industry rules" rather than naming the CA/Browser Forum specifically. This matches the site's existing
  pattern of naming a specific organization only when it's load-bearing for the point being made (the one
  exception, the App-ID/User-ID/Content-ID vendor-attribution note, exists specifically to correct a
  credibility problem — there's no equivalent problem here). If the project owner wants the body named
  explicitly, that's a one-clause addition to the "Leaf:" bullet in §3/§7, not a restructure.
- **The 47-day figure is stated as a current policy target, not a settled fact of today's web.** Phrased as
  "current industry rules, with the endpoint as low as 47 days" rather than asserting it as already true, since
  it's a phased-in future state per the source material. Worth a periodic accuracy check by whoever maintains
  this content, since it's one of the only date-sensitive claims on the entire site.
- **No interactive element is proposed.** The existing Reference section has exactly one piece of interaction
  (the `Toggle`) and is otherwise static, dense recap copy — consistent with `content-strategy.md`'s own
  assessment that the Reference section's "denser, less scaffolded" register is the *correct* register for a
  lookup section, not a gap to fix. This plan stays inside that register. If interactivity is wanted here
  (e.g., a lifespan timeline visualization), that's the parallel Interaction Designer's lane — see below.

  ❌ **Superseded by owner resolution (2026-07-24).** The project owner reviewed both this doc and
  `simulation-design.md` and decided the two interactives proposed there (Certificate Field Decoder,
  Verification Walkthrough) ARE in scope for this phase — this bullet's "no interactive element" call does
  not stand. Everything else in this §8 (the CA/Browser Forum naming call, the 47-day-figure phrasing) still
  stands unchanged. See §10 below and `simulation-design.md`'s status block for what was actually built.

---

## 9. Order of implementation (for the Implementer)

1. `src/data/acronyms.ts` — add the three entries (§5).
2. `src/data/glossary.ts` — add the four entries (§6).
3. `src/data/certificates.ts` — append the new exports (§3).
4. `src/components/reference/CertificateTabs.tsx` — update the import and add the new JSX block (§4).
5. `npm run build` (type-checks via `tsc -b` then bundles) and `npm run lint` — both must pass clean.
6. Visual check in `npm run dev`: confirm the existing tab `Toggle` still switches `forward`/`inbound`/`vpn`
   content unchanged, the new bridge paragraph and two cards render below it inside the same `#reference`
   section, and hovering `CA`, `ACME`, `OCSP`, and `CRL` anywhere in the new copy shows the correct tooltip.

---

## 10. Coordination note

A separate Simulation/Interaction Designer agent is working the same research candidates (#5/#17) in parallel
and does not share context with this plan. If that agent's output proposes any interactive or visual treatment
for this same lifespan/revocation content (e.g., a timeline slider, an ACME renewal animation), the Implementer
and/or project owner needs to reconcile the two plans before execution — this plan assumes a fully static
addition matching the Reference section's existing non-interactive convention (§8), and should not be applied
verbatim alongside a conflicting interactive plan for the same block without that reconciliation happening
first.

✅ **Reconciled by the project owner (2026-07-24).** `simulation-design.md` did propose exactly this kind of
interactive treatment (Certificate Field Decoder in its §1, Verification Walkthrough in its §2). The owner
resolved the conflict this note anticipated: both interactives are in scope, placed below this doc's two new
`Card`s (after "Expiry and revocation aren't the same problem" and its closing paragraph), still inside
`<section id="reference">` — matching `simulation-design.md` §2.6's own suggested placement (prose first,
hands-on last, the same relationship `PolicyEvaluator` has to the rest of `Chapter5DecryptionPolicies.tsx`).
Built as `src/components/reference/CertificateFieldDecoder.tsx` and
`src/components/reference/VerificationWalkthrough.tsx`, wired into `CertificateTabs.tsx` per §4's update above.
Two further owner resolutions applied on top of `simulation-design.md` itself: its proposed 7th "Revocation
info" chip (§1.7) was built; its proposed 6th verification scenario (§2.6, bad-intermediate/step-2-only
failure) was deliberately skipped. See `simulation-design.md`'s own status block for detail.
