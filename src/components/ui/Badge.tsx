interface Props {
  icon:        string
  title:       string
  description: string
  points:      number
  unlocked:    boolean
}

export default function Badge({ icon, title, description, points, unlocked }: Props) {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          14,
      background:   unlocked ? 'var(--app-card)' : 'var(--app-surface)',
      border:       `1.5px solid ${unlocked ? 'var(--gold)' : 'var(--app-border)'}`,
      borderRadius: 16,
      padding:      '14px 16px',
      opacity:      unlocked ? 1 : 0.45,
      transition:   'all 0.3s',
    }}>
      {/* Icon */}
      <div style={{
        width:          52,
        height:         52,
        borderRadius:   16,
        background:     unlocked
          ? 'linear-gradient(135deg, rgba(255,209,0,0.2) 0%, rgba(155,89,255,0.2) 100%)'
          : 'var(--app-card)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       26,
        flexShrink:     0,
        filter:         unlocked ? 'none' : 'grayscale(1)',
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily:   'Tajawal, sans-serif',
          fontSize:     15,
          fontWeight:   700,
          color:        unlocked ? 'var(--app-text)' : 'var(--app-muted)',
          direction:    'rtl',
          marginBottom: 3,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: 'Tajawal, sans-serif',
          fontSize:   12,
          color:      'var(--app-muted)',
          direction:  'rtl',
          lineHeight: 1.4,
        }}>
          {description}
        </p>
      </div>

      {/* Points */}
      <div style={{
        flexShrink:  0,
        textAlign:   'center',
        background:  unlocked ? 'rgba(255,209,0,0.12)' : 'transparent',
        borderRadius: 10,
        padding:     '4px 8px',
      }}>
        <p style={{ fontSize: 14 }}>{unlocked ? '✅' : '🔒'}</p>
        <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>+{points}</p>
      </div>
    </div>
  )
}
