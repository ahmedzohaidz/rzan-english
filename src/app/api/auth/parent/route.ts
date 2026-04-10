import { NextRequest, NextResponse } from 'next/server'

const PARENT_PIN = process.env.PARENT_PIN ?? '1234'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()

  if (!pin || pin !== PARENT_PIN) {
    return NextResponse.json({ error: 'الرمز غير صحيح' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })

  res.cookies.set('parent_auth', 'true', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 8, // 8 hours
  })

  return res
}
