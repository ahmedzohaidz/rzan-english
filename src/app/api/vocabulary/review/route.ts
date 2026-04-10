import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/service'
import { calculateNextReview } from '@/lib/spaced-repetition'

export async function POST(req: NextRequest) {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { wordId, wasCorrect } = await req.json() as { wordId: string; wasCorrect: boolean }
  if (!wordId) return NextResponse.json({ error: 'wordId مطلوب' }, { status: 400 })

  const supabase = createServiceClient()

  // Fetch current word state
  const { data: word } = await supabase
    .from('rzan_vocabulary')
    .select('correct_count, review_count, difficulty')
    .eq('id', wordId)
    .eq('profile_id', profile.id)
    .single()

  if (!word) return NextResponse.json({ error: 'الكلمة غير موجودة' }, { status: 404 })

  const newReviewCount  = word.review_count + 1
  const newCorrectCount = wasCorrect ? word.correct_count + 1 : word.correct_count
  const nextReview      = calculateNextReview(newCorrectCount, Number(word.difficulty ?? 3), wasCorrect)

  const { error } = await supabase
    .from('rzan_vocabulary')
    .update({
      review_count:  newReviewCount,
      correct_count: newCorrectCount,
      next_review:   nextReview.toISOString(),
    })
    .eq('id', wordId)
    .eq('profile_id', profile.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP for correct answers
  if (wasCorrect) {
    await supabase
      .from('rzan_profile')
      .update({ points: profile.points + 3 })
      .eq('id', profile.id)
  }

  return NextResponse.json({ ok: true, nextReview: nextReview.toISOString() })
}
