'use client'
import { useState, useEffect } from 'react'
import type { RzanMissionRow } from '@/types/supabase'

export function useMission() {
  const [missions, setMissions] = useState<RzanMissionRow[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/mission')
      .then(r => r.ok ? r.json() : [])
      .then(data => setMissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  async function complete(missionId: string) {
    await fetch('/api/mission', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ missionId }),
    })
    setMissions(prev =>
      prev.map(m => m.id === missionId ? { ...m, completed: true } : m)
    )
  }

  return { missions, loading, complete }
}
