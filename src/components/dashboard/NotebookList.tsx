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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-rule)]">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-tight">
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
          className="h-10 px-5 bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
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
        <div className="mt-4 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-[var(--surface-container-low)] border border-[var(--border-rule)] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[var(--secondary-container)] flex items-center justify-center text-[var(--primary)] shadow-xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 max-w-md">
              <h3 className="font-serif font-semibold text-[20px] text-[var(--text-primary)]">
                Create your first notebook to begin publishing
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Organize lecture transcripts, handwritten annotations, and syllabus guides in one archival volume for your classmates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-5 py-2.5 bg-[var(--surface)] hover:bg-[var(--surface-container)] text-[var(--text-primary)] border border-[var(--border-rule)] rounded-xl text-[14px] font-medium transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create first notebook</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((nb) => {
            const noteCount = nb.notes?.[0]?.count ?? 0;
            return (
              <div
                key={nb.id}
                className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border-rule)] shadow-xs flex flex-col justify-between gap-5 transition-all hover:border-[var(--outline)] hover:shadow-sm"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] shrink-0">
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
                        <h2 className="font-serif font-semibold text-[18px] text-[var(--text-primary)] leading-snug truncate">
                          {nb.title}
                        </h2>
                        <span className="text-[12px] font-mono text-[var(--text-secondary)] truncate">
                          /{nb.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {nb.description && (
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {nb.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-rule)]">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-container)] text-[var(--text-secondary)] font-medium">
                      {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <span>
                      {new Date(nb.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions matching DesignSystem */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/${nb.slug}`}
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--surface-container)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Open</span>
                    </Link>

                    <Link
                      href={`/dashboard/${nb.slug}/upload`}
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white font-medium text-[13px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Upload note</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateNotebookModal
        username={username}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refreshNotebooks}
      />
    </div>
  );
}
