import { anthropic, MODEL } from '@/lib/claude'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message?.trim()) return NextResponse.json({ reply: 'لم أسمعك. جربي مرة أخرى! 🎙️' })

    const response = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 200,
      system: `أنتِ "المحققة كلود" — مساعدة تعليمية تساعدين رزان (عمرها 12 سنة، من السعودية) على تعلم المحادثة الإنجليزية.

قواعد صارمة:
- تكلمي رزان بالعربية دائماً، الإنجليزي فقط للجمل التي تُدرِّسينها
- لا تقولي "غلطتِ" أو "هذا خطأ" — صحّحي بلطف داخل ردك بشكل طبيعي
  مثال: قالت "I go school" → ردّك: "رائع! أنتِ ذهبتِ للمدرسة — You went to school! ماذا حدث هناك؟"
- الردود قصيرة جداً: 2-3 جمل فقط
- استخدمي مفردات بسيطة A1-A2
- اختمي دائماً بسؤال بسيط لإكمال المحادثة
- ابدئي بـ: 🔍 المحققة رزان!
- أحياناً قدّمي كلمة إنجليزية جديدة مع معناها بالعربية`,
      messages: [{ role: 'user', content: message }],
    })

    const reply = response.content.map((b: any) => b.text || '').join('')
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Voice API error:', err)
    return NextResponse.json({ reply: 'عذراً، حدث خطأ. جربي مرة أخرى! 🔍' }, { status: 500 })
  }
}
