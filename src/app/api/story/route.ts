import { anthropic, MODEL } from '@/lib/claude'
import { NextRequest, NextResponse } from 'next/server'

const THEME_CONTEXTS: Record<string, string> = {
  mystery: 'مدرسة غامضة مليئة بالأسرار الخفية',
  magic:   'مملكة سحرية بها حيوانات تتكلم',
  ocean:   'مغامرة تحت الماء مع مخلوقات البحر',
  space:   'رحلة فضائية لاكتشاف كواكب جديدة',
  forest:  'غابة مسحورة يخفي فيها كنز',
}

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json()
    const context   = THEME_CONTEXTS[theme] ?? 'a magical adventure'

    const res = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 400,
      system:     'أنتِ كاتبة قصص تفاعلية لرزان (12 سنة، تتعلم الإنجليزية). اكتبي القصة بالإنجليزي البسيط مستوى A2. أعيدي JSON صالح فقط بدون أي نص إضافي.',
      messages: [{
        role:    'user',
        content: `اكتبي قصة تجري أحداثها في: ${context}
البطلة هي رزان نفسها (استخدمي اسمها!).
الفصل 1: 3-4 جمل إنجليزية بسيطة وحيّة. اختمي بلحظة قرار لرزان.
أعيدي هذا JSON فقط:
{
  "chapterNum": 1,
  "text": "نص القصة هنا بالإنجليزية...",
  "choices": {
    "a": "الخيار الأول (جملة قصيرة بالإنجليزية)",
    "b": "الخيار الثاني (جملة قصيرة بالإنجليزية)"
  },
  "finished": false
}`,
      }],
    })

    const raw = res.content.map((b: any) => b.text || '').join('')
    return NextResponse.json(JSON.parse(raw.replace(/```json|```/g, '').trim()))
  } catch (err) {
    console.error('Story API error:', err)
    return NextResponse.json({ error: 'فشل إنشاء القصة' }, { status: 500 })
  }
}
