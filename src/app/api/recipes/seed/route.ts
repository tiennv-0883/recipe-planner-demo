import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { seedUserRecipes } from '@/src/data/supabase-seed'

/**
 * POST /api/recipes/seed
 * Seeds the 20 default recipes for the authenticated user.
 * Idempotent — checks seeded_at before running.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if already seeded
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('seeded_at')
    .eq('id', user.id)
    .single()

  if (profile?.seeded_at) {
    return NextResponse.json({ message: 'Already seeded', seeded: true })
  }

  try {
    await seedUserRecipes(user.id)
    return NextResponse.json({ message: 'Seed complete', seeded: true }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
