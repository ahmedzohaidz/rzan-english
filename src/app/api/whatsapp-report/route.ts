import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { anthropic, MODEL } from '@/lib/claude'
import { sendWhatsApp, buildWeeklyReport } from '@/lib/whatsapp'
import { levelToString } from '@/types'

export async function POST() {
  // Parent-auth only
  const cookieStore = await cookies()
  const parentAuth  = cookieStore.get('parent_auth')?.value
  if (!parentAuth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()

  // Get profile
  const { data: profile } = await supabase
    .from('rzan_profile')
    .select('*')
    .order('created_at')
    .limit(1)
    .single()

  if (!profile) return NextResponse.json({ error: 'لا يوجد ملف' }, { status: 404 })

  // Stats for this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const [missionsRes, writingRes, vocabRes] = await Promise.all([
    supabase.from('rzan_missions').select('id').eq('profile_id', profile.id).eq('completed', true).gte('mission_date', weekAgoStr),
    supabase.from('rzan_writing_journal').select('id').eq('profile_id', profile.id).gte('created_at', weekAgo.toISOString()),
    supabase.from('rzan_vocabulary').select('id').eq('profile_id', profile.id),
  ])

  const missionsCount = missionsRes.data?.length ?? 0
  const storiesCount  = writingRes.data?.length ?? 0
  const vocabCount    = vocabRes.data?.length ?? 0
  const level         = levelToString(profile.level)

  // Ask Claude for a warm encouragement message in Arabic
  let encouragement = 'رزان تتقدم بشكل رائع هذا الأسبوع! 🌟'
  try {
    const resp = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 200,
      system:     'أنت مس نورا. اكتبي رسالة تشجيع قصيرة (جملتان) لأبي رزان عن تقدمها هذا الأسبوع. باللغة العربية فقط.',
      messages: [{
        role:    'user',
        content: `رزان مستواها ${level}، جمعت ${profile.points} نقطة، أكملت ${missionsCount} مهمة، وكتبت ${storiesCount} قصة هذا الأسبوع.`,
      }],
    })
    encouragement = resp.content.map(b => ('text' in b ? b.text : '')).join('').trim()
  } catch { /* keep default */ }

  // Build message
  const message = buildWeeklyReport({
    name:             profile.name,
    level,
    points:           profile.points,
    streak:           profile.streak_days,
    missionsThisWeek: missionsCount,
    storiesCount,
    vocabCount,
    encouragement,
  })

  // Send to parent WhatsApp
  const parentPhone = process.env.PARENT_WHATSAPP ?? ''
  const sent = parentPhone ? await sendWhatsApp(parentPhone, message) : false

  // Log to whatsapp_logs (DiagPro legacy table — cast to bypass typed client)
  if (sent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('whatsapp_logs').insert({
      direction: 'outbound',
      message,
      status:    'sent',
    })
  }

  return NextResponse.json({ ok: true, sent, message })
}
