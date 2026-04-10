'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const router = useRouter()

  async function handleLogin() {
    const trimmed = name.trim()
    if (!trimmed) { setError('اكتبي اسمك أولاً ✨'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (res.ok) router.push(data.diagnosticDone ? '/dashboard' : '/diagnostic')
      else        setError(data.error ?? 'حدث خطأ، حاولي مجدداً')
    } catch {
      setError('تحقق من الاتصال بالإنترنت')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#FFF5E8 0%,#F9ECF5 50%,#EEF0FF 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle,#E8789A,transparent)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle,#9B72CF,transparent)' }} />

      {/* Floating sparkles */}
      {(['✨','⭐','🌸','💫','🌟'] as const).map((s, i) => (
        <span
          key={i}
          className="absolute text-xl opacity-40 select-none pointer-events-none"
          style={{
            top:            `${[15,25,70,80,45][i]}%`,
            left:           `${[85,10,90,12,5][i]}%`,
            animation:      `drift 4s ease-in-out ${i * 0.7}s infinite`,
          }}
        >{s}</span>
      ))}

      {/* Hero emoji */}
      <div
        className="text-8xl mb-2 select-none"
        style={{
          animation:  'float 4s ease-in-out infinite',
          filter:     'drop-shadow(0 12px 24px rgba(200,100,150,0.3))',
        }}
      >
        📖
      </div>

      <h1
        className="text-3xl font-black text-center mb-2"
        style={{
          fontFamily:           'var(--font-display)',
          fontStyle:            'italic',
          background:           'linear-gradient(135deg, #E8789A, #9B72CF, #E8A020)',
          backgroundSize:       '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
          animation:            'shimmer 4s linear infinite',
        }}
      >
        عالم رزان الإنجليزي
      </h1>
      <p className="text-base mb-10 text-center" style={{ color: 'var(--text-mid)' }}>
        روايتك القادمة ستكون بالإنجليزية ✨
      </p>

      {/* Card */}
      <div
        className="w-full max-w-sm"
        style={{
          background:      'rgba(255,255,255,0.85)',
          backdropFilter:  'blur(20px)',
          border:          '1.5px solid rgba(255,255,255,0.9)',
          borderRadius:    28,
          padding:         '28px 24px',
          boxShadow:       '0 20px 60px rgba(200,120,160,0.15)',
          animation:       'fadeUp 0.45s ease both',
        }}
      >
        <p className="text-center text-sm mb-4" style={{ color: 'var(--text-mid)' }}>
          اكتبي اسمك للدخول 🌟
        </p>

        <input
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="رزان..."
          autoFocus
          className="w-full text-center text-lg outline-none mb-3 transition-all"
          style={{
            background:   '#FDF6EC',
            border:       '2px solid #E8D5C0',
            borderRadius: 16,
            padding:      '18px 20px',
            fontFamily:   'Tajawal, sans-serif',
            color:        '#3D2B1F',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#E8789A'
            e.target.style.boxShadow   = '0 0 0 4px rgba(232,120,154,0.12)'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#E8D5C0'
            e.target.style.boxShadow   = 'none'
          }}
        />

        {error && (
          <p className="text-center text-sm mb-3" style={{ color: 'var(--rose-dark)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? '⏳ جاري الدخول...' : 'ادخلي إلى عالمك ✨'}
        </button>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-soft)' }}>
          أنت ولي الأمر؟{' '}
          <a href="/parent/login" style={{ color: 'var(--lav-deep)', fontWeight: 700, textDecoration: 'none' }}>
            ادخل هنا
          </a>
        </p>
      </div>

      <p className="text-xs mt-6" style={{ color: 'var(--text-soft)' }}>
        منصة تعليمية مخصصة لرزان 💜
      </p>
    </div>
  )
}
