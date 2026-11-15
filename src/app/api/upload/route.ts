import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyCsrfOrigin } from '@/lib/security';
import { validateImageFile } from '@/lib/validations/upload';
import { MAX_IMAGES_PER_UPLOAD } from '@/lib/constants/upload';
import { checkUserUploadLimits } from '@/lib/limits';

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'Invalid origin or CSRF check failed' },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check hourly and daily abuse limits
    const limitCheck = await checkUserUploadLimits(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error }, { status: 429 });
    }

    const formData = await request.formData();
    const notebookId = formData.get('notebookId') as string;
    const title = (formData.get('title') as string)?.trim();
    const files = formData.getAll('images') as File[];

    if (!notebookId) {
      return NextResponse.json(
        { error: 'Notebook ID is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Note title is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo must be provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_IMAGES_PER_UPLOAD) {
      return NextResponse.json(
        {
          error: `You cannot upload more than ${MAX_IMAGES_PER_UPLOAD} images at once`,
        },
        { status: 400 }
      );
    }

    // Validate each image
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Verify notebook ownership
    const { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, owner_id')
      .eq('id', notebookId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (nbError || !notebook) {
      return NextResponse.json(
        { error: 'Notebook not found or you do not have permission' },
        { status: 404 }
      );
    }

    // 1. Create draft note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        notebook_id: notebook.id,
        title,
        content: '',
        status: 'draft',
        flags: [],
      })
      .select()
      .single();

    if (noteError || !note) {
      console.error('Note creation error:', noteError);
      return NextResponse.json(
        { error: 'Failed to create draft note' },
        { status: 500 }
      );
    }

    // 2. Upload images to private storage bucket under owner's user ID folder
    const uploadedImagesData: { storage_path: string; order_index: number }[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(rawExt)
        ? rawExt
        : 'jpg';
      const uniqueFilename = `${index + 1}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
      const storagePath = `${user.id}/${note.id}/${uniqueFilename}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload image: ${file.name}` },
          { status: 500 }
        );
      }

      uploadedImagesData.push({
        storage_path: storagePath,
        order_index: index,
      });
    }

    // 3. Insert images rows
    const imagesInsertPayload = uploadedImagesData.map((img) => ({
      note_id: note.id,
      storage_path: img.storage_path,
      order_index: img.order_index,
      quality_status: 'passed' as const,
    }));

    const { error: imagesError } = await supabase
      .from('images')
      .insert(imagesInsertPayload);

    if (imagesError) {
      console.error('Images db insert error:', imagesError);
      return NextResponse.json(
        { error: 'Failed to record image metadata' },
        { status: 500 }
      );
    }

    // 4. Create async processing job
    const initialLog = [
      {
        stage: 'queued',
        timestamp: new Date().toISOString(),
        message: 'Job received and queued for processing',
      },
    ];

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        notebook_id: notebook.id,
        note_id: note.id,
        status: 'queued',
        stage: 'queued',
        log: initialLog,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Job creation error:', jobError);
      return NextResponse.json(
        { error: 'Failed to create processing job' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Upload successful. Job created.',
        jobId: job.id,
        noteId: note.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
