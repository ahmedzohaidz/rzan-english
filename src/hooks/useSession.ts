'use client'
import { useEffect, useState, useCallback } from 'react'
import type { RzanProfileRow } from '@/types/supabase'

export interface SessionState {
  profile: RzanProfileRow | null
  loading: boolean
  logout:  () => Promise<void>
  refresh: () => Promise<void>
}

export function useSession(): SessionState {
  const [profile, setProfile] = useState<RzanProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) setProfile(await res.json())
      else        setProfile(null)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }, [])

  return { profile, loading, logout, refresh }
}
