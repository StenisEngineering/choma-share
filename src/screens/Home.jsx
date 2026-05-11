import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus } from 'lucide-react'
import { useAuth }   from '../hooks/useAuth'
import { useSplits } from '../hooks/useSplits'
import { joinSplit }  from '../lib/api'
import SplitCard  from '../components/SplitCard'
import Spinner    from '../components/Spinner'
import { useToast } from '../components/Toast'

export default function Home() {
  const { profile, user } = useAuth()
  const navigate          = useNavigate()
  const toast             = useToast()
  const [joining, setJoining] = useState(null)
  const { splits, loading, error, refresh } = useSplits()

  async function handleJoin(splitId) {
    if (!user) { navigate('/onboarding'); return }
    setJoining(splitId)
    try {
      const r = await joinSplit(splitId, user.id)
      toast(r.full ? '🎉 Split is full!' : '✓ You joined!', 'success')
      refresh()
    } catch (err) {
      toast(err.message, 'error')
    } finally { setJoining(null) }
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-3 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-gray-400 font-medium">{greet}</p>
            <h1 className="font-display font-black text-[26px] text-gray-900 tracking-tight leading-tight">
              {profile?.name ? `${profile.name} 👋` : 'Choma Share'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mt-1">
            <Bell size={18} color="#6b7280"/>
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { v: `£${profile.total_saved ?? 0}`, l: 'Saved' },
              { v: profile.total_splits ?? 0,       l: 'Splits' },
              { v: profile.reliability_score ?? 5,  l: 'Score' },
            ].map(s => (
              <div key={s.l} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                <div className="font-display font-bold text-[19px] leading-none" style={{ color: '#0f7a4b' }}>{s.v}</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-none">

        {/* Coming soon banner for non-Sunderland users */}
        {profile && profile.city !== 'Sunderland' && (
          <div className="mx-4 mt-4 p-4 rounded-3xl text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#062f23,#0a4a35)', border: '1px solid rgba(200,242,109,0.2)' }}>
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-display font-bold text-[16px] text-white mb-1">
              Coming to {profile.city} soon!
            </h3>
            <p className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
              We're launching in Sunderland first. You'll be notified the moment Choma Share goes live in {profile.city}.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(248,200,90,0.15)', color: '#f8c85a', border: '1px solid rgba(248,200,90,0.3)' }}>
              🔔 You're on the waitlist
            </div>
          </div>
        )}

        {/* Create CTA */}
        <div className="px-4 pt-4">
          <button onClick={() => navigate('/create')}
            className="w-full rounded-3xl p-4 flex items-center gap-3 active:scale-[.98] transition-transform"
            style={{ background: 'linear-gradient(135deg,#0c2118,#0f2d1e)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#0f7a4b,#15a66a)', boxShadow: '0 6px 18px rgba(15,122,75,.4)' }}>
              <Plus size={22} color="white" strokeWidth={2.5}/>
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-[16px] text-white tracking-tight">Create a Split</div>
              <div className="text-[12px] text-gray-400 mt-0.5">Post an item · find your people nearby</div>
            </div>
            <div className="ml-auto opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </button>
        </div>

        {/* Splits */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-display font-bold text-[16px] text-gray-900 tracking-tight">Active Splits Near You</h2>
          <span className="text-[12px] font-semibold" style={{ color: '#0f7a4b' }}>See all</span>
        </div>

        {loading && <Spinner/>}
        {error   && <div className="mx-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600">{error}</div>}

        {!loading && splits.length === 0 && (
          <div className="mx-4 mt-2 p-6 bg-white border border-gray-100 rounded-3xl text-center">
            <div className="text-3xl mb-2">🛒</div>
            <p className="font-semibold text-gray-700 mb-1">No active splits yet</p>
            <p className="text-[13px] text-gray-400">Be the first — create a split and share it with your community.</p>
          </div>
        )}

        <div className="px-4 flex flex-col gap-3 pb-4">
          {splits.map(s => (
            <SplitCard key={s.id} split={s} onJoin={handleJoin} joining={joining === s.id}/>
          ))}
        </div>

        {/* Circles */}
        <div className="flex items-center justify-between px-4 pt-1 pb-2">
          <h2 className="font-display font-bold text-[16px] text-gray-900 tracking-tight">Monthly Circles</h2>
          <span className="text-[12px] font-semibold cursor-pointer" style={{ color: '#0f7a4b' }} onClick={() => navigate('/circles')}>Manage</span>
        </div>
        <div className="mx-4 mb-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {[
            { name: 'Church Food Circle',  sub: 'Last Saturday monthly · 5 members', bg: '#ecfff5', badge: 'Monthly', bc: '#d1fae5', bt: '#065f46' },
            { name: 'Afrikana Hub Regulars', sub: '1st Saturday monthly · 3 members', bg: '#fffbeb', badge: 'Monthly', bc: '#fde68a', bt: '#92400e' },
          ].map((c, i, arr) => (
            <div key={c.name} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length-1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0f7a4b" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-gray-900">{c.name}</div>
                <div className="text-[11px] text-gray-400">{c.sub}</div>
              </div>
              <span className="text-[9px] font-bold px-2 py-1 rounded-full border" style={{ background: c.bc, color: c.bt, borderColor: c.bc }}>{c.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
