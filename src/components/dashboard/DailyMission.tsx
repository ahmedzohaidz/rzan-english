import type { RzanMissionRow } from '@/types/supabase'

const TYPE_ICON: Record<string, string> = {
  vocabulary: '📚',
  reading:    '📖',
  writing:    '✍️',
  chat:       '💬',
}

interface Props {
  missions:  RzanMissionRow[]
  loading:   boolean
  onComplete:(id: string) => void
}

export default function DailyMission({ missions, loading, onComplete }: Props) {
  if (loading) return (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <span style={{ fontSize: 28, animation: 'var(--animate-float)' }}>🔮</span>
      <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 13, marginTop: 8, direction: 'rtl' }}>
        مس نورا تحضّر مهامك اليومية...
      </p>
    </div>
  )

  if (missions.length === 0) return (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 14, direction: 'rtl' }}>
        لا توجد مهام اليوم
      </p>
    </div>
  )

  const done  = missions.filter(m => m.completed).length
  const total = missions.length
  const pct   = Math.round((done / total) * 100)

  return (
    <div>
      {/* progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: 'var(--app-muted)', direction: 'rtl' }}>
          {done}/{total} مكتملة
        </span>
        <span style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: done === total ? 'var(--mint)' : 'var(--gold)', fontWeight: 700 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--app-border)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, var(--purple) 0%, var(--gold) 100%)', transition: 'width 0.5s' }} />
      </div>

      {missions.map(m => (
        <div key={m.id} style={{
          display:      'flex',
          alignItems:   'flex-start',
          gap:          14,
          background:   m.completed ? 'rgba(79,255,176,0.07)' : 'var(--app-card)',
          border:       `1.5px solid ${m.completed ? 'var(--mint)' : 'var(--app-border)'}`,
          borderRadius: 14,
          padding:      '14px 16px',
          marginBottom: 10,
          opacity:      m.completed ? 0.7 : 1,
          transition:   'all 0.3s',
        }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>{TYPE_ICON[m.type] ?? '📌'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--app-text)', marginBottom: 3 }}>{m.title}</p>
            <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: 'var(--app-muted)', direction: 'rtl', textAlign: 'right', lineHeight: 1.5 }}>
              {m.description}
            </p>
            <p style={{ fontSize: 12, color: 'var(--gold)', marginTop: 6 }}>+{m.points_reward} ⭐</p>
          </div>
          {!m.completed && (
            <button
              onClick={() => onComplete(m.id)}
              style={{
                flexShrink:   0,
                padding:      '6px 14px',
                borderRadius: 8,
                border:       'none',
                background:   'var(--purple)',
                color:        '#fff',
                fontSize:     12,
                fontWeight:   700,
                cursor:       'pointer',
                fontFamily:   'Tajawal, sans-serif',
              }}
            >
              أنجزت
            </button>
          )}
          {m.completed && (
            <span style={{ fontSize: 22, flexShrink: 0 }}>✅</span>
          )}
        </div>
      ))}
    </div>
  )
}
