import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient }       from '@/lib/supabase/service'
import webpush                       from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

const MESSAGES = [
  { title: '🔍 المحققة رزان!',  body: 'درسك اليوم ينتظرك — تعالي نكمل المغامرة! 📖' },
  { title: '⭐ سلسلتك مستمرة!', body: 'لا تكسري السلسلة اليوم — دقيقة واحدة تكفي! 🔥' },
  { title: '📚 كلمة جديدة!',    body: 'كلمة جديدة تنتظرك في المنصة — هل تعرفينها؟ ✨' },
  { title: '✍️ روايتك تنتظر!', body: 'كملي قصتك — بطلتك تنتظر قرارك! 🌟' },
]

export async function GET(req: NextRequest) {
  // تحقق من Vercel Cron أو secret
  const cronSecret = req.headers.get('x-vercel-cron') ??
                     req.headers.get('authorization')?.replace('Bearer ', '')
  if (cronSecret !== (process.env.CRON_SECRET ?? 'rzan-cron-2026') && !req.headers.get('x-vercel-cron')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const currentHour = new Date().getUTCHours() + 3 // توقيت السعودية (UTC+3)
  const supabase    = createServiceClient()

  // جلب المشتركين الذين حان وقت تذكيرهم
  const { data: subs } = await (supabase as any)
    .from('push_subscriptions')
    .select('user_id, subscription')
    .eq('reminder_hour', currentHour)

  if (!subs?.length) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  let sent  = 0
  const expired: string[] = []

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({ ...msg, url: '/dashboard', icon: '/icons/icon-192x192.png' }),
      )
      sent++
    } catch (err: any) {
      if (err?.statusCode === 410) expired.push(sub.user_id)
    }
  }

  // احذف الاشتراكات المنتهية
  if (expired.length) {
    await (supabase as any)
      .from('push_subscriptions')
      .delete()
      .in('user_id', expired)
  }

  return NextResponse.json({ ok: true, sent, expired: expired.length })
}
