import { useCallback, useState } from 'react';
import { COURSE_ROUTES } from '../routeMeta';

const STORAGE_KEY = 'netwise:progress';
const COURSE_PATHS = new Set(COURSE_ROUTES.map((r) => r.path));

interface StoredProgress {
  visited: string[];
  lastPath: string | null;
}

function readStorage(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { visited: [], lastPath: null };
    const parsed = JSON.parse(raw);
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited.filter((p: unknown) => typeof p === 'string') : [],
      lastPath: typeof parsed.lastPath === 'string' ? parsed.lastPath : null,
    };
  } catch {
    return { visited: [], lastPath: null };
  }
}

function writeStorage(data: StoredProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private browsing / quota exceeded — progress just won't persist this session.
  }
}

/**
 * Tracks which course chapters (not tools) a reader has visited, purely in
 * localStorage — no accounts, no server. Powers the "Continue reading" CTA
 * on Home, the sidebar's visited dots, and its course-progress bar.
 */
export function useReadingProgress() {
  const [state, setState] = useState<StoredProgress>(() => readStorage());

  const markVisited = useCallback((path: string) => {
    if (!COURSE_PATHS.has(path)) return;
    setState((prev) => {
      if (prev.lastPath === path && prev.visited.includes(path)) return prev;
      const next: StoredProgress = {
        visited: prev.visited.includes(path) ? prev.visited : [...prev.visited, path],
        lastPath: path,
      };
      writeStorage(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const empty: StoredProgress = { visited: [], lastPath: null };
    writeStorage(empty);
    setState(empty);
  }, []);

  const visited = new Set(state.visited);
  const lastRoute = COURSE_ROUTES.find((r) => r.path === state.lastPath) ?? null;
  const done = COURSE_ROUTES.filter((r) => visited.has(r.path)).length;

  return { visited, lastRoute, markVisited, reset, done, total: COURSE_ROUTES.length };
}
