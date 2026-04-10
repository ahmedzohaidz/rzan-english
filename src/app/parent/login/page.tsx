'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ParentLoginPage() {
  const router = useRouter()
  const [pin,     setPin]     = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...pin]
    next[index] = value
    setPin(next)
    setError('')
    if (value && index < 3) {
      inputs.current[index + 1]?.focus()
    }
    // auto-submit when all 4 filled
    if (value && index === 3) {
      const full = [...next].join('')
      if (full.length === 4) submitPin(full)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  async function submitPin(code: string) {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/parent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pin: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'رمز خاطئ')
        setPin(['', '', '', ''])
        inputs.current[0]?.focus()
        return
      }
      router.replace('/parent')
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = pin.join('')
    if (code.length === 4) submitPin(code)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ background: 'var(--app-bg)' }}>

      {/* orb */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', top: '-60px', left: '-60px',
          background: 'radial-gradient(circle, rgba(79,255,176,0.12) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 340, animation: 'var(--animate-fade-up)' }}>

        {/* icon */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--mint) 0%, var(--purple) 100%)',
            fontSize: 32,
          }}>
            👨‍👧
          </div>
        </div>

        <h1 style={{
          fontFamily:   'Tajawal, sans-serif',
          fontSize:     26,
          fontWeight:   900,
          textAlign:    'center',
          direction:    'rtl',
          color:        'var(--app-text)',
          marginBottom: 6,
        }}>
          لوحة ولي الأمر
        </h1>
        <p style={{
          textAlign:    'center',
          color:        'var(--app-muted)',
          fontFamily:   'Tajawal, sans-serif',
          fontSize:     14,
          marginBottom: 36,
          direction:    'rtl',
        }}>
          أدخل الرمز المكوّن من 4 أرقام
        </p>

        <form onSubmit={handleSubmit}>
          {/* PIN boxes */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width:        56, height: 64,
                  borderRadius: 14,
                  border:       `2px solid ${digit ? 'var(--mint)' : 'var(--app-border)'}`,
                  background:   'var(--app-card)',
                  color:        'var(--app-text)',
                  fontSize:     28,
                  fontWeight:   700,
                  textAlign:    'center',
                  outline:      'none',
                  transition:   'border-color 0.2s',
                  caretColor:   'transparent',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--mint)')}
                onBlur={e  => (e.target.style.borderColor = digit ? 'var(--mint)' : 'var(--app-border)')}
              />
            ))}
          </div>

          {error && (
            <p style={{
              color:        'var(--error)',
              fontFamily:   'Tajawal, sans-serif',
              fontSize:     14,
              direction:    'rtl',
              textAlign:    'center',
              marginBottom: 16,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || pin.join('').length < 4}
            style={{
              width:        '100%',
              padding:      '14px 0',
              borderRadius: 12,
              border:       'none',
              cursor:       loading || pin.join('').length < 4 ? 'not-allowed' : 'pointer',
              background:   loading || pin.join('').length < 4
                ? 'var(--app-border)'
                : 'linear-gradient(135deg, var(--mint) 0%, #00c97a 100%)',
              color:        loading || pin.join('').length < 4 ? 'var(--app-muted)' : '#0a0a0a',
              fontSize:     16,
              fontWeight:   700,
              fontFamily:   'Tajawal, sans-serif',
            }}
          >
            {loading ? '...' : 'دخول'}
          </button>
        </form>

        <p style={{
          textAlign:  'center',
          marginTop:  28,
          fontFamily: 'Tajawal, sans-serif',
          fontSize:   13,
          color:      'var(--app-muted)',
          direction:  'rtl',
        }}>
          <a href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            ← رجوع لصفحة رزان
          </a>
        </p>
      </div>
    </main>
  )
}
