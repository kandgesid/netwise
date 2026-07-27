import { useEffect, useState } from 'react';

/**
 * 0-100 readout of how far down the current page the reader has scrolled.
 * `resetKey` (typically the route pathname) re-zeroes it on navigation,
 * since a fresh page starts unscrolled regardless of the last page's height.
 */
export function useScrollProgress(resetKey: string) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [resetKey]);

  return progress;
}
