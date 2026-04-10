interface DayActivity {
  date:      string
  completed: number
  total:     number
  points:    number
}

interface Props {
  activity:     DayActivity[]
  missionsWeek: { completedThisWeek: number; totalThisWeek: number }
}

const DAY_LABELS_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']

export default function WeeklyStats({ activity, missionsWeek }: Props) {
  const maxPoints = Math.max(...activity.map(d => d.points), 1)

  return (
    <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 16, padding: '18px 18px' }}>
      <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--app-text)', direction: 'rtl', marginBottom: 16 }}>
        نشاط الأسبوع 📅
      </p>

      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 8 }}>
        {activity.map((day) => {
          const pct    = (day.points / maxPoints) * 100
          const active = day.completed > 0
          const dayOfWeek = new Date(day.date + 'T12:00:00').getDay()
          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width:        '100%',
                borderRadius: '6px 6px 0 0',
                height:       `${Math.max(pct, active ? 8 : 4)}%`,
                minHeight:    active ? 8 : 4,
                background:   active
                  ? 'linear-gradient(180deg, var(--gold) 0%, var(--purple) 100%)'
                  : 'var(--app-border)',
                transition:   'height 0.5s',
              }} />
              <span style={{ fontSize: 10, color: active ? 'var(--gold)' : 'var(--app-muted)', fontFamily: 'Tajawal, sans-serif' }}>
                {DAY_LABELS_AR[dayOfWeek]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--app-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>
            {missionsWeek.completedThisWeek}
          </p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 11, color: 'var(--app-muted)', direction: 'rtl' }}>مهمة مكتملة</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--purple-light)' }}>
            {activity.filter(d => d.completed > 0).length}
          </p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 11, color: 'var(--app-muted)', direction: 'rtl' }}>أيام نشطة</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--mint)' }}>
            {activity.reduce((s, d) => s + d.points, 0)}
          </p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 11, color: 'var(--app-muted)', direction: 'rtl' }}>نقطة هذا الأسبوع</p>
        </div>
      </div>
    </div>
  )
}
