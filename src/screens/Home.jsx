import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import NotificationBell from '../components/NotificationBell'
import { useAuth }   from '../hooks/useAuth'
import { useSplits } from '../hooks/useSplits'
import { joinSplit }  from '../lib/api'
import { supabase }   from '../lib/supabase'
import SplitCard  from '../components/SplitCard'
import Spinner    from '../components/Spinner'
import { useToast } from '../components/Toast'

export default function Home() {
  const { profile, user } = useAuth()
  const navigate          = useNavigate()
  const toast             = useToast()
  const [joining,  setJoining]  = useState(null)
  const [circles,  setCircles]  = useState([])
  const { splits, loading, error, refresh } = useSplits()

  // Listen for pull-to-refresh event
  React.useEffect(() => {
    window.addEventListener('choma-refresh', refresh)
    return () => window.removeEventListener('choma-refresh', refresh)
  }, [refresh])

  // Load real circles from Supabase
  useEffect(() => {
    if (!user) return
    supabase
      .from('circle_members')
      .select('circle_id, role, circle:circles(id, name, is_private, city)')
      .eq('user_id', user.id)
      .limit(3)
      .then(({ data }) => setCircles(data ?? []))
      .catch(() => {})
  }, [user])

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

  const hour  = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[17px] text-gray-400 font-medium">{greet}</p>
            <h1 className="font-display font-black text-[27px] text-gray-900 tracking-tight leading-tight">
              {profile?.name || 'Welcome'}
            </h1>
          </div>
          <div className="mt-1">
            <NotificationBell/>
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { v: `£${profile.total_saved ?? 0}`, l: 'Saved'  },
              { v: profile.total_splits ?? 0,       l: 'Splits' },
              { v: profile.reliability_score ?? 5,  l: 'Score'  },
            ].map(s => (
              <div key={s.l} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                <div className="font-display font-bold text-[21px] leading-none" style={{ color: '#0f7a4b' }}>{s.v}</div>
                <div className="text-[17px] text-gray-400 font-semibold mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">

        {/* Coming soon banner for non-Sunderland users */}
        {profile && profile.city !== 'Sunderland' && (
          <div className="mx-4 mt-4 p-4 rounded-3xl text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#062f23,#0a4a35)', border: '1px solid rgba(200,242,109,0.2)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{background:'rgba(200,242,109,0.12)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8f26d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3 className="font-display font-bold text-[17px] text-white mb-1">
              Coming to {profile.city} soon!
            </h3>
            <p className="text-[17px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
              We're launching in Sunderland first. You'll be notified the moment Choma Share goes live in {profile.city}.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[17px] font-bold"
              style={{ background: 'rgba(248,200,90,0.15)', color: '#f8c85a', border: '1px solid rgba(248,200,90,0.3)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              You're on the waitlist
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
              <div className="font-display font-bold text-[17px] text-white tracking-tight">Create a Split</div>
              <div className="text-[17px] text-gray-400 mt-0.5">Post an item · find your people nearby</div>
            </div>
            <div className="ml-auto opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Active Splits */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h2 className="font-display font-bold text-[17px] text-gray-900 tracking-tight">Active Splits Near You</h2>
          <span className="text-[17px] font-semibold cursor-pointer" style={{ color: '#0f7a4b' }}
            onClick={() => navigate('/splits')}>See all</span>
        </div>

        {loading && <Spinner/>}
        {error && (
          <div className="mx-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-[17px] text-red-600">{error}</div>
        )}

        {!loading && splits.length === 0 && (
          <div className="mx-4 mt-2 p-4 bg-white border border-gray-100 rounded-3xl text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{background:'#f3f4f6'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">No active splits yet</p>
            <p className="text-[17px] text-gray-400">Be the first — create a split and share it with your community.</p>
          </div>
        )}

        <div className="px-4 flex flex-col gap-2 pb-3">
          {splits.map(s => (
            <SplitCard key={s.id} split={s} onJoin={handleJoin} joining={joining === s.id}/>
          ))}
        </div>

        {/* Store owner confidence */}
        <div className="mx-4 mb-3 p-3 rounded-2xl flex items-start gap-2.5"
          style={{ background: '#f0fdf4', border: '1px solid #b6f0d4' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f7a4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p className="text-[17px] leading-relaxed" style={{ color: '#0f7a4b' }}>
            <strong>Choma Share does not handle payments or deliveries.</strong> We connect people to share bulk food costs. You pay the store directly.
          </p>
        </div>

        {/* Monthly Circles — real data */}
        <div className="flex items-center justify-between px-4 pt-1 pb-2">
          <h2 className="font-display font-bold text-[17px] text-gray-900 tracking-tight">Monthly Circles</h2>
          <span className="text-[17px] font-semibold cursor-pointer" style={{ color: '#0f7a4b' }}
            onClick={() => navigate('/circles')}>Manage</span>
        </div>

        <div className="mx-4 mb-3 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {circles.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-[17px] text-gray-400 mb-3">No circles yet</p>
              <button
                onClick={() => navigate('/circles')}
                className="text-[17px] font-bold px-4 py-2 rounded-xl text-white"
                style={{ background: '#0f7a4b' }}>
                + Create a Circle
              </button>
            </div>
          ) : (
            circles.map((m, i) => (
              <div
                key={m.circle_id}
                onClick={() => navigate('/circles')}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer active:bg-gray-50 ${i < circles.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: m.circle?.is_private ? '#fef3c7' : '#ecfff5' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0f7a4b" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-bold text-gray-900 truncate">{m.circle?.name}</div>
                  <div className="text-[17px] text-gray-400">
                    {m.role === 'admin' ? 'Admin' : 'Member'} · {m.circle?.city}
                  </div>
                </div>
                <span className="text-[17px] font-bold px-2 py-1 rounded-full"
                  style={{ background: '#ecfff5', color: '#0f7a4b', border: '1px solid #b6f0d4' }}>
                  Monthly
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
