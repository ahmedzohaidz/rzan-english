'use client'
import { useState, useEffect } from 'react'
import type { RzanProfileRow } from '@/types/supabase'

export function useRzanProfile() {
  const [profile, setProfile] = useState<RzanProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => setProfile(data))
      .finally(() => setLoading(false))
  }, [])

  return { profile, loading, setProfile }
}
