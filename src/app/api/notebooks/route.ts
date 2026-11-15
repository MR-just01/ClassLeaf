import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notebookCreateSchema } from '@/lib/validations/auth';
import { verifyCsrfOrigin } from '@/lib/security';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notebooks, error } = await supabase
      .from('notebooks')
      .select('*, notes(count)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notebooks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notebooks });
  } catch (error) {
    console.error('Fetch notebooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const result = notebookCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { title, slug, description } = result.data;

    // Check if user already has a notebook with this slug
    const { data: existing, error: checkError } = await supabase
      .from('notebooks')
      .select('id')
      .eq('owner_id', user.id)
      .eq('slug', slug)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a notebook with this URL slug' },
        { status: 409 }
      );
    }

    const { data: notebook, error: insertError } = await supabase
      .from('notebooks')
      .insert({
        owner_id: user.id,
        title,
        slug,
        description: description || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ notebook }, { status: 201 });
  } catch (error) {
    console.error('Create notebook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
