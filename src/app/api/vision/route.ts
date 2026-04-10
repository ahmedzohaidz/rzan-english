import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageGemini } from '@/lib/google-ai'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType = 'image/jpeg' } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'لم يتم إرسال صورة' }, { status: 400 })

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const safeType   = validTypes.includes(mediaType) ? mediaType : 'image/jpeg'

    const raw  = await analyzeImageGemini(imageBase64, safeType)
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Vision API error:', err)
    return NextResponse.json({ error: 'فشل تحليل الصورة' }, { status: 500 })
  }
}
