import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('seeded_at')
      .eq('id', user.id)
      .single()

    const seeded = !!profile?.seeded_at

    return NextResponse.json({ user: { id: user.id, email: user.email, seeded } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
