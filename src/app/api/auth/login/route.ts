import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  const { name } = await req.json()

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'اسم غير صالح' }, { status: 400 })
  }

  const cleanName = name.trim()
  const supabase  = createServiceClient()

  // Find existing profile or create new one
  let { data: profile } = await supabase
    .from('rzan_profile')
    .select('id, name, diagnostic_done')
    .ilike('name', cleanName)
    .maybeSingle()

  if (!profile) {
    const { data: newProfile, error } = await supabase
      .from('rzan_profile')
      .insert({ name: cleanName })
      .select('id, name, diagnostic_done')
      .single()

    if (error || !newProfile) {
      return NextResponse.json({ error: 'فشل إنشاء الملف الشخصي' }, { status: 500 })
    }
    profile = newProfile
  }

  // Update last_active
  await supabase
    .from('rzan_profile')
    .update({ last_active: new Date().toISOString().split('T')[0] })
    .eq('id', profile.id)

  // Create session token
  const token = crypto.randomUUID()
  const { error: sessionError } = await supabase
    .from('rzan_sessions')
    .insert({ profile_id: profile.id, session_token: token })

  if (sessionError) {
    return NextResponse.json({ error: 'فشل إنشاء الجلسة' }, { status: 500 })
  }

  const res = NextResponse.json({
    ok:             true,
    diagnosticDone: profile.diagnostic_done,
  })

  res.cookies.set('rzan_session', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 30, // 30 days
  })

  return res
}
