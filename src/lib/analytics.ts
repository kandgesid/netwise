import { COURSE_ROUTES, TOOL_ROUTES } from '../routeMeta';

const GA_MEASUREMENT_ID = 'G-VDJ0HVC79H';
const CONSENT_KEY = 'netwise:consent';

type ConsentState = 'accepted' | 'declined';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function readConsent(): ConsentState | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_KEY, state);
  } catch {
    // Private browsing / quota exceeded — the choice just won't persist.
  }
}

// HashRouter's own routing state is derived from window.location.hash, so
// reading it here directly stays correctly in sync with React Router without
// needing route info threaded in from every call site.
function currentSpaPath(): string {
  const hash = window.location.hash;
  return hash.startsWith('#') ? hash.slice(1) || '/' : '/';
}

function titleFor(path: string): string {
  const route = [...COURSE_ROUTES, ...TOOL_ROUTES].find((r) => r.path === path);
  return route ? route.navLabel : 'Home';
}

let loaded = false;

function loadGtag() {
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  // Google Consent Mode: gtag.js silently withholds every hit until this is
  // set, regardless of our own consent banner having already gated whether
  // loadGtag() runs at all. Must come before 'js'/'config' — setting it after
  // does not retroactively unblock hits already queued under the default
  // (denied) state.
  window.gtag('consent', 'default', { ad_storage: 'granted', analytics_storage: 'granted' });
  window.gtag('js', new Date());
  // send_page_view: false — this is a client-routed SPA, so page views are
  // fired manually on each route change (see trackPageView) instead of only
  // once on the initial script load.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  // Cache-busted: without this, a gtag.js instance already cached in this
  // browser from an earlier consent state can get served without properly
  // re-initializing against the fresh consent signal queued above.
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}&t=${Date.now()}`;
  document.head.appendChild(script);

  trackPageView(currentSpaPath());
}

export function trackPageView(path: string) {
  if (!loaded || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: titleFor(path),
    page_location: window.location.href,
  });
}

/** Call once on app mount — loads GA4 only if consent was already given in a past session. */
export function initAnalyticsIfConsented() {
  if (readConsent() === 'accepted') loadGtag();
}

export function acceptConsent() {
  writeConsent('accepted');
  loadGtag();
}

export function declineConsent() {
  writeConsent('declined');
}

export function getConsent() {
  return readConsent();
}
