# Research: Candidate Topics for Netwise

Prepared by the research agent, for the project owner's own review. Nothing here has been implemented or drafted as content — these are topic candidates with rationale, sized and grounded against what the site already teaches and against where the field is visibly moving right now (mid-2026).

**Scope check performed first:** I read `CLAUDE.md`, `src/App.tsx`, and `src/data/glossary.ts` before researching, so none of the below duplicate the existing six chapters (firewall basics, what a firewall inspects, the TLS handshake, key exchange/cipher suites, decryption policy, forward proxy), the Sandbox, the certificate reference, or the glossary.

**One thing worth flagging up front:** `src/data/glossary.ts` already has a full `vpn` category (VPN, IPSec, IKE, site-to-site, remote-access, PSK) with no chapter anywhere that teaches those terms — the glossary entries currently exist without a home. Several candidates below (Zero Trust, ZTNA-vs-VPN) would give that orphaned glossary content a chapter to belong to. That's an existing-content gap, not just a new-content opportunity.

Organized into three tiers by how strong a fit I think each is, strongest first. Within a tier, order isn't meaningful.

---

## Tier 1 — Strongest fit (directly extends what a Chapter 6 graduate just learned)

### 1. Encrypted Client Hello (ECH) — TLS's next privacy layer
**What it is:** Even with everything Chapter 3 already teaches about the TLS handshake, one detail slips through in cleartext today: the SNI (Server Name Indication) field, where the client announces which website it wants, sent unencrypted so the server knows which certificate to present. ECH closes that gap by encrypting the entire inner ClientHello, including the real destination hostname, so an observer on the wire (including a firewall doing SNI-based policy) sees only a generic "outer" hello.

**Why it's worth adding:** This is the single most direct sequel to the existing TLS/decryption-policy chapters. A learner who just finished Chapters 3–5 has been taught that firewalls read SNI to make decrypt/no-decrypt and allow/block decisions — ECH is the thing that quietly breaks that assumption, and it's actively rolling out now, not speculative. It also gives a concrete, current answer to "so is TLS 1.3 the end of the story?"

**Rough fit:** Small-to-medium new section, best appended to Chapter 5 (Decryption Policies) or Chapter 3 (Handshake) as a "what changes next" closing beat — probably too narrow to justify a full standalone chapter on its own.

**Source area:** Recent standards-track activity (an IETF ECH specification was finalized in early 2026) plus current firewall-vendor documentation on how their products are adapting to it.

---

### 2. Post-quantum key exchange (hybrid ML-KEM)
**What it is:** Chapter 4 already teaches key exchange groups and cipher suites. The next natural question is: what happens when a powerful enough quantum computer could break the math those groups rely on? The industry's answer, already shipping today, is "hybrid" key exchange — running a classical algorithm (like X25519) and a new quantum-resistant one (ML-KEM, a NIST-standardized algorithm) side by side in the same handshake, so the connection is safe unless *both* are broken.

**Why it's worth adding:** This isn't a distant hypothetical — major browsers and cloud providers are defaulting to hybrid key exchange in live traffic now, and it slots in as almost a direct continuation of Chapter 4's existing cipher-suite-decoder concept (the site already has a UI pattern — `CipherDecoder` — built for exactly this kind of "decode the parts of a negotiated suite" teaching moment).

**Rough fit:** Medium section addition to Chapter 4 (Key Exchange & Cipher Suites) — reuses that chapter's existing framing almost perfectly, so it may not need a new chapter number.

**Source area:** Recent standards-track activity (finalized NIST PQC standards) and current vendor/enterprise-security commentary on hybrid TLS deployment timelines.

---

### 3. QUIC / HTTP/3 and what it does to inspection
**What it is:** Chapter 2 teaches what a firewall actually inspects, and Chapter 6 covers forward proxy. QUIC is the newer transport protocol under HTTP/3, and it changes more than just "which port it uses" — worth spelling out concretely what's actually different from the TCP+TLS traffic every earlier chapter assumes:

