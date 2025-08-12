export async function requestPersistentStorage() {
  if (navigator.storage && 'persist' in navigator.storage) {
    try {
      // Request persistent storage to reduce eviction risk
      const persisted = await navigator.storage.persist();
      return persisted;
    } catch {
      return false;
    }
  }
  return false;
}

export function setBadge(count?: number) {
  const anyNav = navigator as any;
  if (anyNav.setAppBadge) {
    try {
      if (count && count > 0) anyNav.setAppBadge(count);
      else anyNav.setAppBadge();
    } catch {}
  }
}

export function clearBadge() {
  const anyNav = navigator as any;
  if (anyNav.clearAppBadge) {
    try {
      anyNav.clearAppBadge();
    } catch {}
  }
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

