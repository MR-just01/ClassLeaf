import { usernameSchema, signUpSchema, notebookCreateSchema } from '../src/lib/validations/auth';
import { RESERVED_USERNAMES } from '../src/lib/constants/auth';

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

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
