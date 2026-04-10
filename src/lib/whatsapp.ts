// WhatsApp Business API — sends a text message via DiagPro's existing integration
// Env vars needed: WHATSAPP_API_URL, WHATSAPP_API_TOKEN, PARENT_WHATSAPP

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL
  const token  = process.env.WHATSAPP_API_TOKEN

  // If not configured, log and skip gracefully
  if (!apiUrl || !token) {
    console.warn('[WhatsApp] Not configured — skipping send. Set WHATSAPP_API_URL and WHATSAPP_API_TOKEN.')
    return false
  }

  try {
    const res = await fetch(apiUrl, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        type: 'text',
        text: { body: message },
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[WhatsApp] Send failed:', err)
    return false
  }
}

export function buildWeeklyReport(data: {
  name:          string
  level:         string
  points:        number
  streak:        number
  missionsThisWeek: number
  storiesCount:  number
  vocabCount:    number
  encouragement: string
}): string {
  const { name, level, points, streak, missionsThisWeek, storiesCount, vocabCount, encouragement } = data

  return `📊 *تقرير رزان الأسبوعي*

👩‍🎓 *الاسم:* ${name}
🎓 *المستوى:* ${level}
⭐ *النقاط المجموعة:* ${points}
🔥 *الأيام المتتالية:* ${streak} يوم

📋 *هذا الأسبوع:*
✅ مهام مكتملة: ${missionsThisWeek}
📖 قصص مكتوبة: ${storiesCount}
🔤 كلمات متعلمة: ${vocabCount}

💬 *ملاحظة مس نورا:*
${encouragement}

_تقرير تلقائي من منصة رزان للتعلم_`
}
