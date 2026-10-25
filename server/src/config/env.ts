import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root workspace if available
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // fallback to current dir .env

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional().default(''),
  Gemini_api_key: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('200').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

const rawEnv = parsed.data;
// Resolve Gemini key from either casing
const resolvedGeminiKey = (rawEnv.GEMINI_API_KEY || rawEnv.Gemini_api_key || '').trim();

export const ENV = {
  PORT: rawEnv.PORT,
  NODE_ENV: rawEnv.NODE_ENV,
  CLIENT_URL: rawEnv.CLIENT_URL,
  GEMINI_API_KEY: resolvedGeminiKey,
  GEMINI_MODEL: rawEnv.GEMINI_MODEL,
  IS_MOCK_GEMINI: resolvedGeminiKey.length === 0,
  RATE_LIMIT_WINDOW_MS: rawEnv.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: rawEnv.RATE_LIMIT_MAX_REQUESTS,
};
