'use client'
import { useCallback, useEffect, useState } from 'react'

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export function useNotifications(userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed]  = useState(false)

  /* ── تحقق من الدعم والإذن الحالي ─────────────────── */
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as NotificationPermission)
  }, [])

  /* ── طلب الإذن ────────────────────────────────────── */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    setPermission(result as NotificationPermission)
    return result === 'granted'
  }, [])

  /* ── الاشتراك في Push ─────────────────────────────── */
  const subscribe = useCallback(async (reminderHour = 19): Promise<boolean> => {
    if (!userId) return false
    try {
      const granted = permission === 'granted' || await requestPermission()
      if (!granted) return false

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return false

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      const res = await fetch('/api/push-subscription', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON(), reminderHour }),
      })

      if (res.ok) { setSubscribed(true); return true }
      return false
    } catch (err) {
      console.error('Subscribe error:', err)
      return false
    }
  }, [userId, permission, requestPermission])

  /* ── إلغاء الاشتراك ───────────────────────────────── */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) return false
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()

      await fetch('/api/push-subscription', { method: 'DELETE' })
      setSubscribed(false)
      return true
    } catch {
      return false
    }
  }, [userId])

  return { permission, subscribed, requestPermission, subscribe, unsubscribe }
}

/* ── مساعد: تحويل VAPID key ──────────────────────────── */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding  = '='.repeat((4 - base64String.length % 4) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw      = atob(base64)
  const output   = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
