import { AuthForm } from '@/components/auth/AuthForm';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

export const metadata = {
  title: 'Log In — ClassLeaf',
  description: 'Log in to your ClassLeaf notebooks.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[var(--canvas)] text-[var(--text-primary)]">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 text-[var(--primary)] hover:opacity-90">
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
          <span className="font-serif font-semibold text-[19px] tracking-tight text-[var(--text-primary)]">
            ClassLeaf
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Desktop Left Editorial Column */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-6 pr-4">
            <div className="inline-flex items-center gap-2 self-start bg-[var(--secondary-container)]/60 text-[var(--on-secondary-container)] px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
              <span>Scholar Repository</span>
            </div>

            <h2 className="font-serif text-[38px] font-semibold leading-[1.2] text-[var(--text-primary)] tracking-tight">
              Welcome back to your class notebooks.
            </h2>

            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed">
              Continue uploading lectures, reviewing AI transcription flags, and updating your public notebook collections.
            </p>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-rule)] flex items-start gap-3 shadow-xs">
              <svg className="w-5 h-5 text-[var(--primary)] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex flex-col gap-0.5 text-[13px]">
                <span className="font-semibold text-[var(--text-primary)]">Need your notes on the go?</span>
                <span className="text-[var(--text-secondary)]">Your published notebooks are cached and optimized for mobile phones and campus Wi-Fi.</span>
              </div>
            </div>
          </div>

          {/* Right Column (Form Card) */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <AuthForm initialMode="login" />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-[12px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}
