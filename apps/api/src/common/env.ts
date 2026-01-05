import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default('http://localhost:3000')
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }
  return parsed.data;
}
