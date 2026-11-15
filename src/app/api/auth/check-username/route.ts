import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { usernameSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = usernameSchema.safeParse(body?.username);

    if (!result.success) {
      return NextResponse.json({
        available: false,
        reason: result.error.issues[0]?.message || 'Invalid username format',
      });
    }

    const username = result.data;
    const supabase = await createClient();

    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Error checking username:', error);
      return NextResponse.json(
        { available: false, reason: 'Failed to verify username availability' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json({
        available: false,
        reason: 'This username is already taken',
      });
    }

    return NextResponse.json({
      available: true,
      username,
    });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json(
      { available: false, reason: 'Internal server error' },
      { status: 500 }
    );
  }
}