- **Transport layer itself changes.** Everything through Chapter 6 assumes TCP: a firewall tracks connection state via the familiar source/destination IP-and-port "5-tuple," watches the three-way handshake, and can key off TCP flags. QUIC drops TCP entirely and rides on UDP instead, so none of that TCP-specific state-tracking machinery applies.
- **Far more of the handshake is encrypted.** With ordinary TLS-over-TCP, plenty of metadata around the encrypted payload stays readable, which is exactly what Chapters 3 and 5 build their whole "the firewall watches this happen without being a party to it" framing on. QUIC folds TLS 1.3 directly into its own handshake and encrypts nearly everything after the very first packet, so a lot of what a firewall used to casually observe simply isn't there to read anymore.
- **Connections aren't tied to an IP/port pair anymore.** QUIC identifies a connection by a "connection ID" that the client and server agree on, which means the same ongoing connection can survive a client's network changing entirely (moving from Wi-Fi to cellular mid-session, for instance) without restarting the handshake. That's a genuinely new mechanic, not just "the same thing but encrypted" — the 5-tuple-based session tracking every earlier chapter assumes doesn't have an obvious QUIC equivalent.
- **SNI can still leak the destination, but not always.** Unless it's paired with Encrypted Client Hello (candidate #1 above), the destination hostname in QUIC's handshake is exposed the same way it is in ordinary TLS — so SNI-based policy isn't automatically dead, it's just one encryption layer away from being closed off entirely, which makes QUIC and ECH a natural pair to teach together.
- **What firewalls actually do about it today:** the blunt early answer was often to just block UDP/443 outright, forcing clients to fall back to ordinary HTTP/2 over TCP where existing inspection still works. Newer approaches instead decrypt and inspect QUIC directly, the same conceptual move Chapter 3's forward-proxy scenario already teaches for TCP+TLS, just adapted to a transport that wasn't designed with a middlebox looking over its shoulder in mind.

**Why it's worth adding:** It's a very natural "wait, doesn't that break everything you just taught me" follow-up to Chapters 2, 3, and 6 — a learner who now understands 5-tuple session tracking, SNI-based inspection, and forward-proxy interception would immediately wonder how any of that holds up against a protocol that changes the transport layer itself. It's also not a fringe case anymore: QUIC now carries a substantial share of global web traffic, with HTTP/3 specifically accounting for a meaningful and growing slice of web requests, so "some organizations just block UDP/443" is a real, currently-live operational tradeoff, not a hypothetical.

**Rough fit:** Medium section addition to Chapter 2 or Chapter 6, or a short standalone "what's next after the browser you're securing changes" capstone — doesn't need heavy new mechanics since it builds entirely on concepts already taught (session state, SNI, decrypt-and-reencrypt), it just needs to show how each one gets disrupted.

**Source area:** Current firewall-vendor technical documentation, network-engineering community discussion, and industry traffic-composition reporting on QUIC/HTTP-3 adoption and enterprise handling in 2026.

---

### 4. Zero Trust Architecture (a genuine Chapter 7 candidate)
**What it is:** Everything in Chapters 1–6 is built around a fairly classic model: a firewall sits at a boundary, and traffic is trusted or not based mostly on where it's coming from and what zone it's in. Zero Trust flips that premise — no request is trusted by default just because of its network location; every access attempt gets checked against identity, device health, and context, every time, regardless of whether it originated "inside" or "outside."

**Why it's worth adding:** This is the most conceptually significant thing a Chapter 6 graduate hasn't been told yet: that the entire zone/perimeter model they just learned is increasingly treated as necessary-but-not-sufficient in modern network design. It's also squarely mainstream now rather than a buzzword — treated as baseline architecture guidance, not an edge case. It's a strong, appropriately-sized capstone chapter because it reframes rather than repeats prior material.

**Rough fit:** Full new chapter (natural "Chapter 7").

**Source area:** Current vendor and industry-analyst guidance treating zero trust as a default enterprise architecture expectation for 2026, not an emerging idea.

---

### 5. Short-lived certificates and automated renewal (ACME)
**What it is:** The site already has a full certificate reference (CA, root/intermediate/leaf, chain of trust, SAN, wildcard, self-signed). The industry body that sets browser/CA rules has now mandated that public TLS certificate lifetimes shrink dramatically over the next few years — down from the roughly year-long validity common until recently, through intermediate steps, to as little as 47 days by 2029. That makes manual certificate renewal essentially impossible at scale and pushes automated issuance/renewal protocols like ACME (the same mechanism behind widely-used free certificate authorities) from "nice to have" to mandatory.

