import { NextRequest } from 'next/server'
import { getSessionProfile } from '@/lib/session'
import { anthropic, MODEL, buildTeacherSystemPrompt } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase/service'
import { levelToString } from '@/types'

export async function POST(req: NextRequest) {
  const profile = await getSessionProfile()
  if (!profile) return new Response('غير مصرح', { status: 401 })

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('لا توجد رسائل', { status: 400 })
  }

  // Fetch recent wrong vocabulary for context
  const supabase = createServiceClient()
  const { data: weak } = await supabase
    .from('rzan_vocabulary')
    .select('word')
    .eq('profile_id', profile.id)
    .lt('correct_count', 2)
    .order('next_review')
    .limit(5)

  const recentErrors = weak?.map(w => w.word) ?? []
  const level        = levelToString(profile.level)
  const systemPrompt = buildTeacherSystemPrompt(level, recentErrors)

  // Stream response from Claude
  const stream = await anthropic.messages.stream({
    model:      MODEL,
    max_tokens: 1024,
    system:     systemPrompt,
    messages,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
