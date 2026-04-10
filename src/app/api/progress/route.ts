import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile }         from '@/lib/session'
import { createServiceClient }       from '@/lib/supabase/service'

/* GET — جلب التقدم ────────────────────────────────────── */
export async function GET() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await (supabase as any)
    .from('user_progress')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  if (!data) {
    // أنشئ سجلاً افتراضياً إذا لم يكن موجوداً
    const { data: created } = await (supabase as any)
      .from('user_progress')
      .insert({ user_id: profile.id, current_level: profile.level ?? 1 })
      .select()
      .single()
    return NextResponse.json({ progress: created })
  }

  return NextResponse.json({ progress: data })
}

/* POST — حفظ/تحديث التقدم ─────────────────────────────── */
export async function POST(req: NextRequest) {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const updates = await req.json()
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('user_progress')
    .upsert({
      user_id:          profile.id,
      last_activity:    new Date().toISOString(),
      ...updates,
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'فشل الحفظ' }, { status: 500 })
  return NextResponse.json({ progress: data })
}
