interface Props {
  prompt: string
  value:  string
  onChange: (v: string) => void
}

export default function WritingInput({ prompt, value, onChange }: Props) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div>
      <div style={{
        background:   'var(--app-card)',
        border:       '1.5px solid var(--gold)',
        borderRadius: 16,
        padding:      '16px 18px',
        marginBottom: 20,
      }}>
        <p style={{
          fontSize:   15,
          lineHeight: 1.65,
          color:      'var(--gold)',
          fontWeight: 600,
        }}>
          ✍️ {prompt}
        </p>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write your answer here..."
        rows={5}
        style={{
          width:        '100%',
          padding:      '14px 16px',
          borderRadius: 12,
          border:       '1.5px solid var(--app-border)',
          background:   'var(--app-card)',
          color:        'var(--app-text)',
          fontSize:     15,
          lineHeight:   1.7,
          resize:       'vertical',
          outline:      'none',
          fontFamily:   'inherit',
          boxSizing:    'border-box',
          transition:   'border-color 0.2s',
        }}
        onFocus={e  => (e.target.style.borderColor = 'var(--purple)')}
        onBlur={e   => (e.target.style.borderColor = 'var(--app-border)')}
      />
      <p style={{
        fontSize:  12,
        color:     wordCount >= 10 ? 'var(--mint)' : 'var(--app-muted)',
        marginTop: 6,
        textAlign: 'right',
      }}>
        {wordCount} words {wordCount >= 10 ? '✓' : '(try for at least 10)'}
      </p>
    </div>
  )
}
