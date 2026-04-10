interface Props {
  title:   string
  passage: string
}

export default function PassageCard({ title, passage }: Props) {
  return (
    <div style={{
      background:   'var(--app-card)',
      border:       '1.5px solid var(--app-border)',
      borderRadius: 16,
      padding:      '20px 18px',
      marginBottom: 24,
    }}>
      <p style={{
        fontFamily:   'var(--font-display)',
        fontSize:     16,
        fontWeight:   700,
        color:        'var(--gold)',
        marginBottom: 12,
      }}>
        📖 {title}
      </p>
      {passage.split('\n').filter(Boolean).map((line, i) => (
        <p key={i} style={{
          fontSize:     15,
          lineHeight:   1.75,
          color:        'var(--app-text)',
          marginBottom: 4,
        }}>
          {line}
        </p>
      ))}
    </div>
  )
}
