import { Link } from 'react-router-dom';
import { ChapterPage } from '../layout/ChapterPage';
import { SectionHead } from '../ui/SectionHead';
import { Card } from '../ui/Card';
import { ChapterTOC } from '../ui/ChapterTOC';
import { TOOL_LINK_CLASS } from '../ui/toolLinkClass';
import { AutoLink } from '../../lib/autoLink';
import { ContinuousVerificationViz } from './ContinuousVerificationViz';
import { TrustSignalsViz } from './TrustSignalsViz';

const TOC_ITEMS = [
  { id: 'location', label: 'When location stops being proof' },
  { id: 'verify-every', label: 'Verify every request' },
  { id: 'signals', label: 'Three signals' },
  { id: 'scope', label: 'Smaller than a zone' },
  { id: 'coexist', label: 'Doesn\'t replace the firewall' },
];

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

export function Chapter8ZeroTrust() {
  return (
    <ChapterPage title="Chapter 8: Zero Trust">
      <SectionHead eyebrow="Chapter 8" title="Zero Trust: verify every time">
        Chapter 1 opened with a firewall deciding what counts as 'inside' a zone versus 'outside' it,
        then trusting a lot of what happens next based on that answer alone. Chapters 2 through 7 were
        about what a firewall does once traffic reaches that boundary: decrypting it, inspecting it,
        deciding what to do with it. This chapter asks what changes once being inside the zone stops
        being proof of anything by itself.
      </SectionHead>

      <ChapterTOC items={TOC_ITEMS} />

      <Card id="location" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">When location stops being proof</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="None of this is a knock on the zone model from Chapter 1. Zones, perimeters, and the whole decrypt-and-inspect pipeline from Chapters 2 through 7 are still exactly how a huge amount of real traffic gets decided on, today, in production. The problem is narrower than 'the old way was wrong': location was always a proxy for trust, not trust itself, and the gap between the two got more expensive to ignore." />
        </p>
        <ul className="pl-4 text-ink-dim text-[14.5px] space-y-2 list-disc marker:text-line">
          {BOUNDARY_POINTS.map((p) => (
            <li key={p.strong}>
              <strong className="text-ink">{p.strong}</strong> <AutoLink text={p.text} />
            </li>
          ))}
        </ul>
      </Card>

      <ContinuousVerificationViz />

      <Card id="verify-every" className="mb-5">
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

      <Card id="signals" className="mb-5">
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

      <TrustSignalsViz />

      <Card id="scope" className="mb-5">
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

      <Card id="coexist" className="mb-5">
        <h3 className="font-sans font-semibold text-base mb-2">Zero Trust doesn't replace the firewall</h3>
        <p className="text-ink-dim text-[14.5px] mb-2.5">
          <AutoLink text="Every rule the last seven chapters covered is still doing real, necessary work. A decryption policy from Chapter 5 still has to run before anything downstream can be inspected at all. App-ID, User-ID, and Content-ID from Chapter 3 are still how a firewall answers what actually is this, who's actually sending it, and is anything in it dangerous. Zones from Chapter 1 haven't gone anywhere either." />
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
        7, and the identity-and-device-checked model this chapter adds on top of it. Time to build a
        rule yourself in the{' '}
        <Link to="/sandbox" className={TOOL_LINK_CLASS}>
          Sandbox
        </Link>{' '}
        and watch the difference between a check keyed to a port and one keyed to an actual identity.
      </p>
    </ChapterPage>
  );
}
