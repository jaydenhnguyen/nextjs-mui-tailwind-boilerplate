import { z } from 'zod';

// An empty value in .env (like `NEXT_PUBLIC_API_URL=`) counts as "not set", so defaults still kick in.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema);

const envSchema = z.object({
  APP_KEY: optional(
    z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and dashes only')
      .default('app'),
  ),
  SITE_URL: optional(z.url().default('http://localhost:3000')),
  API_URL: optional(z.url().default('http://localhost:3001/api/v1')),
  ACCESS_TOKEN_TTL: optional(z.coerce.number().int().positive().default(3600)),
  REFRESH_TOKEN_TTL: optional(z.coerce.number().int().positive().default(604800)),
  API_MOCKING: optional(z.enum(['enabled', 'disabled']).default('disabled')).transform((value) => value === 'enabled'),
});

// Next.js only inlines NEXT_PUBLIC_* values when they're written out in full like this,
// so don't swap this for a loop over process.env.
const result = envSchema.safeParse({
  APP_KEY: process.env.NEXT_PUBLIC_APP_KEY,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  ACCESS_TOKEN_TTL: process.env.NEXT_PUBLIC_ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL: process.env.NEXT_PUBLIC_REFRESH_TOKEN_TTL,
  API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
});

if (!result.success) {
  throw new Error(`Invalid environment variables, check your .env file:\n${z.prettifyError(result.error)}`);
}

export const env = result.data;
