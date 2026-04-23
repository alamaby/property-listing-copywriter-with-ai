import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.from('profiles').select('id').limit(1)

  if (error) {
    return NextResponse.json(
      { status: 'error', supabase: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }

  return NextResponse.json({
    status: 'ok',
    supabase: 'ok',
    timestamp: new Date().toISOString(),
  })
}
