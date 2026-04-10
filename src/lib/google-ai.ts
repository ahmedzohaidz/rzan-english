import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

export const geminiFlash = genAI.getGenerativeModel({
  model:          'gemini-1.5-flash',
  safetySettings,
})

/* ── Story generation ────────────────────────────────────── */
export async function generateStoryChapterGemini(
  context: string,
  chapterNum: number,
  history: string[],
  isLast: boolean,
): Promise<string> {
  const historyLine = history.length
    ? `رزان اختارت: ${history.join(' → ')}`
    : ''

  const prompt = chapterNum === 1
    ? `أنتِ كاتبة قصص تفاعلية لرزان (12 سنة، تتعلم الإنجليزية، تحب القصص الغامضة).
المكان: ${context}
اكتبي الفصل 1. البطلة هي رزان نفسها. 3-4 جمل إنجليزية بسيطة مستوى A2. اختمي بلحظة قرار.
أعيدي JSON صالح فقط:
{"chapterNum":1,"text":"...","choices":{"a":"...","b":"..."},"finished":false}`
    : `أنتِ كاتبة قصص تفاعلية لرزان.
المكان: ${context}
${historyLine}
اكتبي الفصل ${chapterNum}. ${isLast
  ? 'الفصل الأخير. نهاية سعيدة تُشير لخياراتها. finished:true, choices:null.'
  : 'تابعي القصة بناءً على خيارها. اختمي بقرار جديد.'}
أعيدي JSON صالح فقط:
{"chapterNum":${chapterNum},"text":"...","choices":${isLast ? 'null' : '{"a":"...","b":"..."}'},"finished":${isLast}}`

  const result = await geminiFlash.generateContent({
    contents:         [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 450 },
  })
  return result.response.text()
}

/* ── Vision: analyze image (anime detective style) ───────── */
export async function analyzeImageGemini(imageBase64: string, mimeType: string): Promise<string> {
  const result = await geminiFlash.generateContent({
    contents: [{
      role:  'user',
      parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: `أنتِ "المحققة كلود" — شخصية أنمي ذكية وحماسية مثل المحققات في أنمي الغموض!
حدّدي الشيء الرئيسي في الصورة.
أعيدي JSON صالح فقط:
{
  "word":          "الكلمة الإنجليزية الرئيسية (اسم مفرد أساسي)",
  "meaning_ar":    "المعنى بالعربية (كلمة أو كلمتان)",
  "sentence":      "جملة بسيطة بالإنجليزية (حد أقصى 8 كلمات، مستوى A1-A2)",
  "emoji":         "رمز تعبيري واحد مناسب",
  "detective_note":"ملاحظة المحققة بالعربية بأسلوب أنمي مثير (جملة واحدة قصيرة مثل: آها! أنا وجدت الدليل!)"
}` },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 200 },
  })
  return result.response.text()
}

/* ── Daily mission ───────────────────────────────────────── */
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

  const result = await geminiFlash.generateContent({
    contents:         [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 250 },
  })
  return result.response.text()
}
