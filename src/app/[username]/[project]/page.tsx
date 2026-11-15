import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    username: string;
    project: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username, project } = await params;
  return {
    title: `${project} by @${username} — ClassLeaf`,
    description: `Public shared notebook for ${project} by @${username}.`,
  };
}

export default async function PublicNotebookPage({ params }: PageProps) {
  const { username, project } = await params;
  const supabase = await createClient();

  // 1. Verify that the user profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // 2. Verify that the notebook exists for this user
  const { data: notebook } = await supabase
    .from('notebooks')
    .select('*')
    .eq('owner_id', profile.id)
    .eq('slug', project.toLowerCase())
    .maybeSingle();

  if (!notebook) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[var(--border-rule)] bg-[var(--surface)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            <span className="text-[13px] font-mono text-[var(--text-secondary)]">@{username}</span>
            <span className="text-[var(--outline-variant)] select-none">/</span>
            <span className="text-[13px] font-mono font-medium text-[var(--text-primary)]">{project}</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-rule)] bg-[var(--surface)] hover:bg-[var(--surface-container)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <div className="bg-[var(--surface)] border border-[var(--border-rule)] rounded-xl p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-[var(--surface-container-low)] text-[var(--primary)]">
                Class Notebook
              </span>
              <span className="text-[12px] text-[var(--text-secondary)]">
                By @{username}
              </span>
            </div>
            <h1 className="font-serif text-[30px] font-semibold text-[var(--text-primary)] leading-tight">
              {notebook.title}
            </h1>
            {notebook.description && (
              <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {notebook.description}
              </p>
            )}
          </div>

          <div className="p-6 rounded-lg bg-[var(--surface-container-low)] border border-[var(--border-rule)] text-center flex flex-col items-center gap-2">
            <p className="font-serif text-[16px] text-[var(--text-primary)]">
              Notebook established
            </p>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-md">
              Published handwritten notes and verified transcriptions for this class will appear here once published in upcoming phases.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-rule)] bg-[var(--surface)] py-4 text-center text-[12px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}
