'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface InsightStats {
  sessions: number; words: number; missions: number; stories: number
  streak: number; points: number; level: number
  weakWords: Array<{ word: string; times_seen: number; times_correct: number }>
}

const LEVEL_MAP = ['','A1','A1+','A2','A2+','B1','B1+']

export default function InsightsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState('')
  const [stats,    setStats]    = useState<InsightStats | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    fetch('/api/parent/insights')
      .then(r => {
        if (r.status === 401) { router.push('/parent/login'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        if (data.error) { setError(data.error); return }
        setAnalysis(data.analysis)
        setStats(data.stats)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FDF6EC' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, animation:'float 4s ease-in-out infinite' }}>🤖</div>
        <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', marginTop:12 }}>
          AI يحلل أسبوع رزان...
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#FDF6EC', padding:'0 0 40px' }}>

      {/* Header */}
      <div style={{
        background:   'linear-gradient(135deg,#E8789A,#9B72CF)',
        borderRadius: '0 0 28px 28px',
        padding:      '24px 20px',
        marginBottom: 20,
      }}>
        <button onClick={() => router.push('/parent')}
          style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10,
                   padding:'6px 14px', color:'white', fontFamily:'Tajawal,sans-serif',
                   fontSize:13, cursor:'pointer', marginBottom:12 }}>
          ← رجوع
        </button>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'white', marginBottom:4 }}>
          🤖 تحليل AI الأسبوعي
        </h1>
        <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'rgba(255,255,255,0.85)' }}>
          تقرير ذكي عن أسبوع رزان
        </p>
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* Stats cards */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
            {[
              { icon:'📅', val: stats.sessions,  label:'جلسة'   },
              { icon:'📚', val: stats.words,      label:'كلمة'   },
              { icon:'✅', val: stats.missions,   label:'مهمة'   },
              { icon:'✍️', val: stats.stories,    label:'قصة'    },
              { icon:'🔥', val: stats.streak,     label:'يوم'    },
              { icon:'⭐', val: stats.points,     label:'نقطة'   },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{
                background:   'white',
                border:       '1.5px solid #E8D5C0',
                borderRadius: 16,
                padding:      '14px 10px',
                textAlign:    'center',
                boxShadow:    '0 2px 10px rgba(180,120,80,0.08)',
              }}>
                <p style={{ fontSize:22, marginBottom:4 }}>{icon}</p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--rose-dark)', lineHeight:1 }}>{val}</p>
                <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:11, color:'var(--text-soft)', marginTop:2 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Level + weak words */}
        {stats && (
          <div style={{ background:'white', border:'1.5px solid #E8D5C0', borderRadius:18, padding:'16px 18px', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, color:'var(--text-mid)' }}>المستوى الحالي</p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'var(--gold)' }}>
                {LEVEL_MAP[stats.level] ?? 'A1'}
              </p>
            </div>
            {stats.weakWords.length > 0 && (
              <>
                <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)', marginBottom:8 }}>
                  🎯 كلمات تحتاج مراجعة:
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {stats.weakWords.map(w => (
                    <span key={w.word} style={{
                      background:'rgba(232,120,154,0.1)', borderRadius:20,
                      padding:'4px 12px', fontSize:13, color:'var(--rose-dark)',
                      fontFamily:'Georgia,serif', direction:'ltr',
                    }}>
                      {w.word}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* AI Analysis */}
        {error ? (
          <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--rose-dark)', textAlign:'center' }}>{error}</p>
        ) : (
          <div style={{
            background:   'white',
            border:       '1.5px solid #E8D5C0',
            borderRadius: 20,
            padding:      '20px 18px',
            boxShadow:    '0 4px 20px rgba(180,120,80,0.1)',
          }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', marginBottom:12 }}>
              📋 تقرير AI المفصّل
            </p>
            <p style={{
              fontFamily: 'Tajawal,sans-serif',
              fontSize:   14,
              color:      'var(--text-dark)',
              lineHeight: 1.8,
              direction:  'rtl',
              whiteSpace: 'pre-wrap',
            }}>
              {analysis}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
