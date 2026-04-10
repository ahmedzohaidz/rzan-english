import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('rzan_session')
  res.cookies.delete('parent_auth')
  return res
}
