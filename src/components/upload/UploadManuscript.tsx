'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_UPLOAD,
  STAGE_LABELS,
  STAGES_ORDER,
} from '@/lib/constants/upload';
import { validateImageFile } from '@/lib/validations/upload';

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}

interface UploadManuscriptProps {
  notebookId: string;
  notebookSlug: string;
  notebookTitle: string;
}

interface JobStatusResponse {
  id: string;
  status: 'queued' | 'processing' | 'draft_ready' | 'failed';
  stage: string | null;
  error: string | null;
  noteId: string | null;
}

export function UploadManuscript({
  notebookId,
  notebookSlug,
  notebookTitle,
}: UploadManuscriptProps) {
  const [title, setTitle] = useState(
    `Lecture Notes — ${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`
  );
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  // Job processing states
  const [isSubmitting, startSubmit] = useTransition();
  const [jobId, setJobId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobStatusResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle adding new files
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setClientError(null);

    const incoming = Array.from(files);

    if (images.length + incoming.length > MAX_IMAGES_PER_UPLOAD) {
      setClientError(
        `You can upload up to ${MAX_IMAGES_PER_UPLOAD} pages per submission. Please select fewer files.`
      );
      return;
    }

    const validated: SelectedImage[] = [];

    for (const f of incoming) {
      const validation = validateImageFile(f);
      if (!validation.valid) {
        setClientError(validation.error || 'Invalid file selected.');
        return;
      }
      validated.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: f.name,
      });
    }

    setImages((prev) => [...prev, ...validated]);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const target = prev[indexToRemove];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // Submit and initiate job
  const handleUploadSubmit = async () => {
    if (!title.trim()) {
      setClientError('Please enter a title for this note session.');
      return;
    }
    if (images.length === 0) {
      setClientError('Please add at least one photo of your notes.');
      return;
    }

    setClientError(null);

    startSubmit(async () => {
      try {
        const formData = new FormData();
        formData.append('notebookId', notebookId);
        formData.append('title', title.trim());
        images.forEach((img) => {
          formData.append('images', img.file);
        });

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setClientError(uploadData.error || 'Failed to submit photos.');
          return;
        }

        const newJobId = uploadData.jobId;
        const newNoteId = uploadData.noteId;
        setJobId(newJobId);
        setNoteId(newNoteId);

        // Trigger processing
        fetch(`/api/jobs/${newJobId}/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch((err) => console.error('Job process trigger warning:', err));
      } catch (err: unknown) {
        console.error(err);
        setClientError('A network error occurred while uploading. Please try again.');
      }
    });
  };

  // Poll job status while active
  useEffect(() => {
    if (!jobId) return;

    let isPolling = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;
        const data: JobStatusResponse = await res.json();
        if (!isPolling) return;

        setJobData(data);

        if (data.status === 'draft_ready' || data.status === 'failed') {
          isPolling = false;
        }
      } catch (err) {
        console.error('Job poll error:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 1200);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [jobId]);

  // Compute progress percentage
  const getProgressPercentage = () => {
    if (!jobData) return 10;
    if (jobData.status === 'draft_ready') return 100;
    if (jobData.status === 'failed') return 100;
    switch (jobData.stage) {
      case 'preparing_photo':
        return 25;
      case 'reading_handwriting':
        return 50;
      case 'cleaning_text':
        return 75;
      case 'checking_mistakes':
        return 90;
      default:
        return 15;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={(e) => handleFilesAdded(e.target.files)}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        capture="environment"
        accept="image/*"
        onChange={(e) => handleFilesAdded(e.target.files)}
        className="hidden"
      />

      {/* Breadcrumb Context Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-rule)]">
        <div className="flex items-center gap-2 text-[13px]">
          <Link
            href={`/dashboard/${notebookSlug}`}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider font-semibold"
          >
            {notebookTitle}
          </Link>
          <span className="text-[var(--outline-variant)]">/</span>
          <span className="text-[var(--primary)] font-medium">Add new note</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-container)] text-[var(--text-secondary)] text-[11px] font-semibold">
          Manuscript Ingestion
        </span>
      </div>

      {/* Session Title Input */}
      <div className="bg-[var(--surface)] rounded-2xl p-5 sm:p-6 border border-[var(--border-rule)] shadow-xs flex flex-col gap-2">
        <label
          htmlFor="session-title"
          className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
        >
          Session Title
        </label>
        <input
          id="session-title"
          type="text"
          disabled={Boolean(jobId)}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chapter 4: Database Normalization"
          className="w-full bg-transparent font-serif text-[20px] sm:text-[24px] font-semibold text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--outline-variant)]"
        />
      </div>

      {clientError && (
        <div className="p-4 rounded-xl bg-[var(--error-container)] text-[var(--on-error-container)] text-[13px] flex items-start gap-2.5 shadow-xs">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-snug">{clientError}</span>
        </div>
      )}

      {/* SECTION 1: Upload Dropzone & Thumbnails Tray (shown when job not yet submitted) */}
      {!jobId && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border-rule)] shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="font-serif font-semibold text-[18px] text-[var(--text-primary)]">
                Capture Manuscript
              </h2>
            </div>
            <span className="text-[12px] text-[var(--text-secondary)]">
              {images.length} of {MAX_IMAGES_PER_UPLOAD} pages
            </span>
          </div>

          {/* Tactile Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesAdded(e.dataTransfer.files);
            }}
            className="rounded-2xl border-2 border-dashed border-[var(--border-rule)] bg-[var(--surface-container-low)] p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:border-[var(--primary)]"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--surface)] shadow-xs border border-[var(--border-rule)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <p className="font-serif text-[17px] font-semibold text-[var(--text-primary)]">
                Place lecture pages flat
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Take photos in good lighting or upload from files. Supports JPEG, PNG, WEBP, and HEIC up to 10 MB per image.
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 h-11 px-4 rounded-xl bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span>Take photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-11 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-container)] text-[var(--text-primary)] border border-[var(--border-rule)] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>From library</span>
              </button>
            </div>
          </div>

          {/* Thumbnails Tray */}
          {images.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                <span className="font-semibold uppercase tracking-wider">
                  Scanned Sheets ({images.length})
                </span>
                <span>Use arrows to reorder pages</span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-3 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative shrink-0 w-32 bg-[var(--surface-container-low)] rounded-xl p-2 border border-[var(--border-rule)] shadow-xs flex flex-col gap-2"
                  >
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-black/5">
                      {/* Image Preview */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.previewUrl}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Page Index Badge */}
                      <span className="absolute top-1.5 left-1.5 bg-[var(--surface)]/90 backdrop-blur-xs text-[var(--text-primary)] text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-xs">
                        p. {idx + 1}
                      </span>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        aria-label={`Remove page ${idx + 1}`}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[var(--surface)]/90 text-[var(--text-secondary)] hover:text-[var(--error)] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-[var(--text-secondary)]">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, 'left')}
                        title="Move left"
                        className="p-1 rounded hover:bg-[var(--surface)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        ←
                      </button>
                      <span className="truncate max-w-[50px] font-mono">
                        Page {idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 'right')}
                        title="Move right"
                        className="p-1 rounded hover:bg-[var(--surface)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add More Slot */}
                {images.length < MAX_IMAGES_PER_UPLOAD && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-32 h-[196px] rounded-xl border border-dashed border-[var(--border-rule)] bg-[var(--surface-container-low)] flex flex-col items-center justify-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors p-3 text-center cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center shadow-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-[12px] font-medium">Add page</span>
                    <span className="text-[10px] text-[var(--outline)]">Max {MAX_IMAGES_PER_UPLOAD}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Action CTA */}
          <button
            type="button"
            disabled={isSubmitting || images.length === 0}
            onClick={handleUploadSubmit}
            className="w-full h-12 rounded-xl bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[15px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Uploading {images.length} {images.length === 1 ? 'page' : 'pages'}...</span>
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>
                  Clean up notes ({images.length} {images.length === 1 ? 'page' : 'pages'})
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* SECTION 2: Processing Progress Card (Shown after job is created) */}
      {jobId && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 sm:p-8 border border-[var(--border-rule)] shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {jobData?.status === 'draft_ready' ? (
                  <span className="w-3 h-3 rounded-full bg-[var(--status-published-text)]"></span>
                ) : jobData?.status === 'failed' ? (
                  <span className="w-3 h-3 rounded-full bg-[var(--error)]"></span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-[var(--primary)] animate-pulse"></span>
                )}
                <h3 className="font-serif font-semibold text-[20px] sm:text-[22px] text-[var(--text-primary)]">
                  {jobData?.status === 'draft_ready'
                    ? 'Manuscript Cleaned & Draft Ready!'
                    : jobData?.status === 'failed'
                    ? 'Transcription Failed'
                    : 'AI Transcription in progress...'}
                </h3>
              </div>
              <p className="text-[14px] text-[var(--text-secondary)]">
                {jobData?.status === 'draft_ready'
                  ? 'Your draft note has been generated and flagged words are marked for review.'
                  : jobData?.status === 'failed'
                  ? jobData.error || 'An unexpected error occurred during processing.'
                  : 'Analyzing manuscript handwriting, structuring markdown, and flagging low-confidence words.'}
              </p>
            </div>

            <span className="text-[13px] font-mono font-medium px-3 py-1 rounded-full bg-[var(--surface-container)] text-[var(--primary)] shrink-0">
              {getProgressPercentage()}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[var(--surface-container)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                jobData?.status === 'failed'
                  ? 'bg-[var(--error)]'
                  : jobData?.status === 'draft_ready'
                  ? 'bg-[var(--status-published-text)]'
                  : 'bg-[var(--primary)]'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* Stage Indicators */}
          <div className="space-y-3 bg-[var(--surface-container-low)] rounded-xl p-4 sm:p-5 border border-[var(--border-rule)]">
            {STAGES_ORDER.map((stageKey, idx) => {
              const currentStageIdx = STAGES_ORDER.indexOf(
                (jobData?.stage as typeof STAGES_ORDER[number]) || 'preparing_photo'
              );
              const isCompleted =
                jobData?.status === 'draft_ready' || currentStageIdx > idx;
              const isCurrent =
                jobData?.status === 'processing' && currentStageIdx === idx;

              return (
                <div key={stageKey} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-[var(--status-published-bg)] text-[var(--status-published-text)] border border-[var(--status-published-border)]'
                        : isCurrent
                        ? 'bg-[var(--primary-container)] text-white animate-pulse'
                        : 'bg-[var(--surface-container)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <span
                      className={`text-[14px] ${
                        isCompleted || isCurrent
                          ? 'font-medium text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {STAGE_LABELS[stageKey]}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                        In progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action on Success or Failure */}
          {jobData?.status === 'draft_ready' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/dashboard/${notebookSlug}/notes/${noteId || jobData.noteId}/review`}
                className="flex-1 h-12 rounded-xl bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[15px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Open draft note for review</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href={`/dashboard/${notebookSlug}`}
                className="h-12 px-5 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--text-primary)] text-[14px] font-medium flex items-center justify-center transition-colors"
              >
                Return to notebook
              </Link>
            </div>
          )}

          {jobData?.status === 'failed' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setJobId(null);
                  setJobData(null);
                }}
                className="flex-1 h-11 rounded-xl bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Try upload again
              </button>
              <Link
                href={`/dashboard/${notebookSlug}`}
                className="h-11 px-5 rounded-xl bg-[var(--surface-container)] text-[var(--text-primary)] text-[14px] font-medium flex items-center justify-center transition-colors"
              >
                Back to notebook
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
