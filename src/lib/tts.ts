'use client'

/** Speak text using the /api/tts proxy (Google Translate TTS).
 *  Falls back to browser Web Speech API on failure. */
export function speak(text: string, lang = 'en', rate = 0.85): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`)
    audio.onended = () => resolve()
    audio.onerror = () => fallback(text, lang, rate, resolve)
    audio.play().catch(() => fallback(text, lang, rate, resolve))
  })
}

function fallback(text: string, lang: string, rate: number, onEnd: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd(); return }
  const u  = new SpeechSynthesisUtterance(text)
  u.lang   = lang.startsWith('en') ? 'en-US' : lang
  u.rate   = rate
  u.onend  = onEnd
  const trySpeak = () => {
    const voices = speechSynthesis.getVoices()
    const best   = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
                || voices.find(v => v.lang.startsWith('en'))
    if (best) u.voice = best
    speechSynthesis.speak(u)
  }
  speechSynthesis.getVoices().length > 0 ? trySpeak() : (speechSynthesis.onvoiceschanged = trySpeak)
}
