import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import type { RzanProfileRow } from '@/types/supabase'

export async function getSessionProfile(): Promise<RzanProfileRow | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('rzan_session')?.value
  if (!token) return null

  const supabase = createServiceClient()

  const { data: session } = await supabase
    .from('rzan_sessions')
    .select('profile_id, expires_at')
    .eq('session_token', token)
    .maybeSingle()

  if (!session) return null
  if (new Date(session.expires_at) < new Date()) return null

  const { data: profile } = await supabase
    .from('rzan_profile')
    .select('*')
    .eq('id', session.profile_id)
    .single()

  return profile ?? null
}
