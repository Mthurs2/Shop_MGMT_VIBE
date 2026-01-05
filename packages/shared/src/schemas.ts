import { z } from 'zod';

export const emailSchema = z.string().email();
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a symbol');

export const tenantSignupSchema = z.object({
  name: z.string().min(2),
  legalName: z.string().min(2),
  timezone: z.string().min(3),
  primaryEmail: emailSchema,
  laborRateCents: z.number().int().positive(),
  taxRegion: z.string().min(2),
  currency: z.string().default('USD')
});

export const loginSchema = z.object({
  tenantId: z.string().uuid(),
  email: emailSchema,
  password: z.string().min(1)
});

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  notes: z.string().optional()
});

export type TenantSignupInput = z.infer<typeof tenantSignupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
