const GENRE_ICON: Record<string, string> = {
  story: '📖', poem: '🎭', dialogue: '💬', description: '🖼️', other: '✍️',
}

interface Story {
  id:          string
  title:       string
  genre:       string
  word_count:  number
  ai_feedback: string | null
  created_at:  string
  points_earned: number
}

interface Props { stories: Story[] }

export default function StoryReview({ stories }: Props) {
  if (stories.length === 0) return (
    <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 16, padding: '20px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 13, direction: 'rtl' }}>
        لم تكتب رزان قصصاً بعد
      </p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {stories.map(s => (
        <div key={s.id} style={{
          background:   'var(--app-card)',
          border:       '1px solid var(--app-border)',
          borderRadius: 16,
          padding:      '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{GENRE_ICON[s.genre] ?? '✍️'}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>{s.title}</span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>+{s.points_earned} ⭐</p>
              <p style={{ fontSize: 11, color: 'var(--app-muted)' }}>{s.word_count} كلمة</p>
            </div>
          </div>

          {s.ai_feedback && (
            <div style={{ background: 'rgba(155,89,255,0.06)', border: '1px solid rgba(155,89,255,0.2)', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
              <p style={{ fontSize: 11, color: 'var(--purple-light)', marginBottom: 4 }}>👩‍🏫 تقييم مس نورا</p>
              <p style={{
                fontFamily: 'Tajawal, sans-serif',
                fontSize:   12,
                color:      'var(--app-muted)',
                direction:  'rtl',
                lineHeight: 1.6,
                display:    '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow:   'hidden',
              }}>
                {s.ai_feedback}
              </p>
            </div>
          )}

          <p style={{
            fontSize:  11,
            color:     'var(--app-muted)',
            marginTop: 8,
            fontFamily:'Tajawal, sans-serif',
            direction: 'rtl',
          }}>
            {new Date(s.created_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      ))}
    </div>
  )
}
