'use client'
import { useState, useRef } from 'react'

interface Props {
  onSend:   (text: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    // auto-grow
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div style={{
      position:   'fixed',
      bottom:     64, // above BottomNav
      left:       0,
      right:      0,
      padding:    '10px 16px',
      background: 'var(--app-surface)',
      borderTop:  '1px solid var(--app-border)',
      display:    'flex',
      gap:        10,
      alignItems: 'flex-end',
    }}>
      <textarea
        ref={ref}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="اكتبي هنا... (Enter للإرسال)"
        rows={1}
        disabled={disabled}
        style={{
          flex:        1,
          padding:     '11px 14px',
          borderRadius: 16,
          border:      '1.5px solid var(--app-border)',
          background:  'var(--app-card)',
          color:       'var(--app-text)',
          fontSize:    15,
          resize:      'none',
          outline:     'none',
          fontFamily:  'Tajawal, sans-serif',
          direction:   'rtl',
          lineHeight:  1.5,
          maxHeight:   120,
          overflow:    'auto',
          transition:  'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--app-border)')}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          width:          44,
          height:         44,
          borderRadius:   '50%',
          border:         'none',
          background:     disabled || !text.trim() ? 'var(--app-border)' : 'var(--purple)',
          color:          '#fff',
          fontSize:       20,
          cursor:         disabled || !text.trim() ? 'not-allowed' : 'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          transition:     'background 0.2s',
        }}
      >
        ↑
      </button>
    </div>
  )
}
