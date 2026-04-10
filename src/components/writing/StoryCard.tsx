import type { RzanWritingJournalRow } from '@/types/supabase'

const GENRE_ICON: Record<string, string> = {
  story:       '📖',
  poem:        '🎭',
  dialogue:    '💬',
  description: '🖼️',
  other:       '✍️',
}

interface Props {
  entry:   RzanWritingJournalRow
  onClick: () => void
}

export default function StoryCard({ entry, onClick }: Props) {
  const date = new Date(entry.created_at).toLocaleDateString('ar-SA', {
    day: 'numeric', month: 'short',
  })

  return (
    <button
      onClick={onClick}
      style={{
        display:     'block',
        width:       '100%',
        textAlign:   'left',
        background:  'var(--app-card)',
        border:      '1.5px solid var(--app-border)',
        borderRadius: 16,
        padding:     '16px 18px',
        marginBottom: 12,
        cursor:      'pointer',
        transition:  'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>{GENRE_ICON[entry.genre] ?? '✍️'}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.title}
            </span>
          </div>
          <p style={{
            fontSize:     13,
            color:        'var(--app-muted)',
            lineHeight:   1.5,
            overflow:     'hidden',
            display:      '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {entry.content}
          </p>
        </div>
        {entry.ai_feedback && (
          <span style={{ fontSize: 18, flexShrink: 0 }} title="تم تقييمها">⭐</span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--app-muted)' }}>{entry.word_count} كلمة</span>
        <span style={{ fontSize: 12, color: 'var(--app-muted)', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>{date}</span>
      </div>
    </button>
  )
}
