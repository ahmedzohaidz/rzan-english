import Anthropic from '@anthropic-ai/sdk'
import { levelToString } from '@/types'
import type { DiagnosticAnswer, DiagnosticResult, EnglishLevel } from '@/types'
import type { RzanProfileRow } from '@/types/supabase'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODEL = 'claude-sonnet-4-20250514'

export function buildTeacherSystemPrompt(
  level: EnglishLevel,
  recentErrors: string[]
): string {
  return `أنتِ "المحققة كلود" — مساعدة تعليمية ذكية تساعدين رزان (عمرها 12 سنة) على تعلم اللغة الإنجليزية.
مستوى رزان: ${level}. تحب الروايات الغامضة والكتابة الإبداعية.
كلماتها الصعبة مؤخراً: ${recentErrors.join('، ') || 'لا يوجد بعد'}.

قواعد صارمة:
- تكلمي رزان دائماً بالعربية البسيطة الواضحة المناسبة لعمر 12 سنة
- الإنجليزي فقط للكلمات والجمل التي تُدرِّسينها
- بعد كل كلمة إنجليزية اكتبي معناها بالعربية مباشرة: مثال: "adventure (مغامرة)"
- صحّحي أخطاءها بلطف داخل ردك بدون إحراج مباشر
- اربطي الدروس دائماً بعالم القصص والروايات الغامضة
- عند ظهور كلمة جديدة ضعي بعدها: [كلمة جديدة ⭐]
- لا تكتبي فقرات طويلة، استخدمي نقاط قصيرة وواضحة
- ابدئي ردودك دائماً بـ: 🔍 المحققة رزان!
- أسلوبك: مشجع، لطيف، مثير كالروايات الغامضة`
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
    system: 'أنت متخصص في تقييم مستوى اللغة الإنجليزية. ردّك يجب أن يكون JSON صالح فقط بدون أي نص إضافي.',
    messages: [{
      role: 'user',
      content: `الطالبة: رزان، عمرها 12 سنة، من السعودية. تحب كتابة الروايات.
النتيجة: ${score.correct} من ${score.total} (${score.pct}%)
إجاباتها:\n${summary}

أعد JSON بهذا الشكل بالضبط:
{
  "level":"A1|A2|B1",
  "levelName":"string (مثل: Beginner)",
  "levelNameAr":"string (مثل: مبتدئة)",
  "overallScore":${score.pct},
  "strengths":["نقطة قوة بالعربية"],
  "weaknesses":["نقطة ضعف بالعربية"],
  "summaryAr":"ملخص 2-3 جمل بالعربية للأب عن مستوى ابنته",
  "encouragementAr":"رسالة تشجيعية دافئة بالعربية لرزان تذكر فيها حبها للكتابة والروايات"
}`
    }]
  })

  const raw   = response.content.map(b => ('text' in b ? b.text : '')).join('')
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as DiagnosticResult
}

export async function generateDailyMission(profile: RzanProfileRow) {
  const levelStr = levelToString(profile.level)

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: 'أنت مولّد مهام تعليمية يومية. ردّك يجب أن يكون JSON صالح فقط بدون أي نص إضافي.',
    messages: [{
      role: 'user',
      content: `أنشئ مهمة يومية لرزان:
المستوى: ${levelStr}
السلسلة: ${profile.streak_days} يوم
النقاط: ${profile.points}
رزان تحب الروايات الغامضة والكتابة الإبداعية.

أعد JSON بهذا الشكل:
{
  "mission_date": "${new Date().toISOString().split('T')[0]}",
  "type": "vocabulary|reading|writing|chat",
  "title": "عنوان قصير بالعربية",
  "description": "وصف المهمة بالعربية مرتبط بعالم القصص والروايات (جملة أو جملتان)",
  "points_reward": 10
}`
    }]
  })

  const raw   = response.content.map(b => ('text' in b ? b.text : '')).join('')
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
