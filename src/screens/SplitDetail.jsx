import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, Share2 } from 'lucide-react'
import { useAuth }   from '../hooks/useAuth'
import { useSplit }  from '../hooks/useSplits'
import { joinSplit, pricePerPerson, savingPerPerson, spotsLeft, formatDate } from '../lib/api'
import ShareSheet from '../components/ShareSheet'
import Spinner    from '../components/Spinner'
import { useToast } from '../components/Toast'

const COLOURS = [
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#ede9fe', text: '#5b21b6' },
]

export default function SplitDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const toast     = useToast()
  const { split, loading, error } = useSplit(id)
  const [joining,   setJoining]   = useState(false)
  const [shareOpen, setShare]     = useState(false)

  async function handleJoin() {
    if (!user) { navigate('/onboarding'); return }
    setJoining(true)
    try {
      const r = await joinSplit(id, user.id)
      toast(r.full ? '🎉 Split is full!' : '✓ You joined!', 'success')
    } catch (err) { toast(err.message, 'error') }
    finally { setJoining(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner/></div>
  if (!split)  return <div className="flex flex-col items-center justify-center h-full px-6 text-center"><p className="text-gray-500 mb-4">Split not found</p><button onClick={() => navigate(-1)} className="font-semibold" style={{ color: '#0f7a4b' }}>Go back</button></div>

  // Use actual member count as source of truth
  const members   = split.split_members ?? []
  const memberCount = members.length
  const left      = Math.max(0, split.people_needed - memberCount)
  const perHead   = pricePerPerson(split)
  const saving    = savingPerPerson(split)
  const isMember  = members.some(m => m.user_id === user?.id)
  const isOpen    = split.status === 'open' && left > 0 && memberCount < split.people_needed

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Dark hero */}
      <div className="flex-shrink-0 px-5 pt-4 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#0c2118,#0f2d1e)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium mb-4">
          <ArrowLeft size={17}/> Back
        </button>
        {isOpen && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[10px] font-bold" style={{ background: 'rgba(200,242,109,.15)', color: '#c8f26d', border: '1px solid rgba(200,242,109,.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c8f26d' }}/>
            LIVE · {left} spot{left !== 1 ? 's' : ''} left
          </div>
        )}
        <h1 className="font-display font-black text-[30px] text-white tracking-tight leading-none mb-2">{split.title || split.item?.name}</h1>
        <div className="flex items-center gap-1.5 text-gray-400 text-[13px]">
          <MapPin size={13}/> {split.store?.name} · {split.store?.city}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-none">

        {/* Savings */}
        <div className="mx-4 mt-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Your share</div>
            <div className="font-display font-black text-[38px] leading-none" style={{ color: '#0f7a4b' }}>£{saving}</div>
            <div className="text-[11px] text-gray-400 mt-1">{Math.round((saving/split.total_price)*100)}% less than buying alone</div>
          </div>
          <div className="text-right">
            <div className="text-[15px] text-gray-300 line-through">£{split.total_price}</div>
            <div className="font-display font-black text-[30px] text-gray-900 leading-none">£{perHead}</div>
            <div className="text-[11px] text-gray-400 mt-1">per person</div>
          </div>
        </div>

        {/* Info */}
        <div className="mx-4 mt-3 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {[
            { icon: <Calendar size={16} color="#a16207"/>, bg: '#fffbeb', p: split.preferred_date ? `${formatDate(split.preferred_date)}${split.preferred_time ? ' · ' + split.preferred_time : ''}` : 'Date TBC', s: 'Meet at the store · choose your own portions' },
            { icon: <MapPin   size={16} color="#0f7a4b"/>, bg: '#ecfff5', p: split.store?.name, s: split.store?.address || split.store?.city },
            { icon: <Users    size={16} color="#1e40af"/>, bg: '#eff6ff', p: `${split.people_needed} people · ${split.people_joined} joined · ${left} spot${left !== 1 ? 's' : ''} left`, s: 'Everyone chooses their own portion in-store' },
          ].map((r, i, arr) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length-1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.bg }}>{r.icon}</div>
              <div><div className="text-[13px] font-semibold text-gray-900">{r.p}</div><div className="text-[11px] text-gray-400 mt-0.5">{r.s}</div></div>
            </div>
          ))}
        </div>

        {/* Members */}
        <div className="mx-4 mt-3 mb-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Split Members</div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            {members.map((m, i) => {
              const c = COLOURS[i % COLOURS.length]
              return (
                <div key={m.id} className={`flex items-center gap-3 px-4 py-3 ${i < members.length-1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] flex-shrink-0" style={{ background: c.bg, color: c.text }}>
                    {m.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-gray-900">{m.user?.name}</div>
                    <div className="text-[11px] text-gray-400">{m.user?.city}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={m.user_id === split.creator_id ? { background: '#fffbeb', color: '#a16207' } : { background: '#ecfff5', color: '#0f7a4b' }}>
                    {m.user_id === split.creator_id ? 'Host' : `⭐ ${m.user?.reliability_score ?? '5.0'}`}
                  </span>
                </div>
              )
            })}
            {Array.from({ length: left }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 opacity-35">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 flex-shrink-0">+</div>
                <div className="text-[13px] text-gray-400">Open spot — join this split</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 pb-5">
        {isMember ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center mb-2.5">
            <div className="text-[15px] font-bold" style={{ color: '#0f7a4b' }}>✓ You're in this split</div>
            <div className="text-[12px] text-gray-400">You'll be notified when it's confirmed</div>
          </div>
        ) : isOpen ? (
          <button onClick={handleJoin} disabled={joining}
            className="w-full text-white rounded-2xl py-4 text-[16px] font-bold disabled:opacity-50 mb-2.5"
            style={{ background: '#0f7a4b', boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
            {joining ? 'Joining...' : 'Join This Split'}
          </button>
        ) : (
          <div className="bg-gray-100 rounded-2xl p-4 text-center text-[14px] font-semibold text-gray-500 mb-2.5">
            This split is {split.status}
          </div>
        )}
        <button onClick={() => setShare(true)}
          className="w-full bg-transparent border border-gray-200 rounded-2xl py-3.5 text-[14px] font-semibold text-gray-600 flex items-center justify-center gap-2 active:bg-gray-50">
          <Share2 size={17}/> Share to WhatsApp
        </button>
      </div>

      <div className="mx-4 mb-4 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-[12px] text-amber-700 leading-relaxed">⚠️ <strong>Choma Share only coordinates splits.</strong> Payment and collection are agreed directly between members. Only join splits with people you trust.</p>
      </div>
      <ShareSheet split={split} open={shareOpen} onClose={() => setShare(false)}/>
    </div>
  )
}
