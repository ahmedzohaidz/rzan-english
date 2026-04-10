import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { levelToString } from '@/types'

export async function GET() {
  // Verify parent auth cookie
  const cookieStore = await cookies()
  const parentAuth  = cookieStore.get('parent_auth')?.value
  if (!parentAuth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()

  // Get Rzan's profile (first / only profile)
  const { data: profile } = await supabase
    .from('rzan_profile')
    .select('*')
    .order('created_at')
    .limit(1)
    .single()

  if (!profile) return NextResponse.json({ error: 'لا يوجد ملف للطالبة' }, { status: 404 })

  // Last 7 days date range
  const today   = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  // Gather all data in parallel
  const [missionsRes, writingRes, vocabRes] = await Promise.all([
    supabase
      .from('rzan_missions')
      .select('mission_date, completed, type, points_reward')
      .eq('profile_id', profile.id)
      .gte('mission_date', weekAgoStr)
      .order('mission_date'),
    supabase
      .from('rzan_writing_journal')
      .select('id, title, genre, word_count, ai_feedback, created_at, points_earned')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('rzan_vocabulary')
      .select('word, difficulty, correct_count, review_count, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const missions = missionsRes.data ?? []
  const writing  = writingRes.data  ?? []
  const vocab    = vocabRes.data    ?? []

  // Build 7-day activity grid
  const activityMap: Record<string, { completed: number; total: number; points: number }> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo)
    d.setDate(d.getDate() + i)
    activityMap[d.toISOString().split('T')[0]] = { completed: 0, total: 0, points: 0 }
  }
  for (const m of missions) {
    const key = m.mission_date
    if (activityMap[key]) {
      activityMap[key].total++
      if (m.completed) {
        activityMap[key].completed++
        activityMap[key].points += m.points_reward
      }
    }
  }
  const weeklyActivity = Object.entries(activityMap).map(([date, v]) => ({ date, ...v }))

  // Vocab accuracy
  const vocabAccuracy = vocab.length > 0
    ? Math.round(vocab.reduce((sum, v) => sum + (v.review_count > 0 ? v.correct_count / v.review_count : 0), 0) / vocab.length * 100)
    : 0

  return NextResponse.json({
    profile: {
      name:           profile.name,
      level:          levelToString(profile.level),
      levelNum:       profile.level,
      points:         profile.points,
      streak:         profile.streak_days,
      diagnosticDone: profile.diagnostic_done,
      lastActive:     profile.last_active,
    },
    weeklyActivity,
    recentWriting: writing,
    vocabStats: {
      total:    vocab.length,
      accuracy: vocabAccuracy,
      recent:   vocab.slice(0, 8),
    },
    missionStats: {
      completedThisWeek: missions.filter(m => m.completed).length,
      totalThisWeek:     missions.length,
    },
  })
}
