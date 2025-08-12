import { browser } from '$app/environment';

export type ErrorEntry = { t: number; m: string; s?: string };

const KEY = 'tg_error_log_v1';

function load(): ErrorEntry[] {
  if (!browser) return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(arr: ErrorEntry[]) {
  if (!browser) return;
  try { localStorage.setItem(KEY, JSON.stringify(arr.slice(-200))); } catch {}
}

let log = load();

export function addError(m: string, s?: string) {
  log.push({ t: Date.now(), m, s });
  save(log);
}

export function getErrors() { return [...log]; }
export function clearErrors() { log = []; save(log); }

export function installGlobalHandler() {
  if (!browser) return;
  window.addEventListener('error', (e: ErrorEvent) => addError(e.message, e.error?.stack));
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => addError(String(e.reason)));
}

