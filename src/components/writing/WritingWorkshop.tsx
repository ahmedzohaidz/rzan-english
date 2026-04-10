'use client'
import { useState } from 'react'
import type { Genre } from '@/types'

const GENRES: { value: Genre; label: string; icon: string }[] = [
  { value: 'story',       label: 'قصة',     icon: '📖' },
  { value: 'poem',        label: 'قصيدة',   icon: '🎭' },
  { value: 'dialogue',    label: 'حوار',    icon: '💬' },
  { value: 'description', label: 'وصف',     icon: '🖼️' },
  { value: 'other',       label: 'أخرى',    icon: '✍️' },
]

const STORY_STARTERS = [
  'It was a dark and stormy night when I found the old map...',
  'The dragon had been asleep for a thousand years until...',
  'Nobody believed that the library held a secret door...',
  'She opened the letter and her hands began to shake...',
  'The last star disappeared from the sky, and that\'s when everything changed...',
]

interface Props {
  onSave: (data: { title: string; content: string; genre: Genre; requestFeedback: boolean }) => Promise<void>
  saving: boolean
}

export default function WritingWorkshop({ onSave, saving }: Props) {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [genre,   setGenre]   = useState<Genre>('story')
  const [wantsFeedback, setWantsFeedback] = useState(true)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const canSave   = title.trim().length > 0 && wordCount >= 5

  function useStarter(starter: string) {
    setContent(prev => prev ? prev + '\n' + starter : starter)
  }

  async function handleSave() {
    if (!canSave || saving) return
    await onSave({ title, content, genre, requestFeedback: wantsFeedback })
    setTitle('')
    setContent('')
    setGenre('story')
  }

  return (
    <div>
      {/* Genre selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {GENRES.map(g => (
          <button
            key={g.value}
            onClick={() => setGenre(g.value)}
            style={{
              flexShrink:   0,
              padding:      '7px 14px',
              borderRadius: 20,
              border:       `1.5px solid ${genre === g.value ? 'var(--gold)' : 'var(--app-border)'}`,
              background:   genre === g.value ? 'rgba(255,209,0,0.12)' : 'var(--app-card)',
              color:        genre === g.value ? 'var(--gold)' : 'var(--app-muted)',
              fontSize:     13,
              fontWeight:   genre === g.value ? 700 : 400,
              cursor:       'pointer',
              fontFamily:   'Tajawal, sans-serif',
              display:      'flex',
              alignItems:   'center',
              gap:          5,
            }}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="عنوان قصتك..."
        style={{
          width:        '100%',
          padding:      '12px 14px',
          borderRadius: 12,
          border:       '1.5px solid var(--app-border)',
          background:   'var(--app-card)',
          color:        'var(--app-text)',
          fontSize:     16,
          fontWeight:   600,
          marginBottom: 12,
          outline:      'none',
          fontFamily:   'Tajawal, sans-serif',
          direction:    'rtl',
          boxSizing:    'border-box',
          transition:   'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--app-border)')}
      />

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="ابدئي الكتابة هنا... اكتبي بالإنجليزي ولا تخافي من الأخطاء! 🌟"
        rows={8}
        style={{
          width:        '100%',
          padding:      '14px 16px',
          borderRadius: 12,
          border:       '1.5px solid var(--app-border)',
          background:   'var(--app-card)',
          color:        'var(--app-text)',
          fontSize:     15,
          lineHeight:   1.75,
          resize:       'vertical',
          outline:      'none',
          fontFamily:   'inherit',
          boxSizing:    'border-box',
          marginBottom: 8,
          transition:   'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--app-border)')}
      />
      <p style={{ fontSize: 12, color: wordCount >= 20 ? 'var(--mint)' : 'var(--app-muted)', textAlign: 'right', marginBottom: 14 }}>
        {wordCount} words {wordCount >= 20 ? '✓' : ''}
      </p>

      {/* Story starters */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 12, color: 'var(--app-muted)', direction: 'rtl', marginBottom: 8 }}>
          💡 جرّبي إحدى البدايات:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STORY_STARTERS.map((s, i) => (
            <button key={i} onClick={() => useStarter(s)} style={{
              textAlign:    'left',
              padding:      '8px 12px',
              borderRadius: 8,
              border:       '1px solid var(--app-border)',
              background:   'transparent',
              color:        'var(--app-muted)',
              fontSize:     12,
              cursor:       'pointer',
              fontFamily:   'inherit',
              lineHeight:   1.4,
              transition:   'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple-light)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--app-border)'; e.currentTarget.style.color = 'var(--app-muted)' }}
            >
              "{s}"
            </button>
          ))}
        </div>
      </div>

      {/* AI feedback toggle */}
      <label style={{
        display:        'flex',
        alignItems:     'center',
        gap:            10,
        marginBottom:   16,
        cursor:         'pointer',
        fontFamily:     'Tajawal, sans-serif',
        fontSize:       14,
        color:          'var(--app-text)',
        direction:      'rtl',
        justifyContent: 'flex-end',
      }}>
        طلب تقييم من مس نورا ⭐
        <div
          onClick={() => setWantsFeedback(v => !v)}
          style={{
            width:        44,
            height:       24,
            borderRadius: 12,
            background:   wantsFeedback ? 'var(--purple)' : 'var(--app-border)',
            position:     'relative',
            transition:   'background 0.2s',
            flexShrink:   0,
          }}
        >
          <div style={{
            position:   'absolute',
            width:      18,
            height:     18,
            borderRadius: '50%',
            background: '#fff',
            top:        3,
            left:       wantsFeedback ? 23 : 3,
            transition: 'left 0.2s',
          }} />
        </div>
      </label>

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        style={{
          width:        '100%',
          padding:      '14px 0',
          borderRadius: 12,
          border:       'none',
          background:   !canSave || saving
            ? 'var(--app-border)'
            : 'linear-gradient(135deg, var(--gold) 0%, #ffb300 100%)',
          color:        !canSave || saving ? 'var(--app-muted)' : '#0a0a0a',
          fontSize:     16,
          fontWeight:   700,
          fontFamily:   'Tajawal, sans-serif',
          cursor:       !canSave || saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? (wantsFeedback ? '🔮 مس نورا تقرأ قصتك...' : 'جاري الحفظ...') : 'احفظي قصتك ✨'}
      </button>
    </div>
  )
}
