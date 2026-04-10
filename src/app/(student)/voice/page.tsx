'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

type Status = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript,  setTranscript]  = useState('')
  const [response,    setResponse]    = useState('')
  const [status,      setStatus]      = useState<Status>('idle')
  const [supported,   setSupported]   = useState(true)
  const recognitionRef = useRef<any>(null)
  const transcriptRef  = useRef('')

  const sendToAI = useCallback(async (text: string) => {
    if (!text.trim()) { setStatus('idle'); return }
    setStatus('thinking')
    try {
      const res  = await fetch('/api/voice', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setResponse(data.reply)
      speakResponse(data.reply)
    } catch {
      setStatus('idle')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setSupported(false); return }

    const rec = new SR()
    rec.continuous     = false
    rec.interimResults = true
    rec.lang           = 'en-US'

    rec.onresult = (e: any) => {
      const text = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript).join('')
      setTranscript(text)
      transcriptRef.current = text
    }
    rec.onend = () => {
      setIsListening(false)
      sendToAI(transcriptRef.current)
    }
    rec.onerror = () => {
      setIsListening(false)
      setStatus('idle')
    }
    recognitionRef.current = rec
  }, [sendToAI])

  function startListening() {
    if (!recognitionRef.current) return
    setTranscript('')
    setResponse('')
    setStatus('listening')
    setIsListening(true)
    transcriptRef.current = ''
    recognitionRef.current.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setStatus('thinking')
  }

  function speakResponse(text: string) {
    setStatus('speaking')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = 'en-US'
    utterance.rate  = 0.85
    utterance.pitch = 1.1
    const trySpeak = () => {
      const voices = speechSynthesis.getVoices()
      const best   = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
                  || voices.find(v => v.lang.startsWith('en'))
      if (best) utterance.voice = best
      utterance.onend = () => setStatus('idle')
      speechSynthesis.speak(utterance)
    }
    if (speechSynthesis.getVoices().length > 0) trySpeak()
    else { speechSynthesis.onvoiceschanged = trySpeak }
  }

  const rippleStyle = isListening ? {
    boxShadow: '0 0 0 20px rgba(232,120,154,0.15), 0 0 0 40px rgba(232,120,154,0.08)',
  } : {
    boxShadow: '0 8px 32px rgba(180,120,80,0.2)',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg,#FFF0F8,#F5F0FF,#F0F5FF)' }}>

      {/* Blobs */}
      <div style={{ position:'absolute', top:0, right:0, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,120,154,0.15),transparent)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, left:0, width:150, height:150, borderRadius:'50%', background:'radial-gradient(circle,rgba(155,114,207,0.12),transparent)', pointerEvents:'none' }} />

      {/* Avatar */}
      <div className="text-7xl mb-4 select-none" style={{ animation:'float 4s ease-in-out infinite' }}>
        👩‍🏫
      </div>
      <h1 className="text-2xl font-black text-center mb-1"
        style={{ fontFamily:'var(--font-display)', color:'var(--text-dark)' }}>
        مس نورا الصوتية
      </h1>
      <p className="text-sm mb-8 text-center" style={{ color:'var(--text-mid)' }}>
        تحدثي معها بالإنجليزية 🎙️
      </p>

      {!supported && (
        <div style={{ background:'#FFF0F0', border:'1.5px solid #E8789A', borderRadius:16, padding:'16px 20px', marginBottom:20, textAlign:'center' }}>
          <p style={{ fontFamily:'Tajawal,sans-serif', color:'var(--rose-dark)', fontSize:14, direction:'rtl' }}>
            ⚠️ المتصفح لا يدعم التعرف على الصوت. استخدمي Chrome على Android.
          </p>
        </div>
      )}

      {/* Mic Button */}
      <button
        onPointerDown={startListening}
        onPointerUp={stopListening}
        disabled={!supported || status === 'thinking' || status === 'speaking'}
        className="relative w-32 h-32 rounded-full flex items-center justify-center text-5xl transition-all active:scale-95"
        style={{
          background: isListening
            ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
            : status === 'thinking' || status === 'speaking'
              ? '#E8D5C0'
              : 'white',
          border:  '3px solid #E8D5C0',
          cursor:  status === 'thinking' || status === 'speaking' ? 'not-allowed' : 'pointer',
          ...rippleStyle,
          transition: 'all 0.3s ease',
        }}
      >
        {status === 'thinking'  ? '🤔' :
         status === 'speaking'  ? '🔊' :
         isListening            ? '🎙️' : '🎤'}
      </button>

      <p className="mt-6 text-sm font-bold" style={{ color:'var(--text-mid)', fontFamily:'Tajawal,sans-serif' }}>
        {status === 'idle'      && 'اضغطي مطولاً للتحدث'}
        {status === 'listening' && '🎙️ أنا أسمعك...'}
        {status === 'thinking'  && '💭 أفكر...'}
        {status === 'speaking'  && '🔊 مس نورا تتحدث...'}
      </p>

      {/* Transcript */}
      {transcript && (
        <div className="mt-6 w-full max-w-sm p-4 rounded-2xl ltr text-left"
          style={{ background:'white', border:'1.5px solid #E8D5C0',
                   boxShadow:'0 4px 16px rgba(180,120,80,0.1)', animation:'fadeUp 0.3s ease both' }}>
          <p className="text-xs font-bold mb-1" style={{ color:'var(--text-soft)', fontFamily:'Tajawal,sans-serif' }}>
            قلتِ:
          </p>
          <p style={{ color:'var(--text-dark)', fontSize:15 }}>{transcript}</p>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="mt-3 w-full max-w-sm p-4 rounded-2xl ltr text-left"
          style={{ background:'linear-gradient(135deg,#FFF0F5,#F5F0FF)',
                   border:'1.5px solid #E8C8D8',
                   boxShadow:'0 4px 16px rgba(200,100,150,0.1)',
                   animation:'fadeUp 0.35s ease both' }}>
          <p className="text-xs font-bold mb-1" style={{ color:'var(--rose-dark)', fontFamily:'Tajawal,sans-serif' }}>
            مس نورا:
          </p>
          <p style={{ color:'var(--text-dark)', fontSize:15, lineHeight:1.6 }}>{response}</p>
          <button
            onClick={() => speakResponse(response)}
            style={{ marginTop:10, background:'transparent', border:'none', cursor:'pointer',
                     fontFamily:'Tajawal,sans-serif', fontSize:12, color:'var(--lav-deep)' }}>
            🔊 اسمعي مرة أخرى
          </button>
        </div>
      )}

      <p className="mt-8 text-xs text-center" style={{ color:'var(--text-soft)', fontFamily:'Tajawal,sans-serif' }}>
        جربي: "Hello! I like books" أو "My name is Rzan" 📖
      </p>
    </div>
  )
}
