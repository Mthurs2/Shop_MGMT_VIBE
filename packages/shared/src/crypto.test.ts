import { describe, expect, it } from 'vitest';
import { decryptString, encryptString } from './crypto';

describe('crypto', () => {
  it('round trips', () => {
    const secret = 'supersecretkeysupersecretkeysupersecretkey12';
    const payload = 'hello';
    const encrypted = encryptString(payload, secret);
    const decrypted = decryptString(encrypted, secret);
    expect(decrypted).toBe(payload);
  });
});
