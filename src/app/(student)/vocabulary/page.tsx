'use client'
import { useEffect, useState, useCallback } from 'react'
import { speak } from '@/lib/tts'
import {
  isDueForReview, getMasteryLevel,
  masteryLabel, masteryColor,
  type MasteryLevel,
} from '@/lib/spaced-repetition'

interface VocabWord {
  id:               string
  word:             string
  definition:       string
  example_sentence: string
  correct_count:    number
  review_count:     number
  difficulty:       number
  next_review:      string | null
  source:           string
}

type Tab = 'review' | 'all'

export default function VocabularyPage() {
  const [words,    setWords]    = useState<VocabWord[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('review')

  /* ── Flashcard state ─────────────────────────────────── */
  const [queue,    setQueue]    = useState<VocabWord[]>([])
  const [cardIdx,  setCardIdx]  = useState(0)
  const [flipped,  setFlipped]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [speaking, setSpeaking] = useState(false)

  /* ── Load words ──────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/vocabulary')
      const data = await res.json()
      setWords(Array.isArray(data) ? data : [])
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Build review queue on tab/words change ──────────── */
  useEffect(() => {
    if (tab === 'review') {
      const due = words.filter(w => isDueForReview(w.next_review))
      setQueue(due)
      setCardIdx(0)
      setFlipped(false)
      setDone(due.length === 0)
    }
  }, [tab, words])

  /* ── Review answer ───────────────────────────────────── */
  async function answer(wasCorrect: boolean) {
    const word = queue[cardIdx]
    if (!word) return

    await fetch('/api/vocabulary/review', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ wordId: word.id, wasCorrect }),
    })

    const next = cardIdx + 1
    if (next >= queue.length) { setDone(true); load() }
    else { setCardIdx(next); setFlipped(false) }
  }

  async function pronounce(word: string) {
    setSpeaking(true)
    await speak(word, 'en')
    setSpeaking(false)
  }

  const dueCount      = words.filter(w => isDueForReview(w.next_review)).length
  const masteredCount = words.filter(w => getMasteryLevel(w.correct_count, w.review_count) === 'mastered').length
  const currentCard   = queue[cardIdx]

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background:'linear-gradient(160deg,#F5F0FF,#FFF0F5)' }}>
      <div style={{ fontSize:48, animation:'float 4s ease-in-out infinite' }}>📚</div>
      <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', marginTop:12 }}>جاري تحميل كلماتك...</p>
    </div>
  )

  if (words.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background:'linear-gradient(160deg,#F5F0FF,#FFF0F5)' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
      <h2 style={{ fontFamily:'Tajawal,sans-serif', fontSize:22, fontWeight:900, color:'var(--text-dark)', textAlign:'center', marginBottom:8 }}>
        لا كلمات بعد!
      </h2>
      <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', textAlign:'center', fontSize:14, maxWidth:280 }}>
        التقطي صوراً بالكاميرا أو تحدثي مع مس نورا لتجميع كلماتك هنا ✨
      </p>
    </div>
  )

  return (
    <div className="min-h-screen pb-24" style={{ background:'linear-gradient(160deg,#F5F0FF,#FFF0F5)' }}>

      {/* Header */}
      <div style={{ padding:'20px 20px 0', textAlign:'center' }}>
        <h1 style={{
          fontFamily:           'var(--font-display)', fontSize:24, fontWeight:900,
          background:           'linear-gradient(135deg,#9B72CF,#E8789A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4,
        }}>
          📚 كلماتي
        </h1>
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:8 }}>
          {[
            { label:'إجمالي',   value: words.length,  color:'#9B72CF' },
            { label:'للمراجعة', value: dueCount,       color:'#E8789A' },
            { label:'محفوظة',   value: masteredCount,  color:'#4FD8A0' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontFamily:'Tajawal,sans-serif', fontSize:11, color:'var(--text-soft)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', margin:'16px 16px 0', borderRadius:14,
                    overflow:'hidden', border:'1.5px solid #E8D5C0', background:'white' }}>
        {(['review','all'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex:1, padding:'10px 0', border:'none', cursor:'pointer',
              fontFamily:'Tajawal,sans-serif', fontWeight:700, fontSize:13,
              background: tab === t ? 'linear-gradient(135deg,#9B72CF,#E8789A)' : 'white',
              color:      tab === t ? 'white' : 'var(--text-mid)',
              transition: 'all 0.2s',
            }}>
            {t === 'review' ? `🔁 مراجعة اليوم (${dueCount})` : '📋 كل الكلمات'}
          </button>
        ))}
      </div>

      {/* ── REVIEW MODE ──────────────────────────────────── */}
      {tab === 'review' && (
        <div style={{ padding:'20px 16px' }}>
          {done && (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
              <h2 style={{ fontFamily:'Tajawal,sans-serif', fontSize:20, fontWeight:900, color:'var(--text-dark)', marginBottom:8 }}>
                أتممتِ مراجعة اليوم!
              </h2>
              <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)', fontSize:14 }}>
                عودي غداً لمراجعة جديدة 🌟
              </p>
            </div>
          )}

          {!done && currentCard && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8,
                            fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-soft)' }}>
                <span>{cardIdx + 1} / {queue.length}</span>
                <span>{Math.round((cardIdx / queue.length) * 100)}%</span>
              </div>
              <div style={{ height:4, background:'#E8D5C0', borderRadius:4, marginBottom:20, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:4,
                              background:'linear-gradient(90deg,#9B72CF,#E8789A)',
                              width:`${(cardIdx / queue.length) * 100}%`,
                              transition:'width 0.3s' }} />
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setFlipped(f => !f)}
                style={{
                  background:    flipped ? 'linear-gradient(135deg,#F5F0FF,#FFF0F5)' : 'white',
                  border:        '2px solid #E8D5C0',
                  borderRadius:  24,
                  padding:       '32px 24px',
                  textAlign:     'center',
                  minHeight:     220,
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent:'center',
                  cursor:        'pointer',
                  boxShadow:     '0 8px 32px rgba(155,114,207,0.15)',
                  transition:    'all 0.3s',
                  userSelect:    'none',
                  animation:     'fadeUp 0.3s ease both',
                }}>

                {!flipped ? (
                  <>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:900,
                                  color:'var(--text-dark)', marginBottom:16 }}>
                      {currentCard.word}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); pronounce(currentCard.word) }}
                      style={{ background:'transparent', border:'1px solid #E8D5C0', borderRadius:20,
                               padding:'6px 16px', fontFamily:'Tajawal,sans-serif', fontSize:12,
                               color:'var(--text-mid)', cursor:'pointer', marginBottom:16 }}>
                      {speaking ? '🔊 جاري النطق...' : '🔊 اسمعي النطق'}
                    </button>
                    <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-soft)' }}>
                      اضغطي لرؤية المعنى 👆
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily:'Tajawal,sans-serif', fontSize:26, fontWeight:900,
                                  color:'#9B72CF', marginBottom:6 }}>
                      {currentCard.definition}
                    </div>
                    <div style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--text-soft)', marginBottom:12 }}>
                      {currentCard.word}
                    </div>
                    {currentCard.example_sentence && (
                      <div style={{ background:'rgba(155,114,207,0.08)', borderRadius:12,
                                    padding:'10px 16px', fontStyle:'italic', color:'var(--text-mid)',
                                    fontSize:13, direction:'ltr', textAlign:'left', width:'100%' }}>
                        &ldquo;{currentCard.example_sentence}&rdquo;
                      </div>
                    )}
                  </>
                )}
              </div>

              {flipped && (
                <div style={{ display:'flex', gap:12, marginTop:16, animation:'fadeUp 0.2s ease both' }}>
                  <button onClick={() => answer(false)}
                    style={{ flex:1, padding:'14px', borderRadius:16, border:'2px solid #E8789A',
                             background:'linear-gradient(135deg,#FFF0F5,#FFE4EE)',
                             color:'var(--rose-dark)', fontFamily:'Tajawal,sans-serif',
                             fontWeight:700, fontSize:15, cursor:'pointer' }}>
                    ✗ لم أتذكر
                  </button>
                  <button onClick={() => answer(true)}
                    style={{ flex:1, padding:'14px', borderRadius:16, border:'2px solid #4FD8A0',
                             background:'linear-gradient(135deg,#F0FFF8,#E0FFF0)',
                             color:'#2A9070', fontFamily:'Tajawal,sans-serif',
                             fontWeight:700, fontSize:15, cursor:'pointer' }}>
                    ✓ تذكرت!
                  </button>
                </div>
              )}

              <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:11, color:'var(--text-soft)',
                          textAlign:'center', marginTop:12 }}>
                {!flipped ? 'اضغطي على البطاقة لرؤية المعنى' : 'كيف كان أداؤكِ؟'}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── ALL WORDS LIST ──────────────────────────────── */}
      {tab === 'all' && (
        <div style={{ padding:'16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {words.map(word => {
              const mastery = getMasteryLevel(word.correct_count, word.review_count)
              const due     = isDueForReview(word.next_review)
              return (
                <div key={word.id} style={{
                  background:   'white',
                  borderRadius: 16,
                  padding:      '14px 16px',
                  border:       `1.5px solid ${due ? '#E8789A55' : '#E8D5C0'}`,
                  boxShadow:    '0 2px 8px rgba(180,120,80,0.08)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, color:'var(--text-dark)' }}>
                        {word.word}
                      </span>
                      <button onClick={() => pronounce(word.word)}
                        style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:15, padding:2 }}>
                        🔊
                      </button>
                    </div>
                    <span style={{
                      fontFamily:'Tajawal,sans-serif', fontSize:11, fontWeight:700,
                      color:       masteryColor(mastery as MasteryLevel),
                      background:  masteryColor(mastery as MasteryLevel) + '22',
                      padding:     '2px 10px', borderRadius:20,
                    }}>
                      {masteryLabel(mastery as MasteryLevel)}
                    </span>
                  </div>
                  <div style={{ fontFamily:'Tajawal,sans-serif', fontSize:14, color:'var(--text-mid)' }}>
                    {word.definition}
                  </div>
                  {word.example_sentence && (
                    <div style={{ fontFamily:'Georgia,serif', fontSize:12, color:'var(--text-soft)',
                                  marginTop:4, fontStyle:'italic', direction:'ltr', textAlign:'left' }}>
                      &ldquo;{word.example_sentence}&rdquo;
                    </div>
                  )}
                  <div style={{ display:'flex', gap:12, marginTop:6,
                                fontFamily:'Tajawal,sans-serif', fontSize:11, color:'var(--text-soft)' }}>
                    <span>✓ {word.correct_count}/{word.review_count}</span>
                    {due && <span style={{ color:'#E8789A', fontWeight:700 }}>● للمراجعة</span>}
                    <span style={{ marginRight:'auto', fontSize:10, color:'#C4A88E' }}>{word.source ?? 'يدوي'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
