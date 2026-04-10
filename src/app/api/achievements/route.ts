import { NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/service'
import { ACHIEVEMENTS, computeUnlocked } from '@/data/achievements'

export async function GET() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()

  // Gather extras in parallel
  const [writingRes, missionsRes, vocabRes] = await Promise.all([
    supabase.from('rzan_writing_journal').select('id, word_count').eq('profile_id', profile.id),
    supabase.from('rzan_missions').select('id').eq('profile_id', profile.id).eq('completed', true),
    supabase.from('rzan_vocabulary').select('id').eq('profile_id', profile.id),
  ])

  const writingEntries = writingRes.data ?? []
  const extras = {
    writingCount:  writingEntries.length,
    missionsCount: missionsRes.data?.length ?? 0,
    vocabCount:    vocabRes.data?.length ?? 0,
  }

  // Check if any story has 200+ words (for storyteller achievement)
  const hasLongStory = writingEntries.some(e => (e.word_count ?? 0) >= 200)

  const unlocked = computeUnlocked(profile, extras)
  // Override storyteller check
  if (!hasLongStory) unlocked.delete('storyteller')

  const result = ACHIEVEMENTS.map(a => ({
    id:             a.id,
    icon:           a.icon,
    title_ar:       a.title_ar,
    description_ar: a.description_ar,
    points:         a.points,
    is_unlocked:    unlocked.has(a.id),
  }))

  return NextResponse.json({
    achievements: result,
    stats: {
      unlocked: result.filter(a => a.is_unlocked).length,
      total:    result.length,
      points:   profile.points,
      level:    profile.level,
      streak:   profile.streak_days,
      ...extras,
    },
  })
}
