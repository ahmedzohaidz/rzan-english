'use client'
import { useRef, useState } from 'react'
import { speak } from '@/lib/tts'

interface VisionResult {
  word:            string
  meaning_ar:      string
  sentence:        string
  emoji:           string
  detective_note?: string
}

export default function CameraPage() {
  const [image,   setImage]   = useState<string | null>(null)
  const [result,  setResult]  = useState<VisionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setImage(dataUrl)
      setLoading(true)
      setSaved(false)
      setResult(null)

      const base64 = dataUrl.split(',')[1]
      const mime   = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      try {
        const res  = await fetch('/api/vision', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ imageBase64: base64, mediaType: mime }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); return }
        setResult(data)
        // نطق الكلمة تلقائياً
        speak(data.word, 'en')
      } catch {
        setError('تعذّر تحليل الصورة، حاولي مرة أخرى')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function saveWord() {
    if (!result) return
    try {
      await fetch('/api/vocabulary/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          word:             result.word,
          meaning_ar:       result.meaning_ar,
          example_sentence: result.sentence,
        }),
      })
      setSaved(true)
    } catch { /* silent */ }
  }

  function reset() {
    setImage(null)
    setResult(null)
    setError('')
    setSaved(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="min-h-screen p-5"
      style={{ background: 'linear-gradient(160deg,#F0FFF8,#FFF5F0,#F5F0FF)' }}>

      {/* Header */}
      <h1 className="text-2xl font-black text-center mb-1"
        style={{ fontFamily:'var(--font-display)', background:'linear-gradient(135deg,#7ED8B5,#9B72CF)',
                 WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
        📸 ماذا ترين؟
      </h1>
      <p className="text-center text-sm mb-6" style={{ color:'var(--text-mid)', fontFamily:'Tajawal,sans-serif' }}>
        صوّري أي شيء وتعلمي اسمه بالإنجليزية!
      </p>

      {/* Camera trigger */}
      {!image && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-44 h-44 rounded-3xl flex flex-col items-center justify-center gap-3 text-white font-black text-lg shadow-2xl active:scale-95 transition-transform"
            style={{ background:'linear-gradient(135deg,#7ED8B5,#9B72CF)' }}>
            <span className="text-5xl">📷</span>
            <span style={{ fontFamily:'Tajawal,sans-serif' }}>التقطي صورة</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCapture}
          />
          <p className="text-xs text-center" style={{ color:'var(--text-soft)', fontFamily:'Tajawal,sans-serif' }}>
            جربي: فنجان ☕ كتاب 📚 قطة 🐱 شجرة 🌳
          </p>

          {/* Examples */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, width:'100%', maxWidth:320, marginTop:8 }}>
            {['☕','📚','🐱','🌳','🌸','✏️','📱','🎒'].map(e => (
              <div key={e} style={{ background:'white', borderRadius:14, padding:'12px 8px',
                                    textAlign:'center', fontSize:24, border:'1.5px solid #E8D5C0' }}>
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview + result */}
      {image && (
        <div className="flex flex-col items-center gap-4">
          <div style={{ position:'relative', width:'100%', maxWidth:360 }}>
            <img
              src={image}
              alt="captured"
              style={{ width:'100%', borderRadius:20, maxHeight:260, objectFit:'cover',
                       boxShadow:'0 8px 32px rgba(180,120,80,0.2)' }}
            />
            {loading && (
              <div style={{ position:'absolute', inset:0, background:'rgba(253,246,236,0.85)',
                            display:'flex', flexDirection:'column', alignItems:'center',
                            justifyContent:'center', borderRadius:20 }}>
                <div style={{ fontSize:48, animation:'float 4s ease-in-out infinite', marginBottom:8 }}>🔮</div>
                <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--text-mid)' }}>AI يحلل الصورة...</p>
              </div>
            )}
          </div>

          {error && (
            <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--rose-dark)', fontSize:14, direction:'rtl' }}>
              ⚠️ {error}
            </p>
          )}

          {result && !loading && (
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background:'white', border:'1.5px solid #E8D5C0',
                       boxShadow:'0 8px 32px rgba(180,120,80,0.12)', animation:'fadeUp 0.4s ease both' }}>

              <div className="text-center mb-4">
                <div style={{ fontSize:56, marginBottom:8, animation:'float 4s ease-in-out infinite' }}>
                  {result.emoji}
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:900, color:'var(--rose-dark)' }}>
                  {result.word}
                </div>
                <div style={{ fontFamily:'Tajawal,sans-serif', fontSize:18, color:'var(--text-mid)', marginTop:4 }}>
                  {result.meaning_ar}
                </div>
              </div>

              {/* Detective note (Gemini anime style) */}
              {result.detective_note && (
                <div style={{ background:'linear-gradient(135deg,#F5F0FF,#FFF0F5)', borderRadius:14,
                              padding:'10px 14px', marginBottom:12, fontSize:13,
                              fontFamily:'Tajawal,sans-serif', color:'#9B72CF', direction:'rtl' }}>
                  🔍 {result.detective_note}
                </div>
              )}

              {/* Example sentence */}
              <div style={{ background:'#FDF6EC', borderRadius:14, padding:'12px 16px',
                            marginBottom:12, fontStyle:'italic', color:'var(--text-mid)',
                            fontSize:14, direction:'ltr', textAlign:'left' }}>
                &ldquo;{result.sentence}&rdquo;
              </div>

              {/* Pronounce button */}
              <button
                onClick={() => speak(result.word, 'en')}
                style={{ width:'100%', marginBottom:10, background:'transparent',
                         border:'1.5px solid #E8D5C0', borderRadius:12, padding:'10px',
                         fontFamily:'Tajawal,sans-serif', fontSize:13, color:'var(--text-mid)',
                         cursor:'pointer' }}
              >
                🔊 اسمعي النطق مرة أخرى
              </button>

              <div style={{ display:'flex', gap:10 }}>
                <button
                  onClick={saveWord}
                  disabled={saved}
                  style={{
                    flex:1, padding:'12px 16px', borderRadius:14, border:'none',
                    cursor: saved ? 'default' : 'pointer',
                    background: saved
                      ? 'linear-gradient(135deg,#7ED8B5,#4FD8A0)'
                      : 'linear-gradient(135deg,#E8789A,#9B72CF)',
                    color:'white', fontSize:13, fontWeight:700,
                    fontFamily:'Tajawal,sans-serif',
                    boxShadow: saved ? 'none' : '0 4px 12px rgba(200,100,150,0.3)',
                  }}
                >
                  {saved ? '✅ محفوظة!' : '💾 احفظي الكلمة (+5 نقاط)'}
                </button>
                <button
                  onClick={reset}
                  style={{ padding:'12px 14px', borderRadius:14, border:'1.5px solid #E8D5C0',
                           background:'#FDF6EC', color:'var(--text-mid)',
                           fontFamily:'Tajawal,sans-serif', fontSize:13, cursor:'pointer' }}
                >
                  📷 جديد
                </button>
              </div>
            </div>
          )}

          {!result && !loading && (
            <button onClick={reset} className="btn-secondary">
              📷 صورة جديدة
            </button>
          )}
        </div>
      )}
    </div>
  )
}
