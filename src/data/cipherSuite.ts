export interface CipherPart {
  code: string;
  label: string;
  text: string;
  /** Shown on the chip button instead of `code` when the key-exchange toggle is set to
   *  'hybrid'. Only defined on CIPHER_PARTS[0] ("Key exchange" / ECDHE) — the other three
   *  entries have nothing to swap. */
  hybridCode?: string;
  /** Shown in the explainer panel instead of `text`, only when the active chip is index 0
   *  AND the toggle is 'hybrid'. Only defined on CIPHER_PARTS[0]. */
  hybridText?: string;
}

export const CIPHER_PARTS: CipherPart[] = [
  {
    code: 'ECDHE',
    label: 'Key exchange',
    text: 'ECDHE is the key exchange group. This is the ephemeral elliptic-curve exchange from earlier in this chapter: it derives the shared secret and provides forward secrecy since a fresh key pair is used just for this session.',
    hybridCode: 'X25519+ML-KEM',
    hybridText: "With hybrid key exchange, X25519 (the classical group named earlier in this chapter) and ML-KEM, a NIST-standardized post-quantum algorithm built on different math entirely (lattice-based, not elliptic-curve), run side by side in the same handshake, and their two outputs combine into one shared secret. That secret only breaks if both algorithms do, a future flaw in the new lattice-based math, or a quantum computer breaking the classical curve, isn't enough on its own. This defends against a different threat than forward secrecy above: forward secrecy protects finished sessions from a future stolen private key, but does nothing against a future quantum computer breaking the classical math itself, since the ephemeral exchange underneath is still just classical math. That's what harvest now, decrypt later means: an attacker recording today's traffic could still decrypt it years later once that math is broken. Hybrid key exchange like this, commonly deployed as ML-KEM-768 (developed under the earlier name CRYSTALS-Kyber during NIST's standardization process), is already live and default-on in mainstream browsers and major cloud providers today, not a future plan. One limit worth being explicit about: this only upgrades key exchange. Authentication, encryption, and integrity above are untouched, server authentication in particular is still almost entirely classical RSA today, with its own post-quantum migration still at a much earlier stage.",
  },
  { code: 'RSA', label: 'Authentication', text: 'RSA is the authentication algorithm. It\'s what the server\'s certificate uses to prove its identity during the handshake, separate from whatever is doing the actual key exchange.' },
  { code: 'AES_256_GCM', label: 'Bulk encryption', text: 'AES_256_GCM is the bulk encryption algorithm. It actually encrypts the application data flowing back and forth once the handshake is done, and GCM also provides built-in integrity checking as it encrypts.' },
  { code: 'SHA384', label: 'Integrity / MAC', text: 'SHA384 is the hash function backing the handshake\'s integrity checks, confirming nothing was tampered with in transit. That\'s a different layer of integrity than GCM\'s per-message authentication above: this one covers the handshake\'s key derivation and transcript, not the encrypted application data itself.' },
];
