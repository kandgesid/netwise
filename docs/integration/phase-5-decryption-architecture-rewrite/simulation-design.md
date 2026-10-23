# Phase 5 — Simulation / Interaction Design: Decryption Architecture Rewrite (PFS Inbound Mechanics + Stolen-Key Impact)

**Author role:** Simulation/Interaction Designer (mechanics and states only, no prose, no `src/` edits).
**Status:** Draft, awaiting project-owner review alongside the parallel Content & Flow Strategist's prose/restructuring/new-chapter proposal for the same source material.
**Consumes:** `/Users/sidkandge/Documents/SSL:TLS_Decryption_architecture.md` (full read, source doc) §§5–9 specifically; `src/components/chapters/HandshakeStepper.tsx` + `src/data/handshakeSteps.ts` (full read — the `inbound` scenario and the ECH toggle pattern on `passthrough`); `src/components/chapters/Chapter4KeyExchange.tsx` + `src/components/chapters/CipherDecoder.tsx` + `src/data/cipherSuite.ts` (full read); `docs/integration/phase-1-certificates/simulation-design.md` and `docs/integration/phase-4-chain-of-trust-basics/simulation-design.md` (format/restraint precedent).
**Produces:** this document. The parallel Content & Flow Strategist agent owns exact prose, chapter restructuring, and a new-chapter proposal for key-security/deployment-protection content — this doc does not have visibility into their placement decisions and does not try to guess them; see the Coordination note at the end.

## 0. Role boundary, restated

Everything below specifies **behavior and data**, not copy. Any string shown in quotes (step titles, body text, table cells, captions) is a draft/placeholder written to prove the mechanic reads correctly — the Content Strategist and Implementer should treat these as content-requirements ("this fact must land here"), not final wording to paste in verbatim.

---

## 1. Gap 1 — How inbound inspection actually works under PFS/ECDHE

### 1.1 The decision: extend `HandshakeStepper`'s existing `inbound` scenario, don't build a new component

Confirmed by reading `HandshakeStepper.tsx` and `handshakeSteps.ts` in full. This is a straightforward "same component, same job" extension, not a new mechanic — the `inbound` scenario already exists, already walks Client/Firewall/Server through a handshake, and already gestures at the ECDHE gap it needs to actually show. No new component file is warranted.

**But it can't be a plain linear step addition to the existing `steps` array.** The existing `inbound.steps` array models a *passive* firewall: one shared handshake between client and server, with the firewall quietly deriving the same session key off to the side (static RSA case). The source doc's §7 mechanism (and the fix for the "ECDHE isn't enough, full stop" dead end at step 4 today) is structurally different: the firewall becomes an **active third party running two independent Diffie-Hellman exchanges** — one with the client, one with the server — and has to sign its ephemeral key share with the server's real private key to make the client-facing leg authenticate. That's a different step count, different `pos` choreography (the firewall needs its own leg-2 handshake to the server, which the static-RSA path never needed), and a different causal structure (two `shared_N` secrets instead of one derived key). Trying to force that into the existing 6-step array via per-step `echBody`-style text swaps would either mangle the static-RSA explanation (which is correct and should stay exactly as-is) or produce steps whose `pos`/title don't match what's actually happening in one of the two modes.

**The right-sized fix:** generalize the pattern `ech`/`echBody`/`echNote` already established on `passthrough` — a scenario-scoped toggle that swaps in an alternate *full* step sequence — rather than swapping single-field text within a shared sequence. ECH didn't need this because ECH doesn't change *what happens*, only what's *visible* on the wire, so one body-text swap per affected step was enough. The static-RSA-vs-ECDHE split in `inbound` does change what happens, so the toggle needs to swap the whole sequence, not a line of it.

### 1.2 Data shape additions to `handshakeSteps.ts`

Add two optional fields to `ScenarioData`, used only by the `inbound` entry (mirrors how `echNote`/`echBody` are only ever defined on `passthrough` — same "optional, scenario-specific" discipline already documented in the existing JSDoc comments):

