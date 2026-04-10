import Link from 'next/link'

const ACTIONS = [
  { href: '/chat',       icon: '💬', label: 'تحدّثي مع مس نورا', color: 'var(--purple)' },
  { href: '/vocabulary', icon: '📚', label: 'مراجعة المفردات',   color: 'var(--gold)' },
  { href: '/writing',    icon: '✍️', label: 'ورشة الكتابة',      color: 'var(--pink)' },
]

export default function QuickActions() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ACTIONS.map(({ href, icon, label, color }) => (
        <Link key={href} href={href} style={{
          display:        'flex',
          alignItems:     'center',
          gap:            14,
          background:     'var(--app-card)',
          border:         `1.5px solid var(--app-border)`,
          borderRadius:   14,
          padding:        '14px 16px',
          textDecoration: 'none',
          transition:     'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
        >
          <span style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          42,
            height:         42,
            borderRadius:   12,
            background:     `${color}22`,
            fontSize:       22,
            flexShrink:     0,
          }}>
            {icon}
          </span>
          <span style={{
            fontFamily: 'Tajawal, sans-serif',
            fontSize:   15,
            fontWeight: 600,
            color:      'var(--app-text)',
            direction:  'rtl',
          }}>
            {label}
          </span>
          <span style={{ marginLeft: 'auto', color: 'var(--app-muted)', fontSize: 18 }}>←</span>
        </Link>
      ))}
    </div>
  )
}
