import { levelToString } from '@/types'

const LEVEL_DESC: Record<string, string> = {
  A1: 'مبتدئة',
  A2: 'متوسطة المبتدئين',
  B1: 'متوسطة',
  B2: 'فوق المتوسط',
  C1: 'متقدمة',
  C2: 'محترفة',
}

interface Props { level: number; points: number }

export default function LevelBadge({ level, points }: Props) {
  const str   = levelToString(level)
  const next  = Math.min(level + 1, 6)
  const pct   = Math.min(Math.round((points % 100) / 100 * 100), 100)

  return (
    <div style={{
      background:   'linear-gradient(135deg, rgba(155,89,255,0.15) 0%, rgba(255,209,0,0.1) 100%)',
      border:       '1.5px solid var(--purple)',
      borderRadius: 18,
      padding:      '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 12, color: 'var(--app-muted)', direction: 'rtl', marginBottom: 2 }}>
            مستواكِ الحالي
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
            {str}
          </p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: 'var(--purple-light)', direction: 'rtl', marginTop: 2 }}>
            {LEVEL_DESC[str]}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, animation: 'var(--animate-float)' }}>📖</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 11, color: 'var(--app-muted)' }}>
            {str} → {levelToString(next)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--gold)' }}>{points % 100}/100 ⭐</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'var(--app-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, var(--purple) 0%, var(--gold) 100%)', transition: 'width 0.6s' }} />
        </div>
      </div>
    </div>
  )
}
