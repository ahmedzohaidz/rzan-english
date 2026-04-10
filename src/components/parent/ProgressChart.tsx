interface VocabStats {
  total:    number
  accuracy: number
  recent:   { word: string; correct_count: number; review_count: number }[]
}

interface Props {
  vocabStats: VocabStats
  streak:     number
  points:     number
}

export default function ProgressChart({ vocabStats, streak, points }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Vocab accuracy */}
      <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 16, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--app-text)', direction: 'rtl' }}>
            المفردات 📚
          </p>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)' }}>{vocabStats.accuracy}% دقة</span>
        </div>
        <div style={{ height: 7, borderRadius: 99, background: 'var(--app-border)', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${vocabStats.accuracy}%`, background: 'linear-gradient(90deg, var(--purple) 0%, var(--mint) 100%)', transition: 'width 0.6s' }} />
        </div>

        {/* Recent vocab chips */}
        {vocabStats.recent.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {vocabStats.recent.map(v => {
              const acc = v.review_count > 0 ? v.correct_count / v.review_count : 0
              return (
                <span key={v.word} style={{
                  padding:      '3px 10px',
                  borderRadius: 20,
                  fontSize:     12,
                  background:   acc >= 0.7 ? 'rgba(79,255,176,0.12)' : 'rgba(255,107,107,0.12)',
                  color:        acc >= 0.7 ? 'var(--mint)' : 'var(--error)',
                  border:       `1px solid ${acc >= 0.7 ? 'var(--mint)' : 'var(--error)'}`,
                }}>
                  {v.word}
                </span>
              )
            })}
          </div>
        )}
        {vocabStats.total === 0 && (
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 12, color: 'var(--app-muted)', direction: 'rtl' }}>
            لم تبدأ بالمفردات بعد
          </p>
        )}
      </div>

      {/* Streak + points mini cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: 28 }}>🔥</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--gold)' }}>{streak}</p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 11, color: 'var(--app-muted)', direction: 'rtl' }}>يوم متتالي</p>
        </div>
        <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: 28 }}>⭐</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--purple-light)' }}>{points}</p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 11, color: 'var(--app-muted)', direction: 'rtl' }}>نقطة مجموع</p>
        </div>
      </div>
    </div>
  )
}
