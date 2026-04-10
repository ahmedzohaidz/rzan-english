interface Props {
  role:    'user' | 'assistant'
  content: string
  isNew?:  boolean
}

export default function ChatBubble({ role, content, isNew }: Props) {
  const isUser = role === 'user'

  return (
    <div style={{
      display:       'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom:  12,
      animation:     isNew ? 'var(--animate-fade-up)' : 'none',
    }}>
      <div style={{
        maxWidth:     '80%',
        padding:      '11px 15px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background:   isUser
          ? 'linear-gradient(135deg, var(--purple) 0%, #7a3ff0 100%)'
          : 'var(--app-card)',
        border:       isUser ? 'none' : '1px solid var(--app-border)',
        color:        'var(--app-text)',
        fontSize:     15,
        lineHeight:   1.65,
        whiteSpace:   'pre-wrap',
        wordBreak:    'break-word',
      }}>
        {content}
      </div>
    </div>
  )
}
