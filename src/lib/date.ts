export function ymdFromDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function nowEpoch() {
  return Date.now();
}

export function localMidnight(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

