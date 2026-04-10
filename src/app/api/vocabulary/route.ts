import { NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const profile = await getSessionProfile()
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rzan_vocabulary')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
