**Implementation status (added by the Implementer agent, 2026-07-24): both interactives are ✅ implemented.**
**The project owner resolved this doc's two ⚠ open flags before implementation (§4): §1.7's proposed 7th**
**"Revocation info" chip was built (owner approved, do not stop at 6); §2.6's proposed 6th verification**
**scenario (bad-intermediate/step-2-only failure) was skipped (owner approved skipping it) — exactly the 1**
**valid + 4 failure scenarios in §2.3 shipped, no more. New files:**
**`src/components/reference/CertificateFieldDecoder.tsx`, `src/data/certificateFields.ts` (field/chip data,**
**mirroring `cipherSuite.ts` per this doc's own citation), `src/components/reference/VerificationWalkthrough.tsx`**
**(scenario/step data kept inline in the component, mirroring how `PolicyEvaluator` keeps its data inline in**
**`Chapter5DecryptionPolicies.tsx` rather than in a separate data file). Both wired into**
**`CertificateTabs.tsx` below `content-plan.md`'s two new prose `Card`s, per §2.6's own suggested placement —**
**see `content-plan.md`'s §10 note for the placement reconciliation. The optional preview-line-highlight**
**enhancement mentioned in §1.5 was not built (explicitly optional/skippable in that section; skipped to keep**
**scope to what both docs actually specify).**

# Phase 1 — Simulation / Interaction Design: Certificate Field Decoder & Verification Walkthrough

**Author role:** Simulation/Interaction Designer (game-design role — mechanics and states only, no prose, no code).
**Status:** Draft, awaiting project-owner review alongside `content-plan.md` (produced in parallel by the Content & Flow Strategist).
**Consumes:** `docs/research-ideas.md` #5 (short-lived certs & ACME) and #17 (root cert longevity, expiry vs. revocation) for subject-matter grounding; `src/components/chapters/CipherDecoder.tsx` + `src/data/cipherSuite.ts` (chip-click pattern); `src/components/chapters/Chapter5DecryptionPolicies.tsx`'s `PolicyEvaluator` + `src/components/sandbox/Sandbox.tsx` (ordered-check pattern).
**Produces:** this document. Read alongside `content-plan.md` — that doc owns exact placement in `CertificateTabs.tsx`/`certificates.ts` and all final prose; this doc owns mechanics, states, example data, and the *facts* each explainer must convey (not the polished sentences themselves).

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string shown in quotes in this doc (field explainers, step messages, verdict text) is a **draft/placeholder written to prove the mechanic reads correctly** — the Implementer should treat these as content-requirements, matching them against `content-plan.md`'s voice, not paste them in verbatim as final copy. Where I mean "these exact facts must appear, wording is not mine to decide," I've written that as a bullet list of facts instead of a sentence.

Two components, never merged, per the project's one-interactive-per-concept rule:
1. **Certificate Field Decoder** — adapts `CipherDecoder`'s chip pattern.
2. **Verification Walkthrough** — adapts `PolicyEvaluator`'s ordered-check pattern.

They share one fictional PKI story (below) so a learner who does both sees a consistent world, but neither depends on the other to function — either could ship alone.

---

## 0.1 Shared fictional PKI story (both interactives use this)

Domain chosen from the `.test` TLD, which [RFC 2606](https://www.rfc-editor.org/rfc/rfc2606) reserves specifically so it can never resolve to a real registered domain — a stronger "this is obviously fictional" signal than reusing `example.com`, and it echoes the site's own name.

- **Root CA:** `Netwise Example Root CA` — self-signed, deliberately long-lived, offline.
- **Intermediate CA:** `Netwise Example Intermediate CA` — signed by the root, does the actual day-to-day leaf-signing.
- **Leaf certificate:** issued to `portal.netwise-example.test`, signed by the intermediate.

The Field Decoder shows this leaf certificate's fields in detail. The Verification Walkthrough validates this same three-tier chain (with variations per failure scenario). Reusing the same names across both interactives is a deliberate continuity choice, not a requirement — flag if the Content Strategist prefers different fictional names for narrative reasons.

---

## 1. Interactive 1 — Certificate Field Decoder

### 1.1 Purpose and pattern being adapted

Directly adapts `CipherDecoder`: a row of clickable chips, one always "active," an explainer panel below shows detail for whichever chip is active. Two deltas from the original, both necessary because certificate fields carry more structure than a 4-13 character cipher-suite token:

1. **Chip label ≠ chip value.** In `CipherDecoder`, the chip text *is* the value (`ECDHE`, `RSA`...). A certificate field's value (`CN=portal.netwise-example.test, O=Netwise Example Corp, C=US`) is too long to sit on a button. Chips show the **field name** (`Subject`, `Issuer`, ...); the value moves into the explainer panel.
2. **A full-certificate preview block sits above the chips.** `CipherDecoder` doesn't need this because a cipher suite string is inherently one line, self-evident from its four chip codes concatenated. A certificate is a multi-line structured document — showing the whole thing first (non-interactive, like a real "view certificate" pane) is what makes the fictional example actually read as *a certificate* rather than a scattered set of six unrelated facts. This satisfies the brief's "invent a clearly-fictional, illustrative example certificate ... with plausible values for every field" more literally than chips alone would.

### 1.2 The example certificate (raw preview block)

Rendered as a monospace, non-interactive block (same visual family as other monospace blocks on the site: `bg-bg-deep`, `border-line-soft`), styled to resemble `openssl x509 -text` output. This block is the literal "plausible example certificate" the brief asks for:

```
Certificate:
    Version: 3 (0x2)
    Serial Number: 04:8a:2f:19:c3:00:0e:77:aa:11
    Signature Algorithm: sha256WithRSAEncryption
    Issuer: C=US, O=Netwise Example CA, CN=Netwise Example Intermediate CA
    Validity:
        Not Before: Jan 15 00:00:00 2026 GMT
        Not After : Apr 15 23:59:59 2026 GMT
    Subject: C=US, O=Netwise Example Corp, CN=portal.netwise-example.test
    Subject Public Key Info:
        Public Key Algorithm: rsaEncryption
        RSA Public-Key: (2048 bit)
    X509v3 extensions:
        X509v3 Subject Alternative Name:
            DNS:portal.netwise-example.test, DNS:www.netwise-example.test, DNS:api.netwise-example.test
        X509v3 CRL Distribution Points:
            Full Name: URI:http://crl.netwise-example-ca.test/intermediate.crl
```

**On the dates:** deliberately not tied to whatever the real-world "today" is when a learner reads the page. This block is a static reference example — it demonstrates what the Validity field *is* and how to read it, not whether this specific instance is currently valid. "Is it valid right now" is what the Verification Walkthrough (Interactive 2) demonstrates, and that interactive uses relative day-counts instead of fixed calendar dates for exactly this reason (see §2.3). Recommend the Implementer keep these dates as static values in the data file — no live date math needed here, consistent with how every other data file in this repo (`cipherSuite.ts`, `sandboxScenarios.ts`) holds plain static values.

**Version and Serial Number** appear in the raw block for realism (every real certificate has them) but are **not** chip-clickable — they don't carry independent teaching payload beyond "certificates carry version/serial metadata too," and adding chips for them would dilute focus. This is a deliberate scope cut, not an oversight.

### 1.3 Field list and data shape

Six required chips (per the brief's minimum) plus one proposed seventh — see the open flag in §1.7 before building the seventh.

Suggested data shape (illustrative, not literal source — mirrors `CipherPart` in `cipherSuite.ts`):

```ts
interface CertField {
  id: string;        // 'subject' | 'issuer' | 'validity' | 'san' | 'pubkey' | 'sigalg' | 'revocation'
  label: string;      // chip button text, e.g. "Subject"
  rawLine: string;    // the line(s) in the preview block this chip corresponds to —
                       // used to both display the value in the explainer panel AND
                       // (optional enhancement, see 1.5) highlight the matching line above
  facts: string[];    // bullet facts this field's explainer must convey — content strategist's
                       // job to turn into final prose, not mine to phrase
}
```

Chip order (top-to-bottom teaching sequence, matches how a learner would naturally read "who is this for → who backs it → when's it good → what proves the connection → how do we check it hasn't been killed early"):

1. Subject
2. Subject Alternative Name (SAN)
3. Issuer
4. Validity window
5. Public Key
6. Signature Algorithm
7. *(proposed)* Revocation info

### 1.4 Field-by-field facts

For each field: the raw value (already shown above, repeated in the explainer panel scoped to just that field), and the facts its explainer needs to convey.

**1. Subject**
Value: `CN=portal.netwise-example.test, O=Netwise Example Corp, C=US`
Facts:
- Identifies who the certificate was issued to — the entity, not the CA.
- Format is a Distinguished Name: `CN` (Common Name), `O` (Organization), `C` (Country).
- Historically `CN` held the hostname a browser checked against, but modern clients no longer trust `CN` for that — they check the SAN field instead (pointer forward to field #2). Flag this explicitly so a learner doesn't come away thinking Subject alone proves the domain.
- The `O` field here (an organization name) reflects an organization-validated certificate. Not every certificate carries verified organization info — domain-validated (DV) certificates, which are the large majority issued through ACME-style automation, often leave `O` blank or generic. This is a natural pointer to the site's new short-lived-certs/ACME content (research-ideas.md #5) — most of what's shrinking in lifetime is exactly this DV, automated category.

**2. Subject Alternative Name (SAN)**
Value: `DNS:portal.netwise-example.test, DNS:www.netwise-example.test, DNS:api.netwise-example.test`
Facts:
- Lists every hostname (and, on other certificates, IP address) this one certificate is valid for. This is the field a client actually checks the requested hostname against — not Subject CN (reinforces the pointer from field #1).
- One certificate can cover several related names — here, the bare domain plus two subdomains — instead of needing a separate certificate per name.
- The site's existing glossary already defines a **wildcard certificate** (`*.example.com`-style) as an alternative to listing names individually; this example deliberately lists explicit names instead of a wildcard, so the SAN list format itself is visible. Worth a one-line cross-reference to that glossary entry rather than re-explaining wildcards here.
- If the hostname a browser is actually visiting isn't in this list, the connection fails — regardless of how otherwise-valid and properly-signed the certificate is. Worth stating plainly since it's a common real-world "why did this obviously-valid cert throw an error" cause.

**3. Issuer**
Value: `C=US, O=Netwise Example CA, CN=Netwise Example Intermediate CA`
Facts:
- Identifies which CA signed this certificate, vouching for it — matches the site's existing glossary definition of "Certificate authority (CA)."
- This issuer is an **intermediate**, not the root. Ties directly to research-ideas.md #17: root CAs are deliberately long-lived and kept offline; day-to-day signing is delegated to intermediates, which are themselves rotated every few years on a planned overlap schedule so a new one is trusted before the old one expires.
- This field is the anchor for Interactive 2: the Verification Walkthrough's first two checks are literally "does this Issuer's signature check out" and "is *that* issuer's own issuer eventually a trusted root."
- Same Issuer concept, different job depending on context — worth a light cross-reference to the existing three-tab certificate reference (forward proxy / inbound inspection / VPN), which already covers who holds which certificate in each scenario.

**4. Validity window**
Value: `Not Before: Jan 15 00:00:00 2026 GMT` / `Not After: Apr 15 23:59:59 2026 GMT` (a 90-day window)
Facts:
- Two timestamps: Not Before (when the certificate starts being valid) and Not After (when it stops).
- Browsers hard-block the instant Not After passes. No grace period, no partial trust, no warning-but-proceed option. This is scheduled and predictable — the explicit contrast research-ideas.md #17 draws against revocation, which is unscheduled and needs a live check instead of just reading a date.
- This example's ~90-day window mirrors what mainstream automated CAs (Let's Encrypt-style, via ACME) already issue today, not a hypothetical future state. Direct pointer to the new short-lived-certs content (#5): the industry-mandated maximum keeps shrinking further (down toward 47 days by 2029), which is what makes automation move from convenience to necessity.
- This field is the anchor for Verification Walkthrough step 4.

**5. Public Key**
Value: `Public Key Algorithm: rsaEncryption` / `RSA Public-Key: (2048 bit)`
Facts:
- This is the certificate subject's *own* key pair — the same kind of key Chapter 4's `CipherDecoder` already introduced as the "authentication algorithm" (the `RSA` in a cipher suite name). The certificate is where that public key is actually published.
- Only the server holds the matching private key. That's the entire mechanical basis of "the server proves it's really the one this certificate was issued to" during the handshake — the server can do something (a signature, or decrypting something encrypted to this public key) that only the true private-key holder could do.
- This is a **different key** from the one in the Signature Algorithm field below. Two distinct keys are involved in reading one certificate, and conflating them is a common point of confusion: this key belongs to the certificate's *subject* (the leaf); the signature below was produced by the *issuer's* key. Worth stating explicitly, as a "don't mix these two up" note.

**6. Signature Algorithm**
Value: `sha256WithRSAEncryption`
Facts:
- Explicitly **not** the algorithm the certificate's own key uses (that's field #5) — this is the algorithm the Issuer (the intermediate CA) used to sign and vouch for this certificate.
- A client re-verifies this signature using the issuer's public key (found on the issuer's *own* certificate) to confirm two things at once: the certificate wasn't tampered with in transit, and it really was issued by that specific CA.
- If this signature doesn't check out, nothing else about the certificate matters — a client won't even proceed to check validity dates or revocation status. This is exactly Verification Walkthrough step 1 (and, one level up the chain, step 2), and it's first in that ordered list for this reason: it gates everything after it.

**7. Revocation info** *(proposed — see open flag §1.7 before building)*
Value: `X509v3 CRL Distribution Points: Full Name: URI:http://crl.netwise-example-ca.test/intermediate.crl`
Facts:
- Points to where a client can check whether this specific certificate has been killed early — before its natural Not After date — rather than expiring on schedule.
- Historically two mechanisms: downloading a CRL (a list of revoked serial numbers) or asking a live OCSP responder "is this one still good?" in real time.
- Direct pointer to research-ideas.md #17: real-time OCSP checking is being phased out industry-wide in favor of CRLs, and shorter certificate lifetimes (field #4) are part of *why* — a much smaller window exists for a compromised-but-not-yet-expired certificate to do damage.
- This is the data the Verification Walkthrough's final step ("has it been revoked?") is conceptually checking against.

### 1.5 UI states and behavior

- State: `active: number`, index into the field array, default `0` (Subject) — identical state shape to `CipherDecoder`'s `active`.
- Chip row: identical visual treatment to `CipherDecoder`'s chips (active = accent border/text/10%-tint background; inactive = line border, dim text, hover states). No new classes needed.
- Explainer panel below the chips: two parts, in order —
  1. The field's raw value, scoped to just this field (e.g. for Subject: `CN=portal.netwise-example.test, O=Netwise Example Corp, C=US`), styled as inline code/monospace, visually distinct from the prose below it.
  2. The plain-English explanation, informed by the facts in §1.4, in the site's established voice (Content Strategist's job).
- **Optional enhancement, not required:** when a chip is active, highlight the matching line(s) in the full-certificate preview block above (e.g. accent-tinted background on that line only). Because both the preview block and the chip explainer are meant to be generated from the same underlying field data (`rawLine` on each `CertField`), this is a small conditional-className addition, not a structural change — worth doing if time allows, safe to skip if not; the interactive is fully functional either way.
- No button, no multi-step reveal — single click swaps `active`, same as `CipherDecoder`. Nothing here needs Sandbox's terminal-log treatment (see §2.5 for why that matters more for Interactive 2).

### 1.6 Visual / motion notes

No new tokens, no new motion. Reuses `CipherDecoder`'s existing Tailwind classes verbatim for the chip row; the preview block reuses whatever monospace/`bg-bg-deep` treatment already exists elsewhere on the site (e.g. Sandbox's console, styled *without* the cursor-blink/log-accumulation behavior — this block is static, not a feedback stream).

### 1.7 Open flags

- ⚠ **needs a decision:** whether to build the 7th "Revocation info" chip. It's outside the brief's explicit minimum (Subject, Issuer, Validity, SAN, Public Key, Signature Algorithm), but I think it's worth including because it's the one field that structurally bridges this interactive to both the #17 prose content and the Verification Walkthrough's final step — without it, "revocation" is introduced in prose and in Interactive 2 but never grounded in an actual certificate field. If cut, nothing else breaks; the Verification Walkthrough's revocation step stands on its own regardless. Recommend: build it, but this is the project owner's call since it's scope beyond the literal brief.

  ✅ **Resolved by the project owner (2026-07-24): build it.** Implemented as the 7th chip
  (`id: 'revocation'`, label "Revocation info") in `src/data/certificateFields.ts`, rendered by
  `CertificateFieldDecoder.tsx` in the same chip row as the other six, no structural difference from the
  brief's original six.

---

## 2. Interactive 2 — Verification Walkthrough

### 2.1 Purpose and pattern being adapted

Adapts `PolicyEvaluator`, specifically — not `Sandbox`. Both were named as reference in the brief, but they encode different mechanics, and this interactive should follow `PolicyEvaluator`'s, not blend both:

- `PolicyEvaluator`: a `<select>` picks a scenario; an ordered list re-renders instantly with the relevant item(s) highlighted; a static verdict bar at the bottom. No button, no accumulating log, no animation.
- `Sandbox`: a button-triggered action that appends a new entry to a scrolling, timestamped, terminal-style log with a blinking cursor.

CLAUDE.md is explicit that the terminal-log/blinking-cursor treatment is reserved specifically for `Sandbox` — *"Motion is intentionally split in two tiers ... The Sandbox ... is the one exception ... If you extend the Sandbox, keep new feedback in that console rather than adding a separate static result box."* This interactive is not the Sandbox and isn't extending it, so it must **not** adopt that treatment. It should be reactive-on-select, static-render, exactly like `PolicyEvaluator`: pick a scenario from a dropdown, the five-step list updates immediately, no button, no log accumulation.

The mechanic being adapted specifically: in `PolicyEvaluator`, only the one matching rule gets highlighted and rules below it visibly "never get a chance to fire." Here, the analogous idea is: steps before the failure point are shown as passed, the one failing step is highlighted as the failure, and every step after it is shown as **not reached** — directly mirroring "rules below it never get a chance to fire once one above it already has." This is a stronger, more literal fit for "ordered checks, first blocking failure halts the chain" than Sandbox's pattern, which is why `PolicyEvaluator` should be the primary template.

### 2.2 The ordered checks

Five steps, fixed order, matching the brief exactly:

| # | id | Label (the question shown) | Draft "pass" message (content strategist to finalize) |
|---|----|----|----|
| 1 | `leaf-sig` | Leaf signature valid? | "Verified — the leaf certificate's signature checks out against the intermediate CA's public key." |
| 2 | `intermediate-sig` | Intermediate signature valid? | "Verified — the intermediate CA's own certificate is properly signed by the root CA's public key." |
| 3 | `root-trusted` | Root in trust store? | "Verified — that root CA is present in this client's trusted root store." |
| 4 | `validity-window` | Is today inside the validity window? | "Verified — today's date falls between Not Before and Not After." |
| 5 | `revocation` | Has it been revoked? | "Verified — not found on the CRL, not flagged as revoked." |

A step's status is always one of three states, computed from the active scenario's `failStepIndex` (or `null` for the fully-valid scenario):
- **pass** — index is before `failStepIndex` (or scenario has no failure at all).
- **fail** — index equals `failStepIndex`. Exactly one step per scenario, or zero for the valid scenario.
- **not-reached** — index is after `failStepIndex`. Never independently evaluated; shown as dimmed/neutral, not colored pass or fail, with a short note like "not evaluated — an earlier check already failed."

### 2.3 Scenario data (exact)

A note on dates: unlike a live security product, this is a static teaching page with no real clock input, and it needs to stay evergreen (the site doesn't get updated on a schedule that tracks "today"). So scenario data below uses **relative day-counts in the message text** ("issued 120 days ago, expired 12 days ago") rather than fixed calendar dates — this avoids the whole interactive quietly becoming stale or self-contradictory years after publication, and it doesn't require any actual date math or live clock in the implementation; the "relative" framing is just how the fixed strings are worded, not a computed value. This is a confident design decision, not an open flag.

Five scenarios: one fully-valid baseline (default/first option) and four failures, one per distinct blocking step. `PolicyEvaluator`'s `EVAL_SCENARIOS` array is the direct structural template — same idea, swap `category` for `failStepIndex` and a per-step message override.

Suggested data shape (illustrative, mirrors `EvalScenario` in `Chapter5DecryptionPolicies.tsx`):

```ts
interface VerificationScenario {
  value: string;               // dropdown option value
  label: string;                // dropdown option text
  whatsWrong: string;           // one-line summary of the scenario's premise (for the card's own use, not necessarily rendered)
  failStepIndex: number | null; // 0-4, or null if fully valid
  failMessage?: string;         // only present when failStepIndex is set — overrides that step's default pass message
}
```

**A — Valid certificate** *(default, shown first)*
- `value: 'valid'`
- Label: "Valid certificate (the happy path)"
- What's wrong: nothing — every check passes.
- `failStepIndex: null`
- All five steps show their default pass message from §2.2.
- Verdict: **TRUSTED**. Draft message: "All 5 checks passed — the browser proceeds with the connection."

**B — Tampered / forged certificate**
- `value: 'tampered'`
- Label: "Tampered certificate"
- What's wrong: the signed content and the signature on the leaf certificate don't match — either corruption in transit, or an attempt to forge a certificate for this domain without a real CA's signature.
- `failStepIndex: 0` (leaf-sig)
- Fail message (step 1): "Failed — this certificate's signature doesn't verify against the intermediate CA's public key. The signed content and the signature don't match. Whether that's corruption or forgery, the result is the same: the chain never even gets to check who issued it."
- Steps 2-5: not-reached.
- Verdict: **NOT TRUSTED**. Draft message: "Blocked at step 1: invalid signature."

**C — Untrusted root**
- `value: 'untrusted-root'`
- Label: "Untrusted root CA"
- What's wrong: the chain is internally consistent (leaf signed by intermediate, intermediate signed by a root) but that root — call it `Unverified Example Root CA` for this scenario, deliberately *not* `Netwise Example Root CA` — was never added to this client's trust store. This is the same shape of problem the site's existing forward-proxy certificate content already describes (an internal CA that every managed device has to be told to trust, or warnings appear).
- `failStepIndex: 2` (root-trusted)
- Steps 1-2 pass normally.
- Fail message (step 3): "Failed — this chain leads back to a root CA that isn't in this client's trusted root store. The signatures are all internally consistent; this isn't tampering. The client simply has no reason to trust that specific root."
- Steps 4-5: not-reached.
- Verdict: **NOT TRUSTED**. Draft message: "Blocked at step 3: unknown root CA."

**D — Expired certificate**
- `value: 'expired'`
- Label: "Expired certificate"
- What's wrong: this certificate's Not After date has already passed.
- `failStepIndex: 3` (validity-window)
- Steps 1-3 pass normally.
- Fail message (step 4): "Failed — this certificate expired 12 days ago. Browsers hard-block here, no exceptions, no partial trust, regardless of how solid the signature chain above it is."
- Step 5: not-reached.
- Verdict: **NOT TRUSTED**. Draft message: "Blocked at step 4: certificate has expired."

**E — Revoked certificate**
- `value: 'revoked'`
- Label: "Revoked certificate"
- What's wrong: the issuing CA killed this certificate early — e.g. the private key leaked — even though it's nowhere near its natural expiry.
- `failStepIndex: 4` (revocation)
- Steps 1-4 pass normally (signatures fine, root trusted, still well inside the validity window).
- Fail message (step 5): "Failed — this certificate's serial number appears on the issuing CA's revocation list, revoked 3 days ago, reason given: key compromise. It's still inside its validity window; the CA killed it early anyway."
- Verdict: **NOT TRUSTED**. Draft message: "Blocked at step 5: certificate revoked."

That's 1 valid + 4 failure scenarios (brief asked for "at least three toggleable failure scenarios" — this covers four, one per distinct failing step among 1, 3, 4, 5).

### 2.4 UI states and behavior (exact)

- State: `scenarioValue: string`, default `'valid'`. Identical shape to `PolicyEvaluator`'s `scenarioValue`/`EVAL_SCENARIOS` state.
- Dropdown: same `<select>` treatment as `PolicyEvaluator`'s "Traffic scenario" picker — label "Certificate scenario," options are the five `label` strings above.
- On change: recompute all five step statuses immediately (pure function of `failStepIndex`, no transition delay, no button). This is a direct copy of `PolicyEvaluator`'s reactive-recompute-on-change behavior.
- Ordered list (five `<li>`-equivalent rows), each showing:
  - The step's label (the question) — always visible, regardless of status.
  - A status indicator: pass / fail / not-reached (icon or text glyph — lucide-react is already a project dependency; exact icon choice left to the Implementer, consistent with icon usage already established elsewhere in the codebase).
  - The step's message: the scenario's override message if this step is the `failStepIndex`, otherwise the default pass message from §2.2, or the "not evaluated" note if the step is after the failure point.
  - Styling: pass → success-green tint/border (reuse the same `border-accent`/`bg-accent/10` treatment `PolicyEvaluator` uses for its matched rule, since CLAUDE.md documents that `--color-success` intentionally shares its hue with `--color-accent`). fail → danger-red tint/border (`border-danger`/`bg-danger/10`/`text-danger` — CLAUDE.md reserves danger red specifically for "errors, blocked traffic," which this is). not-reached → the same dim, unstyled treatment `PolicyEvaluator` uses for rules that never got a chance to fire (`text-ink-dim`, no border/background).
- Bottom verdict bar (same structural slot as `PolicyEvaluator`'s bottom bar: `border-t border-line-soft pt-3`, flex row): left side a short summary ("5 of 5 checks passed" / "Blocked at step N"), right side the big colored verdict — `TRUSTED` in success green, `NOT TRUSTED` in danger red. Directly mirrors `PolicyEvaluator`'s `Rule X matched first, so it wins` / `DECRYPT`-or-not right-aligned pattern.

### 2.5 Visual / motion notes

No terminal log, no blinking cursor, no accumulating history — every scenario switch is a full, instant re-render of the same five-row list and one verdict bar, exactly like `PolicyEvaluator`. This is a deliberate exclusion, not an omission: see §2.1's citation of CLAUDE.md's motion-tiers rule. No new color tokens — success/danger/accent/line are all that's needed, all already defined in `src/index.css`.

### 2.6 Open flags

- ⚠ **needs a decision:** none of the five scenarios independently demonstrates step 2 (`intermediate-sig`) failing on its own — the tampered-certificate scenario fails at step 1, which structurally prevents step 2 from ever being reached in that scenario. Demonstrating a step-2-only failure requires a scenario where the leaf's signature is fine but the *intermediate's* signature (against the root) is bad — e.g. a mis-issued or cross-signed intermediate. This is a real but comparatively obscure real-world failure mode. I'm not confident it's worth a 6th scenario given the added complexity relative to how often a learner would actually encounter it — flagging for the project owner rather than guessing. If added, suggested scenario: `value: 'bad-intermediate'`, label "Forged intermediate," `failStepIndex: 1`, fail message along the lines of "Failed — the intermediate CA's certificate doesn't verify against the root's public key. The leaf's own signature checked out, but the chain breaks one link further up."

  ❌ **Resolved by the project owner (2026-07-24): skip it.** Shipped exactly the 1 valid + 4 failure
  scenarios fully specified in §2.3 (`valid`, `tampered`, `untrusted-root`, `expired`, `revoked`) in
  `VerificationWalkthrough.tsx`. No `bad-intermediate` scenario was added; step 2 (`intermediate-sig`) is
  exercised as a pass in every scenario that reaches it, never independently as a failure, exactly as this
  flag anticipated.
- Placement of this component within the Reference → Certificates section (new tab? below the existing three tabs? its own subsection?) is explicitly `content-plan.md`'s call per the master design doc's role split, not mine — I'd suggest it sit below the existing tab content as its own `Card`, the same structural relationship `PolicyEvaluator` has to the rest of `Chapter5DecryptionPolicies` (prose/context first, hands-on check last), but defer to the Content Strategist's placement decision.

  ✅ **Resolved by the project owner (2026-07-24).** Both interactives were placed below `content-plan.md`'s
  two new prose `Card`s (after "Expiry and revocation aren't the same problem" and its closing paragraph),
  still inside `<section id="reference">` — this suggestion (prose first, hands-on last) is exactly what was
  built. See `content-plan.md` §10 for the reconciliation record.

---

## 3. Cross-cutting notes

- **New acronyms this design introduces:** `OCSP` and `CRL` (used in the Field Decoder's proposed 7th field and the Verification Walkthrough's revocation step/scenario). Neither is currently in `src/data/acronyms.ts`. Research-ideas.md #17 discusses both at the prose level, so `content-plan.md` will very likely need to add them regardless of what happens with these interactives — flagging here so it isn't dropped if the two docs are implemented slightly out of sync. `SAN` and `CA` are already in `acronyms.ts` and don't need re-adding.

  ✅ **Confirmed, not duplicated.** `content-plan.md` §5 already added `ACME`, `OCSP`, and `CRL` to
  `src/data/acronyms.ts`. Both interactives here rely on that same dictionary entry via `AutoLink` — no
  second `OCSP`/`CRL` entry was added.
- **Glossary cross-references used by this design** (already exist in `src/data/glossary.ts`, no new entries needed on their account): Certificate authority (CA), Root certificate, Intermediate certificate, Chain of trust, SAN, Wildcard certificate, Self-signed certificate. The Verification Walkthrough's "untrusted root" scenario (§2.3, C) is a direct interactive illustration of the existing Self-signed certificate glossary entry — worth the Content Strategist knowing that link exists.
- **Both interactives are independently shippable.** If only one gets approved, or they ship in separate rounds, neither breaks — they share fictional PKI naming for continuity, not a data or state dependency.
- **Nothing in this design requires new Tailwind classes, new color tokens, or new motion primitives.** Every visual treatment specified above already exists in the codebase, used by `CipherDecoder`, `PolicyEvaluator`, or `Sandbox`.

## 4. Summary of ⚠ needs-a-decision flags

1. **§1.7** — Build the proposed 7th "Revocation info" chip on the Field Decoder, or stop at the brief's explicit six? (Recommend: build it.) — ✅ **Owner resolution: build it. Implemented.**
2. **§2.6** — Add a 6th Verification Walkthrough scenario to independently demonstrate step 2 (bad intermediate signature) failing on its own, given none of the five scenarios above currently isolates that step? (Recommend: skip unless the project owner wants full per-step coverage; the four scenarios already cover steps 1, 3, 4, 5.) — ❌ **Owner resolution: skip it. Not implemented, exactly the 1 valid + 4 failure scenarios in §2.3 shipped.**

Everything else in this document is a confident design decision with rationale attached, not an open question,
and was implemented as specified — see the status block at the top of this doc and the inline ✅ notes in §1.7
and §2.6 above.
