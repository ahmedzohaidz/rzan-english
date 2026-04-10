import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile }         from '@/lib/session'
import { createServiceClient }       from '@/lib/supabase/service'

/* POST — حفظ اشتراك Push ────────────────────────────── */
export async function POST(req: NextRequest) {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { subscription, reminderHour = 19 } = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'بيانات الاشتراك غير صالحة' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .upsert({
      user_id:       profile.id,
      subscription,
      reminder_hour: reminderHour,
    }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: 'فشل الحفظ' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/* DELETE — إلغاء الاشتراك ───────────────────────────── */
export async function DELETE() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()
  await (supabase as any)
    .from('push_subscriptions')
    .delete()
    .eq('user_id', profile.id)

  return NextResponse.json({ ok: true })
}
