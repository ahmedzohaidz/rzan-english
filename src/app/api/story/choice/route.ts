import { anthropic, MODEL } from '@/lib/claude'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { theme, history, chapterNum } = await req.json()
    const isLast = chapterNum >= 5

    const res = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 400,
      system:     'أنتِ كاتبة قصص تفاعلية لرزان (12 سنة، تتعلم الإنجليزية). مفردات A2 بسيطة. JSON صالح فقط بدون أي نص إضافي.',
      messages: [{
        role:    'user',
        content: `موضوع القصة: ${theme}
خيارات رزان حتى الآن: ${history.join(' → ')}
اكتبي الفصل ${chapterNum}. ${isLast
  ? 'هذا هو الفصل الأخير. اكتبي نهاية سعيدة ومُرضية تُشير لخياراتها السابقة. اجعلي finished: true.'
  : 'تابعي القصة بناءً على خيارها. اختمي بقرار جديد.'
}
أعيدي هذا JSON فقط:
{
  "chapterNum": ${chapterNum},
  "text": "نص الفصل هنا بالإنجليزية...",
  "choices": ${isLast ? 'null' : '{"a":"الخيار أ بالإنجليزية","b":"الخيار ب بالإنجليزية"}'},
  "finished": ${isLast}
}`,
      }],
    })

    const raw = res.content.map((b: any) => b.text || '').join('')
    return NextResponse.json(JSON.parse(raw.replace(/```json|```/g, '').trim()))
  } catch (err) {
    console.error('Story choice error:', err)
    return NextResponse.json({ error: 'فشل المتابعة' }, { status: 500 })
  }
}
