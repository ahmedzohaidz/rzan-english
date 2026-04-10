import { anthropic, MODEL } from '@/lib/claude'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType = 'image/jpeg' } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'لم يتم إرسال صورة' }, { status: 400 })

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const safeType   = validTypes.includes(mediaType) ? mediaType : 'image/jpeg'

    const response = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 200,
      messages: [{
        role:    'user',
        content: [
          {
            type:   'image',
            source: {
              type:       'base64',
              media_type: safeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data:       imageBase64,
            },
          },
          {
            type: 'text',
            text: `أنتِ "المحققة كلود"، معلمة إنجليزية ممتعة لرزان (12 سنة، تحب القصص الغامضة).
انظري إلى هذه الصورة وحدّدي الشيء الرئيسي فيها.
أعيدي JSON صالح فقط بدون أي نص إضافي:
{
  "word":       "الكلمة الإنجليزية (اسم مفرد، مستوى أساسي)",
  "meaning_ar": "المعنى بالعربية (كلمة أو كلمتان)",
  "sentence":   "جملة بسيطة بالإنجليزي تستخدم الكلمة (8 كلمات كحد أقصى، مستوى A1-A2)",
  "emoji":      "رمز تعبيري واحد مناسب"
}`,
          },
        ],
      }],
    })

    const raw   = response.content.map((b: any) => b.text || '').join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const data  = JSON.parse(clean)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Vision API error:', err)
    return NextResponse.json({ error: 'فشل تحليل الصورة' }, { status: 500 })
  }
}
