'use client'
import { useState, useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types'

const WELCOME: ChatMessage = {
  role:    'assistant',
  content: 'أهلاً رزان! 👋 أنا مس نورا، معلمتك في اللغة الإنجليزية.\n\nأنا هنا عشان أساعدك تتعلمي الإنجليزي بطريقة ممتعة وتربطيها بعالم الروايات والقصص اللي تحبينها! 📖✨\n\nبكدا نبدأ؟ اسأليني أي سؤال أو قوليلي عن قصة تحبينها!',
}

function renderContent(text: string) {
  /* Highlight **word** as gold vocab pill */
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    const m = p.match(/^\*\*(.+)\*\*$/)
    if (m) return (
      <mark key={i} style={{
        background:   'linear-gradient(135deg,rgba(248,220,80,0.4),rgba(255,200,50,0.3))',
        borderRadius: 6,
        padding:      '1px 6px',
        color:        '#7A4A00',
        fontWeight:   700,
      }}>
        {m[1]}
      </mark>
    )
    return <span key={i}>{p}</span>
  })
}

export default function ChatPage() {
  const [messages,  setMessages]  = useState<ChatMessage[]>([WELCOME])
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg: ChatMessage = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setStreaming(true)

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    setMessages([...updated, assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok || !res.body) {
        setMessages(prev => {
          const c = [...prev]; c[c.length-1] = { role:'assistant', content:'عذراً، حدث خطأ. حاولي مرة أخرى 😊' }; return c
        }); return
      }
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        const snap = full
        setMessages(prev => {
          const c = [...prev]; c[c.length-1] = { role:'assistant', content: snap }; return c
        })
      }
    } catch {
      setMessages(prev => {
        const c = [...prev]; c[c.length-1] = { role:'assistant', content:'عذراً، تعذّر الاتصال 😔' }; return c
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'#FDF6EC', maxWidth:520, margin:'0 auto' }}>

      {/* ═══ STICKY HEADER ═══ */}
      <div style={{
        background:    'rgba(255,255,255,0.97)',
        backdropFilter:'blur(16px)',
        borderBottom:  '1px solid #E8D5C0',
        padding:       '14px 18px',
        display:       'flex',
        alignItems:    'center',
        gap:           12,
        position:      'sticky',
        top:           0,
        zIndex:        20,
        boxShadow:     '0 2px 16px rgba(180,120,80,0.08)',
      }}>
        {/* Teacher avatar */}
        <div style={{
          width:46, height:46, borderRadius:'50%',
          background:'linear-gradient(135deg,#E8789A,#9B72CF)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:24,
          boxShadow:'0 4px 12px rgba(200,100,150,0.3)',
        }}>
          👩‍🏫
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--text-dark)', lineHeight:1.2 }}>
            مس نورا
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{
              width:7, height:7, borderRadius:'50%',
              background: streaming ? '#E8A020' : '#7ED8B5',
              animation:  'pulseDot 2s ease-in-out infinite',
            }} />
            <p style={{ fontFamily:'Tajawal,sans-serif', fontSize:12, color: streaming ? 'var(--gold)' : 'var(--mint)', direction:'rtl' }}>
              {streaming ? 'تكتب...' : 'متصلة الآن'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ MESSAGES ═══ */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', paddingBottom:90 }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          const isLast = i === messages.length - 1
          const typing = streaming && isLast && msg.role === 'assistant' && !msg.content

          if (typing) return (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:16, direction:'rtl' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#E8789A,#9B72CF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>👩‍🏫</div>
              <div style={{ background:'white', border:'1.5px solid #E8D5C0', borderRadius:'18px 18px 18px 4px', padding:'12px 16px', boxShadow:'0 2px 10px rgba(180,120,80,0.08)' }}>
                <span style={{ display:'inline-flex', gap:4 }}>
                  {[0,1,2].map(j => (
                    <span key={j} style={{ width:6, height:6, borderRadius:'50%', background:'#C8A8E9', display:'inline-block', animation:`pulseDot 1.2s ease-in-out ${j*0.2}s infinite` }} />
                  ))}
                </span>
              </div>
            </div>
          )

          return (
            <div key={i} style={{
              display:       'flex',
              flexDirection: isUser ? 'row-reverse' : 'row',
              gap:           10,
              marginBottom:  16,
              direction:     isUser ? 'ltr' : 'rtl',
              animation:     isLast ? 'fadeUp 0.35s ease both' : undefined,
            }}>
              {!isUser && (
                <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#E8789A,#9B72CF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  👩‍🏫
                </div>
              )}
              <div style={{
                maxWidth:    '75%',
                background:  isUser
                  ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
                  : 'white',
                color:       isUser ? 'white' : 'var(--text-dark)',
                border:      isUser ? 'none' : '1.5px solid #E8D5C0',
                borderRadius: isUser
                  ? '18px 4px 18px 18px'
                  : '4px 18px 18px 18px',
                padding:     '12px 16px',
                boxShadow:   isUser
                  ? '0 4px 16px rgba(200,100,150,0.25)'
                  : '0 2px 10px rgba(180,120,80,0.08)',
                lineHeight:  1.65,
                fontFamily:  'Tajawal, sans-serif',
                fontSize:    14,
                direction:   isUser ? 'rtl' : 'rtl',
                whiteSpace:  'pre-wrap',
              }}>
                {isUser ? msg.content : renderContent(msg.content)}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ═══ INPUT ROW ═══ */}
      <div style={{
        position:      'fixed',
        bottom:        68,
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         '100%',
        maxWidth:      520,
        padding:       '10px 14px',
        background:    'rgba(253,246,236,0.97)',
        backdropFilter:'blur(12px)',
        borderTop:     '1px solid #E8D5C0',
        display:       'flex',
        gap:           8,
        alignItems:    'flex-end',
        zIndex:        10,
      }}>
        <div style={{
          flex:1,
          background:   'white',
          border:       '1.5px solid #E8D5C0',
          borderRadius: 20,
          padding:      '10px 16px',
          boxShadow:    '0 2px 8px rgba(180,120,80,0.08)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="اكتبي رسالتك... 💬"
            rows={1}
            style={{
              width:      '100%',
              border:     'none',
              outline:    'none',
              background: 'transparent',
              fontFamily: 'Tajawal, sans-serif',
              fontSize:   14,
              color:      'var(--text-dark)',
              direction:  'rtl',
              resize:     'none',
              lineHeight: 1.5,
              maxHeight:  80,
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || streaming}
          style={{
            width:      46,
            height:     46,
            borderRadius:'50%',
            background: input.trim() && !streaming
              ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
              : '#E8D5C0',
            border:     'none',
            cursor:     input.trim() && !streaming ? 'pointer' : 'not-allowed',
            display:    'flex',
            alignItems: 'center',
            justifyContent:'center',
            fontSize:   20,
            flexShrink: 0,
            boxShadow:  input.trim() && !streaming ? '0 4px 12px rgba(200,100,150,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          🚀
        </button>
      </div>
    </div>
  )
}
