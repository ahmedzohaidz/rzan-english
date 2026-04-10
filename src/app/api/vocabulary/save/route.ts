import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { word, meaning_ar, example_sentence } = await req.json()
    if (!word) return NextResponse.json({ error: 'word required' }, { status: 400 })

    const supabase = createServiceClient()

    // Get profile id first
    const { data: profile } = await supabase
      .from('rzan_profile').select('id, points').single()
    if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 400 })

    // Check if word already exists
    const { data: existing } = await supabase
      .from('rzan_vocabulary')
      .select('id, review_count')
      .eq('profile_id', profile.id)
      .ilike('word', word.trim())
      .maybeSingle()

    if (existing) {
      await supabase
        .from('rzan_vocabulary')
        .update({ review_count: (existing.review_count ?? 0) + 1 })
        .eq('id', existing.id)
    } else {
      await supabase.from('rzan_vocabulary').insert({
        word:             word.trim(),
        definition:       meaning_ar ?? '',
        example_sentence: example_sentence ?? null,
        profile_id:       profile.id,
        review_count:     1,
        correct_count:    0,
        next_review:      new Date().toISOString(),
        difficulty:       'easy',
      })
    }

    // Award 5 points
    await supabase
      .from('rzan_profile')
      .update({ points: (profile.points ?? 0) + 5 })
      .eq('id', profile.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('vocabulary/save error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
