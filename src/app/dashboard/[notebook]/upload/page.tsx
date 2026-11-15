import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { UploadManuscript } from '@/components/upload/UploadManuscript';
import Link from 'next/link';

interface UploadPageProps {
  params: Promise<{ notebook: string }>;
}

export async function generateMetadata({ params }: UploadPageProps) {
  const { notebook: slug } = await params;
  return {
    title: `Upload Manuscript — ${slug} — ClassLeaf`,
  };
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { notebook: notebookSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify notebook ownership
  const { data: notebook, error } = await supabase
    .from('notebooks')
    .select('id, slug, title')
    .eq('slug', notebookSlug)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error || !notebook) {
    notFound();
  }

  // Fetch username for header breadcrumbs
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();

  const username =
    profile?.username || user.user_metadata?.username || 'scholar';

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[var(--border-rule)] bg-[var(--surface)] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[var(--primary)] hover:opacity-90"
            >
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
            <span className="text-[var(--outline-variant)] select-none">/</span>
            <Link
              href="/dashboard"
              className="text-[13px] font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              @{username}
            </Link>
            <span className="text-[var(--outline-variant)] select-none">/</span>
            <Link
              href={`/dashboard/${notebook.slug}`}
              className="text-[13px] font-mono font-semibold text-[var(--primary)] hover:underline truncate max-w-[150px]"
            >
              {notebook.slug}
            </Link>
            <span className="text-[var(--outline-variant)] select-none">/</span>
            <span className="text-[12px] font-mono text-[var(--text-secondary)] uppercase">
              Upload
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Sign Out Form */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3.5 py-1.5 rounded-lg border border-[var(--border-rule)] bg-[var(--surface)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex-1 flex flex-col gap-8">
        <UploadManuscript
          notebookId={notebook.id}
          notebookSlug={notebook.slug}
          notebookTitle={notebook.title}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-rule)] bg-[var(--surface)] py-6 text-center text-[12px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}