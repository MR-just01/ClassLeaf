import { z } from 'zod';
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  USERNAME_REGEX,
  RESERVED_USERNAMES,
} from '@/lib/constants/auth';

export const usernameSchema = z
  .string()
  .min(
    MIN_USERNAME_LENGTH,
    `Username must be at least ${MIN_USERNAME_LENGTH} characters long`
  )
  .max(
    MAX_USERNAME_LENGTH,
    `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`
  )
  .refine(
    (val) => val === val.toLowerCase(),
    'Username must contain only lowercase letters'
  )
  .refine(
    (val) => !val.startsWith('-') && !val.endsWith('-'),
    'Username cannot start or end with a hyphen'
  )
  .refine(
    (val) => USERNAME_REGEX.test(val),
    'Username may only contain lowercase letters, numbers, and hyphens (no consecutive hyphens)'
  )
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val as typeof RESERVED_USERNAMES[number]),
    'This username is reserved and cannot be claimed'
  );

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  username: usernameSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const notebookCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug cannot exceed 60 characters')
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NotebookCreateInput = z.infer<typeof notebookCreateSchema>;