**Why it's worth adding:** It's a direct, concrete update to content the site already has, not a new topic area — a learner who just finished the certificate reference would benefit from knowing *why* certificates increasingly renew themselves and what "automation" actually looks like mechanically (a small agent proving domain control and requesting a fresh cert on a timer).

**Rough fit:** Section addition to the existing certificate reference (`CertificateTabs`) — doesn't need a new chapter, just a "how certificates get issued and renewed today" tab or block.

**Source area:** Recent CA/Browser Forum policy decisions and current certificate-authority vendor guidance on the phased validity-period reduction.

---

### 16. Single pass (parallel processing) architecture — how a firewall does all of it without becoming the bottleneck
**What it is:** Chapter 3's "Three lenses the firewall applies" card now explains that App-ID, User-ID, and Content-ID are one vendor's names for three separate inspection capabilities — but not how a firewall runs all three, plus decryption, plus policy lookup, without each one adding its own latency tax. Older-style firewalls historically chained together separate inspection engines (one for antivirus, one for intrusion detection, one for application control, and so on), and traffic had to pass through each one in sequence, so turning on more security features meant more sequential passes and more added delay. Single-pass architecture instead does the networking lookup, policy match, application identification, and threat/content signature matching all in one traversal per packet, with many sessions handled at once across dedicated processing cores — so enabling more inspection doesn't multiply the number of passes traffic has to survive.

**Why it's worth adding:** It directly answers the question the vendor-attribution card in Chapter 3 sets up but doesn't resolve: if a firewall is doing this much work on every packet, why doesn't that wreck performance? It's a natural pairing with the Sandbox, which already treats App-ID/User-ID/Content-ID as instantaneous — this would be the honest "here's why that's a reasonable simplification, and here's what's actually happening under the hood" footnote. Like App-ID/User-ID/Content-ID, this is genuinely one vendor's branded architecture term for a pattern other vendors implement differently, so it would need the same disclosure treatment already established in Chapter 3 rather than being presented as a universal firewall design.

**Rough fit:** Small section, best placed near the existing vendor-attribution card in Chapter 3 or as a short aside introducing the Sandbox — doesn't need its own chapter, it's more of a "how" footnote to mechanics the site already teaches.

**Source area:** Current vendor architecture documentation and third-party technical explainers describing single-pass parallel-processing firewall design.

---

