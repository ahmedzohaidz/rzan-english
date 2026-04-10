import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text') ?? ''
  const lang = searchParams.get('lang') ?? 'en'

  if (!text.trim()) return new NextResponse(null, { status: 400 })

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob&ttsspeed=0.8`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer':    'https://translate.google.com/',
      },
    })

    if (!res.ok) throw new Error(`TTS status ${res.status}`)

    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    // Return empty 204 so client can fall back to Web Speech API
    return new NextResponse(null, { status: 204 })
  }
}
