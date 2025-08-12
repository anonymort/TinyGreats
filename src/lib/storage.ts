import { browser } from '$app/environment';

export async function requestPersistentStorage() {
  if (!browser) return false;
  if (navigator.storage && 'persist' in navigator.storage) {
    try {
      // Request persistent storage to reduce eviction risk
      const persisted = await (navigator.storage.persist as () => Promise<boolean>)();
      return persisted;
    } catch {
      return false;
    }
  }
  return false;
}

export function setBadge(count?: number) {
  if (!browser) return;
  const anyNav = navigator as any;
  if (anyNav.setAppBadge) {
    try {
      if (count && count > 0) anyNav.setAppBadge(count);
      else anyNav.setAppBadge();
    } catch {}
  }
}

export function clearBadge() {
  if (!browser) return;
  const anyNav = navigator as any;
  if (anyNav.clearAppBadge) {
    try {
      anyNav.clearAppBadge();
    } catch {}
  }
}

export function downloadBlob(filename: string, blob: Blob) {
  if (!browser) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

