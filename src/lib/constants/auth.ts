export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;

export const USERNAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'api',
  'login',
  'signup',
  'signin',
  'signout',
  'logout',
  'settings',
  'about',
  'dashboard',
  'new',
  'app',
  'auth',
  '_next',
  'help',
  'support',
  'terms',
  'privacy',
  'legal',
  'static',
  'public',
  'favicon',
  'classleaf',
  'notes',
  'notebook',
  'notebooks',
  'upload',
  'review',
  'publish',
] as const;
