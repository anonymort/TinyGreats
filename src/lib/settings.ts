import type { Settings } from './types';
import { getSettings, putSettings } from './db';
import { Store } from './store';

export const settings = new Store<Settings | null>(null);

export async function loadSettings() {
  const loaded = await getSettings();
  settings.set(loaded);
}

export function updateSettings(patch: Partial<Settings>) {
  const current = settings.get();
  const fallback: Settings = {
    badgeNudges: true,
    encryption: false,
    typeface: 'pairA'
  };

  const next = { ...(current ?? fallback), ...patch } as Settings;
  putSettings(next);
  settings.set(next);
}
