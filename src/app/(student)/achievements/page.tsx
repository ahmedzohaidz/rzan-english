'use client'
import { useState, useEffect } from 'react'
import { levelToString } from '@/types'

interface AchievementItem {
  id:              string
  icon:            string
  title_ar:        string
  description_ar:  string
  points:          number
  is_unlocked:     boolean
}
interface Stats {
  unlocked:      number
  total:         number
  points:        number
  level:         number
  streak:        number
  writingCount:  number
  missionsCount: number
  vocabCount:    number
}

/* Week points simulated from total */
function weekPts(total: number) { return Math.min(total, Math.round(total * 0.3)) }

/* The 9 static badges (merged with API data) */
const STATIC_BADGES = [
  { id:'first_story',     icon:'✍️', title:'كاتبة المستقبل',  desc:'اكتبي أول قصة',           pts:50  },
  { id:'streak_7',        icon:'🔥', title:'أسبوع كامل',       desc:'سلسلة 7 أيام',             pts:100 },
  { id:'vocab_50',        icon:'📚', title:'قارئة نهمة',       desc:'تعلّمي 50 كلمة',            pts:150 },
  { id:'level_a2',        icon:'⭐', title:'وصلت A2',          desc:'ترقّي مستوى',              pts:200 },
  { id:'stories_5',       icon:'🌟', title:'روائية',            desc:'اكتبي 5 قصص',              pts:250 },
  { id:'correct_30',      icon:'🎯', title:'دقة ١٠٠%',         desc:'30 إجابة صحيحة',           pts:100 },
  { id:'chat_20',         icon:'💬', title:'محادثة نشطة',      desc:'20 رسالة مع مس نورا',      pts:80  },
  { id:'word_14',         icon:'🔮', title:'كلمة يومياً',      desc:'14 يوم كلمة يومياً',       pts:200 },
  { id:'complete',        icon:'👑', title:'بطلة القصص',        desc:'إتمام المنهج',             pts:500 },
]

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [stats,        setStats]        = useState<Stats | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState<'all'|'unlocked'|'locked'>('all')

  useEffect(() => {
    fetch('/api/achievements')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.achievements?.length) {
          setAchievements(data.achievements)
          setStats(data.stats)
        } else {
          /* Fallback: show static badges locked */
          setAchievements(STATIC_BADGES.map(b => ({
            id: b.id, icon: b.icon, title_ar: b.title,
            description_ar: b.desc, points: b.pts, is_unlocked: false,
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered     = achievements.filter(a =>
    filter === 'all'      ? true :
    filter === 'unlocked' ? a.is_unlocked : !a.is_unlocked
  )
  const unlockedCount = achievements.filter(a => a.is_unlocked).length
  const totalPts      = stats?.points ?? 0
  const wPts          = weekPts(totalPts)

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FDF6EC' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, animation:'float 4s ease-in-out infinite' }}>🏆</div>
        <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', marginTop:12, direction:'rtl' }}>جاري التحميل...</p>
      </div>
    </div>
  )

  return (
    <div style={{ padding:'0 0 100px', maxWidth:520, margin:'0 auto' }}>

      {/* ══════════ POINTS BANNER ══════════ */}
      <div style={{
        background:   'linear-gradient(135deg,#E8789A 0%,#9B72CF 50%,#E8A020 100%)',
        borderRadius: '0 0 28px 28px',
        padding:      '24px 20px',
        marginBottom: 20,
        position:     'relative',
        overflow:     'hidden',
      }}>
        {/* Shimmer overlay */}
        <div style={{
          position:   'absolute', inset:0,
          background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.08) 50%,transparent 100%)',
          backgroundSize:'200% 100%',
          animation:  'shimmer 4s linear infinite',
          pointerEvents:'none',
        }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, color:'rgba(255,255,255,0.85)', direction:'rtl' }}>
            إنجازات رزان 🏆
          </p>
          <p style={{ fontSize:32, animation:'float 4s ease-in-out infinite' }}>🏆</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {[
            { val: totalPts,      label:'مجموع النقاط',    icon:'⭐' },
            { val: wPts,          label:'نقاط هذا الأسبوع', icon:'📈' },
            { val: unlockedCount, label:'إنجاز مفتوح',     icon:'🎖️' },
          ].map(({ val, label, icon }) => (
            <div key={label} style={{
              background:   'rgba(255,255,255,0.18)',
              borderRadius: 16,
              padding:      '12px 10px',
              textAlign:    'center',
              backdropFilter:'blur(8px)',
            }}>
              <p style={{ fontSize:20, marginBottom:4 }}>{icon}</p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'white', lineHeight:1 }}>{val}</p>
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:10, color:'rgba(255,255,255,0.8)', marginTop:3, direction:'rtl' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Level */}
        {stats && (
          <div style={{ marginTop:14, background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'rgba(255,255,255,0.85)', direction:'rtl' }}>
              المستوى الحالي
            </p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, color:'white' }}>
              {levelToString(stats.level)}
            </p>
          </div>
        )}
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* ══════════ FILTER TABS ══════════ */}
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          {(['all','unlocked','locked'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:      '8px 16px',
              borderRadius: 20,
              border:       `1.5px solid ${filter===f ? '#E8789A' : '#E8D5C0'}`,
              background:   filter===f ? 'rgba(232,120,154,0.1)' : 'white',
              color:        filter===f ? 'var(--rose-dark)' : 'var(--text-soft)',
              fontSize:     13,
              fontWeight:   filter===f ? 700 : 400,
              cursor:       'pointer',
              fontFamily:   'Tajawal,sans-serif',
            }}>
              {f==='all' ? '✨ الكل' : f==='unlocked' ? '✅ مفتوحة' : '🔒 مغلقة'}
            </button>
          ))}
        </div>

        {/* ══════════ BADGES GRID (3 cols) ══════════ */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {filtered.map(a => (
            <div key={a.id} style={{
              background:   a.is_unlocked
                ? 'linear-gradient(135deg,#FFFDE0,#FFF0C0)'
                : 'rgba(245,240,235,0.6)',
              border:       a.is_unlocked
                ? '1.5px solid rgba(232,160,32,0.4)'
                : '1.5px solid #E8D5C0',
              borderRadius: 16,
              padding:      '14px 10px',
              textAlign:    'center',
              position:     'relative',
              boxShadow:    a.is_unlocked
                ? '0 4px 16px rgba(232,160,32,0.2)'
                : 'none',
              opacity:      a.is_unlocked ? 1 : 0.65,
              overflow:     'hidden',
            }}>
              {/* Sparkle animation for unlocked */}
              {a.is_unlocked && (
                <div style={{
                  position:'absolute', top:6, right:6,
                  fontSize:10,
                  animation:'sparkle 3s ease-in-out infinite',
                }}>✨</div>
              )}

              {/* Lock for locked */}
              {!a.is_unlocked && (
                <div style={{
                  position:'absolute', top:6, right:6,
                  fontSize:11, color:'var(--text-soft)',
                }}>🔒</div>
              )}

              <p style={{
                fontSize:   30,
                marginBottom:6,
                filter:     a.is_unlocked ? 'none' : 'grayscale(0.6)',
                animation:  a.is_unlocked ? 'sparkle 3s ease-in-out infinite' : undefined,
              }}>
                {a.icon}
              </p>
              <p style={{
                fontFamily: 'Tajawal,sans-serif',
                fontSize:   11,
                fontWeight: 700,
                color:      a.is_unlocked ? '#7A4A00' : 'var(--text-mid)',
                direction:  'rtl',
                lineHeight: 1.3,
                marginBottom:4,
              }}>
                {a.title_ar}
              </p>
              <p style={{
                fontFamily:'Tajawal,sans-serif',
                fontSize:   9,
                color:      'var(--text-soft)',
                direction:  'rtl',
                lineHeight: 1.3,
                marginBottom:6,
              }}>
                {a.description_ar}
              </p>
              {a.is_unlocked && (
                <p style={{
                  fontFamily:   'Tajawal,sans-serif',
                  fontSize:     11,
                  fontWeight:   900,
                  color:        'var(--gold)',
                  background:   'rgba(232,160,32,0.12)',
                  borderRadius: 8,
                  padding:      '2px 8px',
                  display:      'inline-block',
                }}>
                  +{a.points}⭐
                </p>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign:'center', fontFamily:'Tajawal,sans-serif', color:'var(--text-soft)', fontSize:14, direction:'rtl', padding:'40px 0' }}>
            لا توجد إنجازات في هذه الفئة ✨
          </p>
        )}
      </div>
    </div>
  )
}
