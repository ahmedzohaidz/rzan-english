import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  // حماية: Cron secret أو استدعاء داخلي
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? 'rzan-cron-2026'}`) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { subscription, title, body, url = '/' } = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url, icon: '/icons/icon-192x192.png' }),
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    // 410 Gone = اشتراك منتهي
    if (err?.statusCode === 410) {
      return NextResponse.json({ error: 'اشتراك منتهٍ', expired: true }, { status: 410 })
    }
    return NextResponse.json({ error: 'فشل الإرسال' }, { status: 500 })
  }
}
