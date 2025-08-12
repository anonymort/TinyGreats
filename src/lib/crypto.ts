// Minimal AES-GCM utilities for optional local encryption

function textEncoder() { return new TextEncoder(); }
function textDecoder() { return new TextDecoder(); }

export async function deriveKey(passcode: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder().encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJson(key: CryptoKey, data: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = textEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { iv: b64(iv), ciphertext: b64(new Uint8Array(ciphertext)) };
}

export async function decryptJson(key: CryptoKey, ivB64: string, ciphertextB64: string) {
  const iv = fromB64(ivB64);
  const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fromB64(ciphertextB64));
  return JSON.parse(textDecoder().decode(new Uint8Array(buf)));
}

export function b64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

export function fromB64(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

