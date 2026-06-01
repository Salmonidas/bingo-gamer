import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token for editing cards.
 */
export function generateEditToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates a cryptographically secure random token for public play sharing.
 */
export function generateShareToken(): string {
  return crypto.randomBytes(12).toString('hex');
}
