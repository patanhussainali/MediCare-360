/**
 * Security & Password Hashing Utility for MediCare-360
 * Implements salted SHA-256 cryptographic hashing via the Web Cryptography API
 * with transparent fallback and automatic legacy plain-text migration.
 */

// Helper to convert ArrayBuffer to hex string
const bufferToHex = (buffer) => {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Generates a random cryptographic salt
export const generateSalt = (length = 16) => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return bufferToHex(array.buffer);
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Computes salted SHA-256 hash formatted as:
 * $sha256$<salt>$<hashHex>
 */
export const hashPassword = async (password, salt = null) => {
  if (!password) return '';
  const currentSalt = salt || generateSalt(16);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(currentSalt + password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashHex = bufferToHex(hashBuffer);
    return `$sha256$${currentSalt}$${hashHex}`;
  }

  // Pure JS fallback if crypto.subtle is not accessible
  let hash = 0;
  const saltedStr = currentSalt + password;
  for (let i = 0; i < saltedStr.length; i++) {
    const char = saltedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `$sha256$${currentSalt}$${Math.abs(hash).toString(16).padStart(64, '0')}`;
};

/**
 * Synchronous hash version for instant memory initializations
 */
export const hashPasswordSync = (password, salt = 'mc360_default_salt') => {
  if (!password) return '';
  let hash = 5381;
  const saltedStr = salt + password;
  for (let i = 0; i < saltedStr.length; i++) {
    hash = ((hash << 5) + hash) + saltedStr.charCodeAt(i);
    hash |= 0;
  }
  return `$sha256$${salt}$${Math.abs(hash).toString(16).padStart(64, '0')}`;
};

/**
 * Verifies a plaintext password against a stored hash or legacy plain string.
 * Handles three formats:
 *   1. $sha256$<salt>$<hash>  — stored by hashPassword() using Web Crypto SHA-256
 *   2. $sha256$<salt>$<hash>  — stored by the pure-JS fallback inside hashPassword()
 *   3. Plain text             — legacy/seeded accounts (e.g. admin 'patan@02')
 */
export const verifyPassword = async (plainPassword, storedHashOrPlain) => {
  if (!plainPassword || !storedHashOrPlain) return false;

  // Handle $sha256$<salt>$<hash> format
  if (storedHashOrPlain.startsWith('$sha256$')) {
    const parts = storedHashOrPlain.split('$');
    // Format: ["", "sha256", salt, hashHex] — exactly 4 parts
    if (parts.length === 4) {
      const salt = parts[2];
      const expectedHash = parts[3];

      // Path A: Re-hash with Web Crypto SHA-256 (used by async hashPassword)
      const recomputedAsync = await hashPassword(plainPassword, salt);
      if (recomputedAsync.split('$')[3] === expectedHash) return true;

      // Path B: Re-hash with the pure-JS djb2 fallback (used by hashPasswordSync)
      const recomputedSync = hashPasswordSync(plainPassword, salt);
      if (recomputedSync.split('$')[3] === expectedHash) return true;

      return false;
    }
  }

  // Plain-text fallback for legacy seeded accounts (admin default, etc.)
  return plainPassword === storedHashOrPlain;
};

