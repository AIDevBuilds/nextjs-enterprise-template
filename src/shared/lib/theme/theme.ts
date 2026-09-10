'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export interface ThemeSnapshot {
  /** What the user chose — may be 'system'. */
  theme: Theme;
  /** What is actually rendered right now. */
  resolved: ResolvedTheme;
}

/**
 * Theme lives in an external store read via `useSyncExternalStore`, not in React
 * state seeded from an effect. `localStorage` and `matchMedia` are external
 * mutable sources; reading them in an effect and calling `setState` causes a
 * cascading render, which React 19's compiler-aware lint rules reject.
 *
 * `getServerSnapshot` lets the server render deterministically while the
 * blocking script in the root layout applies the real theme before first paint.
 */
const SERVER_SNAPSHOT: ThemeSnapshot = { theme: 'system', resolved: 'light' };

const listeners = new Set<() => void>();
let snapshot: ThemeSnapshot = SERVER_SNAPSHOT;

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
    return 'system';
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyToDocument(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

/** Recomputes the cached snapshot; returns true when it actually changed. */
function refresh(): boolean {
  const theme = readStoredTheme();
  const resolved = theme === 'system' ? systemTheme() : theme;
  if (snapshot.theme === theme && snapshot.resolved === resolved) return false;
  // A new object identity is required for useSyncExternalStore to see a change,
  // but only when something really changed — otherwise React loops.
  snapshot = { theme, resolved };
  return true;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onExternalChange = () => {
    if (refresh()) {
      applyToDocument(snapshot.resolved);
      emit();
    }
  };

  media.addEventListener('change', onExternalChange);
  // Another tab changing the preference.
  window.addEventListener('storage', onExternalChange);

  // Adopt whatever the pre-hydration script already decided.
  if (refresh()) emit();

  return () => {
    listeners.delete(onStoreChange);
    media.removeEventListener('change', onExternalChange);
    window.removeEventListener('storage', onExternalChange);
  };
}

export function getSnapshot(): ThemeSnapshot {
  return snapshot;
}

export function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

export function setTheme(next: Theme): void {
  try {
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Non-fatal: the choice just won't survive a reload.
  }
  refresh();
  applyToDocument(snapshot.resolved);
  emit();
}

export function useTheme() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    theme: snap.theme,
    resolvedTheme: snap.resolved,
    setTheme: useCallback((next: Theme) => setTheme(next), []),
  };
}

/**
 * Runs before first paint to set the `.dark` class from storage / OS preference.
 * Injected as a blocking inline script — without it the page paints light and
 * then snaps to dark.
 */
export const THEME_INIT_SCRIPT = `
(function(){try{
var s=localStorage.getItem('${THEME_STORAGE_KEY}');
var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',d);
document.documentElement.style.colorScheme=d?'dark':'light';
}catch(e){}})();
`.trim();
