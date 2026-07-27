import type { ReactNode } from 'react';
import { ROUTE_META, type RouteMeta } from './routeMeta';
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

export interface RouteEntry extends RouteMeta {
  element: ReactNode;
}

// Pairs each routeMeta.ts entry with its component. Only App.tsx needs this
// (the <Routes> table) — everything else (Sidebar, Home, ChapterPage,
// useReadingProgress) should import path/label/description straight from
// routeMeta.ts instead, to avoid importing every chapter component.
const ELEMENTS: Record<string, ReactNode> = {
  '/chapters/firewall': <Chapter1Firewall />,
  '/chapters/what-it-does': <Chapter2WhatItDoes />,
  '/chapters/handshake': <Chapter3Handshake />,
  '/chapters/key-exchange': <Chapter4KeyExchange />,
  '/chapters/policies': <Chapter5DecryptionPolicies />,
  '/chapters/forward-proxy': <Chapter6ForwardProxy />,
  '/chapters/zero-trust': <Chapter7ZeroTrust />,
  '/sandbox': <Sandbox />,
  '/certificates': <CertificateTabs />,
  '/glossary': <Glossary />,
};

export const ROUTES: RouteEntry[] = ROUTE_META.map((meta) => ({ ...meta, element: ELEMENTS[meta.path] }));
