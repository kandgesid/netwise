import { Link } from 'react-router-dom';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { ChapterTOC } from '../ui/ChapterTOC';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';
import { AutoLink } from '../../lib/autoLink';

const TOC_ITEMS = [
  { id: 'why-matters', label: 'Why this is its own problem' },
  { id: 'hsm', label: 'Hardware security modules' },
  { id: 'master-key', label: 'Master key encryption' },
  { id: 'practices', label: 'Other standing practices' },
  { id: 'formfactor', label: 'Hardware vs software vs cloud' },
];

const STAKES_POINTS = [
  {
    strong: 'Stealing a session key costs you one session.',
    text: "Chapter 4 already covered this: an ephemeral key pair dies with the handshake it was generated for. Stealing one, if that were even possible after the fact, buys an attacker nothing beyond the single session it belonged to.",
  },
  {
    strong: 'Stealing the signing key costs you every future session, and everyone who trusts it.',
    text: "The Forward Trust CA key from Chapter 6 and the server's own private key from Chapter 3 are different: they're long-lived, reused across every session, and used specifically to prove identity. Steal the Forward Trust CA key and you can sign a convincing certificate for any domain, to anyone whose device already trusts that CA, not just the one organization that issued it. Steal the server's key and you can impersonate that real server to anyone, going forward, the exact exposure Chapter 4's stolen-key table already walked through.",
  },
  {
    strong: "That asymmetry is why this gets separate engineering attention.",
    text: "A key this consequential doesn't get protected by the same casual handling as an ephemeral one. The rest of this chapter is what \"separate engineering attention\" actually looks like in practice.",
  },
];

const HSM_POINTS = [
  {
    strong: 'What actually changes.',
    text: "Without an HSM, a private key sits somewhere in the firewall's own memory or config, in a form the firewall itself can read and use directly. With an HSM, the firewall instead sends the HSM a request, sign this or decrypt this, the HSM performs that one operation internally, using a key that never leaves it, and hands back only the result. The key material itself never crosses that boundary, not even to the device that's using it.",
  },
  {
    strong: 'Independent of brand.',
    text: "Every major firewall vendor supports pairing with some kind of HSM, an on-premises network appliance or a cloud-hosted equivalent. Which specific product sits behind that connection matters far less than the fact that a connection exists at all: the key living somewhere other than the firewall that uses it.",
  },
  {
    strong: 'Independently certified, not just marketed as secure.',
    text: "The relevant benchmark here is FIPS 140, a US government cryptographic-hardware standard with multiple certification levels. It isn't one vendor's claim about its own product, it's a third party actually testing the physical device and publishing the result, the same kind of vendor-neutral credibility NIST's Zero Trust standard carries later in this course.",
  },
];

const MASTER_KEY_POINTS = [
  {
    strong: 'How it works.',
    text: 'Every private key stored on the firewall, the Forward Trust CA key, every server key imported for inbound inspection, gets wrapped in encryption under one master key. Without that master key decrypted first, none of the keys underneath it are usable.',
  },
  {
    strong: 'Local vs. HSM-protected master key.',
    text: "A local master key is the simplest option: it lives on the same box as everything it protects, which means stealing the device can be enough on its own. An HSM-protected master key is the stronger version of the same idea: the master key itself only unlocks through a request to the HSM, so a stolen device without that HSM connection is just an encrypted box with nothing usable inside it.",
  },
  {
    strong: "Layered, not either/or.",
    text: "An HSM and master-key encryption aren't competing choices. Master-key encryption protects everything stored on the box, as a baseline. An HSM is the extra step for the smaller set of especially sensitive keys that justify it. Most real deployments run both at once.",
  },
];

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

const FORM_FACTOR_POINTS = [
  {
    strong: 'A physical appliance.',
    text: "Dedicated hardware, often with its own crypto-acceleration built in, and no hypervisor layer sitting underneath it to compromise. The realistic risks are physical ones: someone stealing the device, or getting console access through stolen credentials.",
  },
  {
    strong: 'A virtual machine on a hypervisor.',
    text: "The keys live in a virtual disk and in ordinary memory, which means whoever administers the hypervisor has reach a hardware appliance's administrator never gets: a VM snapshot captures memory, keys included, cloning the VM clones everything in it, and the virtual disk can be inspected directly, bypassing whatever access control the guest OS itself enforces. The real mitigation is the same HSM connection described above, pointed at a network or cloud HSM so the key never actually lives inside the VM at all, plus disabling snapshots for anything running this role.",
  },
  {
    strong: 'A cloud-hosted instance.',
    text: "Runs under a shared-responsibility model: the cloud provider secures the physical hardware and hypervisor, the organization is still responsible for how the keys inside it are managed and accessed. Most major providers offer a dedicated, single-tenant HSM option and a way for the organization to supply and control its own keys rather than relying solely on the provider's own key management. The added considerations are less technical and more organizational: which jurisdiction the data physically sits in, and what a multi-tenant environment means for isolation guarantees.",
  },
  {
    strong: 'The question never actually changes.',
    text: "Regardless of form factor, the firewall must have access to these keys, full stop. What changes is how many other things, and which people, also have a path to that same access, and that's the thing every mitigation above is actually narrowing.",
  },
];

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
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {STAKES_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card id="hsm" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Hardware security modules</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="A Hardware Security Module (HSM) is a physical, tamper-resistant device built for one job: generate, store, and use cryptographic keys without ever letting the key itself leave in a form that could be copied." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {HSM_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <Card id="master-key" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Master key encryption, the software-side equivalent</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Not every deployment justifies a standalone HSM for every key. For keys stored directly on the firewall, encrypting all of them at rest under one master key is the baseline most vendors fall back to." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {MASTER_KEY_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
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
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Whatever firewall is running, physical appliance, virtual machine, or cloud-hosted instance, it needs access to these keys to do its job. The question is always how guarded that access is, and the answer looks different in each of these three environments." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {FORM_FACTOR_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
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
