interface Props { streak: number }

export default function StreakCounter({ streak }: Props) {
  const flames = Math.min(streak, 7)

  return (
    <div style={{
      background:     'var(--app-card)',
      border:         '1.5px solid var(--app-border)',
      borderRadius:   16,
      padding:        '16px 18px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <p style={{
          fontFamily:   'Tajawal, sans-serif',
          fontSize:     13,
          color:        'var(--app-muted)',
          direction:    'rtl',
          marginBottom: 4,
        }}>
          أيام متتالية 🔥
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize:   32,
          fontWeight: 900,
          color:      streak > 0 ? 'var(--gold)' : 'var(--app-muted)',
          lineHeight: 1,
        }}>
          {streak}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} style={{
            fontSize: 18,
            opacity:  i < flames ? 1 : 0.2,
            filter:   i < flames ? 'none' : 'grayscale(1)',
          }}>
            🔥
          </span>
        ))}
      </div>
    </div>
  )
}
