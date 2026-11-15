import { AuthForm } from '@/components/auth/AuthForm';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up — ClassLeaf',
  description: 'Create your permanent student notebook handle on ClassLeaf.',
};

export default function SignUpPage() {
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
              <span>Quiet Study Platform</span>
            </div>

            <h2 className="font-serif text-[38px] font-semibold leading-[1.2] text-[var(--text-primary)] tracking-tight">
              A distraction-free, archival space for lecture notes.
            </h2>

            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed">
              Create your permanent handle. Photograph lecture notes, let AI extract clean text while flagging uncertainties, and share with your classmates without logins.
            </p>

            <div className="flex flex-col gap-3.5 pt-2 text-[14px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Permanent, globally unique username URL</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Uncertain words flagged instead of guessed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Classmates open and read without signing up</span>
              </div>
            </div>
          </div>

          {/* Right Column (Form Card) */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <AuthForm initialMode="signup" />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-[12px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}
