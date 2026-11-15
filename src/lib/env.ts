import { z } from 'zod';

const envSchema = z.object({
  // Supabase public / server variables (supports both standard Next.js prefix and direct names)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .optional(),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').optional(),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required').optional(),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required').optional(),

  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Groq configuration (server-only)
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_VISION_MODEL: z.string().default('llama-3.2-11b-vision-preview'),
  GROQ_TEXT_MODEL: z.string().default('llama-3.3-70b-versatile'),

  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function getEnv(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  supabaseJwtSecret?: string;
  groqApiKey?: string;
  groqVisionModel: string;
  groqTextModel: string;
  siteUrl: string;
} {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder-project.supabase.co';

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'placeholder-anon-key';

  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqVisionModel =
    process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';
  const groqTextModel =
    process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    supabaseJwtSecret,
    groqApiKey,
    groqVisionModel,
    groqTextModel,
    siteUrl,
  };
}
