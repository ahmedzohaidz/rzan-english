'use client'
import { useState, useEffect } from 'react'
import WritingWorkshop from '@/components/writing/WritingWorkshop'
import StoryCard       from '@/components/writing/StoryCard'
import type { RzanWritingJournalRow } from '@/types/supabase'
import type { Genre } from '@/types'

type View = 'list' | 'new' | 'detail'

export default function WritingPage() {
  const [view,     setView]     = useState<View>('list')
  const [entries,  setEntries]  = useState<RzanWritingJournalRow[]>([])
  const [selected, setSelected] = useState<RzanWritingJournalRow | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    fetch('/api/writing')
      .then(r => r.ok ? r.json() : [])
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(data: {
    title: string; content: string; genre: Genre; requestFeedback: boolean
  }) {
    setSaving(true)
    try {
      const res  = await fetch('/api/writing', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const entry = await res.json()
      if (res.ok) {
        setEntries(prev => [entry, ...prev])
        setSelected(entry)
        setView('detail')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Detail view ───────────────────────────────────────────
  if (view === 'detail' && selected) return (
    <div style={{ padding: '20px 20px 100px', maxWidth: 520, margin: '0 auto' }}>
      <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer', marginBottom: 16, fontFamily: 'Tajawal, sans-serif', padding: 0 }}>
        ← العودة للقائمة
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--app-text)', marginBottom: 6 }}>
        {selected.title}
      </h1>
      <p style={{ fontSize: 12, color: 'var(--app-muted)', marginBottom: 20 }}>
        {selected.word_count} words · {new Date(selected.created_at).toLocaleDateString('ar-SA')}
      </p>

      <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '18px 18px', marginBottom: 24, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15, color: 'var(--app-text)' }}>
        {selected.content}
      </div>

      {selected.ai_feedback && (
        <div style={{ background: 'rgba(155,89,255,0.08)', border: '1.5px solid var(--purple)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>👩‍🏫</span>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--purple-light)' }}>ملاحظات مس نورا</p>
          </div>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 14, lineHeight: 1.8, color: 'var(--app-text)', direction: 'rtl', whiteSpace: 'pre-wrap' }}>
            {selected.ai_feedback}
          </p>
        </div>
      )}

      {!selected.ai_feedback && (
        <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: 'var(--app-muted)', direction: 'rtl', textAlign: 'center', marginTop: 8 }}>
          لم يُطلب تقييم لهذه القصة
        </p>
      )}
    </div>
  )

  // ── New entry view ────────────────────────────────────────
  if (view === 'new') return (
    <div style={{ padding: '20px 20px 100px', maxWidth: 520, margin: '0 auto' }}>
      <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer', marginBottom: 16, fontFamily: 'Tajawal, sans-serif', padding: 0 }}>
        ← العودة للقائمة
      </button>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--app-text)', marginBottom: 20 }}>
        قصة جديدة ✍️
      </h1>
      <WritingWorkshop onSave={handleSave} saving={saving} />
    </div>
  )

  // ── List view ─────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 20px 100px', maxWidth: 520, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--app-text)' }}>
          ورشة الكتابة ✍️
        </h1>
        <button
          onClick={() => setView('new')}
          style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: 'var(--gold)', color: '#0a0a0a', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}
        >
          + جديد
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 40, animation: 'var(--animate-float)' }}>📖</div>
          <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', marginTop: 12, direction: 'rtl' }}>جاري التحميل...</p>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--app-text)', marginBottom: 8 }}>
            ابدئي أول قصة!
          </p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 14, direction: 'rtl', marginBottom: 24 }}>
            كل رواية عظيمة بدأت بكلمة واحدة 🌟
          </p>
          <button
            onClick={() => setView('new')}
            style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--purple) 0%, var(--gold) 100%)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}
          >
            اكتبي قصتك الأولى ✨
          </button>
        </div>
      )}

      {!loading && entries.map(entry => (
        <StoryCard
          key={entry.id}
          entry={entry}
          onClick={() => { setSelected(entry); setView('detail') }}
        />
      ))}
    </div>
  )
}
