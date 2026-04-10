import { NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { generateDailyMission } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const today    = new Date().toISOString().split('T')[0]
  const supabase = createServiceClient()

  // Return existing missions for today if already generated
  const { data: existing } = await supabase
    .from('rzan_missions')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('mission_date', today)
    .order('created_at')

  if (existing && existing.length > 0) {
    return NextResponse.json(existing)
  }

  // Generate 3 missions via Claude (one per type)
  const types = ['vocabulary', 'reading', 'writing'] as const
  const missions = []

  for (const _ of types) {
    try {
      const m = await generateDailyMission(profile)
      const { data } = await supabase
        .from('rzan_missions')
        .insert({ ...m, profile_id: profile.id, mission_date: today })
        .select()
        .single()
      if (data) missions.push(data)
    } catch {
      // skip failed generation
    }
  }

  return NextResponse.json(missions)
}

export async function POST(req: Request) {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { missionId } = await req.json()
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('rzan_missions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', missionId)
    .eq('profile_id', profile.id)
    .select('points_reward')
    .single()

  if (data) {
    await supabase
      .from('rzan_profile')
      .update({ points: profile.points + data.points_reward })
      .eq('id', profile.id)
  }

  return NextResponse.json({ ok: true })
}
