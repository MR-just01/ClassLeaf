'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function LandingPage() {
  const [flagResolved, setFlagResolved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://classleaf.com/alice/phys-204');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="border-b border-[var(--border-rule)] bg-[var(--surface)] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[14px] font-medium text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex-1 flex flex-col gap-16 lg:gap-24">
        {/* Responsive Dual-Column Hero & Preview Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 self-start bg-[var(--secondary-container)]/60 text-[var(--on-secondary-container)] px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
              <svg className="w-3.5 h-3.5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Archival Notebook Engine</span>
            </div>

            <h1 className="font-serif text-[32px] sm:text-[42px] lg:text-[48px] font-semibold text-[var(--text-primary)] leading-[1.15] tracking-tight">
              Turn messy photos of class notes into clean, shareable notes.
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Snap your lecture notes or whiteboard sketches. ClassLeaf transcribes the handwriting, highlights unclear words, and gives you a single link your classmates will actually read.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="h-11 px-6 rounded-[10px] bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[15px] font-medium shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Get started free</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="text-[15px] font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--surface-container)]"
              >
                Sign in to your notebook →
              </Link>
            </div>

            {/* Quick feature tags on desktop */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-[13px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Zero login for readers
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Uncertain words flagged
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Permanent shareable URLs
              </span>
            </div>
          </div>

          {/* Right Column: Live Document Preview Card */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                Live Transcription Output
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--surface-container-high)] px-2.5 py-0.5 rounded-full">
                Editorial Mode
              </span>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border-rule)] rounded-2xl shadow-sm p-6 sm:p-7 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface-container-low)] text-[var(--primary)] tracking-wider uppercase">
                      LECTURE NOTE
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--status-published-bg)] text-[var(--status-published-text)] border border-[var(--status-published-border)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-published-text)]"></span>
                      Published
                    </span>
                  </div>
                  <h2 className="font-serif font-semibold text-[18px] sm:text-[20px] text-[var(--text-primary)] leading-snug">
                    PHYS 204: Quantum Decoherence & Wavepackets
                  </h2>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                    By @alice • Oct 14 • 4 min read
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy shareable link"
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)] rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <span className="text-[11px] font-medium text-[var(--primary)]">Copied!</span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Note text excerpt */}
              <p className="font-serif text-[15px] sm:text-[16px] text-[var(--text-primary)] leading-[1.75]">
                When a quantum superposition interacts with an unmeasured macroscopic environment, the relative phase relations disperse exponentially. This dampening converts pure state coherences into statistical mixtures without requiring instantaneous collapse.
              </p>

              {/* Interactive Token Element */}
              <div className="p-3.5 bg-[var(--surface-container-low)] border border-[var(--border-rule)] rounded-xl flex items-start gap-3">
                <svg className="w-4 h-4 text-[var(--status-flagged-text)] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--status-flagged-text)] uppercase tracking-wider">
                      Uncertain Word Flagged
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">92% AI Confidence</span>
                  </div>
                  <p className="text-[13px] text-[var(--text-primary)] mt-1">
                    Note excerpt: “entropy dissipation{' '}
                    <span className="bg-[var(--status-flagged-bg)] text-[var(--status-flagged-text)] px-1.5 py-0.5 rounded font-medium border-b border-[var(--status-flagged-border)]">
                      dispersion
                    </span>{' '}
                    rate”
                  </p>

                  {flagResolved ? (
                    <div className="text-[12px] font-medium text-[var(--status-published-text)] mt-2.5 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Verified by notebook author</span>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => setFlagResolved(true)}
                        className="px-3 py-1 text-[12px] font-medium bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-rule)] rounded-lg hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
                      >
                        Keep “dispersion”
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlagResolved(true)}
                        className="px-3 py-1 text-[12px] font-medium bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-rule)] rounded-lg hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
                      >
                        Edit word
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Archival Flow (Responsive Grid on Desktop) */}
        <section className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-1 max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              The Archival Flow
            </span>
            <h3 className="font-serif text-[26px] sm:text-[32px] font-semibold text-[var(--text-primary)]">
              Three quiet steps to clarity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[var(--surface)] border border-[var(--border-rule)] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] font-semibold text-[15px]">
                01
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-serif font-semibold text-[18px] text-[var(--text-primary)]">
                  Snap a photo
                </h4>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Capture handwriting from spiral notebooks, napkins, or chalkboards. Don&apos;t worry about skewed angles or dim library lighting.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--surface)] border border-[var(--border-rule)] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] font-semibold text-[15px]">
                02
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-serif font-semibold text-[18px] text-[var(--text-primary)]">
                  Clean & flag
                </h4>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Our server-side AI pipeline extracts the text and structures markdown without silently rewriting words. Low-confidence handwriting is flagged for your review.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--surface)] border border-[var(--border-rule)] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--primary)] font-semibold text-[15px]">
                03
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-serif font-semibold text-[18px] text-[var(--text-primary)]">
                  Publish & share
                </h4>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Classmates read published notes at <code className="text-[var(--primary)] font-mono text-[13px]">classleaf.com/username/project</code> without requiring login or app downloads.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-rule)] bg-[var(--surface)] py-8 text-center text-[13px] text-[var(--text-secondary)]">
        ClassLeaf © {new Date().getFullYear()} — Built for students, notebooks, and quiet study.
      </footer>
    </div>
  );
}
