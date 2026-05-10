import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getSplits, getSplit } from '../lib/api'

export function useSplits() {
  const [splits,  setSplits]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSplits()
      setSplits(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const ch = supabase.channel('splits-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'splits' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [load])

  return { splits, loading, error, refresh: load }
}

export function useSplit(id) {
  const [split,   setSplit]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    let active = true

    async function load() {
      try {
        const data = await getSplit(id)
        if (active) { setSplit(data); setError(null) }
      } catch (e) {
        if (active) setError(e.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const ch = supabase.channel(`split-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'splits',       filter: `id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_members', filter: `split_id=eq.${id}` }, load)
      .subscribe()

    return () => { active = false; supabase.removeChannel(ch) }
  }, [id])

  return { split, loading, error }
}
