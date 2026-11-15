import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query job and its parent notebook to verify ownership
    const { data: job, error } = await supabase
      .from('jobs')
      .select('id, notebook_id, note_id, status, stage, error, log, created_at, updated_at, notebooks(owner_id)')
      .eq('id', jobId)
      .maybeSingle();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Strictly enforce that only the job's notebook owner can access status
    if (job.notebooks?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      notebookId: job.notebook_id,
      noteId: job.note_id,
      status: job.status,
      stage: job.stage,
      error: job.error,
      log: job.log,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    });
  } catch (error) {
    console.error('Job status fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching job status' },
      { status: 500 }
    );
  }
}
