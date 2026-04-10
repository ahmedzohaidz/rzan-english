'use client'
import { useEffect, useRef, useCallback } from 'react'

interface Progress {
  current_level:    number
  current_lesson:   number
  xp_points:        number
  completed_lessons: string[]
}

/* ─── نقاط الحفظ التلقائي ──────────────────────────────── */
const AUTOSAVE_INTERVAL = 60_000 // كل 60 ثانية

export function useProgress(userId: string | null) {
  const progressRef = useRef<Progress | null>(null)
  const dirtyRef    = useRef(false)  // هل يوجد تغيير لم يُحفظ؟

  /* ── جلب التقدم من الـ API ─────────────────────────── */
  const loadProgress = useCallback(async (): Promise<Progress | null> => {
    if (!userId) return null
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) return null
      const data = await res.json()
      if (!data.profile) return null

      const p: Progress = {
        current_level:    data.profile.level   ?? 1,
        current_lesson:   1,
        xp_points:        data.profile.points  ?? 0,
        completed_lessons: [],
      }

      // جلب التقدم التفصيلي من user_progress
      const r2 = await fetch('/api/progress')
      if (r2.ok) {
        const d2 = await r2.json()
        if (d2.progress) {
          p.current_lesson    = d2.progress.current_lesson   ?? 1
          p.completed_lessons = d2.progress.completed_lessons ?? []
        }
      }

      progressRef.current = p
      return p
    } catch {
      return null
    }
  }, [userId])

  /* ── حفظ التقدم ────────────────────────────────────── */
  const saveProgress = useCallback(async (updates: Partial<Progress>) => {
    if (!userId) return
    try {
      progressRef.current = { ...(progressRef.current ?? { current_level:1, current_lesson:1, xp_points:0, completed_lessons:[] }), ...updates }
      dirtyRef.current = false
      await fetch('/api/progress', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(updates),
      })
    } catch {
      // silent — سيُعاد المحاولة لاحقاً
    }
  }, [userId])

  /* ── إكمال درس ─────────────────────────────────────── */
  const completeLesson = useCallback(async (lessonId: string, xpGained = 10) => {
    if (!userId) return
    const current   = progressRef.current
    const completed = current?.completed_lessons ?? []
    if (completed.includes(lessonId)) return  // لا تضاعف النقاط

    const newCompleted = [...completed, lessonId]
    const newXP        = (current?.xp_points ?? 0) + xpGained

    await saveProgress({
      completed_lessons: newCompleted,
      xp_points:         newXP,
      current_lesson:    (current?.current_lesson ?? 1) + 1,
    })
  }, [userId, saveProgress])

  /* ── تحديث المستوى ─────────────────────────────────── */
  const updateLevel = useCallback(async (level: number) => {
    dirtyRef.current = true
    await saveProgress({ current_level: level })
  }, [saveProgress])

  /* ── حفظ تلقائي كل 60 ثانية ─────────────────────── */
  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      if (dirtyRef.current) saveProgress({})
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [userId, saveProgress])

  /* ── حفظ عند إغلاق/تصغير التطبيق ──────────────────── */
  useEffect(() => {
    if (!userId) return
    const handleUnload = () => {
      if (!dirtyRef.current || !progressRef.current) return
      // استخدام sendBeacon لضمان الإرسال قبل الإغلاق
      const blob = new Blob(
        [JSON.stringify(progressRef.current)],
        { type: 'application/json' }
      )
      navigator.sendBeacon('/api/progress', blob)
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [userId])

  return { loadProgress, saveProgress, completeLesson, updateLevel }
}
