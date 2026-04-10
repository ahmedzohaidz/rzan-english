import OptionButton from './OptionButton'

interface Props {
  index:     number
  total:     number
  question:  string
  options:   string[]
  correct:   string
  selected:  string | null
  revealed:  boolean
  onSelect:  (opt: string) => void
}

export default function QuestionCard({
  index, total, question, options, correct, selected, revealed, onSelect,
}: Props) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{
        fontSize:     12,
        color:        'var(--app-muted)',
        marginBottom: 8,
        fontFamily:   'Tajawal, sans-serif',
      }}>
        {index + 1} / {total}
      </p>
      <p style={{
        fontSize:     16,
        fontWeight:   600,
        color:        'var(--app-text)',
        marginBottom: 18,
        lineHeight:   1.5,
      }}>
        {question}
      </p>
      {options.map(opt => (
        <OptionButton
          key={opt}
          label={opt}
          selected={selected === opt}
          correct={revealed && opt === correct}
          wrong={revealed && selected === opt && opt !== correct}
          disabled={revealed}
          onClick={() => onSelect(opt)}
        />
      ))}
    </div>
  )
}
