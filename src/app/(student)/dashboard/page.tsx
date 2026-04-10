'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChatIcon, PenIcon, BookOpenIcon, TrophyIcon,
  CameraIcon, MicIcon, StarIcon, FlameIcon,
} from '@/components/ui/Icons'

/* ─── Types ─────────────────────────────────────────── */
interface Profile {
  name:        string
  level:       number
  points:      number
  streak_days: number
}
interface Mission {
  id:           string
  title_ar:     string
  description_ar:string
  mission_type: string
  points_reward:number
  is_completed: boolean
}

/* ─── Level helpers ──────────────────────────────────── */
function lvlStr(l: number) {
  return ['','A1','A1+','A2','A2+','B1','B1+'][l] ?? 'A1'
}
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح النور'
  if (h < 18) return 'مساء النور'
  return 'مساء الخير'
}
function weekBoxes(streak: number) {
  return Array.from({ length: 7 }, (_, i) => i < (streak % 7 || 7))
}

/* ─── Word of the Day (static, rotated daily) ────────── */
const WORDS = [
  { word:'Magnificent', meaning:'رائع / باهر', example:'The story had a magnificent ending.' },
  { word:'Curious',     meaning:'فضولي',        example:'She was curious about the mystery.' },
  { word:'Whisper',     meaning:'يهمس',         example:'He whispered a secret in her ear.' },
  { word:'Adventure',  meaning:'مغامرة',        example:'Every novel is an adventure.' },
  { word:'Enchanted',  meaning:'مسحور / مبهور', example:'She felt enchanted by the forest.' },
  { word:'Discover',   meaning:'يكتشف',         example:'She loves to discover new worlds.' },
  { word:'Journey',    meaning:'رحلة',          example:'Writing is a journey of the soul.' },
]
function todayWord() {
  const day = Math.floor(Date.now() / 86400000)
  return WORDS[day % WORDS.length]
}

/* ─── Quick Actions ──────────────────────────────────── */
const ACTIONS = [
  {
    icon:  <ChatIcon    size={32} color="#E8789A" />,
    dot:   '#7ED8B5',
    label: 'مس نورا',
    sub:   'تحدثي معها',
    href:  '/chat',
    grad:  'linear-gradient(135deg,#FFF0F5,#FDF0FF)',
    accent:'#E8789A',
    badge: 'متصلة',
  },
  {
    icon:  <PenIcon     size={32} color="#9B72CF" />,
    dot:   null,
    label: 'روايتي',
    sub:   'اكتبي قصتك',
    href:  '/writing',
    grad:  'linear-gradient(135deg,#F5F0FF,#EBF8FF)',
    accent:'#9B72CF',
    badge: 'جديد',
  },
  {
    icon:  <BookOpenIcon size={32} color="#E8A020" />,
    dot:   null,
    label: 'كلماتي',
    sub:   'ذاكري الكلمات',
    href:  '/vocabulary',
    grad:  'linear-gradient(135deg,#FFF8E0,#FFF3CC)',
    accent:'#E8A020',
    badge: 'اليوم',
  },
  {
    icon:  <TrophyIcon  size={32} color="#7ED8B5" />,
    dot:   null,
    label: 'إنجازاتي',
    sub:   'شاركي بطولتك',
    href:  '/achievements',
    grad:  'linear-gradient(135deg,#E8FFF5,#E0F7FF)',
    accent:'#7ED8B5',
    badge: 'الجوائز',
  },
]

