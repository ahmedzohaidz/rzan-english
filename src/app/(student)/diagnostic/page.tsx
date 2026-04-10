'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuestionCard from '@/components/diagnostic/QuestionCard'
import PassageCard  from '@/components/diagnostic/PassageCard'
import WritingInput from '@/components/diagnostic/WritingInput'
import {
  VOCABULARY_QUESTIONS,
  GRAMMAR_QUESTIONS,
  READING_STAGE,
  WRITING_PROMPT,
} from '@/data/diagnostic'
import type { DiagnosticAnswer, DiagnosticResult } from '@/types'

type Stage = 'intro' | 'vocabulary' | 'grammar' | 'reading' | 'writing' | 'loading' | 'result'

const STAGE_ORDER: Stage[] = ['intro', 'vocabulary', 'grammar', 'reading', 'writing', 'loading', 'result']

const STAGE_LABELS: Record<string, string> = {
  vocabulary: '📚 المفردات',
  grammar:    '✏️ القواعد',
  reading:    '📖 القراءة',
  writing:    '✍️ الكتابة',
}

export default function DiagnosticPage() {
  const router = useRouter()
  const [stage,     setStage]     = useState<Stage>('intro')
  const [vAnswers,  setVAnswers]  = useState<(string | null)[]>(Array(5).fill(null))
  const [gAnswers,  setGAnswers]  = useState<(string | null)[]>(Array(5).fill(null))
  const [rAnswers,  setRAnswers]  = useState<(string | null)[]>(Array(3).fill(null))
  const [writing,   setWriting]   = useState('')
  const [revealed,  setRevealed]  = useState(false)
  const [qIndex,    setQIndex]    = useState(0)
  const [result,    setResult]    = useState<DiagnosticResult | null>(null)
  const [error,     setError]     = useState('')

  // ── helpers ──────────────────────────────────────────────
  function stageProgress(): number {
    const idx = STAGE_ORDER.indexOf(stage)
    return Math.round((idx / (STAGE_ORDER.length - 2)) * 100)
  }

  function selectVocab(opt: string) {
    const next = [...vAnswers]; next[qIndex] = opt; setVAnswers(next)
    setRevealed(true)
  }
  function selectGrammar(opt: string) {
    const next = [...gAnswers]; next[qIndex] = opt; setGAnswers(next)
    setRevealed(true)
  }
  function selectReading(opt: string) {
    const next = [...rAnswers]; next[qIndex] = opt; setRAnswers(next)
    setRevealed(true)
  }

  function nextQuestion(
    answers: (string | null)[],
    questions: { id: string; question: string; options: string[]; correct: string }[],
    nextStage: Stage
  ) {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1)
      setRevealed(false)
    } else {
      setQIndex(0)
      setRevealed(false)
      setStage(nextStage)
    }
  }

  async function submitDiagnostic() {
    setStage('loading')
    setError('')

    const allAnswers: DiagnosticAnswer[] = [
      ...VOCABULARY_QUESTIONS.map((q, i) => ({
        stage:   'vocabulary',
        question: q.question,
        chosen:   vAnswers[i] ?? '',
        correct:  q.correct,
        isRight:  vAnswers[i] === q.correct,
      })),
      ...GRAMMAR_QUESTIONS.map((q, i) => ({
        stage:   'grammar',
        question: q.question,
        chosen:   gAnswers[i] ?? '',
        correct:  q.correct,
        isRight:  gAnswers[i] === q.correct,
      })),
      ...READING_STAGE.questions.map((q, i) => ({
        stage:   'reading',
        question: q.question,
        chosen:   rAnswers[i] ?? '',
        correct:  q.correct,
        isRight:  rAnswers[i] === q.correct,
      })),
      { stage: 'writing', question: WRITING_PROMPT, textAnswer: writing },
    ]

    try {
      const res  = await fetch('/api/diagnostic', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ answers: allAnswers }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'حدث خطأ'); setStage('writing'); return }
      setResult(data.result)
      setStage('result')
    } catch {
      setError('تعذّر الاتصال')
      setStage('writing')
    }
  }

  // ── render helpers ────────────────────────────────────────
  const currentVQ = VOCABULARY_QUESTIONS[qIndex]
  const currentGQ = GRAMMAR_QUESTIONS[qIndex]
  const currentRQ = READING_STAGE.questions[qIndex]

  // ── INTRO ─────────────────────────────────────────────────
  if (stage === 'intro') return (
    <main style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 380, width: '100%', animation: 'var(--animate-fade-up)' }}>
        <div style={{ textAlign: 'center', fontSize: 64, marginBottom: 20 }}>🌟</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, textAlign: 'center', color: 'var(--gold)', marginBottom: 12 }}>
          اختبار التحديد
        </h1>
        <p style={{ fontFamily: 'Tajawal, sans-serif', direction: 'rtl', textAlign: 'center', color: 'var(--app-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          هذا الاختبار سيساعدنا نعرف مستواك في اللغة الإنجليزية حتى نصمّم لك رحلة تعليمية مناسبة تماماً 💫
          <br /><br />
          سيكون فيه 4 أجزاء: مفردات، قواعد، قراءة، وكتابة قصيرة.
          <br />
          خذي وقتك ولا تقلقين!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {(['vocabulary', 'grammar', 'reading', 'writing'] as const).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--app-card)', borderRadius: 12, padding: '12px 16px' }}>
              <span style={{ fontSize: 20 }}>{STAGE_LABELS[s].split(' ')[0]}</span>
              <span style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-text)', fontSize: 14 }}>{STAGE_LABELS[s].slice(3)}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setStage('vocabulary')} style={{ width: '100%', padding: '15px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--gold) 0%, #ffb300 100%)', color: '#0a0a0a', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal, sans-serif', cursor: 'pointer' }}>
          ابدئي الآن! 🚀
        </button>
      </div>
    </main>
  )

  // ── LOADING ───────────────────────────────────────────────
  if (stage === 'loading') return (
    <main style={{ minHeight: '100vh', background: 'var(--app-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ fontSize: 56, animation: 'var(--animate-float)' }}>🔮</div>
      <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 16, direction: 'rtl' }}>
        مس نورا تحلّل إجاباتك...
      </p>
    </main>
  )

  // ── RESULT ────────────────────────────────────────────────
  if (stage === 'result' && result) return (
    <main style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 380, width: '100%', animation: 'var(--animate-fade-up)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: 28, background: 'linear-gradient(135deg, var(--gold) 0%, var(--purple) 100%)', fontSize: 44 }}>
            🏆
          </div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, textAlign: 'center', color: 'var(--gold)', marginBottom: 6 }}>
          {result.levelName}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--purple-light)', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
          {result.level} · {result.levelNameAr}
        </p>

        <div style={{ background: 'var(--app-card)', borderRadius: 16, padding: '18px 18px', marginBottom: 16, direction: 'rtl' }}>
          <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-text)', fontSize: 15, lineHeight: 1.75 }}>
            {result.encouragementAr}
          </p>
        </div>

        {result.strengths.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--mint)', fontSize: 13, marginBottom: 8, direction: 'rtl' }}>✅ نقاط القوة</p>
            {result.strengths.map((s, i) => (
              <p key={i} style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 13, direction: 'rtl', marginBottom: 4 }}>• {s}</p>
            ))}
          </div>
        )}

        <button onClick={() => router.replace('/dashboard')} style={{ width: '100%', padding: '15px 0', borderRadius: 12, border: 'none', marginTop: 16, background: 'linear-gradient(135deg, var(--purple) 0%, var(--gold) 100%)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal, sans-serif', cursor: 'pointer' }}>
          انطلقي للوحة التحكم! ✨
        </button>
      </div>
    </main>
  )

  // ── SHARED WRAPPER ────────────────────────────────────────
  const headerLabel = stage === 'reading' ? STAGE_LABELS.reading
    : stage === 'writing' ? STAGE_LABELS.writing
    : stage === 'grammar' ? STAGE_LABELS.grammar
    : STAGE_LABELS.vocabulary

  return (
    <main style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '24px 20px 100px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 13 }}>{headerLabel}</span>
            <span style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', fontSize: 13 }}>{stageProgress()}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--app-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${stageProgress()}%`, background: 'linear-gradient(90deg, var(--purple) 0%, var(--gold) 100%)', transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* VOCABULARY stage */}
        {stage === 'vocabulary' && (
          <>
            <QuestionCard
              index={qIndex}
              total={VOCABULARY_QUESTIONS.length}
              question={currentVQ.question}
              options={currentVQ.options}
              correct={currentVQ.correct}
              selected={vAnswers[qIndex]}
              revealed={revealed}
              onSelect={selectVocab}
            />
            {revealed && (
              <button onClick={() => nextQuestion(vAnswers, VOCABULARY_QUESTIONS, 'grammar')}
                style={{ width: '100%', marginTop: 8, padding: '14px 0', borderRadius: 12, border: 'none', background: 'var(--purple)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal, sans-serif', cursor: 'pointer' }}>
                {qIndex < VOCABULARY_QUESTIONS.length - 1 ? 'السؤال التالي →' : 'التالي: القواعد →'}
              </button>
            )}
          </>
        )}

        {/* GRAMMAR stage */}
        {stage === 'grammar' && (
          <>
            <QuestionCard
              index={qIndex}
              total={GRAMMAR_QUESTIONS.length}
              question={currentGQ.question}
              options={currentGQ.options}
              correct={currentGQ.correct}
              selected={gAnswers[qIndex]}
              revealed={revealed}
              onSelect={selectGrammar}
            />
            {revealed && (
              <button onClick={() => nextQuestion(gAnswers, GRAMMAR_QUESTIONS, 'reading')}
                style={{ width: '100%', marginTop: 8, padding: '14px 0', borderRadius: 12, border: 'none', background: 'var(--purple)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal, sans-serif', cursor: 'pointer' }}>
                {qIndex < GRAMMAR_QUESTIONS.length - 1 ? 'السؤال التالي →' : 'التالي: القراءة →'}
              </button>
            )}
          </>
        )}

        {/* READING stage */}
        {stage === 'reading' && (
          <>
            <PassageCard title={READING_STAGE.title} passage={READING_STAGE.passage} />
            <QuestionCard
              index={qIndex}
              total={READING_STAGE.questions.length}
              question={currentRQ.question}
              options={currentRQ.options}
              correct={currentRQ.correct}
              selected={rAnswers[qIndex]}
              revealed={revealed}
              onSelect={selectReading}
            />
            {revealed && (
              <button onClick={() => nextQuestion(rAnswers, READING_STAGE.questions, 'writing')}
                style={{ width: '100%', marginTop: 8, padding: '14px 0', borderRadius: 12, border: 'none', background: 'var(--purple)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal, sans-serif', cursor: 'pointer' }}>
                {qIndex < READING_STAGE.questions.length - 1 ? 'السؤال التالي →' : 'التالي: الكتابة →'}
              </button>
            )}
          </>
        )}

        {/* WRITING stage */}
        {stage === 'writing' && (
          <>
            <WritingInput prompt={WRITING_PROMPT} value={writing} onChange={setWriting} />
            {error && (
              <p style={{ color: 'var(--error)', fontFamily: 'Tajawal, sans-serif', fontSize: 14, direction: 'rtl', textAlign: 'center', marginTop: 12 }}>{error}</p>
            )}
            <button
              onClick={submitDiagnostic}
              disabled={writing.trim().split(/\s+/).length < 5}
              style={{ width: '100%', marginTop: 20, padding: '15px 0', borderRadius: 12, border: 'none', background: writing.trim().split(/\s+/).length < 5 ? 'var(--app-border)' : 'linear-gradient(135deg, var(--gold) 0%, #ffb300 100%)', color: writing.trim().split(/\s+/).length < 5 ? 'var(--app-muted)' : '#0a0a0a', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal, sans-serif', cursor: writing.trim().split(/\s+/).length < 5 ? 'not-allowed' : 'pointer' }}>
              أرسلي إجاباتك 🚀
            </button>
          </>
        )}

      </div>
    </main>
  )
}
