'use client'
import { useState, useEffect } from 'react'

interface Reward {
  id:          string
  title_ar:    string
  description: string
  points_cost: number
  icon:        string
}
interface RewardRequest {
  id:         string
  reward_id:  string
  points_used:number
  status:     'pending' | 'approved' | 'rejected'
  qr_code:    string
  created_at: string
}

export default function RewardsPage() {
  const [rewards,   setRewards]   = useState<Reward[]>([])
  const [points,    setPoints]    = useState(0)
  const [requests,  setRequests]  = useState<RewardRequest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [requesting,setRequesting]= useState<string | null>(null)
  const [qrCode,    setQrCode]    = useState<string | null>(null)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetch('/api/rewards')
      .then(r => r.json())
      .then(d => {
        setRewards(d.rewards ?? [])
        setPoints(d.points ?? 0)
        setRequests(d.requests ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  async function requestReward(rewardId: string) {
    setRequesting(rewardId)
    setError('')
    try {
      const res  = await fetch('/api/rewards', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rewardId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'خطأ'); return }
      setQrCode(data.qrCode)
      setRequests(prev => [data.request, ...prev])
    } catch {
      setError('تعذّر الطلب')
    } finally {
      setRequesting(null)
    }
  }

  const pendingRequest = requests.find(r => r.status === 'pending')

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FDF6EC' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, animation:'float 4s ease-in-out infinite' }}>🎁</div>
        <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', marginTop:12 }}>جاري التحميل...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#FDF6EC', paddingBottom:100 }}>

      {/* Header banner */}
      <div style={{
        background:   'linear-gradient(135deg,#E8789A,#9B72CF,#E8A020)',
        borderRadius: '0 0 28px 28px',
        padding:      '24px 20px',
        marginBottom: 20,
        textAlign:    'center',
      }}>
        <p style={{ fontSize:48, marginBottom:8, animation:'float 4s ease-in-out infinite' }}>🎁</p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:900, color:'white', marginBottom:4 }}>
          مكافآت رزان
        </h1>
        <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'rgba(255,255,255,0.85)' }}>
          نقاطك الحالية
        </p>
        <p style={{ fontFamily:'var(--font-display)', fontSize:42, fontWeight:900, color:'white', lineHeight:1, marginTop:4 }}>
          {points} ⭐
        </p>
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* Pending QR */}
        {(qrCode || pendingRequest) && (
          <div style={{
            background:   'linear-gradient(135deg,#FFFDE0,#FFF0C0)',
            border:       '1.5px solid rgba(232,160,32,0.4)',
            borderRadius: 20,
            padding:      '20px',
            marginBottom: 20,
            textAlign:    'center',
          }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', marginBottom:8 }}>
              ⏳ طلبك في الانتظار
            </p>
            <div style={{
              background:   'white',
              borderRadius: 16,
              padding:      '16px',
              display:      'inline-block',
              marginBottom: 12,
              border:       '2px solid #E8D5C0',
            }}>
              {/* Simple QR display — real app would use qrcode library */}
              <p style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-dark)', wordBreak:'break-all' }}>
                {qrCode ?? pendingRequest?.qr_code}
              </p>
            </div>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)' }}>
              أرهني هذا الكود لأبوكِ ليوافق على الطلب 📱
            </p>
          </div>
        )}

        {error && (
          <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--rose-dark)', textAlign:'center', marginBottom:12, fontSize:14 }}>
            ⚠️ {error}
          </p>
        )}

        {/* Rewards grid */}
        <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', marginBottom:12 }}>
          المكافآت المتاحة 🌟
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {rewards.map(r => {
            const canAfford    = points >= r.points_cost
            const isRequesting = requesting === r.id
            return (
              <div key={r.id} style={{
                background:   'white',
                border:       `1.5px solid ${canAfford ? '#E8D5C0' : '#F0EAE0'}`,
                borderRadius: 18,
                padding:      '16px 18px',
                display:      'flex',
                alignItems:   'center',
                gap:          14,
                boxShadow:    canAfford ? '0 4px 16px rgba(180,120,80,0.1)' : 'none',
                opacity:      canAfford ? 1 : 0.6,
              }}>
                <span style={{ fontSize:36 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', direction:'rtl' }}>
                    {r.title_ar}
                  </p>
                  {r.description && (
                    <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-soft)', direction:'rtl' }}>
                      {r.description}
                    </p>
                  )}
                  <p style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:900, color:'var(--gold)', marginTop:2 }}>
                    {r.points_cost} ⭐
                  </p>
                </div>
                <button
                  onClick={() => requestReward(r.id)}
                  disabled={!canAfford || isRequesting || !!pendingRequest}
                  style={{
                    background:   canAfford && !pendingRequest
                      ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
                      : '#E8D5C0',
                    color:        canAfford && !pendingRequest ? 'white' : 'var(--text-soft)',
                    border:       'none',
                    borderRadius: 12,
                    padding:      '10px 14px',
                    fontFamily:   'Tajawal,sans-serif',
                    fontSize:     13,
                    fontWeight:   700,
                    cursor:       canAfford && !pendingRequest ? 'pointer' : 'not-allowed',
                    whiteSpace:   'nowrap',
                    minWidth:     72,
                  }}
                >
                  {isRequesting ? '...' : canAfford ? 'استبدلي' : 'نقاط أقل'}
                </button>
              </div>
            )
          })}
        </div>

        {/* History */}
        {requests.length > 0 && (
          <div style={{ marginTop:24 }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, fontWeight:700, color:'var(--text-mid)', marginBottom:10 }}>
              سجل الطلبات
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {requests.map(r => (
                <div key={r.id} style={{
                  background:   r.status === 'approved'
                    ? 'rgba(126,216,181,0.1)'
                    : r.status === 'rejected' ? 'rgba(232,120,154,0.08)' : '#FAFAFA',
                  border:       '1px solid #E8D5C0',
                  borderRadius: 12,
                  padding:      '10px 14px',
                  display:      'flex',
                  justifyContent:'space-between',
                  alignItems:   'center',
                }}>
                  <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)' }}>
                    {r.points_used} ⭐
                  </p>
                  <span style={{
                    fontFamily:   'Tajawal,sans-serif',
                    fontSize:     12,
                    fontWeight:   700,
                    color:        r.status === 'approved' ? '#3D7A5C'
                                : r.status === 'rejected' ? 'var(--rose-dark)' : 'var(--gold)',
                    background:   r.status === 'approved' ? 'rgba(126,216,181,0.2)'
                                : r.status === 'rejected' ? 'rgba(232,120,154,0.1)' : 'rgba(232,160,32,0.1)',
                    borderRadius: 20,
                    padding:      '3px 10px',
                  }}>
                    {r.status === 'approved' ? '✅ موافق' : r.status === 'rejected' ? '❌ مرفوض' : '⏳ انتظار'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