### 17. Root certificate longevity and how expiry actually gets handled
**What it is:** The certificate reference already teaches the chain of trust: root, intermediate, and leaf (end-entity) certificates. What it doesn't cover yet is that each level of that chain lives on a completely different timescale, and why. Root CA certificates are deliberately extremely long-lived, commonly on the order of two decades, because a root's public key has to already be baked into every device and browser's trust store — rotating it means waiting for that trust to propagate everywhere before the old root can safely retire, which is slow and disruptive by nature. Intermediate certificates sit in the middle, typically valid for several years, and get rotated on a planned overlap schedule so a new intermediate is already trusted well before the old one expires. Leaf certificates are the ones this site's existing short-lived-certificate candidate (#5) already covers, and they're the ones shrinking fastest.

Expiry and revocation are also two different failure modes worth distinguishing. Expiry is scheduled and predictable: a certificate simply stops being valid on its stated date, and every browser hard-blocks the connection when that happens, no exceptions. Revocation is different — it's a certificate being killed off *before* its natural expiry, usually because something went wrong (a private key leaked, a domain changed hands). Checking for revocation used to mean either downloading a Certificate Revocation List (CRL) or asking a live Online Certificate Status Protocol (OCSP) server "is this one still good?" in real time. That real-time OCSP checking is actively being phased out industry-wide right now in favor of CRLs, partly because the shift toward very short-lived certificates (candidate #5) makes revocation checking less critical in the first place — if a certificate only lives for days instead of a year, there's a much smaller window for a compromised-but-not-yet-expired certificate to cause damage.

**Why it's worth adding:** It's a direct depth extension of the certificate reference the site already has, not a new topic — a learner who's absorbed root/intermediate/leaf and chain of trust would naturally wonder "okay, so what actually happens when one of these expires, or needs to be killed early?" It also pairs tightly with existing candidate #5 (short-lived certs & ACME): that entry explains *why* leaf certificates are shrinking, and this one explains the other half — why root certs are the opposite, deliberately long-lived, and how the revocation side of the story is being reshaped by that same shift toward shorter lifetimes.

**Rough fit:** Section addition to the existing certificate reference (`CertificateTabs`) — natural to place right alongside or immediately after candidate #5's short-lived-certificate content, since they're really two halves of the same "how certificates live and die" story.

**Source area:** Current CA/Browser Forum policy activity, recent public shifts away from OCSP toward CRLs (including major certificate authorities and large service operators publicly changing their revocation-checking approach), and standard PKI trust-hierarchy validity-period conventions.

---

*Candidates #16 and #17 above were added in a follow-up research pass at the project owner's request, alongside the expanded QUIC comparison in candidate #3 — same sourcing standard as the original pass (current, credible, no verbatim reproduction).*

---

## Tier 2 — Good fit, second wave

### 6. Encrypted DNS and the enterprise visibility tension
**What it is:** DNS — the system that turns a domain name into an IP address — has traditionally traveled in plaintext, which made it easy for a firewall to see and filter. DNS-over-HTTPS and DNS-over-TLS encrypt those lookups, which is genuinely good for user privacy but also means a firewall relying on visibility into DNS queries (a common, simple control point) can lose that visibility, especially since DoH commonly rides over the same port as ordinary HTTPS traffic.

**Why it's worth adding:** It's a clean, beginner-graspable illustration of a recurring theme the site already explores (encryption improving privacy while complicating inspection — the same tension Chapters 3–5 build around for HTTPS generally), just applied to a different, very commonly-encountered protocol. DNS is also something every learner already has an intuitive sense of, which makes it an accessible entry point.

**Rough fit:** Could be a full short chapter, or folded into Chapter 2 (What a firewall actually inspects) as a dedicated section given how thematically aligned it already is.

**Source area:** Current enterprise-security guidance on encrypted-DNS visibility tradeoffs, plus recent DNSSEC algorithm/practice updates.

---

### 7. ZTNA vs. VPN — modernizing remote access
**What it is:** A VPN (already in the glossary, never taught in a chapter) creates one broad encrypted tunnel into a network, after which a user typically has fairly wide reach. Zero Trust Network Access instead grants access to one specific application at a time, continuously re-checked against identity and device signals, without ever placing the user "on" the network the way a VPN does.

**Why it's worth adding:** This is the most direct way to finally give the site's existing orphaned VPN glossary terms (VPN, IPSec, IKE, site-to-site, remote-access, PSK) a real teaching home, while also covering a genuinely live industry shift — organizations are visibly moving remote-access strategy away from traditional VPN toward ZTNA-style per-application access. Natural pairing with the Zero Trust chapter above (#4) if that gets built, since it's the "how do I actually get people connected" application of the same idea.

**Rough fit:** Full chapter, ideally positioned right after a Zero Trust chapter since it's a direct application of the same principle — or could absorb the VPN glossary terms into itself if a standalone VPN chapter isn't otherwise planned.

**Source area:** Current industry commentary and analyst guidance on remote-access architecture shifting away from traditional VPN for application access specifically (not all VPN use cases — site-to-site VPN isn't going anywhere).

---

### 8. SASE and cloud-delivered firewalling
**What it is:** Chapter 6 covers forward proxy deployment, generally implying a proxy or firewall living in one place (a data center, a branch office). SASE describes the broader industry pattern of pulling that functionality — proxy, firewall-as-a-service, access control — out into a distributed, cloud-delivered fabric that follows the user instead of requiring their traffic to route back to a fixed location.

**Why it's worth adding:** It's a natural "so where does all this actually run in a modern company" follow-up to the forward-proxy chapter, and addresses a real structural shift (traditional perimeter security assumed users and servers were both in predictable physical places, which is decreasingly true). Some risk of feeling like a marketing term rather than a teachable mechanism, so it would need care to stay concrete rather than becoming a vendor-category tour.

**Rough fit:** Medium section addition to Chapter 6 (Forward Proxy), framed as "and now imagine that proxy isn't in one building" rather than a full new chapter.

**Source area:** Current vendor and analyst material describing SASE adoption trajectory through 2026 as security shifts toward cloud-delivered, identity-driven enforcement.

---

### 9. Service mesh and mTLS for service-to-service traffic
**What it is:** Everything the site teaches so far is about traffic entering or leaving a network boundary. Inside a modern containerized application, though, dozens of small internal services talk to each other constantly, and increasingly those internal connections are themselves authenticated and encrypted using mutual TLS (both sides present a certificate, not just the server), often handled automatically by an infrastructure layer called a service mesh rather than by the application code itself.

**Why it's worth adding:** It's a good "zero trust, but *inside* the data center" companion to the Zero Trust chapter idea, and mutual TLS is a natural, concrete extension of everything Chapters 3–4 already taught about one-directional TLS — flipping "the server proves who it is" into "both sides prove who they are." More specialized than the other Tier 2 items, so it fits a slightly more advanced/optional slot.

**Rough fit:** Could be a compact standalone chapter, or a mTLS-focused section bolted onto Chapter 3 or Chapter 4 (the actual crypto concept — mutual authentication — is a small, teachable delta from what's already there; the container/mesh framing around it is the newer, optional part).

**Source area:** Current cloud-native infrastructure community discussion, including notable renewed momentum around service mesh adoption patterns in 2026.

---

## Tier 3 — Adjacent but more specialized or further from the site's core lane

These are all legitimate, currently-relevant topics, but each is a bigger reach from firewall/TLS/proxy territory than anything above, either because it leans more toward application development, identity, or a different security discipline than network inspection.

### 10. API security fundamentals
**What it is:** As more traffic between systems became API calls rather than browser page loads, a specific set of risks emerged that are less about network-level firewalling and more about whether an API call is allowed to touch the specific piece of data it's requesting (the most common real-world API breach pattern is an authorization check that's missing, not a network-level flaw a firewall would catch).

**Why it might be worth adding:** APIs are now the dominant form of web traffic, so this is genuinely something a security-curious learner will run into — but it's a meaningfully different discipline (closer to application security than network security) than what the rest of the site teaches.

**Rough fit:** Standalone chapter if pursued, since it doesn't extend an existing chapter cleanly.

**Source area:** OWASP's current API-security risk guidance and recent cloud-threat-report commentary on authorization failures as the dominant real-world API breach pattern.

---

### 11. DDoS, CDNs, and the WAAP convergence
**What it is:** Distributed denial-of-service defense, content delivery networks, and web application firewalls are converging into unified "Web Application and API Protection" platforms sitting at the network edge, defending against both brute-force traffic floods and more surgical application-layer attacks that don't show up as a traffic spike at all.

**Why it might be worth adding:** It's a plausible "how does this scale to internet-facing services, not just enterprise perimeters" follow-up, and ties back to firewall concepts already taught, but the interesting parts (precision Layer-7 attacks, edge compute) are somewhat removed from the site's beginner-friendly, mechanics-first teaching style.

**Rough fit:** Standalone chapter if pursued; doesn't extend an existing one particularly well.

**Source area:** Current edge-security/CDN industry trend reporting on record-scale volumetric attacks alongside a rise in non-volumetric application-layer attacks.

---

### 12. Email authentication (SPF, DKIM, DMARC)
**What it is:** Three protocols that work together to let a receiving mail server verify that an email claiming to be from a domain actually came from a sender that domain authorized, and to tell the receiving server what to do (quarantine, reject) with mail that fails that check.

**Why it might be worth adding:** Extremely practical and something almost everyone has a vague awareness of ("why did this land in spam"), and there's a real current trend of enforcement becoming mandatory rather than optional (major mailbox providers now require it for bulk senders). But it's a fairly distinct protocol family from TLS/firewall content — more of a standalone practical-literacy topic than a natural sequel to Chapters 1–6.

**Rough fit:** Small standalone chapter or a glossary-only addition — probably too self-contained to hang off an existing chapter.

**Source area:** Current email-security industry reporting on DMARC enforcement becoming a de facto requirement (and, per current guidance, a codified regulatory expectation in some payment-related standards).

---

### 13. Passwordless authentication and passkeys
**What it is:** An authentication approach where a device holds a private key and proves a user's identity by cryptographically signing a challenge, instead of the user typing a password (or even a one-time code) that could be phished or intercepted.

**Why it might be worth adding:** Widely discussed as the new baseline for identity security, and it's a nice concrete companion to the Zero Trust chapter (device/identity signals are a core Zero Trust input), but it's identity/authentication territory rather than network traffic territory, so it's a bigger stretch from the site's current lane than most Tier 2 items.

**Rough fit:** Small section within a Zero Trust chapter if that's built (as the "how does a device actually prove who's using it" building block) rather than its own chapter.

**Source area:** Current identity-and-access-management industry guidance describing phishing-resistant authentication (passkeys, FIDO2) as moving from optional to baseline expectation in 2026.

---

### 14. AI agent security (prompt injection and related risks) — flagged, likely out of scope
**What it is:** As AI systems are given the ability to take real actions (browse, run code, send messages) rather than just answer questions, a new attack pattern has emerged where malicious instructions are hidden inside content the AI reads (a webpage, a document, an email) and the AI follows them as if they came from its legitimate operator.

**Why it might be worth adding — but probably not here:** This is a genuinely fast-growing, currently-hot security topic. But it's a different domain entirely — application/AI security, not networking or firewall/TLS infrastructure — and would sit oddly next to the rest of Netwise's content without a much bigger framing change to the site's premise. Flagging it mainly so it's been considered and explicitly set aside rather than silently missed.

**Rough fit:** Not a good fit for this site as currently scoped; would need its own separate project to do justice.

**Source area:** Current AI-security community and vendor threat-research commentary describing prompt injection as the dominant emerging risk category for AI agent deployments in 2026.

---

### 15. Software supply chain security / SBOM — flagged, likely out of scope
**What it is:** A Software Bill of Materials is essentially an ingredients list for a piece of software — every library and component that went into it — used so an organization can quickly tell whether it's exposed when a vulnerability is found in some widely-used component.

**Why it might be worth adding — but probably not here:** Legitimately a hot, currently-evolving topic (regulatory guidance is actively being updated), but it's software supply-chain/appsec territory, not network or traffic-inspection territory, and doesn't connect naturally to anything else on the site. Included for completeness since it came up repeatedly in current security-community discussion, not because it's a strong recommendation.

**Rough fit:** Not a good fit for this site as currently scoped.

**Source area:** Current CISA/industry guidance on SBOM practices maturing from a compliance checkbox toward operational use.

---

## Summary table

| # | Topic | Tier | Rough fit |
|---|---|---|---|
| 1 | Encrypted Client Hello (ECH) | 1 | Section → Ch3/Ch5 |
| 2 | Post-quantum hybrid key exchange | 1 | Section → Ch4 |
| 3 | QUIC / HTTP-3 inspection challenges | 1 | Section → Ch2/Ch6 |
| 4 | Zero Trust Architecture | 1 | Full new chapter |
| 5 | Short-lived certs & ACME automation | 1 | Section → Certificate reference |
| 16 | Single pass (parallel processing) architecture | 1 | Section → Ch3 / Sandbox intro |
| 17 | Root certificate longevity & expiry/revocation handling | 1 | Section → Certificate reference (pairs with #5) |
| 6 | Encrypted DNS vs. enterprise visibility | 2 | Chapter or section → Ch2 |
NOT NOW| 7 | ZTNA vs. VPN | 2 | Full chapter (pairs with #4) | 
| 8 | SASE / cloud-delivered firewall | 2 | Section → Ch6 |
NOT NOW| 9 | Service mesh & mTLS | 2 | Compact chapter or section → Ch3/Ch4 |
| 10 | API security fundamentals | 3 | Standalone chapter |
| 11 | DDoS / CDN / WAAP convergence | 3 | Standalone chapter |
NOT NOW| 12 | Email authentication (SPF/DKIM/DMARC) | 3 | Small standalone chapter |
| 13 | Passwordless auth / passkeys | 3 | Section → Zero Trust chapter |
| 14 | AI agent security / prompt injection | 3 | Out of scope (flagged) |
NOT NOW| 15 | Software supply chain / SBOM | 3 | Out of scope (flagged) |
