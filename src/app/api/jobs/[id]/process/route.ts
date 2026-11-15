import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyCsrfOrigin } from '@/lib/security';
import type { Json } from '@/lib/supabase/types';

export const maxDuration = 60; // Allow sufficient time for async pipeline execution

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STUB_DRAFT_TEXT = `# Lecture Notes: Database Normalization & Integrity Constraints

## 1. Functional Dependencies
A functional dependency \(\alpha \rightarrow \beta\) between two sets of attributes indicates that the value of \(\alpha\) uniquely determines the value of \(\beta\).

## 2. First Normal Form (1NF)
A domain is atomic if elements of the domain are considered to be indivisible units. A relation schema \(R\) is in **1NF** if the domains of all attributes of \(R\) are atomic (no repeating groups).

## 3. Second Normal Form (2NF)
A relation schema is in **2NF** if it is in 1NF and every non-prime attribute is fully functionally dependent on the primary key (no partial key dependencies).

## 4. Third Normal Form (3NF)
A relation schema \(R\) is in **3NF** if whenever a functional dependency \(\alpha \rightarrow \beta\) holds, either:
- \(\alpha \rightarrow \beta\) is trivial, or
- \(\alpha\) is a superkey for \(R\), or
- Each attribute in \(\beta - \alpha\) is contained in a candidate key.

> [!NOTE]
> *Phase 2 Simulated Pipeline: Manuscript successfully processed and structured into markdown notes.*
`;

const STUB_FLAGS: Json = [
  { word: 'indivisible', confidence: 0.88, index: 14 },
  { word: 'superkey', confidence: 0.91, index: 52 },
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'Invalid origin or CSRF check failed' },
      { status: 403 }
    );
  }

  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the job and verify owner permissions
    const { data: job, error: jobFetchError } = await supabase
      .from('jobs')
      .select('*, notebooks(owner_id)')
      .eq('id', jobId)
      .maybeSingle();

    if (jobFetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify ownership
    if (job.notebooks?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // IDEMPOTENCY CHECK:
    // If the job is already completed or currently in progress, do not duplicate work.
    if (job.status === 'draft_ready') {
      return NextResponse.json({
        message: 'Job has already been processed',
        status: 'draft_ready',
        jobId: job.id,
        noteId: job.note_id,
      });
    }

    if (job.status === 'processing') {
      return NextResponse.json({
        message: 'Job is currently being processed',
        status: 'processing',
        jobId: job.id,
        noteId: job.note_id,
      });
    }

    // Begin processing
    let currentLogs = Array.isArray(job.log) ? [...job.log] : [];

    const appendLog = (stage: string, message: string) => {
      currentLogs.push({
        stage,
        timestamp: new Date().toISOString(),
        message,
      });
    };

    // Stage 1: Preparing photo
    appendLog('preparing_photo', 'Auto-rotating from EXIF, enhancing contrast and sharpness');
    await supabase
      .from('jobs')
      .update({
        status: 'processing',
        stage: 'preparing_photo',
        log: currentLogs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    await sleep(700);

    // Stage 2: Reading handwriting
    appendLog('reading_handwriting', 'Extracting raw handwriting manuscript lines');
    await supabase
      .from('jobs')
      .update({
        stage: 'reading_handwriting',
        log: currentLogs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    await sleep(800);

    // Stage 3: Cleaning text
    appendLog('cleaning_text', 'Structuring mathematical symbols, technical terms, and headings');
    await supabase
      .from('jobs')
      .update({
        stage: 'cleaning_text',
        log: currentLogs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    await sleep(800);

    // Stage 4: Checking for mistakes
    appendLog('checking_mistakes', 'Flagging low-confidence handwritten tokens for author review');
    await supabase
      .from('jobs')
      .update({
        stage: 'checking_mistakes',
        log: currentLogs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    await sleep(700);

    // Write placeholder draft note content
    if (job.note_id) {
      await supabase
        .from('notes')
        .update({
          content: STUB_DRAFT_TEXT,
          flags: STUB_FLAGS,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.note_id);
    }

    // Final Stage: draft_ready
    appendLog('draft_ready', 'Draft note generated successfully');
    const { data: updatedJob } = await supabase
      .from('jobs')
      .update({
        status: 'draft_ready',
        stage: 'draft_ready',
        log: currentLogs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    return NextResponse.json({
      message: 'Processing complete',
      status: 'draft_ready',
      jobId: updatedJob?.id || jobId,
      noteId: updatedJob?.note_id || job.note_id,
    });
  } catch (error) {
    console.error('Job processing error:', error);

    // Attempt to set job status to failed
    try {
      const { id: jobId } = await params;
      const supabase = await createClient();
      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          stage: 'failed',
          error: error instanceof Error ? error.message : 'Unknown processing error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch {
      // Ignore fallback error
    }

    return NextResponse.json(
      { error: 'Internal server error during job processing' },
      { status: 500 }
    );
  }
}
