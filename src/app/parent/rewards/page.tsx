'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Reward { id:string; title_ar:string; description:string; points_cost:number; icon:string; is_active:boolean }
interface Request { id:string; reward_id:string; points_used:number; status:string; qr_code:string; created_at:string }

export default function ParentRewardsPage() {
  const router = useRouter()
  const [rewards,   setRewards]   = useState<Reward[]>([])
  const [requests,  setRequests]  = useState<Request[]>([])
  const [points,    setPoints]    = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [newReward, setNewReward] = useState({ title_ar:'', points_cost:100, icon:'🎁' })
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    fetch('/api/rewards')
      .then(r => r.json())
      .then(d => {
        setRewards(d.rewards ?? [])
        setRequests(d.requests ?? [])
        setPoints(d.points ?? 0)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleAction(requestId: string, action: 'approve' | 'reject') {
    await fetch('/api/rewards', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ requestId, action }),
    })
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
    ))
  }

  async function addReward() {
    if (!newReward.title_ar.trim()) return
    setSaving(true)
    // Use service role via server — for now just show the concept
    // In production this would POST to a parent-protected API
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FDF6EC' }}>
      <div style={{ fontSize:48, animation:'float 4s ease-in-out infinite' }}>🎁</div>
    </div>
  )

  const pending = requests.filter(r => r.status === 'pending')

  return (
    <div style={{ minHeight:'100vh', background:'#FDF6EC', padding:'0 0 40px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#E8789A,#9B72CF)', borderRadius:'0 0 24px 24px', padding:'20px 18px', marginBottom:20 }}>
        <button onClick={() => router.push('/parent')}
          style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, padding:'5px 12px', color:'white', fontFamily:'Tajawal,sans-serif', fontSize:12, cursor:'pointer', marginBottom:10 }}>
          ← رجوع
        </button>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'white', marginBottom:2 }}>🎁 مكافآت رزان</h1>
        <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'rgba(255,255,255,0.85)' }}>
          نقاط رزان الحالية: <strong>{points} ⭐</strong>
        </p>
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', marginBottom:10 }}>
              ⏳ طلبات تنتظر موافقتك ({pending.length})
            </p>
            {pending.map(r => {
              const reward = rewards.find(rw => rw.id === r.reward_id)
              return (
                <div key={r.id} style={{ background:'linear-gradient(135deg,#FFFDE0,#FFF8C0)', border:'1.5px solid rgba(232,160,32,0.4)', borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div>
                      <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)' }}>
                        {reward?.icon} {reward?.title_ar ?? 'مكافأة'}
                      </p>
                      <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--gold)' }}>
                        {r.points_used} ⭐ نقطة
                      </p>
                    </div>
                    <div style={{ fontFamily:'monospace', fontSize:10, color:'var(--text-mid)', background:'white', padding:'4px 8px', borderRadius:8 }}>
                      {r.qr_code}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => handleAction(r.id, 'approve')}
                      style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#7ED8B5,#4FD8A0)', color:'white', fontFamily:'Tajawal,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      ✅ وافق
                    </button>
                    <button onClick={() => handleAction(r.id, 'reject')}
                      style={{ flex:1, padding:'10px', borderRadius:10, border:'1.5px solid #E8789A', background:'white', color:'var(--rose-dark)', fontFamily:'Tajawal,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      ❌ ارفض
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Rewards list */}
        <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, fontWeight:700, color:'var(--text-dark)', marginBottom:10 }}>
          قائمة المكافآت المتاحة
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
          {rewards.map(r => (
            <div key={r.id} style={{ background:'white', border:'1.5px solid #E8D5C0', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:28 }}>{r.icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, fontWeight:700, color:'var(--text-dark)' }}>{r.title_ar}</p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--gold)' }}>{r.points_cost} ⭐</p>
              </div>
            </div>
          ))}
        </div>

        {/* All requests history */}
        {requests.length > 0 && (
          <div>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, fontWeight:700, color:'var(--text-mid)', marginBottom:8 }}>
              سجل كل الطلبات
            </p>
            {requests.map(r => (
              <div key={r.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0EAE0' }}>
                <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)' }}>
                  {r.points_used} ⭐ — {new Date(r.created_at).toLocaleDateString('ar-SA')}
                </p>
                <span style={{
                  fontFamily:'Tajawal,sans-serif', fontSize:12, fontWeight:700,
                  color: r.status === 'approved' ? '#3D7A5C' : r.status === 'rejected' ? 'var(--rose-dark)' : 'var(--gold)',
                }}>
                  {r.status === 'approved' ? '✅ موافق' : r.status === 'rejected' ? '❌ مرفوض' : '⏳ انتظار'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
