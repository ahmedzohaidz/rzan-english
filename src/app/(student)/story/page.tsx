'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { speak } from '@/lib/tts'

interface StoryChapter {
  text:       string
  choices:    { a: string; b: string } | null
  chapterNum: number
  finished:   boolean
}

const THEMES = [
  { id:'mystery', label:'🔍 غموض المدرسة',  emoji:'🏫', grad:'linear-gradient(135deg,#FFF0E0,#FFE4CC)' },
  { id:'magic',   label:'🪄 العالم السحري',  emoji:'🌟', grad:'linear-gradient(135deg,#F5F0FF,#EDE4FF)' },
  { id:'ocean',   label:'🌊 مغامرة البحر',   emoji:'🐬', grad:'linear-gradient(135deg,#E0F5FF,#CCE8FF)' },
  { id:'space',   label:'🚀 رحلة الفضاء',   emoji:'🌙', grad:'linear-gradient(135deg,#E8E0FF,#D4CCFF)' },
  { id:'forest',  label:'🌲 سر الغابة',      emoji:'🦋', grad:'linear-gradient(135deg,#E0FFE8,#CCFFCC)' },
]

export default function StoryPage() {
  const router  = useRouter()
  const [story,    setStory]    = useState<StoryChapter | null>(null)
  const [history,  setHistory]  = useState<string[]>([])
  const [loading,  setLoading]  = useState(false)
  const [theme,    setTheme]    = useState('')
  const [error,    setError]    = useState('')

  async function startStory(selectedTheme: string) {
    setTheme(selectedTheme)
    setLoading(true)
    setHistory([])
    setError('')
    try {
      const res  = await fetch('/api/story', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ theme: selectedTheme }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setStory(data)
    } catch {
      setError('تعذّر إنشاء القصة')
    } finally {
      setLoading(false)
    }
  }

  async function makeChoice(choice: 'a' | 'b') {
    if (!story?.choices) return
    const chosen     = choice === 'a' ? story.choices.a : story.choices.b
    const newHistory = [...history, chosen]
    setHistory(newHistory)
    setLoading(true)
    try {
      const res  = await fetch('/api/story/choice', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ theme, history: newHistory, chapterNum: story.chapterNum + 1 }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setStory(data)
    } catch {
      setError('تعذّر المتابعة')
    } finally {
      setLoading(false)
    }
  }

  /* ── Theme picker ── */
  if (!story && !loading) return (
    <div className="min-h-screen p-5" style={{ background:'#FDF6EC' }}>
      <h1 className="text-2xl font-black text-center mb-1"
        style={{
          fontFamily:           'var(--font-display)',
          background:           'linear-gradient(135deg,#E8789A,#9B72CF,#E8A020)',
          backgroundSize:       '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
          animation:            'shimmer 4s linear infinite',
        }}>
        ✨ قصتك الإنجليزية
      </h1>
      <p className="text-center text-sm mb-6" style={{ color:'var(--text-mid)', fontFamily:'Tajawal,sans-serif' }}>
        أنتِ البطلة — اختاري مغامرتك!
      </p>
      {error && (
        <p style={{ color:'var(--rose-dark)', fontFamily:'Tajawal,sans-serif', textAlign:'center', marginBottom:16 }}>{error}</p>
      )}
      <div className="flex flex-col gap-3">
        {THEMES.map(t => (
          <button key={t.id} onClick={() => startStory(t.id)}
            className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-97"
            style={{ background:t.grad, border:'1.5px solid #E8D5C0',
                     boxShadow:'0 4px 16px rgba(180,120,80,0.1)', cursor:'pointer' }}>
            <span style={{ fontSize:36 }}>{t.emoji}</span>
            <span style={{ fontFamily:'Tajawal,sans-serif', fontSize:17, fontWeight:700, color:'var(--text-dark)' }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background:'linear-gradient(160deg,#FFF8F0,#FFF0F8,#F8F0FF)' }}>
      <div style={{ fontSize:56, animation:'float 4s ease-in-out infinite', marginBottom:16 }}>📖</div>
      <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', fontSize:15 }}>
        مس نورا تكتب قصتك...
      </p>
    </div>
  )

  /* ── Story ── */
  return (
    <div className="min-h-screen p-5"
      style={{ background:'linear-gradient(160deg,#FFF8F0,#FFF0F8,#F8F0FF)' }}>

      {/* Chapter dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            width:12, height:12, borderRadius:'50%',
            background: i < (story?.chapterNum ?? 0)
              ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
              : '#E8D5C0',
            transition:'background 0.3s',
          }} />
        ))}
      </div>

      {error && (
        <p style={{ color:'var(--rose-dark)', fontFamily:'Tajawal,sans-serif', textAlign:'center', marginBottom:12 }}>
          {error}
        </p>
      )}

      {story && !story.finished && (
        <div style={{ animation:'fadeUp 0.4s ease both' }}>
          {/* Story card */}
          <div style={{
            background:  'white',
            border:      '1.5px solid #E8D5C0',
            borderRadius:24,
            padding:     '22px 20px',
            marginBottom:20,
            boxShadow:   '0 8px 32px rgba(180,120,80,0.12)',
            lineHeight:  1.9,
            color:       'var(--text-dark)',
            fontFamily:  'Georgia, serif',
            direction:   'ltr',
            textAlign:   'left',
            fontSize:    15,
          }}>
            {story.text}
          </div>

          {/* Read aloud */}
          <button
            onClick={() => speak(story.text, 'en')}
            style={{ width:'100%', marginBottom:16, background:'transparent',
                     border:'1.5px solid #E8D5C0', borderRadius:14, padding:'10px',
                     fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)', cursor:'pointer' }}>
            🔊 اسمعي القصة بصوت عالٍ
          </button>

          {/* Choices */}
          <p style={{ fontFamily:'Tajawal,sans-serif', fontWeight:700, color:'var(--text-mid)',
                      textAlign:'center', marginBottom:12, fontSize:15 }}>
            ماذا تفعلين؟ 🤔
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {(['a','b'] as const).map(c => (
              <button key={c} onClick={() => makeChoice(c)}
                style={{
                  width:        '100%',
                  padding:      '16px 18px',
                  borderRadius: 16,
                  border:       `2px solid ${c === 'a' ? '#E8789A' : '#9B72CF'}`,
                  background:   c === 'a'
                    ? 'linear-gradient(135deg,#FFF0F5,#FFE4EE)'
                    : 'linear-gradient(135deg,#F5F0FF,#EDE4FF)',
                  color:        'var(--text-dark)',
                  fontFamily:   'Georgia, serif',
                  fontSize:     14,
                  lineHeight:   1.5,
                  cursor:       'pointer',
                  textAlign:    'left',
                  direction:    'ltr',
                  transition:   'transform 0.15s',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e   => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontWeight:900, color: c === 'a' ? 'var(--rose-dark)' : 'var(--lav-dark)', marginLeft:4 }}>
                  {c === 'a' ? 'A) ' : 'B) '}
                </span>
                {story.choices?.[c]}
              </button>
            ))}
          </div>

          {/* History breadcrumb */}
          {history.length > 0 && (
            <div style={{ marginTop:20, padding:'10px 14px', background:'rgba(255,255,255,0.6)',
                          borderRadius:14, border:'1px solid #E8D5C0' }}>
              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:11, color:'var(--text-soft)', marginBottom:6 }}>
                قراراتك السابقة:
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {history.map((h, i) => (
                  <span key={i} style={{
                    background:'rgba(232,120,154,0.1)', borderRadius:20,
                    padding:'3px 10px', fontSize:11, color:'var(--rose-dark)',
                    fontFamily:'Georgia,serif', direction:'ltr',
                  }}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Finished */}
      {story?.finished && (
        <div style={{ textAlign:'center', animation:'fadeUp 0.4s ease both' }}>
          <div style={{ fontSize:64, marginBottom:16, animation:'float 4s ease-in-out infinite' }}>🎉</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:900, color:'var(--text-dark)', marginBottom:8 }}>
            أتممتِ القصة!
          </h2>

          {/* Final chapter text */}
          {story.text && (
            <div style={{ background:'white', border:'1.5px solid #E8D5C0', borderRadius:20,
                          padding:'18px 18px', margin:'16px 0', lineHeight:1.9,
                          color:'var(--text-dark)', fontFamily:'Georgia,serif',
                          direction:'ltr', textAlign:'left', fontSize:14 }}>
              {story.text}
            </div>
          )}

          <div style={{ background:'linear-gradient(135deg,#FFF0F5,#F5F0FF)', borderRadius:16,
                        padding:'16px 20px', marginBottom:20, border:'1.5px solid #E8C8D8' }}>
            <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', fontSize:14 }}>
              قصتك محفوظة في روايتي ✨
            </p>
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:24, fontWeight:900, color:'var(--gold)', marginTop:4 }}>
              +50 نقطة 🌟
            </p>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => { setStory(null); setHistory([]); setTheme('') }}
              style={{ flex:1, padding:'14px', borderRadius:16, border:'none',
                       background:'linear-gradient(135deg,#E8789A,#9B72CF)',
                       color:'white', fontFamily:'Tajawal,sans-serif', fontWeight:700,
                       fontSize:14, cursor:'pointer', boxShadow:'0 4px 12px rgba(200,100,150,0.3)' }}>
              قصة جديدة ✨
            </button>
            <button
              onClick={() => router.push('/writing')}
              style={{ flex:1, padding:'14px', borderRadius:16, border:'1.5px solid #E8D5C0',
                       background:'white', color:'var(--text-mid)',
                       fontFamily:'Tajawal,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              روايتي 📚
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
