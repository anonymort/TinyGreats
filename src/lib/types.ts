export type Great = {
  id: string; // uuid
  ymd: string; // 'YYYY-MM-DD' local TZ
  entry: string; // up to 280 chars
  mood?: string; // emoji shortname or literal
  createdAt: number; // epoch ms
  editedAt?: number; // epoch ms
  iv?: string; // base64 iv if encrypted
  v: 1;
};

export type Settings = {
  theme: 'system' | 'daylight' | 'midnight';
  reminderHour?: number; // 0-23
  badgeNudges: boolean;
  encryption: boolean;
  typeface: 'pairA' | 'pairB';
};

