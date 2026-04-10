'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WeeklyStats   from '@/components/parent/WeeklyStats'
import ProgressChart from '@/components/parent/ProgressChart'
import StoryReview   from '@/components/parent/StoryReview'

interface Summary {
  profile: {
    name:           string
    level:          string
    levelNum:       number
    points:         number
    streak:         number
    diagnosticDone: boolean
    lastActive:     string | null
  }
  weeklyActivity:  { date: string; completed: number; total: number; points: number }[]
  recentWriting:   {
    id: string; title: string; genre: string; word_count: number;
    ai_feedback: string | null; created_at: string; points_earned: number
  }[]
  vocabStats:   { total: number; accuracy: number; recent: { word: string; correct_count: number; review_count: number }[] }
  missionStats: { completedThisWeek: number; totalThisWeek: number }
}

export default function ParentDashboard() {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,       setTab]     = useState<'overview' | 'writing' | 'vocab'>('overview')
  const [sending,   setSending]  = useState(false)
  const [reportMsg, setReportMsg] = useState('')

  useEffect(() => {
    fetch('/api/parent/summary')
      .then(r => {
        if (r.status === 401) { router.replace('/parent/login'); return null }
        return r.ok ? r.json() : null
      })
      .then(data => data && setSummary(data))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSendReport() {
    setSending(true)
    setReportMsg('')
    try {
      const res  = await fetch('/api/whatsapp-report', { method: 'POST' })
      const data = await res.json()
      setReportMsg(data.sent ? '✅ تم إرسال التقرير عبر واتساب!' : '📋 التقرير جاهز (واتساب غير مفعّل)')
    } catch {
      setReportMsg('❌ حدث خطأ')
    } finally {
      setSending(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/parent/login')
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--app-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, animation: 'var(--animate-float)' }}>👨‍👧</div>
        <p style={{ fontFamily: 'Tajawal, sans-serif', color: 'var(--app-muted)', marginTop: 12 }}>جاري التحميل...</p>
      </div>
    </main>
  )

  if (!summary) return null

  const { profile, weeklyActivity, recentWriting, vocabStats, missionStats } = summary

  return (
    <main style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '0 0 40px' }}>

      {/* Header */}
      <div style={{
        background:   'var(--app-surface)',
        borderBottom: '1px solid var(--app-border)',
        padding:      '18px 20px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 12, color: 'var(--app-muted)', direction: 'rtl' }}>لوحة ولي الأمر</p>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--app-text)', direction: 'rtl' }}>
            متابعة رزان 👨‍👧
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSendReport} disabled={sending} style={{
            padding:      '7px 14px',
            borderRadius: 20,
            border:       'none',
            background:   sending ? 'var(--app-border)' : 'var(--mint)',
            color:        sending ? 'var(--app-muted)' : '#0a0a0a',
            fontSize:     12,
            fontWeight:   700,
            cursor:       sending ? 'not-allowed' : 'pointer',
            fontFamily:   'Tajawal, sans-serif',
          }}>
            {sending ? '...' : '📤 تقرير'}
          </button>
          <button onClick={handleLogout} style={{
            padding:      '7px 14px',
            borderRadius: 20,
            border:       '1px solid var(--app-border)',
            background:   'transparent',
            color:        'var(--app-muted)',
            fontSize:     12,
            cursor:       'pointer',
            fontFamily:   'Tajawal, sans-serif',
          }}>
            خروج
          </button>
        </div>
      </div>

      {reportMsg && (
        <div style={{ background: 'rgba(79,255,176,0.1)', borderBottom: '1px solid var(--mint)', padding: '10px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: 'var(--mint)', direction: 'rtl' }}>{reportMsg}</p>
        </div>
      )}

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Profile summary card */}
        <div style={{
          background:   'linear-gradient(135deg, rgba(155,89,255,0.15) 0%, rgba(255,209,0,0.1) 100%)',
          border:       '1.5px solid var(--purple)',
          borderRadius: 18,
          padding:      '18px 20px',
          marginBottom: 20,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 20, fontWeight: 900, color: 'var(--app-text)', direction: 'rtl' }}>
              {profile.name}
            </p>
            <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 13, color: 'var(--purple-light)', direction: 'rtl', marginTop: 2 }}>
              المستوى: <strong>{profile.level}</strong>
              {profile.lastActive && ` · آخر نشاط: ${new Date(profile.lastActive).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}`}
            </p>
            {!profile.diagnosticDone && (
              <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 12, color: 'var(--error)', direction: 'rtl', marginTop: 4 }}>
                ⚠️ لم تكمل اختبار التحديد بعد
              </p>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--purple) 100%)',
              borderRadius: 16,
              width: 60, height: 60,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              📖
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'overview', label: 'نظرة عامة' },
            { key: 'writing',  label: 'القصص' },
            { key: 'vocab',    label: 'المفردات' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex:         1,
              padding:      '9px 0',
              borderRadius: 12,
              border:       `1.5px solid ${tab === t.key ? 'var(--gold)' : 'var(--app-border)'}`,
              background:   tab === t.key ? 'rgba(255,209,0,0.1)' : 'transparent',
              color:        tab === t.key ? 'var(--gold)' : 'var(--app-muted)',
              fontSize:     13,
              fontWeight:   tab === t.key ? 700 : 400,
              cursor:       'pointer',
              fontFamily:   'Tajawal, sans-serif',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WeeklyStats activity={weeklyActivity} missionsWeek={missionStats} />
            <ProgressChart vocabStats={vocabStats} streak={profile.streak} points={profile.points} />
          </div>
        )}

        {tab === 'writing' && (
          <div>
            <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--app-text)', direction: 'rtl', marginBottom: 14 }}>
              آخر القصص المكتوبة ✍️
            </p>
            <StoryReview stories={recentWriting} />
          </div>
        )}

        {tab === 'vocab' && (
          <div>
            <p style={{ fontFamily: 'Tajawal, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--app-text)', direction: 'rtl', marginBottom: 14 }}>
              المفردات المتعلّمة 📚
            </p>
            <ProgressChart vocabStats={vocabStats} streak={profile.streak} points={profile.points} />
          </div>
        )}

      </div>
    </main>
  )
}
