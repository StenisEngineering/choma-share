import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile } from '../lib/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Load session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const s = data?.session ?? null
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (active) setLoading(false)
    })

    // Listen for auth changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!active) return
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function loadProfile(uid) {
    try {
      const p = await getProfile(uid)
      setProfile(p)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id)
  }

  return (
    <Ctx.Provider value={{
      session, profile, loading,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      hasProfile: !!profile,
      refreshProfile,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  return useContext(Ctx)
}
