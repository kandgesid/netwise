import { Link } from 'react-router-dom';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { ChapterTOC } from '../ui/ChapterTOC';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';
import { AutoLink } from '../../lib/autoLink';
import { KeyBlastRadiusDiagram, HsmDiagram, MasterKeyDiagram, FormFactorTable } from './KeyProtectionDiagrams';

const TOC_ITEMS = [
  { id: 'why-matters', label: 'Why this is its own problem' },
  { id: 'hsm', label: 'Hardware security modules' },
  { id: 'master-key', label: 'Master key encryption' },
  { id: 'practices', label: 'Other standing practices' },
  { id: 'formfactor', label: 'Hardware vs software vs cloud' },
];

const STAKES_CLOSING =
  "That asymmetry is why this gets separate engineering attention: a key this consequential doesn't get protected by the same casual handling as an ephemeral one. The rest of this chapter is what that looks like in practice.";

const HSM_CLOSING =
  "Every major firewall vendor supports pairing with some kind of HSM, on-premises or cloud-hosted. The relevant benchmark is FIPS 140, a US government cryptographic-hardware standard — a third party actually testing the device, not one vendor's own claim.";

const MASTER_KEY_CLOSING =
  "An HSM and master-key encryption aren't competing choices: master-key encryption protects everything stored on the box, as a baseline, while an HSM is the extra step for the smaller set of keys that justify it. Most real deployments run both at once.";

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

const FORM_FACTOR_CLOSING =
  "Regardless of form factor, the firewall must have access to these keys, full stop. What changes is how many other things, and which people, also have a path to that same access — the thing every mitigation above is actually narrowing.";

export function Chapter7KeyProtection() {
  return (
    <ChapterPage title="Chapter 7: Key protection">
      <SectionHead eyebrow="Chapter 7" title="Protecting the keys the firewall now holds">
        Chapter 3 and Chapter 6 both handed the firewall something extremely sensitive to hold onto: a
        signing key for inbound inspection, a CA key for forward proxy. Neither chapter asked what happens
        if either one leaks. This one does.
      </SectionHead>

      <ChapterTOC items={TOC_ITEMS} />

      <Card id="why-matters" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Why this is its own problem</h3>
        <p className="text-ink-dim text-[14.5px] mb-3">
          Not every key the firewall holds carries the same risk if it leaks:
        </p>
        <KeyBlastRadiusDiagram />
        <p className="text-ink-dim text-[14.5px] mt-3.5">
          <AutoLink text={STAKES_CLOSING} />
        </p>
      </Card>

      <Card id="hsm" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Hardware security modules</h3>
        <p className="text-ink-dim text-[14.5px] mb-3">
          <AutoLink text="A Hardware Security Module (HSM) is a physical, tamper-resistant device built for one job: generate, store, and use cryptographic keys without ever letting the key itself leave in a form that could be copied." />
        </p>
        <HsmDiagram />
        <p className="text-ink-dim text-[14.5px] mt-3.5">
          <AutoLink text={HSM_CLOSING} />
        </p>
      </Card>

      <Card id="master-key" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Master key encryption, the software-side equivalent</h3>
        <p className="text-ink-dim text-[14.5px] mb-3">
          <AutoLink text="Not every deployment justifies a standalone HSM for every key. For keys stored directly on the firewall, encrypting all of them at rest under one master key is the baseline most vendors fall back to:" />
        </p>
        <MasterKeyDiagram />
        <p className="text-ink-dim text-[14.5px] mt-3.5">
          <AutoLink text={MASTER_KEY_CLOSING} />
        </p>
      </Card>

      <Card id="practices" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Other standing practices</h3>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {STANDING_PRACTICES.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card id="formfactor" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Hardware vs. software vs. cloud: the same question, three environments</h3>
        <p className="text-ink-dim text-[14.5px] mb-3">
          Whatever firewall is running, it needs access to these keys to do its job. The question is always
          how guarded that access is:
        </p>
        <FormFactorTable />
        <p className="text-ink-dim text-[14.5px] mt-3.5">
          <AutoLink text={FORM_FACTOR_CLOSING} />
        </p>
      </Card>

      <p className="text-ink-faint text-[13.5px] mt-4">
        <AutoLink text="Protecting the key the firewall holds is still a possession-and-location question: who can physically or administratively reach it. " />
        <Link to="/chapters/zero-trust" className={TOOL_LINK_CLASS}>
          Chapter 8
        </Link>
        <AutoLink text=" asks a related but different question: even once the box itself is trusted, should trust stop there?" />
      </p>
    </ChapterPage>
  );
}
