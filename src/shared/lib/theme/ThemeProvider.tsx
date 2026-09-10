'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'theme';

interface ThemeContextValue {
  /** What the user chose — may be 'system'. */
  theme: Theme;
  /** What is actually rendered right now. */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

/**
 * Theme state. This is a legitimate use of React Context (see CLAUDE.md §4):
 * one value, changes rarely, needs to reach the whole tree.
 *
 * The initial class is set by a blocking inline script in the root layout, so
 * there is no flash of the wrong theme before hydration.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Adopt whatever the pre-hydration script already decided.
  useEffect(() => {
    let stored: Theme | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    } catch {
      // Storage can be unavailable (private mode, blocked cookies).
    }
    const initial: Theme = stored === 'light' || stored === 'dark' ? stored : 'system';
    setThemeState(initial);
    setResolvedTheme(initial === 'system' ? systemTheme() : initial);
  }, []);

  // Follow the OS while the user is on 'system'.
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = media.matches ? 'dark' : 'light';
      setResolvedTheme(next);
      applyTheme(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Non-fatal: the choice just won't survive a reload.
    }
    const resolved = next === 'system' ? systemTheme() : next;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
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
