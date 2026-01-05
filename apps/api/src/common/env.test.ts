import { describe, expect, it } from 'vitest';
import { validateEnv } from './env';

describe('validateEnv', () => {
  it('accepts valid env', () => {
    const env = validateEnv({
      PORT: '3001',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SESSION_SECRET: 'x'.repeat(32),
      ENCRYPTION_SECRET: 'y'.repeat(32),
      CORS_ORIGINS: 'http://localhost:3000'
    });
    expect(env.PORT).toBe(3001);
  });
});
