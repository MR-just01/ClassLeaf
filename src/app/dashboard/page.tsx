import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NotebookList } from '@/components/dashboard/NotebookList';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard — ClassLeaf',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Crucial: Use getUser() instead of getSession() for server-side authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile for username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, created_at')
    .eq('id', user.id)
    .maybeSingle();

  const username =
    profile?.username || user.user_metadata?.username || 'scholar';

  // Fetch owner's notebooks
  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('*, notes(count)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[var(--border-rule)] bg-[var(--surface)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[var(--primary)] hover:opacity-90">
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
              <span className="font-serif font-semibold text-[18px] tracking-tight text-[var(--text-primary)]">
                ClassLeaf
              </span>
            </Link>
            <span className="text-[var(--outline-variant)] select-none">/</span>
            <span className="text-[13px] font-mono font-medium text-[var(--text-secondary)]">
              @{username}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Sign Out Form */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-rule)] bg-[var(--surface)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Owner Profile Banner */}
        <div className="mb-6 flex items-center justify-between bg-[var(--surface)] border border-[var(--border-rule)] px-4 py-3 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--secondary-container)] flex items-center justify-center text-[var(--primary)] font-medium text-[14px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">
                @{username}
              </span>
              <span className="text-[12px] text-[var(--text-secondary)]">
                {user.email}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--status-published-bg)] text-[var(--status-published-text)] text-[11px] font-semibold border border-[var(--status-published-border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-published-text)]"></span>
            Notebook Owner
          </span>
        </div>

        {/* Notebooks List */}
        <NotebookList username={username} initialNotebooks={notebooks || []} />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-rule)] bg-[var(--surface)] py-4 text-center text-[12px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}
