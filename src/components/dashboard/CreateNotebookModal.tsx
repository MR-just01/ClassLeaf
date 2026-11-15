'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface CreateNotebookModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateNotebookModal({
  username,
  isOpen,
  onClose,
  onCreated,
}: CreateNotebookModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-slugify title if slug wasn't manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSlug = slug.replace(/^-+|-+$/g, '');
    if (!cleanSlug || cleanSlug.length < 2) {
      setError('Please provide a valid slug (at least 2 characters).');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/notebooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            slug: cleanSlug,
            description: description.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to create notebook');
          return;
        }

        setTitle('');
        setSlug('');
        setDescription('');
        setSlugManuallyEdited(false);
        onClose();
        if (onCreated) onCreated();
        router.refresh();
      } catch (err: unknown) {
        console.error(err);
        setError('Network error. Failed to create notebook.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border-rule)] rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-serif font-semibold text-[18px] leading-tight">Create a notebook</h2>
              <p className="text-[12px] text-[var(--text-secondary)]">Set up your scholarly repository</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] text-[13px]">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[var(--text-primary)]" htmlFor="notebook-title">
              Notebook Title
            </label>
            <input
              id="notebook-title"
              type="text"
              required
              placeholder="e.g. DBMS Class Notes"
              value={title}
              onChange={handleTitleChange}
              className="w-full h-10 px-3 bg-[var(--surface-container-low)] rounded-lg border border-[var(--border-rule)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)]"
            />
          </div>

          {/* URL Slug */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[var(--text-primary)]" htmlFor="notebook-slug">
              Notebook URL slug
            </label>
            <div className="flex items-center bg-[var(--surface-container-low)] border border-[var(--border-rule)] px-3 rounded-lg h-10">
              <span className="text-[12px] text-[var(--text-secondary)] font-mono truncate max-w-[150px]">
                classleaf.com/{username}/
              </span>
              <input
                id="notebook-slug"
                type="text"
                required
                placeholder="dbms-class-notes"
                value={slug}
                onChange={handleSlugChange}
                className="w-full bg-transparent text-[14px] font-mono text-[var(--primary)] focus:outline-none pl-1"
              />
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              This creates the permanent link classmates will use.
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[var(--text-primary)]" htmlFor="notebook-desc">
              Description <span className="text-[11px] text-[var(--text-secondary)] font-normal">(Optional)</span>
            </label>
            <textarea
              id="notebook-desc"
              rows={3}
              placeholder="Key concepts, professor remarks, semester syllabus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-[var(--surface-container-low)] rounded-lg border border-[var(--border-rule)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-rule)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-4 rounded-lg bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title || !slug}
              className="h-10 px-4 rounded-lg bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-medium transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? 'Creating...' : 'Create notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
