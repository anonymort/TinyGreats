import { writable, derived } from 'svelte/store';
import type { Settings } from './types';
import { getSettings, putSettings } from './db';
import { browser } from '$app/environment';

export const settings = writable<Settings | null>(null);

// System theme detection store
export const systemPrefersDark = writable(false);

// Initialize system theme detection
if (browser) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemPrefersDark.set(mediaQuery.matches);
  
  // Listen for system theme changes
  mediaQuery.addEventListener('change', (e: any) => {
    systemPrefersDark.set(e.matches);
  });
}

export async function loadSettings() {
  settings.set(await getSettings());
}

export function updateSettings(patch: Partial<Settings>) {
  settings.update((prev) => {
    const next = { ...(prev ?? { theme: 'system', badgeNudges: true, encryption: false, typeface: 'pairA' }), ...patch } as Settings;
    void putSettings(next);
    return next;
  });
}

export const themeClass = derived([settings, systemPrefersDark], ([s, systemDark]) => {
  if (!s) return systemDark ? 'dark' : 'light';
  
  switch (s.theme) {
    case 'midnight':
      return 'dark';
    case 'daylight':
      return 'light';
    case 'system':
    default:
      return systemDark ? 'dark' : 'light';
  }
});