```ts
export interface ScenarioData {
  label: string;
  note: string;
  /** Shown instead of `note` when the ECH toggle is on. Only defined on the `passthrough` entry. */
  echNote?: string;
  steps: Step[];
  /**
   * Shown instead of `note` when the key-exchange toggle is set to 'ecdhe'. Only defined on the
   * `inbound` entry — the one scenario where the server's negotiated key-exchange algorithm
   * changes what the firewall structurally has to do (see `kexSteps`).
   */
  kexNote?: string;
  /**
   * Shown instead of `steps` when the key-exchange toggle is set to 'ecdhe'. Only defined on the
   * `inbound` entry. Unlike `echBody` (a per-step text swap within one shared sequence), this is a
   * full alternate sequence, because ECDHE inbound inspection isn't a cosmetic variant of the
   * static-RSA path, it's a structurally different handshake (the firewall runs two independent DH
   * exchanges instead of passively deriving one key). `pos` values in this array are independent of
   * `steps`' pos values.
   */
  kexSteps?: Step[];
}
```

`Step` itself needs no changes — `{ pos, label, title, body, echBody? }` already covers everything a step in the new sequence needs.

### 1.3 Existing `inbound.steps`: one small text edit, nothing structural

Step 4 ("Key derivation", static RSA) currently ends: *"...which is why real inbound-decryption deployments often have to restrict which cipher suites the server offers."* That sentence described a dead end because there was nothing to point to. Now there is — suggest (Content Strategist's exact wording, fact to preserve: *a pointer to the new toggle*):

> "...This works cleanly as long as the negotiated cipher suite uses plain RSA key exchange. If the server negotiates an ephemeral (ECDHE/DHE) exchange instead, the static private key alone isn't enough — toggle to ECDHE below to see what the firewall has to do instead."

Nothing else in the existing 6-step static-RSA array needs to change. It stays the default (`kex: 'static'` on mount, matching `ech`'s `'off'` default).

### 1.4 New `kexSteps` array (full code-complete draft)

Three-column layout convention reused exactly as-is from the existing scenarios (CLIENT/FIREWALL/SERVER, `pos` 0–100 left-to-right, same as `forwardproxy`'s two-leg choreography). Eleven steps — longer than the static-RSA path's six, proportionate to `forwardproxy`'s eight, because this is genuinely doing more (two live DH exchanges *and* a signature step the forward-proxy path never needs, since forward proxy authenticates with a forged cert instead of the real private key).

```ts
kexNote: "The server negotiated an ephemeral (ECDHE/DHE) key exchange, so a static copy of its private key no longer lets the firewall passively derive the session key the way it could with plain RSA. To still inspect this traffic, the firewall has to become an active participant in two separate Diffie-Hellman exchanges, one with the client, one with the server, and prove its identity on the client-facing leg by signing with the server's real private key. Two independent shared secrets come out of this, not one, which is exactly how outbound forward proxy works too (two sessions stitched together) — the difference here is the firewall authenticates with the server's own key instead of a forged certificate.",
kexSteps: [
  { pos: 20, label: 'TCP handshake', title: 'Client ↔ server', body: 'Client opens a TCP connection addressed to the real server, same as always. The firewall sits inline — but this time it can\'t just watch and derive a key afterward, it has to step into the handshake itself.' },
  { pos: 32, label: 'TLS handshake (leg 1)', title: 'ClientHello', body: 'Client sends ClientHello, listing ECDHE/DHE-capable cipher suites. This never reaches the server directly.' },
  { pos: 50, label: 'Firewall as active participant', title: 'Firewall generates two ephemeral key pairs', body: 'A static private key can\'t produce an ECDHE session key, so the firewall generates its own fresh ephemeral key pair for the client-facing leg, and a separate one for the server-facing leg. These two legs will end up with two different shared secrets.' },
  { pos: 62, label: 'TLS handshake (leg 2)', title: 'Firewall → server: firewall acts as the client', body: 'The firewall opens its own TLS handshake to the real server, this time playing the client role, and sends its leg-2 ephemeral public key share.' },
  { pos: 72, label: 'TLS handshake (leg 2)', title: 'Server responds with its own ephemeral key share', body: 'The server replies with ServerHello and its ephemeral ECDHE public key, exactly as it would to any client.' },
  { pos: 62, label: 'Key derivation (leg 2)', title: 'shared_2 established', body: 'Firewall computes shared_2 = DH(firewall_leg2_private, server_public). The real server computes the same value from its side. This secret belongs only to the firewall↔server leg — the client\'s keys play no part in it.' },
  { pos: 38, label: 'TLS handshake (leg 1)', title: 'Firewall → client: real certificate + signed key share', body: "Back on the client-facing leg, the firewall sends the server's actual, real certificate, not a forged one like outbound forward proxy uses, along with its own leg-1 ephemeral public key share. Critically, it signs that key share using the server's real private key." },
  { pos: 38, label: 'Signature check', title: 'Client verifies the signature', body: "The client checks that signature against the public key on the server's real certificate. It passes, because the firewall actually holds the matching private key, so from the client's side this looks exactly like talking to the real server directly. This is the one step the static-RSA path never needed." },
  { pos: 38, label: 'Key derivation (leg 1)', title: 'shared_1 established', body: 'Client computes shared_1 = DH(client_private, firewall_leg1_public). The firewall independently computes the same value using its leg-1 ephemeral private key. Two separate shared secrets now exist: shared_1 (client ↔ firewall) and shared_2 (firewall ↔ server).' },
  { pos: 65, label: 'Session established', title: 'Inline decrypt, now via two live key exchanges', body: 'The firewall decrypts traffic on session 1 using shared_1, inspects it, then re-encrypts with shared_2 before forwarding to the server, and the reverse on the way back. Same inspection outcome as the static-RSA path, achieved by active participation instead of passive key reuse.' },
  { pos: 85, label: 'Policy decision', title: 'Delivered unchanged', body: "Traffic reaches the server exactly as sent. The client and server never see anything different from a normal, direct connection — what makes that possible is the server's signature on the firewall's key share, not anything the client would flag as unusual." },
],
```

### 1.5 `HandshakeStepper.tsx` component changes

Directly parallels the existing ECH toggle (`ech`/`EchState`/`ECH_OPTIONS`, rendered conditionally for `passthrough`), generalized to swap full step sequences:

```tsx
type KexState = 'static' | 'ecdhe';
const KEX_OPTIONS: { value: KexState; label: string }[] = [
  { value: 'static', label: 'Static RSA' },
  { value: 'ecdhe', label: 'ECDHE (PFS)' },
];

export function HandshakeStepper() {
  const [mode, setMode] = useState<ScenarioMode>('passthrough');
  const [i, setI] = useState(0);
  const [ech, setEch] = useState<EchState>('off');
  const [kex, setKex] = useState<KexState>('static');            // new

  const scenario = SCENARIOS[mode];
  const echOn = mode === 'passthrough' && ech === 'on';
  const kexOn = mode === 'inbound' && kex === 'ecdhe';            // new

  const activeSteps = kexOn && scenario.kexSteps ? scenario.kexSteps : scenario.steps;   // new
  const step = activeSteps[i];
  const isLast = i === activeSteps.length - 1;
  const displayedBody = echOn && step.echBody ? step.echBody : step.body;
  const displayedNote = echOn && scenario.echNote
    ? scenario.echNote
    : kexOn && scenario.kexNote
      ? scenario.kexNote
      : scenario.note;

  function changeMode(next: ScenarioMode) {
    setMode(next);
    setI(0);
    setEch('off');
    setKex('static');          // new — reset so switching away from inbound doesn't leave a stale toggle
  }

  function changeKex(next: KexState) {   // new
    setKex(next);
    setI(0);                              // new — step counts differ between the two arrays, so position 0 is the only safe reset target
  }

  return (
    <Card>
      {/* ...mode Toggle, unchanged... */}

      {mode === 'passthrough' && (
        <div className="mb-5 pl-3 border-l border-line-soft max-w-[200px]">
          {/* ...existing ECH toggle, unchanged... */}
        </div>
      )}

      {mode === 'inbound' && (                                              // new block, same shape as the ECH one above
        <div className="mb-5 pl-3 border-l border-line-soft max-w-[220px]">
          <label className="block font-mono text-[10.5px] text-ink-faint mb-1">
            Server's key exchange
          </label>
          <Toggle options={KEX_OPTIONS} value={kex} onChange={changeKex} />
        </div>
      )}

      <div className="text-[13px] text-ink-faint leading-relaxed mb-5">
        <AutoLink text={displayedNote} />
      </div>

      {/* CLIENT/FIREWALL/SERVER rail — unchanged, already reads `step.pos` generically */}

      <div className="flex gap-1 mb-6">
        {activeSteps.map((_, idx) => (                                      // was scenario.steps
          <div key={idx} className={`h-[3px] flex-1 rounded-sm ${idx <= i ? 'bg-accent' : 'bg-line-soft'}`} />
        ))}
      </div>

      {/* step label/title/body block — unchanged, already reads from `step` */}

      <div className="flex justify-between mt-5">
        <Button onClick={() => setI((v) => Math.max(0, v - 1))} className={i === 0 ? 'invisible' : ''}>
          ← Previous
        </Button>
        <Button variant="primary" onClick={() => setI((v) => (isLast ? 0 : v + 1))}>
          {isLast ? 'Restart ↺' : 'Next step →'}
        </Button>
      </div>
    </Card>
  );
}
```

Every other line in the component (the dot's `animate={{ left: `${step.pos}%` }}`, the label/title/body render, the buttons) is unchanged — they already read generically from `step` and don't care which array it came from. The only mechanical additions are: one new piece of state, one new conditionally-rendered `Toggle` (copy-pasted shape from the ECH one), and swapping four `scenario.steps` reads for `activeSteps`.

### 1.6 Why not a brand-new component instead

Rejected for the same reason phase-4 rejected inventing new interactivity where an existing mechanic already fits: the component already does "step through Client/Firewall/Server positions with a progress rail," already has state for a scenario-scoped secondary toggle (ECH), and the new content is the *same kind of fact* (what does the firewall have to do, step by step, under this specific condition) just for a second condition (PFS) on a scenario that already exists. A new component would duplicate the rail, the progress bar, the Prev/Next logic, and the `pos`-based dot animation for no benefit — it's the textbook case for extending data, not forking a component.

---

## 2. Gap 2 — What a stolen private key still enables under PFS

### 2.1 The decision: a small static comparison card, not new `CipherDecoder` state

`CipherDecoder`'s existing state (`active`, which of the four cipher-suite parts is selected; `kexMode`, classical vs. hybrid post-quantum) answers two questions: *what does each part of this cipher-suite string mean*, and *what does hybrid PQ key exchange add*. Neither axis has anything to do with "what happens if the private key is later stolen" — that's not a cipher-suite-anatomy question, it's a separate fact about key *usage* (signing vs. decryption) and *timing* (past vs. future traffic). Bolting a third, unrelated toggle onto `CipherDecoder` would overload one component with two different teaching jobs, the same kind of overreach phase-4's doc specifically warned against ("manufacturing state... where there's no real variable axis to explore").

Checking for a genuine variable axis here, the same test phase-4 applied: is there something a learner would meaningfully *choose* to explore? The source doc's §8 content is a fixed 2×2 fact (PFS or not, crossed with past or future traffic) — it never varies by user input, there's no scenario a reader picks that changes the outcome. That's the same shape phase-4 found for the chain-of-trust tiers: always true, not conditional on a choice. A fixed fact is a table, not an interactive.

**Recommendation: a small static card with a 2×2 table**, placed in `Chapter4KeyExchange.tsx`, near — not inside — `CipherDecoder`. No new data file: this is a handful of static strings with no reuse elsewhere, the same "keep it inline" call phase-1's doc made for `VerificationWalkthrough`'s scenario data and phase-4's doc made for `ChainOfTrustDiagram`'s tier data, both justified by precedent already in this exact file (`PQ_POINTS` is already a local `const` array inside `Chapter4KeyExchange.tsx`, not a `data/` file).

### 2.2 Placement (a suggestion, not a claim on the Content Strategist's territory)

`Chapter4KeyExchange.tsx` already opens with a paragraph (lines 39–45) that sets up exactly this question — "picture ... an attacker who's been quietly recording your encrypted traffic for later. If either one gets hold of the server's long-term private key down the line, ephemeral exchange means it still buys them nothing against sessions that already finished" — but never finishes the thought with *what it doesn't buy them out of* (future impersonation). The natural slot is right after `CipherDecoder`, before the "What changes next: post-quantum key exchange" `Card`, since this is a correction/completion of the forward-secrecy point the chapter already opened with, and the quantum material is a distinct, later topic (a different kind of future threat, not the same one). Flagging this as a suggestion, since exact placement across the rewritten Chapter 3/4/5 sequence is the Content Strategist's call, not mine — see Coordination note.

### 2.3 Code-complete sketch

```tsx
const KEY_THEFT_IMPACT: {
  condition: string;
  pastTraffic: { verdict: 'safe' | 'compromised'; text: string };
  futureTraffic: { verdict: 'at-risk'; text: string };
}[] = [
  {
    condition: 'With PFS (ECDHE/DHE)',
    pastTraffic: {
      verdict: 'safe',
      text: "Protected. The private key was only ever used to sign the ephemeral exchange, never to encrypt anything directly, and the ephemeral keys that actually protected each past session were destroyed right after that session's handshake finished. There's nothing left for a stolen key to unlock.",
    },
    futureTraffic: {
      verdict: 'at-risk',
      text: "Not protected. Anyone holding the private key can sign a new ephemeral exchange and convince a new client it's really talking to the server, the exact mechanism the inbound-inspection firewall above legitimately relies on. PFS was never a defense against impersonation, only against decrypting old traffic.",
    },
  },
  {
    condition: 'Without PFS (static RSA)',
    pastTraffic: {
      verdict: 'compromised',
      text: "Fully exposed. Every past session's pre-master secret was encrypted directly with this public key, so the stolen private key decrypts all of it retroactively, no new handshake required. (Heartbleed, 2014, is the textbook real-world case.)",
    },
    futureTraffic: {
      verdict: 'at-risk',
      text: "Same exposure as the PFS row above — a stolen key lets an attacker impersonate the server either way. PFS changes nothing about future risk; it only changes whether past traffic is also exposed.",
    },
  },
];

function KeyTheftImpact() {
  return (
    <Card className="mb-5">
      <h3 className="font-sans font-semibold text-base mb-2">
        What a stolen private key still gets you
      </h3>
      <p className="text-ink-dim text-[14.5px] mb-4">
        <AutoLink text="Forward secrecy protects finished sessions, not the key's other job. Under modern (ECDHE) TLS, the server's private key is used for one thing only, signing, to prove identity during the handshake. It's never used to encrypt anything directly, which is exactly why a key stolen later can't unlock sessions that already finished. But \"prove identity\" is still something a stolen key can do going forward." />
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="py-2 pr-3 border-b border-line-soft"> </th>
              <th className="py-2 pr-3 border-b border-line-soft">Past traffic</th>
              <th className="py-2 border-b border-line-soft">Future traffic</th>
            </tr>
          </thead>
          <tbody>
            {KEY_THEFT_IMPACT.map((row) => (
              <tr key={row.condition} className="align-top">
                <td className="py-3 pr-3 border-b border-line-soft font-semibold text-ink">
                  {row.condition}
                </td>
                <td
                  className={clsx(
                    'py-3 pr-3 border-b border-line-soft',
                    row.pastTraffic.verdict === 'safe' ? 'text-accent' : 'text-danger'
                  )}
                >
                  <span className="font-mono text-[11px] uppercase block mb-1">
                    {row.pastTraffic.verdict === 'safe' ? 'Safe' : 'Compromised'}
                  </span>
                  <span className="text-ink-dim font-normal text-[12.5px]">
                    <AutoLink text={row.pastTraffic.text} />
                  </span>
                </td>
                <td className="py-3 border-b border-line-soft text-danger">
                  <span className="font-mono text-[11px] uppercase block mb-1">At risk</span>
                  <span className="text-ink-dim font-normal text-[12.5px]">
                    <AutoLink text={row.futureTraffic.text} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

Color choices use only existing tokens, consistent with CLAUDE.md's design-system rule (`text-accent`/`text-danger` reused via the same accent-is-success convention `VerificationWalkthrough` relies on per phase-1's doc). No new Tailwind classes, no new tokens, no new motion, no `useState`. This is a pure presentational component, same tier as phase-4's `ChainOfTrustDiagram`.

### 2.4 Why this isn't redundant with the new `HandshakeStepper` ECDHE steps (§1.4)

The new `kexSteps` sequence in §1.4 shows the signing step *happening*, in the context of one specific scenario (inbound inspection, this session, right now). This table answers a different, retrospective question: *if the key leaks later, what does that change about everything that already happened, and everything that will*. One is procedural ("here's the handshake, step by step"), the other is a consequence summary ("here's the blast radius of a leak, across time"). Worth a one-line cross-reference between them (Content Strategist's call on wording) rather than merging — same "noun vs. verb, don't merge" reasoning phase-4 applied to `ChainOfTrustDiagram` vs. `VerificationWalkthrough`.

---

## 3. New key-security chapter — optional interactive proposal

Per the brief, the new chapter's existence, scope, and placement are the Content Strategist's call, and this doc doesn't block on knowing where it lands. One piece of source material is a strong, low-risk candidate for a small static visual if that chapter gets built, offered here as optional and clearly secondary to §1–2:

**Source doc §9's closing section** ("The Core Principle Remains the Same" / Comparison Summary table) makes a vendor-neutral point that's genuinely hard to say well in prose alone: regardless of form factor (hardware/software/cloud), *the firewall must have access to the private key* — the only thing that changes is how that access is protected. That's the same kind of "always true, not a toggle" structural fact phase-4 found for chain-of-trust tiers, so the same conclusion applies: **a static table/diagram, not an interactive.**

Sketch, vendor-neutral (no PA-Series model numbers, no named HSM vendors, per CLAUDE.md):

```tsx
const KEY_PROTECTION_COMPARISON: { aspect: string; hardware: string; software: string; cloud: string }[] = [
  { aspect: 'Key storage', hardware: 'On-device, optionally backed by an external HSM', software: 'Virtual disk, optionally backed by a network HSM', cloud: 'Cloud HSM or KMS' },
  { aspect: 'Biggest distinct risk', hardware: 'Physical theft of the appliance', software: 'Hypervisor admin can snapshot or clone the VM, keys and all', cloud: 'Shared responsibility — provider staff/legal access is a different trust boundary, not a software bug' },
  { aspect: 'Mitigated by', hardware: 'Tamper-resistant hardware, restricted physical/console access', software: 'External HSM (keys never touch the VM), disabling snapshots, restricted hypervisor RBAC', cloud: 'Customer-managed keys (BYOK), dedicated/single-tenant HSM, audit + contractual controls' },
];
```

Rendered as a static three-column table (same visual family as §2.3's table above), capped with the source doc's closing line as a static callout, not a toggle: *"Regardless of form factor, the firewall must have access to the private key. The real question is how securely that access is protected."* No state, no component logic beyond mapping the array — this is squarely in "diagram, not interactive" territory by the same test applied in §2.1 and in phase-4's doc.

This is explicitly a nice-to-have, not a requirement of this doc's two confirmed gaps, and it should not gate review of §1–2.

---

## 4. Cross-cutting notes

- **New acronyms this design's content touches that aren't yet in `src/data/acronyms.ts`:** `PFS` (Perfect Forward Secrecy) and `HSM` (Hardware Security Module) are both used throughout §1–3 above and are currently absent from the dictionary (confirmed by reading `acronyms.ts` in full — it has `ECDHE`, `DHE`, `RSA`, `GCM` etc. but neither `PFS` nor `HSM`). `MITM` is used as a bare label today (`Chapter3Handshake.tsx`'s TOC entry, "MITM, on purpose") but also isn't in the dictionary. None of these are mine to add — flagging so the Content Strategist's prose pass (which will use all three terms regardless of what ships from this doc) doesn't duplicate-discover this; §1–2 as specified above assume these three get added once, centrally.
- **Both proposed changes are independently shippable.** §1 (HandshakeStepper extension) and §2 (static table) don't depend on each other or on §3. Either can ship alone.
- **Nothing proposed here requires new Tailwind classes, color tokens, or motion primitives.** `text-danger`/`text-accent` are used in their existing, already-documented meanings (danger = blocked/compromised, accent/success = safe) — not a new application of either token.
- **No new data files.** §1's additions go into the existing `src/data/handshakeSteps.ts`; §2 and §3's small fixed arrays stay inline in their respective chapter components, consistent with this exact codebase's own precedent (`PQ_POINTS` in `Chapter4KeyExchange.tsx`, `ACTIONS`/`FLOW`/`EVAL_SCENARIOS` in `Chapter5DecryptionPolicies.tsx`).

---

## Coordination note

A parallel Content & Flow Strategist agent is independently drafting the actual prose, a restructuring plan for the existing Chapter 3/4/5 sequence, and a proposal for a brand-new chapter covering key-security/deployment-protection concepts (HSM, Master Key encryption, subordinate-CA practice, hardware/software/cloud key-protection tradeoffs), all from the same source document. That agent's output and this document were produced without visibility into each other. Specifically unreconciled:

- **Chapter/placement numbering.** This doc assumes the `inbound` scenario extension (§1) stays inside whatever becomes "Chapter 3 equivalent" (currently `Chapter3Handshake.tsx` hosts `HandshakeStepper`) and the stolen-key table (§2) stays near `CipherDecoder` inside whatever becomes "Chapter 4 equivalent." If the Content Strategist's restructuring moves `HandshakeStepper` or `CipherDecoder` to different chapters, merges chapters, or changes what content precedes/follows them, the component-level changes in §1.5 and the placement suggestion in §2.2 are unaffected (they're scoped to the components themselves), but the *surrounding prose transitions* referencing "the toggle below" or "the chapter above" will need to match wherever these components actually end up.
- **The new chapter's existence and content.** §3 above is written speculatively, against source-doc §9 only, with no knowledge of whether the Content Strategist's new-chapter proposal covers that material differently, more thoroughly, or not at all. If their chapter already resolves this with prose that makes a visual redundant (the same "their solution and this diagram may be redundant, pick one" caveat phase-4's doc raised about `ChainOfTrustDiagram`), §3 should be dropped, not stacked on top of it.
- **New acronyms (§4).** `PFS`, `HSM`, and `MITM` need adding to `src/data/acronyms.ts` exactly once. Flagging here so neither agent's implementation pass duplicates or conflicts with the other's addition.
- **Terminology continuity.** This doc's `kexSteps` content refers to "leg 1"/"leg 2" and `shared_1`/`shared_2`, borrowed directly from the source document's own §7 diagram notation. If the Content Strategist's prose uses different naming for the same two legs, the step `title`/`body` strings in §1.4 are drafts and should be reconciled to match their final terminology before implementation, same as every other quoted string in this doc.

These need reconciling by the project owner before implementation, the same way phase-1's `content-plan.md` §10 reconciled placement with that phase's simulation-design doc.
