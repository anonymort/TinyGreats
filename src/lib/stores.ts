import { writable } from 'svelte/store';
import type { Settings } from './types';
import { getSettings, putSettings } from './db';

export const settings = writable<Settings | null>(null);

export async function loadSettings() {
  settings.set(await getSettings());
}

export function updateSettings(patch: Partial<Settings>) {
  settings.update((prev) => {
    const next = {
      ...(prev ?? { badgeNudges: true, encryption: false, typeface: 'pairA' }),
      ...patch
    } as Settings;
    void putSettings(next);
    return next;
  });
}
