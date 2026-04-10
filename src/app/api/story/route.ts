import { NextRequest, NextResponse } from 'next/server'
import { generateStoryChapterGemini } from '@/lib/google-ai'

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
    const context   = THEME_CONTEXTS[theme] ?? 'مغامرة سحرية'

    const raw = await generateStoryChapterGemini(context, 1, [], false)
    return NextResponse.json(JSON.parse(raw))
  } catch (err) {
    console.error('Story API error:', err)
    return NextResponse.json({ error: 'فشل إنشاء القصة' }, { status: 500 })
  }
}
