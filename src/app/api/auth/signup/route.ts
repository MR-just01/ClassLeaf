import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/validations/auth';
import { verifyCsrfOrigin } from '@/lib/security';

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'Invalid origin or CSRF check failed' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, username } = result.data;
    const supabase = await createClient();

    // Check if username already exists in profiles
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (profileCheckError) {
      return NextResponse.json(
        { error: 'Failed to verify username availability' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose another.' },
        { status: 409 }
      );
    }

    // Sign up with Supabase Auth
    // The username is stored in user_metadata, which triggers the Postgres handle_new_user() trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Direct insertion fallback if trigger is not yet active
    if (authData.user) {
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
        });

      if (insertProfileError && !insertProfileError.message.includes('duplicate')) {
        console.warn('Profile direct insert note:', insertProfileError.message);
      }
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
