import { NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'

export async function GET() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  return NextResponse.json(profile)
}
