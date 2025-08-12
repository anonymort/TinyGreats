import Dexie, { type Table } from 'dexie';
import type { Great, Settings } from './types';

class TGDatabase extends Dexie {
  greats!: Table<Great, string>;
  settings!: Table<{ key: string; value: Settings }, string>;

  constructor() {
    super('tg-v1');
    this.version(1).stores({
      greats: 'id,&ymd,createdAt,mood',
      settings: 'key'
    });
  }
}

export const db = new TGDatabase();

export const SETTINGS_KEY = 'settings';

export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get(SETTINGS_KEY);
  return (
    row?.value ?? {
      theme: 'system',
      badgeNudges: true,
      encryption: false,
      typeface: 'pairA'
    }
  );
}

export async function putSettings(value: Settings) {
  await db.settings.put({ key: SETTINGS_KEY, value });
}

export async function upsertGreat(g: Great) {
  await db.greats.put(g);
}

export async function getGreatByYmd(ymd: string) {
  return db.greats.where({ ymd }).first();
}

export async function listGreatsByRange(startYmd: string, endYmd: string) {
  return db.greats.where('ymd').between(startYmd, endYmd, true, true).sortBy('ymd');
}

export async function listAllGreats() {
  return db.greats.orderBy('createdAt').toArray();
}

export async function deleteGreat(id: string) {
  return db.greats.delete(id);
}

