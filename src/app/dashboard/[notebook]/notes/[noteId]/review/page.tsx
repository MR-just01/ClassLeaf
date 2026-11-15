import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

interface ReviewPageProps {
  params: Promise<{ notebook: string; noteId: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps) {
  const { notebook, noteId } = await params;
  return {
    title: `Review Note ${noteId.substring(0, 8)} — ${notebook} — ClassLeaf`,
  };
}

export default async function NoteReviewPage({ params }: ReviewPageProps) {
  const { notebook: notebookSlug, noteId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch notebook and verify ownership
  const { data: notebook, error: nbError } = await supabase
    .from('notebooks')
    .select('id, slug, title')
    .eq('slug', notebookSlug)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (nbError || !notebook) {
    notFound();
  }

  // Fetch note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('notebook_id', notebook.id)
    .maybeSingle();

  if (noteError || !note) {
    notFound();
  }

  // Fetch note images
  const { data: images } = await supabase
    .from('images')
    .select('*')
    .eq('note_id', note.id)
    .order('order_index', { ascending: true });

  const flagsList = Array.isArray(note.flags) ? note.flags : [];

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
              Dashboard
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
              Review
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
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex-1 flex flex-col gap-6">
        {/* Phase 4 Callout Notice */}
        <div className="bg-[var(--surface-container-low)] border border-[var(--primary)]/30 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center text-white shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-serif font-semibold text-[17px] text-[var(--text-primary)]">
                Review & Editing Workspace (Phase 4 Preview)
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                The manuscript photos were successfully uploaded, processed by the stub pipeline,
                and saved as a draft note. Full side-by-side word confidence inspection and one-click
                publishing will be enabled in Phase 4.
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/${notebook.slug}`}
            className="shrink-0 h-10 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-container)] text-[var(--text-primary)] border border-[var(--border-rule)] text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            ← Back to notebook
          </Link>
        </div>

        {/* Note Metadata Banner */}
        <div className="bg-[var(--surface)] border border-[var(--border-rule)] rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                  note.status === 'draft'
                    ? 'bg-[var(--status-draft-bg)] text-[var(--status-draft-text)] border border-[var(--border-rule)]'
                    : 'bg-[var(--status-published-bg)] text-[var(--status-published-text)] border border-[var(--status-published-border)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    note.status === 'draft'
                      ? 'bg-[var(--status-draft-text)]'
                      : 'bg-[var(--status-published-text)]'
                  }`}
                ></span>
                {note.status === 'draft' ? 'Draft Note' : 'Published'}
              </span>

              <span className="text-[12px] text-[var(--text-secondary)]">
                Created {new Date(note.created_at).toLocaleString()}
              </span>
            </div>

            <div className="text-[12px] font-mono text-[var(--text-secondary)]">
              {images?.length || 0} manuscript pages attached
            </div>
          </div>

          <h1 className="font-serif text-[24px] sm:text-[30px] font-semibold text-[var(--text-primary)] leading-tight">
            {note.title}
          </h1>

          {/* Manuscript Images Strip */}
          {images && images.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-rule)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Source Manuscript Pages ({images.length})
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="shrink-0 w-24 h-32 rounded-xl bg-[var(--surface-container-low)] border border-[var(--border-rule)] p-1.5 flex flex-col justify-between text-center"
                  >
                    <div className="w-full h-20 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--text-secondary)] text-[11px]">
                      <svg className="w-6 h-6 text-[var(--outline)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      Page {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flagged Tokens Strip */}
          {flagsList.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-rule)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-flagged-text)]">
                Flagged Words ({flagsList.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {flagsList.map((flag: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--status-flagged-bg)] text-[var(--status-flagged-text)] text-[12px] font-mono border border-[var(--status-flagged-border)]"
                  >
                    <span>{flag.word || flag}</span>
                    {flag.confidence && (
                      <span className="text-[10px] opacity-75">
                        ({Math.round(flag.confidence * 100)}%)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Note Content Preview */}
        <div className="bg-[var(--surface)] border border-[var(--border-rule)] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-rule)]">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Transcribed Manuscript Draft
            </span>
            <span className="text-[11px] font-mono text-[var(--primary)] bg-[var(--surface-container)] px-2.5 py-0.5 rounded-full">
              Markdown
            </span>
          </div>

          <div className="prose max-w-none text-[var(--text-primary)] font-serif whitespace-pre-wrap leading-relaxed">
            {note.content || '(No transcription text generated yet)'}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-rule)] bg-[var(--surface)] py-6 text-center text-[12px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}