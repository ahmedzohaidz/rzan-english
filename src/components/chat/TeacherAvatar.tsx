interface Props { typing?: boolean }

export default function TeacherAvatar({ typing }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 4 }}>
      <div style={{
        width:          40,
        height:         40,
        borderRadius:   '50%',
        background:     'linear-gradient(135deg, var(--purple) 0%, var(--gold) 100%)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       20,
        flexShrink:     0,
        animation:      typing ? 'var(--animate-pulse-soft)' : 'none',
      }}>
        👩‍🏫
      </div>
      <div>
        <p style={{
          fontFamily: 'Tajawal, sans-serif',
          fontSize:   11,
          color:      'var(--purple-light)',
          marginBottom: 3,
          direction:  'rtl',
        }}>
          مس نورا
        </p>
        {typing && (
          <div style={{
            display:      'flex',
            gap:          4,
            background:   'var(--app-card)',
            border:       '1px solid var(--app-border)',
            borderRadius: '14px 14px 14px 2px',
            padding:      '10px 14px',
            alignItems:   'center',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width:        7,
                height:       7,
                borderRadius: '50%',
                background:   'var(--purple-light)',
                animation:    `pulseSoft 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
