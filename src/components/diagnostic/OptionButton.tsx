interface Props {
  label:     string
  selected:  boolean
  correct?:  boolean   // shown after reveal
  wrong?:    boolean
  disabled?: boolean
  onClick:   () => void
}

export default function OptionButton({ label, selected, correct, wrong, disabled, onClick }: Props) {
  let bg     = 'var(--app-card)'
  let border = 'var(--app-border)'
  let color  = 'var(--app-text)'

  if (correct)       { bg = 'rgba(79,255,176,0.15)'; border = 'var(--mint)';  color = 'var(--mint)' }
  else if (wrong)    { bg = 'rgba(255,107,107,0.15)'; border = 'var(--error)'; color = 'var(--error)' }
  else if (selected) { bg = 'rgba(155,89,255,0.15)'; border = 'var(--purple)'; color = 'var(--purple-light)' }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display:      'block',
        width:        '100%',
        textAlign:    'left',
        padding:      '13px 16px',
        marginBottom: 10,
        borderRadius: 12,
        border:       `1.5px solid ${border}`,
        background:   bg,
        color,
        fontSize:     15,
        cursor:       disabled ? 'default' : 'pointer',
        transition:   'all 0.2s',
        fontFamily:   'inherit',
      }}
    >
      {label}
    </button>
  )
}
