import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyCsrfOrigin } from '@/lib/security';

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
    const { id: noteId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify note exists and user owns the parent notebook
    const { data: note, error: noteFetchError } = await supabase
      .from('notes')
      .select('id, notebook_id, status, notebooks(owner_id)')
      .eq('id', noteId)
      .maybeSingle();

    if (noteFetchError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.notebooks?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (note.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft notes can be deleted' },
        { status: 400 }
      );
    }

    // 1. Fetch all associated image storage paths
    const { data: images } = await supabase
      .from('images')
      .select('storage_path')
      .eq('note_id', noteId);

    if (images && images.length > 0) {
      const pathsToDelete = images
        .map((img) => img.storage_path)
        .filter(Boolean);

      if (pathsToDelete.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
          .from('note-images')
          .remove(pathsToDelete);

        if (storageDeleteError) {
          console.warn('Storage cleanup warning:', storageDeleteError);
        }
      }
    }

    // 2. Delete the note (database cascade deletes related images and jobs)
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (deleteError) {
      console.error('Note delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Draft note and associated images deleted successfully',
    });
  } catch (error) {
    console.error('Delete note route error:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting note' },
      { status: 500 }
    );
  }
}
