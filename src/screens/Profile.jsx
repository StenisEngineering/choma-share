import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Bell, Phone, LogOut, Star, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuth }  from '../hooks/useAuth'
import { getMySplits, signOut } from '../lib/api'
import Watchlist from '../components/Watchlist'
import { requestPushPermission } from '../lib/onesignal'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

const ADMIN_EMAILS = ['engineeringstenis@gmail.com']
const CITIES = ['Sunderland','Newcastle','Leeds','Birmingham','Manchester','London','Other']

export default function Profile() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()

  const [splits,       setSplits]       = useState([])
  const [showCityEdit, setShowCityEdit] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted')
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
      <div className="bg-white px-5 pt-4 pb-3 border-b border-gray-100 text-center flex-shrink-0">
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
        <div className="grid grid-cols-3 gap-2 mx-4 mt-4">
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
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer active:bg-gray-50 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
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

        {/* Watchlist */}
        <Watchlist userId={user?.id}/>

        {/* Settings */}
        <div className="mx-4 mt-4 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Settings</div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Location — tappable */}
            <div
              onClick={() => setShowCityEdit(true)}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 cursor-pointer active:bg-gray-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ecfff5' }}>
                <MapPin size={17} color={G}/>
              </div>
              <div className="flex-1 text-[14px] font-semibold text-gray-900">Location</div>
              <div className="text-[12px] text-gray-400">{profile.city}</div>
              <ChevronRight size={15} color="#d1d5db"/>
            </div>

            {/* Notifications */}
            <div
              onClick={async () => {
                if (!pushEnabled) {
                  const ok = await requestPushPermission(user.id, profile?.city)
                  if (ok) { setPushEnabled(true); toast('Push notifications enabled ✓', 'success') }
                  else toast('Please allow notifications in your browser settings', 'error')
                }
              }}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 cursor-pointer active:bg-gray-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fffbeb' }}>
                <Bell size={17} color="#a16207"/>
              </div>
              <div className="flex-1 text-[14px] font-semibold text-gray-900">Notifications</div>
              <div className="text-[12px] font-semibold" style={{ color: pushEnabled ? '#0f7a4b' : '#f59e0b' }}>
                {pushEnabled ? 'Enabled' : 'Tap to enable'}
              </div>
              <ChevronRight size={15} color="#d1d5db"/>
            </div>

            {/* Account */}
            <div className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff' }}>
                <Phone size={17} color="#1e40af"/>
              </div>
              <div className="flex-1 text-[14px] font-semibold text-gray-900">Account</div>
              <div className="text-[12px] text-gray-400 truncate max-w-[140px]">{user?.email ?? 'Signed in'}</div>
              <ChevronRight size={15} color="#d1d5db"/>
            </div>

            {/* Admin link — only visible to admin */}
            {isAdmin && (
              <div
                onClick={() => navigate('/admin')}
                className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-100 cursor-pointer active:bg-gray-50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f0fdf4' }}>
                  <ShieldCheck size={17} color={G}/>
                </div>
                <div className="flex-1 text-[14px] font-semibold" style={{ color: G }}>Admin Panel</div>
                <ChevronRight size={15} color={G}/>
              </div>
            )}

            {/* Privacy */}
            <div onClick={() => navigate('/privacy')}
              className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-100 cursor-pointer active:bg-gray-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="flex-1 text-[14px] font-semibold text-gray-700">Privacy Policy</div>
              <ChevronRight size={15} color="#d1d5db"/>
            </div>

            {/* Terms */}
            <div onClick={() => navigate('/terms')}
              className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-100 cursor-pointer active:bg-gray-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
              </div>
              <div className="flex-1 text-[14px] font-semibold text-gray-700">Terms of Service</div>
              <ChevronRight size={15} color="#d1d5db"/>
            </div>

            {/* Sign out */}
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 border-t border-gray-100 active:bg-red-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#fef2f2' }}>
                <LogOut size={17} color="#ef4444"/>
              </div>
              <div className="text-[14px] font-semibold text-red-500">Sign out</div>
            </button>
          </div>
        </div>

        {/* Creovate branding */}
        <div className="text-center py-4">
          <p className="text-[10px] text-gray-300 font-medium">© 2026 Creovate Global Ltd</p>
          <p className="text-[10px] text-gray-300 mt-0.5">Choma Share · share.choma.app</p>
        </div>
        <div style={{ height: 8 }}/>
      </div>

      {/* City change modal */}
      {showCityEdit && (
        <ChangeCityModal
          currentCity={profile.city}
          userId={user.id}
          onClose={() => setShowCityEdit(false)}
          onChanged={() => { setShowCityEdit(false); window.location.reload() }}
          toast={toast}
        />
      )}
    </div>
  )
}

function ChangeCityModal({ currentCity, userId, onClose, onChanged, toast }) {
  const [city,   setCity]   = useState(currentCity)
  const [saving, setSaving] = useState(false)
  const CITIES = ['Sunderland','Newcastle','Leeds','Birmingham','Manchester','London','Other']
  const G = '#0f7a4b'

  async function save() {
    if (city === currentCity) { onClose(); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('users')
        .update({ city }).eq('id', userId)
      if (error) throw error
      toast(`Location updated to ${city} ✓`, 'success')
      onChanged()
    } catch (err) {
      toast(err.message, 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
        <h3 className="font-display font-bold text-[20px] text-gray-900 mb-1">Change Location</h3>
        <p className="text-[13px] text-gray-400 mb-5">
          You'll see splits in your new city immediately.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {CITIES.map(c => {
            const isLive = c === 'Sunderland'
            const isSel  = city === c
            return (
              <button key={c} type="button" onClick={() => setCity(c)}
                className="py-3 rounded-xl text-[13px] font-bold transition-all relative"
                style={{
                  background:  isSel ? '#f0fdf4' : '#f9fafb',
                  border: `${isSel ? 2 : 1.5}px solid ${isSel ? G : '#e5e7eb'}`,
                  color: isSel ? G : isLive ? '#4b5563' : '#9ca3af',
                }}>
                {c}
                {isLive && <span className="block text-[9px] font-semibold mt-0.5" style={{ color: G }}>✓ Live</span>}
                {!isLive && <span className="block text-[9px] font-semibold mt-0.5" style={{ color: '#f8c85a' }}>Soon</span>}
              </button>
            )
          })}
        </div>
        <button onClick={save} disabled={saving || city === currentCity}
          className="w-full py-4 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40"
          style={{ background: G }}>
          {saving ? 'Saving...' : `Update to ${city}`}
        </button>
        <button onClick={onClose} className="w-full py-3 text-[13px] font-semibold text-gray-400 mt-2">
          Cancel
        </button>
      </div>
    </div>
  )
}
