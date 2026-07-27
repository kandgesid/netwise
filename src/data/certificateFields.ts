// Data for the Certificate Field Decoder (Reference → Certificates).
// Mirrors CipherPart in cipherSuite.ts: a chip-click pattern where the chip shows a short label
// and an explainer panel below shows the field's raw value plus plain-English detail.
// See docs/integration/phase-1-certificates/simulation-design.md §1 for the design this implements.

export interface CertField {
  id: string;
  label: string;
  value: string;
  text: string;
}

// Static "openssl x509 -text"-style preview of one fictional leaf certificate. Dates are fixed,
// not tied to real "today" — this block demonstrates what the fields look like, not whether this
// specific instance is currently valid (that's what the Verification Walkthrough is for).
export const CERT_PREVIEW = `Certificate:
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
            Full Name: URI:http://crl.netwise-example-ca.test/intermediate.crl`;

export const CERT_FIELDS: CertField[] = [
  {
    id: 'subject',
    label: 'Subject',
    value: 'CN=portal.netwise-example.test, O=Netwise Example Corp, C=US',
    text: "Identifies who the certificate was issued to, the entity itself, not the CA that vouches for it. The format is a Distinguished Name: CN (Common Name), O (Organization), C (Country). CN used to be what a browser checked against the hostname you were visiting; modern clients don't trust it for that anymore, they check the Subject Alternative Name field instead. The O field here carries a verified organization name, which makes this an organization-validated certificate. That's the exception rather than the rule: most certificates in use today are domain-validated, issued through ACME-style automation with O left blank or generic, since proving control of a domain is a far smaller bar than proving who a company is.",
  },
  {
    id: 'san',
    label: 'SAN',
    value: 'DNS:portal.netwise-example.test, DNS:www.netwise-example.test, DNS:api.netwise-example.test',
    text: "Lists every hostname this one certificate is actually valid for, and this is the field a client checks the address bar against, not the Subject CN above. One certificate can cover several related names instead of needing a separate certificate per name, here that's the bare domain plus two subdomains, listed explicitly rather than with a wildcard (see the glossary's wildcard certificate entry for that alternative). If the hostname you're actually visiting isn't on this list, the connection fails, no matter how valid and properly signed the certificate otherwise is.",
  },
  {
    id: 'issuer',
    label: 'Issuer',
    value: 'C=US, O=Netwise Example CA, CN=Netwise Example Intermediate CA',
    text: "Identifies which CA signed this certificate and is vouching for it. This issuer is an intermediate, not the root: root CAs stay long-lived and offline, and day-to-day signing gets delegated to intermediates instead, which are themselves rotated every few years on a planned overlap schedule so a new one is already trusted before the old one expires. This field is also the anchor for the verification walkthrough below, its first two checks are literally \"does this Issuer's signature check out\" and \"is that issuer's own issuer eventually a trusted root.\" Same Issuer concept, different job depending on where a certificate sits, see the three tabs above for who holds which certificate in each deployment.",
  },
  {
    id: 'validity',
    label: 'Validity window',
    value: 'Not Before: Jan 15 00:00:00 2026 GMT / Not After: Apr 15 23:59:59 2026 GMT',
    text: "Two timestamps: Not Before, when the certificate starts being valid, and Not After, when it stops. Browsers hard-block the instant Not After passes, no grace period, no partial trust, no warning-but-proceed option. That's what makes expiry different from revocation below: expiry is scheduled and predictable, revocation isn't, and needs a live check instead of just reading a date. This example's roughly 90-day window mirrors what mainstream automated CAs already issue today, not a hypothetical future state, and the industry-mandated maximum keeps shrinking further, down toward 47 days, which is exactly what makes automation move from convenience to necessity.",
  },
  {
    id: 'pubkey',
    label: 'Public key',
    value: 'Public Key Algorithm: rsaEncryption / RSA Public-Key: (2048 bit)',
    text: "This is the certificate subject's own key pair, the same kind of key Chapter 4 introduced as the authentication algorithm, the RSA in a cipher suite name. The certificate is where that public key actually gets published. Only the server holds the matching private key, and that's the entire mechanical basis for proving identity during the handshake: the server can do something, produce a signature, or decrypt something encrypted to this public key, that only the true private-key holder could do. Don't mix this up with the Signature Algorithm field below: this key belongs to the certificate's own subject, the leaf, while that signature was produced by the issuer's key instead.",
  },
  {
    id: 'sigalg',
    label: 'Signature algorithm',
    value: 'sha256WithRSAEncryption',
    text: "Not the algorithm the certificate's own key uses, that's the Public Key field above, this is the algorithm the Issuer used to sign and vouch for this certificate. A client re-verifies that signature using the issuer's public key, found on the issuer's own certificate, to confirm two things at once: the certificate wasn't tampered with in transit, and it really was issued by that specific CA. If this signature doesn't check out, nothing else about the certificate matters, a client won't even proceed to check validity dates or revocation status. That's exactly why it's the first check in the verification walkthrough below, and, one level up the chain, the second: it gates everything that comes after it.",
  },
  {
    id: 'revocation',
    label: 'Revocation info',
    value: 'X509v3 CRL Distribution Points: Full Name: URI:http://crl.netwise-example-ca.test/intermediate.crl',
    text: "Points to where a client can check whether this specific certificate has been killed early, before its natural Not After date, rather than expiring on schedule. Historically that meant one of two mechanisms: downloading a CRL, a list of revoked serial numbers, or asking a live OCSP responder whether this one certificate is still good, in real time. The industry is moving away from that real-time OCSP checking and back toward CRL-based checking, and shrinking certificate lifespans are a direct part of why, a much smaller window exists for a compromised-but-not-yet-expired certificate to do damage. This is the data the verification walkthrough's final step is conceptually checking against.",
  },
];
