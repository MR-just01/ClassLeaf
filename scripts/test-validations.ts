import { usernameSchema, signUpSchema, notebookCreateSchema } from '../src/lib/validations/auth';
import { RESERVED_USERNAMES } from '../src/lib/constants/auth';
import { validateImageFile, uploadMetadataSchema } from '../src/lib/validations/upload';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_UPLOAD,
  MAX_JOBS_PER_HOUR,
  MAX_UPLOADS_PER_DAY,
} from '../src/lib/constants/upload';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- Running Phase 1 Validation Automated Tests ---\n');

// 1. Valid Usernames
console.log('Testing Valid Usernames:');
const validUsernames = ['alice', 'bob-123', 'student-99', 'math-pro', 'cs50'];
for (const u of validUsernames) {
  const result = usernameSchema.safeParse(u);
  assert(result.success, `Accept valid username: "${u}"`);
}

// 2. Invalid Usernames (Length & Format)
console.log('\nTesting Invalid Usernames:');
const invalidUsernames = [
  { val: 'ab', reason: 'Too short (< 3)' },
  { val: 'a-very-long-username-that-exceeds-twenty-chars', reason: 'Too long (> 20)' },
  { val: '-leading-hyphen', reason: 'Starts with hyphen' },
  { val: 'trailing-hyphen-', reason: 'Ends with hyphen' },
  { val: 'has_underscore', reason: 'Contains underscore' },
  { val: 'has.dot', reason: 'Contains dot' },
  { val: 'has spaces', reason: 'Contains spaces' },
  { val: 'UPPERCASE', reason: 'Contains uppercase characters' },
  { val: 'double--hyphen', reason: 'Contains consecutive hyphens' },
];

for (const { val, reason } of invalidUsernames) {
  const result = usernameSchema.safeParse(val);
  assert(!result.success, `Reject invalid username "${val}" (${reason})`);
}

// 3. Reserved Usernames
console.log('\nTesting Reserved Usernames:');
const reservedToTest = ['admin', 'api', 'login', 'signup', 'logout', 'settings', 'about', 'dashboard', 'new', 'auth', '_next'];
for (const r of reservedToTest) {
  const result = usernameSchema.safeParse(r);
  assert(!result.success, `Reject reserved username: "${r}"`);
}

// 4. SignUp Schema
console.log('\nTesting SignUp Schema:');
const validSignUp = signUpSchema.safeParse({
  email: 'student@university.edu',
  password: 'secure-password-123',
  username: 'student-notes',
});
assert(validSignUp.success, 'Valid signup payload passes');

const invalidEmail = signUpSchema.safeParse({
  email: 'not-an-email',
  password: 'secure-password-123',
  username: 'student-notes',
});
assert(!invalidEmail.success, 'Invalid email rejected');

const shortPassword = signUpSchema.safeParse({
  email: 'student@university.edu',
  password: 'short',
  username: 'student-notes',
});
assert(!shortPassword.success, 'Short password (<8 chars) rejected');

// 5. Notebook Creation Schema
console.log('\nTesting Notebook Creation Schema:');
const validNotebook = notebookCreateSchema.safeParse({
  title: 'Database Management Systems',
  slug: 'dbms-notes',
  description: 'Lectures 1 through 12 notes',
});
assert(validNotebook.success, 'Valid notebook payload passes');

const invalidSlug = notebookCreateSchema.safeParse({
  title: 'Database Management Systems',
  slug: 'dbms notes with spaces!',
});
assert(!invalidSlug.success, 'Invalid notebook slug rejected');

// 6. Phase 2: Upload Metadata Schema
console.log('\n--- Running Phase 2 Upload Automated Tests ---\n');
console.log('Testing Upload Metadata Schema:');
const validUploadMetadata = uploadMetadataSchema.safeParse({
  notebookId: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Lecture 1: Intro to Chemistry',
});
assert(validUploadMetadata.success, 'Valid upload metadata passes');

const invalidUUID = uploadMetadataSchema.safeParse({
  notebookId: 'not-a-valid-uuid',
  title: 'Lecture 1: Intro to Chemistry',
});
assert(!invalidUUID.success, 'Invalid notebook UUID rejected');

const emptyTitle = uploadMetadataSchema.safeParse({
  notebookId: '123e4567-e89b-12d3-a456-426614174000',
  title: '',
});
assert(!emptyTitle.success, 'Empty note title rejected');

// 7. Phase 2: Image File Validation
console.log('\nTesting Image File Validation:');

// Mock File for Node environment
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return Object.assign(blob, {
    name,
    lastModified: Date.now(),
  }) as unknown as File;
}

const validJpeg = createMockFile('notes.jpg', 2 * 1024 * 1024, 'image/jpeg');
assert(validateImageFile(validJpeg).valid, 'Valid JPEG within 10MB passes');

const validPng = createMockFile('diagram.png', 5 * 1024 * 1024, 'image/png');
assert(validateImageFile(validPng).valid, 'Valid PNG within 10MB passes');

const validWebp = createMockFile('scan.webp', 1 * 1024 * 1024, 'image/webp');
assert(validateImageFile(validWebp).valid, 'Valid WebP within 10MB passes');

const validHeic = createMockFile('photo.heic', 3 * 1024 * 1024, 'image/heic');
assert(validateImageFile(validHeic).valid, 'Valid HEIC within 10MB passes');

const oversizedFile = createMockFile('giant_raw.jpg', 12 * 1024 * 1024, 'image/jpeg');
const oversizedRes = validateImageFile(oversizedFile);
assert(!oversizedRes.valid && Boolean(oversizedRes.error?.includes('10 MB')), 'Oversized file (>10MB) rejected');

const disallowedFormat = createMockFile('script.pdf', 500 * 1024, 'application/pdf');
const disallowedRes = validateImageFile(disallowedFormat);
assert(!disallowedRes.valid && Boolean(disallowedRes.error?.includes('unsupported format')), 'Disallowed format (.pdf) rejected');

// 8. Phase 2: Constants Verification
console.log('\nTesting Phase 2 Constants:');
assert(MAX_FILE_SIZE_BYTES === 10 * 1024 * 1024, 'MAX_FILE_SIZE_BYTES is 10 MB');
assert(MAX_IMAGES_PER_UPLOAD === 10, 'MAX_IMAGES_PER_UPLOAD is 10');
assert(MAX_JOBS_PER_HOUR === 20, 'MAX_JOBS_PER_HOUR is 20');
assert(MAX_UPLOADS_PER_DAY === 50, 'MAX_UPLOADS_PER_DAY is 50');

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
