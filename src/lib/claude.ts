import Anthropic from '@anthropic-ai/sdk'
import type {
  Level, RzanProfile, DailyMission,
  DiagnosticAnswer, DiagnosticResult
} from '@/types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODEL = 'claude-sonnet-4-20250514'

export function buildTeacherSystemPrompt(
  level: Level,
  recentErrors: string[]
): string {
  return `أنت مس نورا، معلمة إنجليزية محبوبة وصبورة لطفلة اسمها رزان.
رزان عمرها 12 سنة، مستواها ${level}، وتحب الروايات والكتابة الإبداعية.
أخطاؤها الأخيرة: ${recentErrors.join('، ') || 'لا يوجد بعد'}.
قواعد التدريس:
- ردودك: عربي + إنجليزي مختلط بشكل طبيعي
- صححي أخطاءها بلطف داخل ردك بدون إحراج
- دائماً اربطي الدروس بعالم القصص والروايات
- عند ظهور كلمة جديدة ضعي بعدها: [كلمة جديدة ⭐]
- شجّعيها دائماً وكوني حماسية`
}

export async function analyzeDiagnostic(
  answers: DiagnosticAnswer[],
  score: { correct: number; total: number; pct: number }
): Promise<DiagnosticResult> {
  const summary = answers.map(a =>
    a.textAnswer
      ? `Writing: "${a.textAnswer}"`
      : `Q: ${a.question} | Chosen: ${a.chosen} | Correct: ${a.correct} | ${a.isRight ? '✓' : '✗'}`
  ).join('\n')

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: 'You are an expert English assessment specialist. Respond ONLY with valid JSON, no markdown.',
    messages: [{
      role: 'user',
      content: `Student: Rzan, age 12, Saudi Arabia. Loves writing novels.
Score: ${score.correct}/${score.total} (${score.pct}%)
Answers:\n${summary}

Return JSON: {
  "level":"A1|A2|B1",
  "levelName":"string",
  "levelNameAr":"string",
  "overallScore":${score.pct},
  "strengths":["Arabic string"],
  "weaknesses":["Arabic string"],
  "summaryAr":"Arabic 2-3 sentences for parent",
  "encouragementAr":"Warm Arabic message to Rzan mentioning her love of writing"
}`
    }]
  })

  const raw   = response.content.map(b => ('text' in b ? b.text : '')).join('')
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as DiagnosticResult
}

export async function generateDailyMission(
  profile: RzanProfile
): Promise<Omit<DailyMission, 'id' | 'created_at'>> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: 'English learning mission generator. Respond ONLY with valid JSON.',
    messages: [{
      role: 'user',
      content: `Generate a daily mission for Rzan:
Level: ${profile.level}
Streak: ${profile.current_streak} days
Points: ${profile.total_points}

Return JSON: {
  "date": "${new Date().toISOString().split('T')[0]}",
  "mission_type": "vocabulary|grammar|reading|writing",
  "description_ar": "Arabic description connecting to novels/stories",
  "target_count": 3,
  "completed_count": 0,
  "is_completed": false,
  "points_earned": 0
}`
    }]
  })

  const raw   = response.content.map(b => ('text' in b ? b.text : '')).join('')
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
