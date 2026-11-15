'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  initialMode?: 'signup' | 'login';
}

export function AuthForm({ initialMode = 'signup' }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');

  // Live username validation states
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [usernameErrorMsg, setUsernameErrorMsg] = useState('');

  // Form submission state
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Debounced live username check
  useEffect(() => {
    if (mode !== 'signup') return;

    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameErrorMsg('');
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus('invalid');
      setUsernameErrorMsg('At least 3 characters required');
      return;
    }
    if (trimmed.length > 20) {
      setUsernameStatus('invalid');
      setUsernameErrorMsg('Maximum 20 characters allowed');
      return;
    }
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      setUsernameStatus('invalid');
      setUsernameErrorMsg('Cannot start or end with a hyphen');
      return;
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameErrorMsg('Lowercase letters, numbers, and hyphens only');
      return;
    }

    setUsernameStatus('checking');
    setUsernameErrorMsg('');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmed }),
        });
        const data = await res.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameErrorMsg('');
        } else {
          setUsernameStatus('taken');
          setUsernameErrorMsg(data.reason || 'Username is not available');
        }
      } catch {
        setUsernameStatus('invalid');
        setUsernameErrorMsg('Error checking username availability');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (mode === 'signup' && usernameStatus !== 'available') {
      setFormError('Please select a valid and available username.');
      return;
    }

    startTransition(async () => {
      try {
        const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
        const payload =
          mode === 'signup'
            ? { email, password, username: username.trim().toLowerCase() }
            : { email, password };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setFormError(data.error || 'Authentication failed. Please check your credentials.');
          return;
        }

        if (mode === 'signup') {
          setFormSuccess('Account created! Taking you to your dashboard...');
        } else {
          setFormSuccess('Signed in successfully! Redirecting...');
        }

        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 800);
      } catch (err: unknown) {
        setFormError('A network error occurred. Please check your connection.');
        console.error(err);
      }
    });
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-4">
      <div className="w-full bg-[var(--surface)] rounded-xl shadow-xs border border-[var(--border-rule)] p-6 flex flex-col gap-5">
        {/* Segmented Mode Control */}
        <div
          className="w-full bg-[var(--surface-container)] p-1 rounded-lg flex items-center justify-between"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => {
              setMode('signup');
              setFormError(null);
              setFormSuccess(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 text-center cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--primary-container)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login');
              setFormError(null);
              setFormSuccess(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 text-center cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--primary-container)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Log in
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center gap-1.5 text-[var(--primary)] mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--primary)]">
              ClassLeaf
            </span>
          </div>
          <h1 className="font-serif text-[22px] font-semibold text-[var(--text-primary)] leading-tight">
            {mode === 'signup'
              ? 'Create your student notebook'
              : 'Welcome back to your notebook'}
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            {mode === 'signup'
              ? 'A distraction-free, quiet space for scholar notes and lectures.'
              : 'Sign in to access your drafts and published class notebooks.'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {formError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] text-[13px]">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--status-published-bg)] text-[var(--status-published-text)] text-[13px] border border-[var(--status-published-border)]">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[var(--text-primary)]" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[42px] px-3 bg-[var(--surface)] rounded-lg border border-[var(--border-rule)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)] focus:border-[var(--primary-container)]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[var(--text-primary)]" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[42px] px-3 pr-10 bg-[var(--surface)] rounded-lg border border-[var(--border-rule)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)] focus:border-[var(--primary-container)]"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Username Field (Sign up only) */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[var(--text-primary)]" htmlFor="username">
                  Notebook handle
                </label>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Public alias</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[14px] text-[var(--text-secondary)] select-none pointer-events-none">
                  @
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="alice"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full h-[42px] pl-7 pr-3 bg-[var(--surface)] rounded-lg border border-[var(--border-rule)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)] focus:border-[var(--primary-container)]"
                />
              </div>

              {/* URL Preview & Status */}
              <div className="p-2.5 rounded-lg bg-[var(--surface-container-low)] border border-[var(--border-rule)] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[var(--primary)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="text-[13px] font-medium font-sans">
                      classleaf.com/{username ? username : 'username'}
                    </span>
                  </div>

                  {usernameStatus === 'checking' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-[var(--surface-container)] text-[var(--text-secondary)]">
                      Checking...
                    </span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-[var(--status-published-bg)] text-[var(--status-published-text)] border border-[var(--status-published-border)]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Available
                    </span>
                  )}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-[var(--error-container)] text-[var(--on-error-container)]">
                      {usernameStatus === 'taken' ? 'Taken' : 'Invalid'}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {usernameErrorMsg
                    ? usernameErrorMsg
                    : 'Lowercase letters, numbers, and hyphens (3-20 chars). Cannot start/end with hyphen. Permanent URL.'}
                </p>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isPending || (mode === 'signup' && usernameStatus !== 'available')}
            className="w-full h-11 rounded-[10px] bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[15px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create account' : 'Log in'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Scholar Guarantee Card */}
          <div className="rounded-lg p-2.5 bg-[var(--secondary-container)]/40 border border-[var(--border-rule)] flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[var(--text-secondary)] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-[var(--on-secondary-container)]">
                Scholarly privacy guarantee
              </span>
              <p className="font-serif text-[12px] leading-[17px] text-[var(--text-secondary)]">
                No behavioral trackers, no telemetry ads, and zero notification spam.
              </p>
            </div>
          </div>
        </form>

        {/* Footnote */}
        <div className="text-center">
          <p className="font-serif text-[12px] leading-tight text-[var(--text-secondary)]">
            By signing up, you agree to our quiet pledge: no data selling, no notification spam.
          </p>
        </div>
      </div>
    </div>
  );
}
