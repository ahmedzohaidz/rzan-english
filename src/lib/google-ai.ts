/**
 * Google Gemini 1.5 Flash — primary AI engine for stories, vision, and missions.
 * Auto-fallback to Claude Sonnet when GOOGLE_AI_API_KEY is missing or invalid.
 */
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { anthropic, MODEL } from './claude'

/** Strip markdown code fences that Claude sometimes wraps around JSON */
function cleanJson(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
}

/* ── Gemini client (lazy — only initialised when key present) ─────────── */
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY ?? ''
const hasGemini  = Boolean(GOOGLE_KEY && GOOGLE_KEY !== 'your_google_ai_api_key_here')

let geminiFlash: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']> | null = null

if (hasGemini) {
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
  geminiFlash = new GoogleGenerativeAI(GOOGLE_KEY).getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    safetySettings,
  })
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Story generation                                                         */
/* ─────────────────────────────────────────────────────────────────────── */
function buildStoryPrompt(
  context: string,
  chapterNum: number,
  history: string[],
  isLast: boolean,
): string {
  const historyLine = history.length ? `رزان اختارت: ${history.join(' → ')}` : ''
  if (chapterNum === 1) {
    return `أنتِ كاتبة قصص تفاعلية لرزان (12 سنة، تتعلم الإنجليزية، تحب القصص الغامضة).
المكان: ${context}
اكتبي الفصل 1. البطلة هي رزان نفسها. 3-4 جمل إنجليزية بسيطة مستوى A2. اختمي بلحظة قرار.
أعيدي JSON صالح فقط:
{"chapterNum":1,"text":"...","choices":{"a":"...","b":"..."},"finished":false}`
  }
  return `أنتِ كاتبة قصص تفاعلية لرزان.
المكان: ${context}
${historyLine}
اكتبي الفصل ${chapterNum}. ${isLast
  ? 'الفصل الأخير. نهاية سعيدة تُشير لخياراتها. finished:true, choices:null.'
  : 'تابعي القصة بناءً على خيارها. اختمي بقرار جديد.'}
أعيدي JSON صالح فقط:
{"chapterNum":${chapterNum},"text":"...","choices":${isLast ? 'null' : '{"a":"...","b":"..."}'},"finished":${isLast}}`
}

export async function generateStoryChapterGemini(
  context: string,
  chapterNum: number,
  history: string[],
  isLast: boolean,
): Promise<string> {
  const prompt = buildStoryPrompt(context, chapterNum, history, isLast)

  /* Try Gemini first */
  if (geminiFlash) {
    try {
      const result = await geminiFlash.generateContent({
        contents:         [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 450 },
      })
      return cleanJson(result.response.text())
    } catch (err) {
      console.warn('[google-ai] Gemini story failed, falling back to Claude:', (err as Error).message)
    }
  }

  /* Fallback → Claude */
  const resp = await anthropic.messages.create({
    model:      MODEL,
    max_tokens: 600,
    system:     'أنتِ كاتبة قصص تفاعلية. ردّك يجب أن يكون JSON صالح فقط بدون أي نص إضافي.',
    messages:   [{ role: 'user', content: prompt }],
  })
  return cleanJson(resp.content.map(b => ('text' in b ? b.text : '')).join(''))
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Vision — analyze image (anime detective style)                           */
/* ─────────────────────────────────────────────────────────────────────── */
const VISION_PROMPT = `أنتِ "المحققة كلود" — شخصية أنمي ذكية وحماسية مثل المحققات في أنمي الغموض!
حدّدي الشيء الرئيسي في الصورة.
أعيدي JSON صالح فقط:
{
  "word":          "الكلمة الإنجليزية الرئيسية (اسم مفرد أساسي)",
  "meaning_ar":    "المعنى بالعربية (كلمة أو كلمتان)",
  "sentence":      "جملة بسيطة بالإنجليزية (حد أقصى 8 كلمات، مستوى A1-A2)",
  "emoji":         "رمز تعبيري واحد مناسب",
  "detective_note":"ملاحظة المحققة بالعربية بأسلوب أنمي مثير (جملة واحدة قصيرة مثل: آها! أنا وجدت الدليل!)"
}`

export async function analyzeImageGemini(imageBase64: string, mimeType: string): Promise<string> {
  /* Try Gemini first */
  if (geminiFlash) {
    try {
      const result = await geminiFlash.generateContent({
        contents: [{
          role:  'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: VISION_PROMPT },
          ],
        }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 200 },
      })
      return cleanJson(result.response.text())
    } catch (err) {
      console.warn('[google-ai] Gemini vision failed, falling back to Claude:', (err as Error).message)
    }
  }

  /* Fallback → Claude Vision */
  const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
  type ClaudeImageMime = typeof validMimes[number]
  const safeMime = (validMimes.includes(mimeType as ClaudeImageMime)
    ? mimeType : 'image/jpeg') as ClaudeImageMime

  const resp = await anthropic.messages.create({
    model:      MODEL,
    max_tokens: 300,
    system:     'أنتِ محققة أنمي تحلل الصور. ردّك يجب أن يكون JSON صالح فقط بدون أي نص إضافي.',
    messages:   [{
      role:    'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: safeMime, data: imageBase64 } },
        { type: 'text',  text: VISION_PROMPT },
      ],
    }],
  })
  return cleanJson(resp.content.map(b => ('text' in b ? b.text : '')).join(''))
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Daily mission generation                                                 */
/* ─────────────────────────────────────────────────────────────────────── */
export async function generateMissionGemini(
  levelStr: string,
  streakDays: number,
  points: number,
): Promise<string> {
  const prompt = `أنشئ مهمة يومية واحدة لرزان (12 سنة، تحب الروايات الغامضة).
المستوى: ${levelStr} | السلسلة: ${streakDays} يوم | النقاط: ${points}
أعيدي JSON صالح فقط:
{
  "mission_date":  "${new Date().toISOString().split('T')[0]}",
  "type":          "vocabulary|reading|writing|chat",
  "title":         "عنوان قصير بالعربية",
  "description":   "وصف المهمة بالعربية مرتبط بعالم القصص (جملة أو جملتان)",
  "points_reward": 10
}`

  /* Try Gemini first */
  if (geminiFlash) {
    try {
      const result = await geminiFlash.generateContent({
        contents:         [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 250 },
      })
      return cleanJson(result.response.text())
    } catch (err) {
      console.warn('[google-ai] Gemini mission failed, falling back to Claude:', (err as Error).message)
    }
  }

  /* Fallback → Claude */
  const resp = await anthropic.messages.create({
    model:      MODEL,
    max_tokens: 350,
    system:     'أنتِ مولّدة مهام تعليمية. ردّك يجب أن يكون JSON صالح فقط بدون أي نص إضافي.',
    messages:   [{ role: 'user', content: prompt }],
  })
  return cleanJson(resp.content.map(b => ('text' in b ? b.text : '')).join(''))
}
