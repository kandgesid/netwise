import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/chapters/Hero';
import { Chapter1Firewall } from './components/chapters/Chapter1Firewall';
import { Chapter2WhatItDoes } from './components/chapters/Chapter2WhatItDoes';
import { Chapter3Handshake } from './components/chapters/Chapter3Handshake';
import { Chapter4KeyExchange } from './components/chapters/Chapter4KeyExchange';
import { Chapter5DecryptionPolicies } from './components/chapters/Chapter5DecryptionPolicies';
import { Chapter6ForwardProxy } from './components/chapters/Chapter6ForwardProxy';
import { Chapter7ZeroTrust } from './components/chapters/Chapter7ZeroTrust';
import { Sandbox } from './components/sandbox/Sandbox';
import { CertificateTabs } from './components/reference/CertificateTabs';
import { Glossary } from './components/reference/Glossary';

// The whole site is just this list, in order. Adding a Chapter 7 later means:
// 1. Add a data file under src/data (if it needs one)
// 2. Add a component under src/components/chapters
// 3. Add one line here, and one line in Header.tsx's NAV_LINKS
function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Chapter1Firewall />
      <Chapter2WhatItDoes />
      <Chapter3Handshake />
      <Chapter4KeyExchange />
      <Chapter5DecryptionPolicies />
      <Chapter6ForwardProxy />
      <Chapter7ZeroTrust />
      <Sandbox />
      <CertificateTabs />
      <Glossary />
      <Footer />
    </div>
  );
}

export default App;
