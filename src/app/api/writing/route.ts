import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/service'
import { anthropic, MODEL } from '@/lib/claude'
import { levelToString } from '@/types'

// GET — fetch all journal entries for current user
export async function GET() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('rzan_writing_journal')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

// POST — save entry and optionally get AI feedback
export async function POST(req: NextRequest) {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { title, content, genre, requestFeedback } = await req.json()

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'العنوان والمحتوى مطلوبان' }, { status: 400 })
  }

  const wordCount = content.trim().split(/\s+/).length
  const supabase  = createServiceClient()

  // Get AI feedback if requested
  let ai_feedback: string | null = null
  let pointsEarned = 5 // base points for saving

  if (requestFeedback) {
    try {
      const level = levelToString(profile.level)
      const response = await anthropic.messages.create({
        model:      MODEL,
        max_tokens: 600,
        system:     `أنت مس نورا، معلمة إنجليزية لطيفة ومشجعة. تعطين ملاحظات على كتابة رزان (عمرها 12، مستوى ${level}).
قواعد الملاحظات:
- ابدئي بالإيجابيات دائماً
- صحّحي خطأين أو ثلاثة بأسلوب لطيف
- اقترحي كلمة جديدة مناسبة للقصة [كلمة جديدة ⭐]
- اختمي بتشجيع حماسي يذكر حبها للكتابة
- الرد: عربي مع أمثلة إنجليزية`,
        messages: [{
          role:    'user',
          content: `Genre: ${genre}\nTitle: ${title}\n\n${content}`,
        }],
      })
      ai_feedback  = response.content.map(b => ('text' in b ? b.text : '')).join('')
      pointsEarned = 10 + Math.min(Math.floor(wordCount / 10), 20) // bonus for length
    } catch {
      // feedback optional — continue without it
    }
  }

  const { data, error } = await supabase
    .from('rzan_writing_journal')
    .insert({
      profile_id:   profile.id,
      title:        title.trim(),
      content:      content.trim(),
      genre,
      word_count:   wordCount,
      ai_feedback,
      points_earned: pointsEarned,
    })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'فشل الحفظ' }, { status: 500 })
  }

  // Award points
  await supabase
    .from('rzan_profile')
    .update({ points: profile.points + pointsEarned })
    .eq('id', profile.id)

  return NextResponse.json(data)
}
