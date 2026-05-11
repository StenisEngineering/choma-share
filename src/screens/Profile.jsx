import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Bell, Phone, LogOut, Star, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuth }  from '../hooks/useAuth'
import { getMySplits, signOut } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

const ADMIN_EMAILS = ['engineeringstenis@gmail.com']

export default function Profile() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()

  const [splits,       setSplits]       = useState([])
  const [circleCount,  setCircleCount]  = useState(0)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    if (!user) { navigate('/onboarding'); return }

    // Load splits and circle count in parallel
    Promise.all([
      getMySplits(user.id),
      supabase.from('circle_members').select('circle_id', { count: 'exact' }).eq('user_id', user.id)
    ]).then(([splitsData, circleData]) => {
      setSplits(splitsData ?? [])
      setCircleCount(circleData.count ?? 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user, navigate])

  async function logout() {
    try {
      await signOut()
      navigate('/onboarding', { replace: true })
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!profile) return <div className="flex items-center justify-center h-full"><Spinner/></div>

  const G        = '#0f7a4b'
  const isAdmin  = ADMIN_EMAILS.includes(user?.email)
  const totalSplits = profile.total_splits ?? splits.length ?? 0

  // Dynamic badges based on real data
  const badges = [
    totalSplits >= 1  && { l: 'First Split',      bg: '#ecfff5', c: G,        bc: '#b6f0d4' },
    totalSplits >= 5  && { l: '5+ Splits Done',   bg: '#ecfff5', c: G,        bc: '#b6f0d4' },
    totalSplits >= 10 && { l: '10+ Splits',        bg: '#ecfff5', c: G,        bc: '#b6f0d4' },
    (profile.reliability_score ?? 5) >= 4.5 && { l: 'Highly Reliable', bg: '#fffbeb', c: '#a16207', bc: '#fde68a' },
    circleCount >= 1  && { l: 'Circle Member',    bg: '#eff6ff', c: '#1e40af', bc: '#bfdbfe' },
    true              && { l: 'Verified Account', bg: '#f0fdf4', c: G,        bc: '#b6f0d4' },
  ].filter(Boolean)

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Hero */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-gray-100 text-center flex-shrink-0">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 font-display font-bold text-3xl text-white"
          style={{ background: 'linear-gradient(135deg,#0f7a4b,#15a66a)', boxShadow: '0 6px 20px rgba(15,122,75,.35)' }}>
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <h1 className="font-display font-bold text-[22px] text-gray-900 tracking-tight mb-1">{profile.name}</h1>
        <div className="flex items-center justify-center gap-1.5 text-[13px] text-gray-400 mb-3">
          <MapPin size={13}/> {profile.city}, UK
        </div>
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: '#ecfff5', border: '1px solid #b6f0d4' }}>
          <Star size={14} fill={G} color={G}/>
          <span className="font-display font-bold text-[17px] leading-none" style={{ color: G }}>
            {profile.reliability_score ?? '5.0'}
          </span>
          <span className="text-[12px] font-semibold" style={{ color: G }}>Reliability Score</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">

        {/* Stats — real data */}
        <div className="grid grid-cols-3 gap-2.5 mx-4 mt-4">
          {[
            { v: totalSplits,                        l: 'Splits'  },
            { v: `£${profile.total_saved ?? 0}`,     l: 'Saved'   },
            { v: circleCount,                        l: 'Circles' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
              <div className="font-display font-bold text-[20px]" style={{ color: G }}>{s.v}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Badges — dynamic */}
        <div className="mx-4 mt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Trusted Shopper Badges
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <span key={b.l}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border"
                style={{ background: b.bg, color: b.c, borderColor: b.bc }}>
                <Star size={11} fill={b.c} color={b.c}/> {b.l}
              </span>
            ))}
          </div>
        </div>

        {/* My splits */}
        <div className="mx-4 mt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">My Splits</div>
          {loading ? <Spinner size={20}/> : splits.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center text-[13px] text-gray-400 shadow-sm">
              No splits yet — create your first one!
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {splits.slice(0, 5).map((m, i, arr) => (
                <div key={m.split_id}
                  onClick={() => navigate(`/split/${m.split_id}`)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-gray-50 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: '#ecfff5' }}>🛒</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">
                      {m.split?.title || 'Split'}
                    </div>
                    <div className="text-[11px] text-gray-400">{m.split?.store?.name}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={m.split?.status === 'open'
                      ? { background: '#ecfff5', color: G }
                      : m.split?.status === 'full'
                        ? { background: '#fffbeb', color: '#a16207' }
                        : { background: '#f3f4f6', color: '#6b7280' }
                    }>
                    {m.split?.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mx-4 mt-4 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Settings</div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {[
              { icon: <MapPin size={17} color={G}/>,       bg: '#ecfff5', l: 'Location',      v: profile.city },
              { icon: <Bell   size={17} color="#a16207"/>, bg: '#fffbeb', l: 'Notifications', v: 'On'         },
              { icon: <Phone  size={17} color="#1e40af"/>, bg: '#eff6ff', l: 'Account email', v: user?.email?.split('@')[0] },
            ].map((r, i) => (
              <div key={r.l}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < 2 ? 'border-b border-gray-100' : ''} active:bg-gray-50`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: r.bg }}>{r.icon}</div>
                <div className="flex-1 text-[14px] font-semibold text-gray-900">{r.l}</div>
                <div className="text-[12px] text-gray-400 truncate max-w-[120px]">{r.v}</div>
                <ChevronRight size={15} color="#d1d5db"/>
              </div>
            ))}

            {/* Admin link — only visible to admin */}
            {isAdmin && (
              <div
                onClick={() => navigate('/admin')}
                className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 cursor-pointer active:bg-gray-50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f0fdf4' }}>
                  <ShieldCheck size={17} color={G}/>
                </div>
                <div className="flex-1 text-[14px] font-semibold" style={{ color: G }}>Admin Panel</div>
                <ChevronRight size={15} color={G}/>
              </div>
            )}

            {/* Sign out */}
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 active:bg-red-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#fef2f2' }}>
                <LogOut size={17} color="#ef4444"/>
              </div>
              <div className="text-[14px] font-semibold text-red-500">Sign out</div>
            </button>
          </div>
        </div>

        <div style={{ height: 24 }}/>
      </div>
    </div>
  )
}
