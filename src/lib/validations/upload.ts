import { z } from 'zod';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_UPLOAD,
} from '@/lib/constants/upload';

export const uploadMetadataSchema = z.object({
  notebookId: z.string().uuid('Invalid notebook ID'),
  title: z
    .string()
    .min(1, 'Note title is required')
    .max(150, 'Note title is too long'),
});

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    // Check extension as fallback for HEIC on some operating systems
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(ext)) {
      return {
        valid: false,
        error: `File "${file.name}" has unsupported format. Allowed formats: JPEG, PNG, WEBP, HEIC.`,
      };
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum allowed size of 10 MB.`,
    };
  }

  return { valid: true };
}
