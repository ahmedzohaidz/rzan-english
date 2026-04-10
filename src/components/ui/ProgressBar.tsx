interface Props {
  value:   number   // 0-100
  color?:  string
  height?: number
  label?:  string
}

export default function ProgressBar({ value, color = 'var(--purple)', height = 8, label }: Props) {
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 12, color: 'var(--app-muted)' }}>{label}</span>
          <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}%</span>
        </div>
      )}
      <div style={{ height, borderRadius: 99, background: 'var(--app-border)', overflow: 'hidden' }}>
        <div style={{
          height:     '100%',
          borderRadius: 99,
          width:      `${Math.min(value, 100)}%`,
          background: `linear-gradient(90deg, ${color} 0%, var(--gold) 100%)`,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}
