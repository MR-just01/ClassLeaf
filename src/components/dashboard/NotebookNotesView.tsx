'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface NoteItem {
  id: string;
  notebook_id: string;
  title: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  content: string | null;
  flags: unknown;
  images?: { count: number }[];
}

export interface NotebookDetails {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface NotebookNotesViewProps {
  notebook: NotebookDetails;
  username: string;
  initialNotes: NoteItem[];
}

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function NotebookNotesView({
  notebook,
  username,
  initialNotes,
}: NotebookNotesViewProps) {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [deletingNote, setDeletingNote] = useState<NoteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const publishedCount = notes.filter((n) => n.status === 'published').length;
  const draftCount = notes.filter((n) => n.status === 'draft').length;

  const handleDeleteDraft = async () => {
    if (!deletingNote) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/notes/${deletingNote.id}/delete`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete note');
      }

      // Remove deleted note from state
      setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
      setDeletingNote(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'An error occurred while deleting'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Context Breadcrumbs & Meta Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-rule)]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/dashboard"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              Dashboard
            </Link>
            <span className="text-[var(--outline-variant)]">/</span>
            <span className="text-[var(--primary)] font-semibold font-mono">
              {notebook.slug}
            </span>
          </div>

          <h1 className="font-serif text-[26px] sm:text-[32px] font-semibold text-[var(--text-primary)] tracking-tight">
            {notebook.title}
          </h1>

          {notebook.description && (
            <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {notebook.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href={`/${username}/${notebook.slug}`}
            className="h-10 px-4 rounded-xl border border-[var(--border-rule)] bg-[var(--surface)] hover:bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium flex items-center gap-2 transition-colors shadow-xs"
          >
            <svg
              className="w-4 h-4 text-[var(--text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            <span>Public page</span>
          </Link>

          <Link
            href={`/dashboard/${notebook.slug}/upload`}
            className="h-10 px-4 rounded-xl bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-medium flex items-center gap-2 transition-colors shadow-xs"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add notes</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="flex items-center gap-3 flex-wrap text-[12px]">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--status-published-bg)] text-[var(--status-published-text)] font-medium border border-[var(--status-published-border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-published-text)]"></span>
          {publishedCount} Published
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--status-draft-bg)] text-[var(--status-draft-text)] font-medium border border-[var(--border-rule)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-draft-text)]"></span>
          {draftCount} {draftCount === 1 ? 'Draft' : 'Drafts'}
        </span>

        <span className="text-[var(--text-secondary)] ml-auto font-mono text-[12px]">
          Public link: classleaf.com/{username}/{notebook.slug}
        </span>
      </div>

      {/* Empty State */}
      {notes.length === 0 ? (
        <div className="mt-4 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-[var(--surface-container-low)] border border-[var(--border-rule)] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[var(--secondary-container)] flex items-center justify-center text-[var(--primary)] shadow-xs">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 max-w-md">
              <h3 className="font-serif font-semibold text-[20px] text-[var(--text-primary)]">
                No notes in this notebook yet
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Take photographs of your handwritten lecture notes or upload manuscript scans.
                ClassLeaf will transcribe and format them into readable notes.
              </p>
            </div>
            <Link
              href={`/dashboard/${notebook.slug}/upload`}
              className="mt-2 px-5 py-2.5 bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-[14px] font-medium transition-colors shadow-xs flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add first note</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Notes Grid / Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => {
            const pageCount = note.images?.[0]?.count ?? 0;
            const isDraft = note.status === 'draft';

            return (
              <div
                key={note.id}
                className="bg-[var(--surface)] rounded-2xl p-5 sm:p-6 border border-[var(--border-rule)] shadow-xs flex flex-col justify-between gap-5 transition-all hover:border-[var(--outline)] hover:shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                        isDraft
                          ? 'bg-[var(--status-draft-bg)] text-[var(--status-draft-text)] border border-[var(--border-rule)]'
                          : 'bg-[var(--status-published-bg)] text-[var(--status-published-text)] border border-[var(--status-published-border)]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDraft
                            ? 'bg-[var(--status-draft-text)]'
                            : 'bg-[var(--status-published-text)]'
                        }`}
                      ></span>
                      {isDraft ? 'Draft' : 'Published'}
                    </span>

                    <span className="text-[12px] text-[var(--text-secondary)]">
                      Updated {formatRelativeTime(note.updated_at || note.created_at)}
                    </span>
                  </div>

                  <h3 className="font-serif font-semibold text-[19px] text-[var(--text-primary)] leading-snug line-clamp-2">
                    {note.title}
                  </h3>

                  {note.content && (
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {note.content.replace(/^#+\s/g, '').substring(0, 140)}...
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-rule)]">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[var(--outline)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </span>

                    <span className="text-[11px] font-mono text-[var(--outline)]">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/${notebook.slug}/notes/${note.id}/review`}
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      <span>{isDraft ? 'Review & publish' : 'Edit note'}</span>
                    </Link>

                    {isDraft && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingNote(note);
                          setDeleteError(null);
                        }}
                        title="Delete draft note"
                        className="h-9 w-9 rounded-lg border border-[var(--border-rule)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--error)] hover:border-[var(--error)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--surface)] border border-[var(--border-rule)] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[var(--error)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--error-container)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--on-error-container)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="font-serif font-semibold text-[20px] text-[var(--text-primary)]">
                Delete draft note?
              </h3>
            </div>

            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-[var(--text-primary)] font-semibold">
                &ldquo;{deletingNote.title}&rdquo;
              </strong>
              ? All manuscript photo uploads associated with this draft will be permanently deleted
              from private storage. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] text-[13px]">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeletingNote(null);
                  setDeleteError(null);
                }}
                className="h-10 px-4 rounded-xl border border-[var(--border-rule)] bg-[var(--surface)] hover:bg-[var(--surface-container)] text-[var(--text-primary)] text-[14px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteDraft}
                className="h-10 px-4 rounded-xl bg-[var(--error)] hover:opacity-90 text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete draft note</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}