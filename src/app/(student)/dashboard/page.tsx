'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChatIcon, PenIcon, BookOpenIcon, TrophyIcon,
  CameraIcon, MicIcon, StarIcon, FlameIcon,
} from '@/components/ui/Icons'

/* ─── Types ─────────────────────────────────────────── */
interface Profile { name:string; level:number; points:number; streak_days:number }
interface Mission  { id:string; title_ar:string; description_ar:string; mission_type:string; points_reward:number; is_completed:boolean }

/* ─── Helpers ────────────────────────────────────────── */
function lvlStr(l:number) { return ['','A1','A1+','A2','A2+','B1','B1+'][l] ?? 'A1' }
function nextLvlStr(l:number) { return ['','A1+','A2','A2+','B1','B1+','B2'][l] ?? 'A1+' }
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح النور'
  if (h < 18) return 'مساء النور'
  return 'مساء الخير'
}
/* XP needed per level (cumulative thresholds) */
function xpForLevel(l:number) { return [0,0,100,250,450,700,1000][l] ?? 100 }
function xpForNextLevel(l:number) { return [0,100,250,450,700,1000,1400][l] ?? 200 }

const WORDS = [
  { word:'Magnificent', meaning:'رائع / باهر',  example:'The story had a magnificent ending.' },
  { word:'Curious',     meaning:'فضولي',         example:'She was curious about the mystery.' },
  { word:'Whisper',     meaning:'يهمس',          example:'He whispered a secret in her ear.'  },
  { word:'Adventure',  meaning:'مغامرة',         example:'Every novel is an adventure.'       },
  { word:'Enchanted',  meaning:'مسحور / مبهور',  example:'She felt enchanted by the forest.'  },
  { word:'Discover',   meaning:'يكتشف',          example:'She loves to discover new worlds.'  },
  { word:'Journey',    meaning:'رحلة',           example:'Writing is a journey of the soul.'  },
]
function todayWord() { return WORDS[Math.floor(Date.now()/86400000) % WORDS.length] }

const CONFETTI_COLORS = ['#7C3AED','#E8789A','#F59E0B','#7ED8B5','#C8A8E9','#FDE8A0']

/* ─── Quick Actions ──────────────────────────────────── */
const ACTIONS = [
  { icon:<ChatIcon     size={28} color="#7C3AED"/>, label:'مس نورا',   sub:'معلمتك',       href:'/chat',        bg:'#F5F0FF', border:'#DDD5F5', dot:'#7ED8B5' },
  { icon:<PenIcon      size={28} color="#E8789A"/>, label:'روايتي',    sub:'اكتبي',        href:'/writing',     bg:'#FFF0F5', border:'#F5D5E5', dot:null },
  { icon:<BookOpenIcon size={28} color="#F59E0B"/>, label:'كلماتي',   sub:'ذاكري',        href:'/vocabulary',  bg:'#FFFBEB', border:'#F5E8C0', dot:null },
  { icon:<TrophyIcon   size={28} color="#7ED8B5"/>, label:'إنجازاتي', sub:'جوائزك',       href:'/achievements',bg:'#F0FFF8', border:'#C8F0E0', dot:null },
]

