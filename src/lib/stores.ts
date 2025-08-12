import { writable, derived } from 'svelte/store';
import type { Settings } from './types';
import { getSettings, putSettings } from './db';

export const settings = writable<Settings | null>(null);

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

export const themeClass = derived(settings, (s) => {
  if (!s || s.theme === 'system') return '';
  return s.theme === 'midnight' ? 'dark' : '';
});