/* ════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter()
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [missions,     setMissions]     = useState<Mission[]>([])
  const [lastStory,    setLastStory]    = useState<{title:string,content:string,id:string} | null>(null)
  const [wordSaved,    setWordSaved]    = useState(false)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.ok ? r.json() : null),
      fetch('/api/mission').then(r => r.ok ? r.json() : null),
      fetch('/api/writing').then(r => r.ok ? r.json() : null),
    ]).then(([prof, mis, stories]) => {
      if (prof?.profile) setProfile(prof.profile)
      if (mis?.missions) setMissions(mis.missions)
      if (stories?.entries?.length) {
        const s = stories.entries[0]
        setLastStory({ title: s.title, content: s.content?.slice(0,120) ?? '', id: s.id })
      }
    }).finally(() => setLoading(false))
  }, [])

  const word          = todayWord()
  const doneMissions  = missions.filter(m => m.is_completed).length
  const totalMissions = missions.length || 3
  const pct           = totalMissions ? Math.round((doneMissions / totalMissions) * 100) : 0

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FDF6EC' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, animation:'float 4s ease-in-out infinite' }}>📖</div>
        <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', marginTop:12 }}>جاري التحميل...</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth:480, margin:'0 auto', paddingBottom:8 }}>

      {/* ══════════ HEADER ══════════ */}
      <div style={{
        background:   'linear-gradient(135deg,#FFECF0 0%,#F3EEFF 50%,#E8F5FF 100%)',
        borderRadius: '0 0 28px 28px',
        padding:      '20px 20px 24px',
        position:     'relative',
        overflow:     'hidden',
        marginBottom: 16,
      }}>
        {/* Soft bg circles */}
        <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,120,154,0.15),transparent)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-20, left:-20, width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle,rgba(155,114,207,0.12),transparent)', pointerEvents:'none' }} />

        {/* Greeting row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)', direction:'rtl' }}>
              {greeting()} ☀️
            </p>
            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:26,
              fontWeight:900,
              background:'linear-gradient(135deg,#E8789A,#9B72CF)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
              lineHeight:1.2,
              direction:'rtl',
            }}>
              {profile?.name ?? 'رزان'} ✨
            </h1>
          </div>
          {/* Level badge */}
          <div style={{
            background:   'linear-gradient(135deg,#E8A020,#F5C842)',
            borderRadius: 14,
            padding:      '8px 14px',
            textAlign:    'center',
            boxShadow:    '0 4px 12px rgba(232,160,32,0.3)',
          }}>
            <p style={{ fontSize:18, fontWeight:900, color:'white', lineHeight:1 }}>
              {lvlStr(profile?.level ?? 1)}
            </p>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:10, color:'rgba(255,255,255,0.85)', marginTop:2 }}>مستواكِ</p>
          </div>
        </div>

        {/* Streak row */}
        <div style={{
          background:   'rgba(255,255,255,0.7)',
          borderRadius: 14,
          padding:      '10px 14px',
          display:      'flex',
          alignItems:   'center',
          gap:          12,
        }}>
          <span style={{ fontSize:22 }}>🔥</span>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-mid)', direction:'rtl' }}>
              سلسلة {profile?.streak_days ?? 0} يوم
            </p>
            <div style={{ display:'flex', gap:4, marginTop:5 }}>
              {weekBoxes(profile?.streak_days ?? 0).map((done, i) => (
                <div key={i} style={{
                  width:14, height:14, borderRadius:4,
                  background: done
                    ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
                    : '#E8D5C0',
                }} />
              ))}
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:20, fontWeight:900, color:'var(--rose-dark)', lineHeight:1 }}>
              {profile?.points ?? 0}
            </p>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:10, color:'var(--text-soft)' }}>نقطة</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* ══════════ DAILY MISSION ══════════ */}
        <div style={{
          background:   'white',
          borderRadius: 20,
          padding:      '18px 18px',
          marginBottom: 16,
          border:       '1.5px solid #E8D5C0',
          boxShadow:    '0 4px 20px rgba(180,120,80,0.1)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', direction:'rtl' }}>
              مهام اليوم 🎯
            </p>
            <span style={{
              background:   'linear-gradient(135deg,#E8789A,#9B72CF)',
              color:        'white',
              borderRadius: 20,
              padding:      '3px 12px',
              fontSize:     12,
              fontWeight:   700,
              fontFamily:   'Tajawal,sans-serif',
            }}>
              {doneMissions}/{totalMissions}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ background:'#F5EAE0', borderRadius:99, height:8, marginBottom:14, overflow:'hidden' }}>
            <div style={{
              height:'100%',
              borderRadius:99,
              background:'linear-gradient(90deg,#E8789A,#9B72CF)',
              width:`${pct}%`,
              transition:'width 0.5s ease',
            }} />
          </div>

          {/* Mission list */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {missions.length === 0 ? (
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-soft)', textAlign:'center', direction:'rtl', padding:'8px 0' }}>
                لا توجد مهام اليوم — تحققي لاحقاً ✨
              </p>
            ) : (
              missions.map(m => (
                <div key={m.id} style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          10,
                  background:   m.is_completed ? 'rgba(126,216,181,0.1)' : '#FAFAFA',
                  borderRadius: 12,
                  padding:      '10px 12px',
                  border:       `1px solid ${m.is_completed ? 'rgba(126,216,181,0.4)' : '#F0E8DF'}`,
                }}>
                  <span style={{ fontSize:20 }}>{m.is_completed ? '✅' : '⭕'}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700, color:'var(--text-dark)', direction:'rtl' }}>
                      {m.title_ar}
                    </p>
                    <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:11, color:'var(--text-soft)', direction:'rtl' }}>
                      +{m.points_reward} نقطة
                    </p>
                  </div>
                  {!m.is_completed && (
                    <button
                      onClick={() => router.push('/chat')}
                      style={{
                        background:   'linear-gradient(135deg,#E8789A,#9B72CF)',
                        color:        'white',
                        border:       'none',
                        borderRadius: 10,
                        padding:      '6px 12px',
                        fontSize:     12,
                        fontWeight:   700,
                        fontFamily:   'Tajawal,sans-serif',
                        cursor:       'pointer',
                        whiteSpace:   'nowrap',
                      }}
                    >
                      ابدئي
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══════════ QUICK ACTIONS 2×2 ══════════ */}
        <p className="section-title" style={{ paddingRight:0 }}>ابدئي الآن 🚀</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {ACTIONS.map(a => (
            <button
              key={a.href}
              onClick={() => router.push(a.href)}
              style={{
                background:   a.grad,
                border:       '1.5px solid rgba(232,213,192,0.5)',
                borderRadius: 18,
                padding:      '16px 14px',
                textAlign:    'right',
                cursor:       'pointer',
                boxShadow:    '0 2px 12px rgba(180,120,80,0.08)',
                position:     'relative',
                overflow:     'hidden',
              }}
            >
              <span style={{
                position:   'absolute', top:10, left:10,
                background: 'rgba(255,255,255,0.7)',
                borderRadius:20, padding:'2px 8px',
                fontSize:10, fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)',
                fontWeight:700,
              }}>
                {a.badge}
              </span>
              <div style={{ marginBottom:6 }}>{a.icon}</div>
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:900, color:'var(--text-dark)', direction:'rtl' }}>
                {a.label}
              </p>
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-mid)', direction:'rtl' }}>
                {a.sub}
              </p>
            </button>
          ))}
        </div>

        {/* ══════════ WORD OF THE DAY ══════════ */}
        <div style={{
          background:   'linear-gradient(135deg,#FFFDE0,#FFF8C0)',
          borderRadius: 20,
          padding:      '18px 18px',
          marginBottom: 16,
          border:       '1.5px solid rgba(232,160,32,0.25)',
          boxShadow:    '0 4px 16px rgba(232,160,32,0.1)',
        }}>
          <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)', marginBottom:8, direction:'rtl' }}>
            كلمة اليوم 📖
          </p>
          <p style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, color:'var(--text-dark)', marginBottom:4, direction:'ltr' }}>
            {word.word}
          </p>
          <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, color:'var(--text-mid)', marginBottom:6, direction:'rtl' }}>
            {word.meaning}
          </p>
          <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-soft)', marginBottom:14, direction:'ltr', fontStyle:'italic' }}>
            &ldquo;{word.example}&rdquo;
          </p>
          <button
            onClick={() => setWordSaved(true)}
            disabled={wordSaved}
            style={{
              background:   wordSaved ? 'rgba(126,216,181,0.3)' : 'linear-gradient(135deg,#E8A020,#F5C842)',
              color:        wordSaved ? '#3D7A5C' : 'white',
              border:       'none',
              borderRadius: 12,
              padding:      '10px 20px',
              fontSize:     13,
              fontWeight:   700,
              fontFamily:   'Tajawal,sans-serif',
              cursor:       wordSaved ? 'default' : 'pointer',
              width:        '100%',
              boxShadow:    wordSaved ? 'none' : '0 4px 12px rgba(232,160,32,0.3)',
            }}
          >
            {wordSaved ? '✅ تم الحفظ!' : 'حفظت الكلمة ⭐'}
          </button>
        </div>

        {/* ══════════ LAST STORY ══════════ */}
        {lastStory && (
          <div style={{
            background:   'white',
            borderRadius: 20,
            padding:      '18px 18px',
            marginBottom: 16,
            border:       '1.5px solid #E8D5C0',
            boxShadow:    '0 4px 20px rgba(180,120,80,0.08)',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700, color:'var(--text-dark)', direction:'rtl' }}>
                ✍️ آخر قصة كتبتيها
              </p>
              <span style={{ fontSize:20 }}>📚</span>
            </div>
            <p style={{
              fontFamily:'var(--font-display)',
              fontSize:16,
              fontWeight:700,
              color:'var(--text-dark)',
              marginBottom:6,
              direction:'rtl',
            }}>
              {lastStory.title}
            </p>
            <p style={{
              fontFamily:'Tajawal,sans-serif',
              fontSize:13,
              color:'var(--text-mid)',
              lineHeight:1.6,
              direction:'ltr',
              marginBottom:14,
              display:'-webkit-box',
              WebkitLineClamp:3,
              WebkitBoxOrient:'vertical',
              overflow:'hidden',
            }}>
              {lastStory.content}...
            </p>
            <button
              onClick={() => router.push('/writing')}
              style={{
                background:   'linear-gradient(135deg,#C8A8E9,#E8789A)',
                color:        'white',
                border:       'none',
                borderRadius: 12,
                padding:      '10px 20px',
                fontSize:     13,
                fontWeight:   700,
                fontFamily:   'Tajawal,sans-serif',
                cursor:       'pointer',
                width:        '100%',
                boxShadow:    '0 4px 12px rgba(200,100,150,0.25)',
              }}
            >
              أكملي القصة ✍️
            </button>
          </div>
        )}

        {/* ══════════ ADVENTURE CARDS ══════════ */}
        <p className="section-title" style={{ paddingRight:0 }}>مغامرات اليوم 🌟</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:16, paddingBottom:4 }}>
          {[
            { icon:<CameraIcon size={34} color="#3DAA88"/>, label:'ماذا ترين؟', href:'/camera', grad:'linear-gradient(135deg,#E0FFF8,#C8F5E8)' },
            { icon:<MicIcon    size={34} color="#E8789A"/>, label:'تحدثي',       href:'/voice',  grad:'linear-gradient(135deg,#FFF0F5,#FFE0EE)' },
            { icon:<BookOpenIcon size={34} color="#9B72CF"/>, label:'قصتي',     href:'/story',  grad:'linear-gradient(135deg,#F5F0FF,#EDE0FF)' },
          ].map(a => (
            <button
              key={a.href}
              onClick={() => router.push(a.href)}
              style={{
                flex:         1,
                minWidth:     72,
                minHeight:    88,
                display:      'flex',
                flexDirection:'column',
                alignItems:   'center',
                justifyContent:'center',
                gap:          6,
                background:   a.grad,
                border:       '1.5px solid rgba(232,213,192,0.5)',
                borderRadius: 20,
                cursor:       'pointer',
                boxShadow:    '0 2px 10px rgba(180,120,80,0.08)',
                transition:   'transform 0.15s',
              }}
              onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onPointerUp={e   => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {a.icon}
              <span style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, fontWeight:700, color:'var(--text-dark)' }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
