import type { RzanProfileRow } from '@/types/supabase'
import { levelToString } from '@/types'

interface Props { profile: RzanProfileRow | null }

export default function Header({ profile }: Props) {
  return (
    <header style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '16px 20px',
      borderBottom:   '1px solid var(--app-border)',
    }}>
      <div>
        <p style={{
          fontFamily: 'Tajawal, sans-serif',
          fontSize:   12,
          color:      'var(--app-muted)',
          direction:  'rtl',
        }}>
          أهلاً
        </p>
        <p style={{
          fontFamily: 'Tajawal, sans-serif',
          fontSize:   17,
          fontWeight: 700,
          color:      'var(--app-text)',
          direction:  'rtl',
        }}>
          {profile?.name ?? '...'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Level badge */}
        <div style={{
          padding:      '4px 12px',
          borderRadius: 20,
          background:   'linear-gradient(135deg, var(--purple) 0%, var(--gold) 100%)',
          fontSize:     12,
          fontWeight:   700,
          color:        '#fff',
        }}>
          {profile ? levelToString(profile.level) : '...'}
        </div>

        {/* Points */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:           4,
          background:   'var(--app-card)',
          border:       '1px solid var(--app-border)',
          borderRadius: 20,
          padding:      '4px 12px',
        }}>
          <span style={{ fontSize: 14 }}>⭐</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
            {profile?.points ?? 0}
          </span>
        </div>
      </div>
    </header>
  )
}
