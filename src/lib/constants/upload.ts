export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
] as const;

// 10 MB per image
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Max 10 images per upload submission
export const MAX_IMAGES_PER_UPLOAD = 10;

// Abuse limits per user
export const MAX_JOBS_PER_HOUR = 20;
export const MAX_UPLOADS_PER_DAY = 50;

// Pipeline stage definitions
export const STAGE_LABELS: Record<string, string> = {
  queued: 'Queued for processing',
  preparing_photo: 'Preparing photo',
  reading_handwriting: 'Reading handwriting',
  cleaning_text: 'Cleaning text',
  checking_mistakes: 'Checking for mistakes',
  draft_ready: 'Draft note ready',
  failed: 'Processing failed',
};

export const STAGES_ORDER = [
  'preparing_photo',
  'reading_handwriting',
  'cleaning_text',
  'checking_mistakes',
] as const;