/* ════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter()
  const [profile,     setProfile]     = useState<Profile|null>(null)
  const [missions,    setMissions]    = useState<Mission[]>([])
  const [wordSaved,   setWordSaved]   = useState(false)
  const [wordFlipped, setWordFlipped] = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [streakPopped,setStreakPopped]= useState(false)
  const [particles,   setParticles]   = useState<{id:number;x:number;y:number;text:string}[]>([])
  const [confetti,    setConfetti]    = useState<{id:number;x:number;y:number;color:string;delay:number}[]>([])
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.ok ? r.json() : null),
      fetch('/api/mission').then(r => r.ok ? r.json() : null),
    ]).then(([prof, mis]) => {
      if (prof?.profile) setProfile(prof.profile)
      if (mis?.missions) setMissions(mis.missions)
    }).finally(() => setLoading(false))
  }, [])

  /* ── Spawn +XP float particle ── */
  const spawnXP = useCallback((amount:number, el:HTMLElement|null) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const id   = Date.now()
    setParticles(p => [...p, { id, x: rect.left + rect.width/2 - 20, y: rect.top - 10, text:`+${amount} ⭐` }])
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 1200)
  }, [])

  /* ── Spawn confetti burst ── */
  const spawnConfetti = useCallback((el:HTMLElement|null) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width/2
    const cy = rect.top  + rect.height/2
    const pieces = Array.from({length:12}, (_,i) => ({
      id:    Date.now() + i,
      x:     cx + (Math.random()-0.5)*80,
      y:     cy + (Math.random()-0.5)*40,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: i * 40,
    }))
    setConfetti(p => [...p, ...pieces])
    setTimeout(() => setConfetti(p => p.filter(c => !pieces.find(x=>x.id===c.id))), 1000)
  }, [])

  const word          = todayWord()
  const doneMissions  = missions.filter(m => m.is_completed).length
  const totalMissions = missions.length || 3
  const missPct       = totalMissions ? Math.round((doneMissions/totalMissions)*100) : 0

  /* XP progress to next level */
  const lvl       = profile?.level ?? 1
  const xpTotal   = profile?.points ?? 0
  const xpFloor   = xpForLevel(lvl)
  const xpCeil    = xpForNextLevel(lvl)
  const xpInLevel = Math.max(0, xpTotal - xpFloor)
  const xpRange   = Math.max(1, xpCeil - xpFloor)
  const xpPct     = Math.min(100, Math.round((xpInLevel/xpRange)*100))

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F7F3FF'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:52,animation:'float 3s ease-in-out infinite'}}>📖</div>
        <p style={{fontFamily:'Tajawal,sans-serif',color:'var(--text-mid)',marginTop:12,fontSize:14}}>جاري التحميل...</p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Fixed particles (portaled to viewport) ── */}
      {particles.map(p => (
        <div key={p.id} className="xp-particle" style={{left:p.x,top:p.y,position:'fixed'}}>{p.text}</div>
      ))}
      {confetti.map(c => (
        <div key={c.id} className="confetti-piece"
          style={{left:c.x,top:c.y,position:'fixed',background:c.color,animationDelay:`${c.delay}ms`}} />
      ))}

      <div style={{maxWidth:480,margin:'0 auto',paddingBottom:96}}>

        {/* ══ HERO CARD ══════════════════════════════════ */}
        <div ref={heroRef} style={{
          background:   'linear-gradient(145deg,#4C1D95 0%,#7C3AED 55%,#A855F7 100%)',
          borderRadius: '0 0 32px 32px',
          padding:      '24px 20px 28px',
          position:     'relative',
          overflow:     'hidden',
          marginBottom: 14,
          boxShadow:    '0 8px 32px rgba(76,29,149,0.35)',
        }}>
          {/* Ambient blobs */}
          <div style={{position:'absolute',top:-40,right:-30,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.07)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-30,left:-20,width:110,height:110,borderRadius:'50%',background:'rgba(245,158,11,0.12)',pointerEvents:'none'}}/>

          {/* Top row: greeting + level badge */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <div>
              <p style={{fontFamily:'Tajawal,sans-serif',fontSize:13,color:'rgba(255,255,255,0.7)',direction:'rtl',marginBottom:2}}>
                {greeting()} 👋
              </p>
              <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900,color:'white',lineHeight:1.15,direction:'rtl'}}>
                {profile?.name ?? 'رزان'} ✨
              </h1>
            </div>
            {/* Level badge */}
            <div style={{
              background:'linear-gradient(135deg,#F59E0B,#FBBF24)',
              borderRadius:16,padding:'10px 16px',textAlign:'center',
              boxShadow:'0 4px 16px rgba(245,158,11,0.45)',
              flexShrink:0,
            }}>
              <p style={{fontSize:20,fontWeight:900,color:'white',lineHeight:1,fontFamily:'var(--font-display)'}}>
                {lvlStr(lvl)}
              </p>
              <p style={{fontFamily:'Tajawal,sans-serif',fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2,letterSpacing:'0.04em'}}>
                مستواكِ
              </p>
            </div>
          </div>

          {/* XP progress to next level */}
          <div style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontFamily:'Tajawal,sans-serif',fontSize:11,color:'rgba(255,255,255,0.65)'}}>
                {xpInLevel} / {xpRange} XP
              </span>
              <span style={{fontFamily:'Tajawal,sans-serif',fontSize:11,color:'rgba(255,255,255,0.65)'}}>
                → {nextLvlStr(lvl)}
              </span>
            </div>
            <div style={{background:'rgba(255,255,255,0.18)',borderRadius:99,height:8,overflow:'hidden'}}>
              <div style={{
                height:'100%',borderRadius:99,
                background:'linear-gradient(90deg,#FBBF24,#F59E0B)',
                width:`${xpPct}%`,
                transition:'width 1s cubic-bezier(.4,0,.2,1)',
                boxShadow:'0 0 8px rgba(251,191,36,0.6)',
              }}/>
            </div>
          </div>

          {/* Streak + points row */}
          <div style={{
            background:'rgba(255,255,255,0.12)',
            backdropFilter:'blur(8px)',
            borderRadius:16,padding:'10px 14px',
            display:'flex',alignItems:'center',gap:12,
            border:'1px solid rgba(255,255,255,0.15)',
          }}>
            <button
              onClick={() => {
                setStreakPopped(true)
                setTimeout(() => setStreakPopped(false), 700)
              }}
              style={{
                background:'none',border:'none',padding:0,cursor:'pointer',
                fontSize:26,
                animation: streakPopped ? 'streakPop 0.6s ease both' : 'none',
                display:'block',
              }}
            >
              🔥
            </button>
            <div style={{flex:1}}>
              <p style={{fontFamily:'Tajawal,sans-serif',fontSize:12,color:'rgba(255,255,255,0.8)',direction:'rtl',marginBottom:5}}>
                سلسلة <strong style={{color:'white'}}>{profile?.streak_days ?? 0}</strong> يوم
              </p>
              {/* 7-day boxes */}
              <div style={{display:'flex',gap:4}}>
                {Array.from({length:7},(_,i) => i < ((profile?.streak_days ?? 0) % 7 || (profile?.streak_days ?? 0) >= 7 ? 7 : (profile?.streak_days ?? 0))).map((done,i) => (
                  <div key={i} style={{
                    width:16,height:10,borderRadius:3,
                    background: done ? 'linear-gradient(90deg,#FBBF24,#F59E0B)' : 'rgba(255,255,255,0.2)',
                    boxShadow: done ? '0 0 6px rgba(251,191,36,0.5)' : 'none',
                    transition:'background 0.3s',
                  }}/>
                ))}
              </div>
            </div>
            <div style={{textAlign:'center',borderRight:'1px solid rgba(255,255,255,0.2)',paddingRight:12}}>
              <p style={{fontSize:22,fontWeight:900,color:'#FBBF24',lineHeight:1,fontFamily:'var(--font-display)'}}>
                {profile?.points ?? 0}
              </p>
              <p style={{fontFamily:'Tajawal,sans-serif',fontSize:10,color:'rgba(255,255,255,0.65)'}}>نقطة</p>
            </div>
          </div>
        </div>

        <div style={{padding:'0 14px'}}>

          {/* ══ MISSION CARD ════════════════════════════ */}
          <div style={{
            background:'white',borderRadius:22,marginBottom:14,overflow:'hidden',
            border:'1.5px solid var(--border)',
            boxShadow:'0 6px 24px var(--shadow)',
            animation:'fadeUp 0.4s ease both',
          }}>
            {/* Gradient header strip */}
            <div style={{
              background:'linear-gradient(90deg,#7C3AED,#A855F7)',
              padding:'12px 16px',
              display:'flex',justifyContent:'space-between',alignItems:'center',
            }}>
              <p style={{fontFamily:'Tajawal,sans-serif',fontSize:14,fontWeight:900,color:'white',direction:'rtl'}}>
                مهام اليوم 🎯
              </p>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{
                  background:'rgba(255,255,255,0.22)',borderRadius:99,
                  padding:'2px 10px',fontFamily:'Tajawal,sans-serif',
                  fontSize:12,fontWeight:900,color:'white',
                }}>
                  {doneMissions}/{totalMissions}
                </div>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.85)',fontFamily:'Tajawal,sans-serif'}}>
                  {missPct}%
                </span>
              </div>
            </div>
            {/* Progress */}
            <div style={{height:5,background:'#EDE9FE',overflow:'hidden'}}>
              <div style={{
                height:'100%',background:'linear-gradient(90deg,#7C3AED,#E8789A)',
                width:`${missPct}%`,transition:'width 0.7s ease',
              }}/>
            </div>
            {/* Missions list */}
            <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:8}}>
              {missions.length === 0 ? (
                <p style={{fontFamily:'Tajawal,sans-serif',fontSize:13,color:'var(--text-soft)',textAlign:'center',direction:'rtl',padding:'12px 0'}}>
                  لا توجد مهام اليوم — تحققي لاحقاً ✨
                </p>
              ) : missions.map(m => (
                <div key={m.id} style={{
                  display:'flex',alignItems:'center',gap:10,
                  background: m.is_completed ? '#F0FDF4' : '#FAFAFA',
                  borderRadius:14,padding:'10px 12px',
                  border:`1.5px solid ${m.is_completed ? '#86EFAC' : 'var(--border)'}`,
                  transition:'all 0.3s',
                }}>
                  <span className={m.is_completed ? 'check-bounce' : ''} style={{fontSize:20,flexShrink:0}}>
                    {m.is_completed ? '✅' : '⭕'}
                  </span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontFamily:'Tajawal,sans-serif',fontSize:13,fontWeight:700,color:'var(--text-dark)',direction:'rtl',lineHeight:1.3}}>
                      {m.title_ar}
                    </p>
                    <p style={{fontFamily:'Tajawal,sans-serif',fontSize:11,color:'var(--text-soft)',direction:'rtl',marginTop:2}}>
                      +{m.points_reward} نقطة
                    </p>
                  </div>
                  {!m.is_completed && (
                    <button onClick={() => router.push('/chat')} style={{
                      background:'linear-gradient(135deg,#7C3AED,#A855F7)',
                      color:'white',border:'none',borderRadius:10,
                      padding:'7px 13px',fontSize:12,fontWeight:700,
                      fontFamily:'Tajawal,sans-serif',cursor:'pointer',
                      whiteSpace:'nowrap',boxShadow:'0 3px 10px rgba(124,58,237,0.3)',
                    }}>
                      ابدئي ←
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ══ QUICK ACTIONS — horizontal scroll ═══════ */}
          <p className="section-title">ابدئي الآن 🚀</p>
          <div className="h-scroll" style={{paddingBottom:8,marginBottom:6}}>
            {ACTIONS.map((a,i) => (
              <button key={a.href} onClick={() => router.push(a.href)}
                className="pressable"
                style={{
                  flexShrink:0,
                  width:100,minHeight:100,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  gap:6,
                  background:a.bg,
                  border:`1.5px solid ${a.border}`,
                  borderRadius:20,cursor:'pointer',
                  boxShadow:'0 2px 10px var(--shadow)',
                  position:'relative',
                  animation:`fadeUp ${0.3+i*0.08}s ease both`,
                }}>
                {a.dot && (
                  <span style={{
                    position:'absolute',top:8,right:10,
                    width:8,height:8,borderRadius:'50%',
                    background:a.dot,
                    boxShadow:`0 0 0 2px white`,
                    animation:'pulseDot 2s ease-in-out infinite',
                  }}/>
                )}
                <div>{a.icon}</div>
                <div style={{textAlign:'center'}}>
                  <p style={{fontFamily:'Tajawal,sans-serif',fontSize:13,fontWeight:900,color:'var(--text-dark)'}}>
                    {a.label}
                  </p>
                  <p style={{fontFamily:'Tajawal,sans-serif',fontSize:10,color:'var(--text-soft)',marginTop:1}}>
                    {a.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* ══ WORD OF THE DAY — flip card ═════════════ */}
          <p className="section-title">كلمة اليوم 📖</p>
          <div className="flip-scene" style={{marginBottom:14}}>
            <div className={`flip-card${wordFlipped ? ' flipped' : ''}`}
              style={{minHeight:wordFlipped?200:160}}>

              {/* FRONT */}
              <div className="flip-face flip-front"
                onClick={() => !wordSaved && setWordFlipped(f => !f)}
                style={{
                  background:'linear-gradient(145deg,#FFFBEB,#FEF3C7)',
                  borderRadius:22,padding:'24px 20px',
                  border:'1.5px solid #FDE68A',
                  boxShadow:'0 6px 24px rgba(245,158,11,0.12)',
                  cursor:'pointer',minHeight:160,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  textAlign:'center',gap:8,
                }}>
                <p style={{fontFamily:'var(--font-display)',fontSize:38,fontWeight:900,color:'#92400E',direction:'ltr',lineHeight:1}}>
                  {word.word}
                </p>
                <p style={{fontFamily:'Tajawal,sans-serif',fontSize:12,color:'#B45309',opacity:0.8}}>
                  اضغطي لرؤية المعنى 👆
                </p>
              </div>

              {/* BACK */}
              <div className="flip-face flip-back"
                style={{
                  background:'white',
                  borderRadius:22,padding:'20px 18px',
                  border:'1.5px solid var(--border)',
                  boxShadow:'0 6px 24px var(--shadow)',
                  minHeight:200,
                }}>
                <div style={{textAlign:'center',marginBottom:12}}>
                  <p style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,color:'var(--primary)',direction:'ltr'}}>
                    {word.word}
                  </p>
                  <p style={{fontFamily:'Tajawal,sans-serif',fontSize:20,fontWeight:900,color:'var(--text-dark)',marginTop:4}}>
                    {word.meaning}
                  </p>
                </div>
                <div style={{
                  background:'#F7F3FF',borderRadius:14,padding:'10px 14px',
                  fontFamily:'Georgia,serif',fontSize:13,color:'var(--text-mid)',
                  direction:'ltr',textAlign:'left',fontStyle:'italic',marginBottom:12,
                }}>
                  &ldquo;{word.example}&rdquo;
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={() => setWordFlipped(false)}
                    style={{
                      flex:1,background:'transparent',border:'1.5px solid var(--border)',
                      borderRadius:12,padding:'9px 0',fontFamily:'Tajawal,sans-serif',
                      fontSize:12,color:'var(--text-mid)',cursor:'pointer',
                    }}>
                    ← للخلف
                  </button>
                  <button
                    ref={el => { /* attach xp spawn */ }}
                    onClick={(e) => {
                      if (wordSaved) return
                      setWordSaved(true)
                      spawnXP(10, e.currentTarget)
                      spawnConfetti(e.currentTarget)
                    }}
                    disabled={wordSaved}
                    style={{
                      flex:2,border:'none',borderRadius:12,
                      padding:'9px 0',fontFamily:'Tajawal,sans-serif',
                      fontSize:13,fontWeight:900,cursor: wordSaved ? 'default' : 'pointer',
                      background: wordSaved
                        ? 'linear-gradient(135deg,#7ED8B5,#4ADE80)'
                        : 'linear-gradient(135deg,#F59E0B,#FBBF24)',
                      color:'white',
                      boxShadow: wordSaved ? 'none' : '0 4px 14px rgba(245,158,11,0.4)',
                      transition:'all 0.3s',
                    }}>
                    {wordSaved ? '✅ محفوظة!' : 'احفظي الكلمة ⭐'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ══ ADVENTURE CARDS ═════════════════════════ */}
          <p className="section-title">مغامرات اليوم 🌟</p>
          <div style={{display:'flex',gap:10,marginBottom:14}}>
            {[
              { emoji:'📸', label:'ماذا ترين؟', href:'/camera', bg:'linear-gradient(135deg,#D1FAE5,#A7F3D0)', border:'#6EE7B7' },
              { emoji:'🎙️', label:'تحدثي',       href:'/voice',  bg:'linear-gradient(135deg,#FCE7F3,#FBCFE8)', border:'#F9A8D4' },
              { emoji:'📚', label:'قصتي',        href:'/story',  bg:'linear-gradient(135deg,#EDE9FE,#DDD6FE)', border:'#C4B5FD' },
            ].map((a,i) => (
              <button key={a.href}
                onClick={() => router.push(a.href)}
                className="pressable"
                style={{
                  flex:1,minHeight:86,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
                  background:a.bg,border:`1.5px solid ${a.border}`,borderRadius:20,
                  cursor:'pointer',boxShadow:'0 2px 10px var(--shadow)',
                  animation:`fadeUp ${0.4+i*0.1}s ease both`,
                }}>
                <span style={{fontSize:28}}>{a.emoji}</span>
                <span style={{fontFamily:'Tajawal,sans-serif',fontSize:12,fontWeight:700,color:'var(--text-dark)'}}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
