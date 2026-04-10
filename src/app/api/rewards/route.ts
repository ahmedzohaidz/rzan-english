import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/* GET — list active rewards + student points + recent requests */
export async function GET() {
  const supabase = createServiceClient()
  const db       = supabase as any   // new tables not yet in generated types

  const [{ data: rewards }, { data: profile }, { data: requests }] = await Promise.all([
    db.from('rzan_rewards').select('*').eq('is_active', true).order('points_cost'),
    supabase.from('rzan_profile').select('points').single(),
    db.from('rzan_reward_requests').select('*').order('created_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    rewards:  rewards  ?? [],
    points:   profile?.points ?? 0,
    requests: requests ?? [],
  })
}

/* POST — student requests a reward */
export async function POST(req: NextRequest) {
  try {
    const { rewardId } = await req.json()
    const supabase     = createServiceClient()
    const db           = supabase as any

    const { data: reward } = await db.from('rzan_rewards').select('*').eq('id', rewardId).single()
    if (!reward) return NextResponse.json({ error: 'Reward not found' }, { status: 404 })

    const { data: profile } = await supabase.from('rzan_profile').select('id, points').single()
    if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 400 })
    if (profile.points < reward.points_cost)
      return NextResponse.json({ error: 'نقاط غير كافية' }, { status: 400 })

    const qrCode = `RZAN-${rewardId.slice(0, 8).toUpperCase()}-${Date.now()}`

    const { data: request } = await db
      .from('rzan_reward_requests')
      .insert({ reward_id: rewardId, points_used: reward.points_cost, qr_code: qrCode })
      .select()
      .single()

    return NextResponse.json({ request, qrCode })
  } catch (err) {
    console.error('Rewards POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/* PATCH — parent approves or rejects */
export async function PATCH(req: NextRequest) {
  try {
    const { requestId, action } = await req.json()
    const supabase = createServiceClient()
    const db       = supabase as any

    if (action === 'approve') {
      const { data: request } = await db
        .from('rzan_reward_requests').select('points_used').eq('id', requestId).single()

      if (request) {
        const { data: profile } = await supabase
          .from('rzan_profile').select('id, points').single()
        if (profile) {
          await supabase
            .from('rzan_profile')
            .update({ points: Math.max(0, (profile.points ?? 0) - request.points_used) })
            .eq('id', profile.id)
        }
      }
      await db.from('rzan_reward_requests')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', requestId)
    } else {
      await db.from('rzan_reward_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
