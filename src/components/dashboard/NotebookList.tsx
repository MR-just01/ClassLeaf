'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreateNotebookModal } from './CreateNotebookModal';

interface Notebook {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
  notes?: { count: number }[];
}

interface NotebookListProps {
  username: string;
  initialNotebooks: Notebook[];
}

export function NotebookList({ username, initialNotebooks }: NotebookListProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshNotebooks = async () => {
    try {
      const res = await fetch('/api/notebooks');
      if (res.ok) {
        const data = await res.json();
        if (data.notebooks) {
          setNotebooks(data.notebooks);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-[26px] font-semibold text-[var(--text-primary)] tracking-tight">
            Your notebooks
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Public collections accessible at{' '}
            <span className="font-mono text-[var(--primary)] font-medium">
              classleaf.com/{username}/[slug]
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New notebook</span>
        </button>
      </div>

      {/* Notebooks Grid or Empty State */}
      {notebooks.length === 0 ? (
        /* Tactile Empty State matching DesignSystem */
        <div className="mt-2 flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-1">
            Curated Notebook Repository
          </span>
          <div className="bg-[var(--surface-container-low)] border border-[var(--border-rule)] rounded-xl p-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary-container)] flex items-center justify-center text-[var(--primary)] shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1 max-w-[320px]">
              <h3 className="font-serif font-semibold text-[18px] text-[var(--text-primary)]">
                Create your first notebook to begin publishing
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Organize lecture transcripts, handwritten annotations, and syllabus guides in one archival volume.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-container)] text-[var(--text-primary)] border border-[var(--border-rule)] rounded-lg text-[13px] font-medium transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create notebook</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notebooks.map((nb) => {
            const noteCount = nb.notes?.[0]?.count ?? 0;
            return (
              <div
                key={nb.id}
                className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border-rule)] shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-[var(--outline)]"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h2 className="font-serif font-semibold text-[17px] text-[var(--text-primary)] leading-snug truncate">
                          {nb.title}
                        </h2>
                        <span className="text-[12px] font-mono text-[var(--text-secondary)] truncate">
                          classleaf.com/{username}/{nb.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {nb.description && (
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                      {nb.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border-rule)]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-container)] text-[var(--text-secondary)] text-[11px] font-semibold">
                      {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] ml-auto">
                      Created {new Date(nb.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${username}/${nb.slug}`}
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View public page</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal instance */}
      <CreateNotebookModal
        username={username}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refreshNotebooks}
      />
    </div>
  );
}
