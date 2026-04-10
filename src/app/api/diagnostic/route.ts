import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { analyzeDiagnostic } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase/service'
import type { DiagnosticAnswer } from '@/types'

export async function POST(req: NextRequest) {
  const profile = await getSessionProfile()
  if (!profile) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { answers }: { answers: DiagnosticAnswer[] } = await req.json()
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: 'لا توجد إجابات' }, { status: 400 })
  }

  // Score multiple-choice answers (ignore writing stage)
  const mcAnswers = answers.filter(a => !a.textAnswer)
  const correct   = mcAnswers.filter(a => a.isRight).length
  const total     = mcAnswers.length
  const pct       = total > 0 ? Math.round((correct / total) * 100) : 0

  // Ask Claude to analyze
  const result = await analyzeDiagnostic(answers, { correct, total, pct })

  // Map level string to integer (A1=1, A2=2, B1=3, B2=4, C1=5, C2=6)
  const levelMap: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }
  const levelNum = levelMap[result.level] ?? 1

  // Save to profile
  const supabase = createServiceClient()
  await supabase
    .from('rzan_profile')
    .update({ diagnostic_done: true, level: levelNum })
    .eq('id', profile.id)

  return NextResponse.json({ ok: true, result })
}
