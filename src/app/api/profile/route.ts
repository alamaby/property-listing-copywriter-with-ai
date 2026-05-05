import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, timezone, language } = body;

    // Validate required fields
    if (!name || !timezone || !language) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the user's profile in the database
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        timezone,
        language,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[api/profile] supabase update error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('[api/profile] unhandled error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}