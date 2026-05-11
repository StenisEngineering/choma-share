import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, Share2 } from 'lucide-react'
import { useAuth }   from '../hooks/useAuth'
import { useSplit }  from '../hooks/useSplits'
import { joinSplit, pricePerPerson, savingPerPerson, formatDate } from '../lib/api'
import ShareSheet from '../components/ShareSheet'
import Spinner    from '../components/Spinner'
import { useToast } from '../components/Toast'

const COLOURS = [
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#fce7f3', text: '#9d174d' },
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
  if (!split)  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-gray-500 mb-4">Split not found</p>
      <button onClick={() => navigate(-1)} className="font-semibold" style={{ color: '#0f7a4b' }}>Go back</button>
    </div>
  )

  const members     = split.split_members ?? []
  const memberCount = members.length
  const left        = Math.max(0, split.people_needed - memberCount)
  const perHead     = pricePerPerson(split)
  const saving      = savingPerPerson(split)
  const isMember    = members.some(m => m.user_id === user?.id)
  const isOpen      = split.status === 'open' && left > 0
  const isFull      = split.status === 'full' || left === 0

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Dark hero */}
      <div className="flex-shrink-0 px-5 pt-4 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0c2118,#0f2d1e)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium mb-4">
          <ArrowLeft size={17}/> Back
        </button>
        {isOpen && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[10px] font-bold"
            style={{ background: 'rgba(200,242,109,.15)', color: '#c8f26d', border: '1px solid rgba(200,242,109,.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c8f26d' }}/>
            LIVE · {left} spot{left !== 1 ? 's' : ''} left
          </div>
        )}
        {isFull && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[10px] font-bold"
            style={{ background: 'rgba(248,200,90,.15)', color: '#f8c85a', border: '1px solid rgba(248,200,90,.25)' }}>
            🎉 Split is Full
          </div>
        )}
        <h1 className="font-display font-black text-[30px] text-white tracking-tight leading-none mb-2">
          {split.title || split.item?.name}
        </h1>
        <div className="flex items-center gap-1.5 text-gray-400 text-[13px]">
          <MapPin size={13}/> {split.store?.name} · {split.store?.city}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-none">

        {/* Savings card */}
        <div className="mx-4 mt-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Your share</div>
            <div className="font-display font-black text-[38px] leading-none" style={{ color: '#0f7a4b' }}>£{perHead}</div>
            <div className="text-[11px] text-gray-400 mt-1">{Math.round((saving/split.total_price)*100)}% less than buying alone</div>
          </div>
          <div className="text-right">
            <div className="text-[15px] text-gray-300 line-through">£{split.total_price}</div>
            <div className="font-display font-black text-[30px] text-gray-900 leading-none">£{saving}</div>
            <div className="text-[11px] text-gray-400 mt-1">you save</div>
          </div>
        </div>

        {/* Info list */}
        <div className="mx-4 mt-3 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {[
            { icon: <Calendar size={16} color="#a16207"/>, bg: '#fffbeb',
              p: split.preferred_date ? `${formatDate(split.preferred_date)}${split.preferred_time ? ' · ' + split.preferred_time : ''}` : 'Date TBC',
              s: 'Meet at the store · choose your own portions' },
            { icon: <MapPin size={16} color="#0f7a4b"/>, bg: '#ecfff5',
              p: split.store?.name,
              s: split.store?.address || split.store?.city },
            { icon: <Users size={16} color="#1e40af"/>, bg: '#eff6ff',
              p: `${split.people_needed} people · ${memberCount} joined · ${left > 0 ? left + ' spot' + (left !== 1 ? 's' : '') + ' left' : 'No spots left — Full'}`,
              s: 'Everyone chooses their own portion in-store' },
          ].map((r, i, arr) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length-1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.bg }}>{r.icon}</div>
              <div>
                <div className="text-[13px] font-semibold text-gray-900">{r.p}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{r.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Members */}
        <div className="mx-4 mt-3 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Split Members</div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            {members.map((m, i) => {
              const c = COLOURS[i % COLOURS.length]
              return (
                <div key={m.id} className={`flex items-center gap-3 px-4 py-3 ${i < members.length-1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] flex-shrink-0"
                    style={{ background: c.bg, color: c.text }}>
                    {m.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-gray-900">{m.user?.name}</div>
                    <div className="text-[11px] text-gray-400">{m.user?.city}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={m.user_id === split.creator_id
                      ? { background: '#fffbeb', color: '#a16207' }
                      : { background: '#ecfff5', color: '#0f7a4b' }}>
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

      {/* Trust note */}
      <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          ⚠️ <strong>Choma Share only coordinates splits.</strong> Payment is agreed directly between members. Only join people you trust.
        </p>
      </div>

      {/* CTA footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 pb-5">

        {/* FULL + member — show WhatsApp coordination */}
        {isFull && isMember && (
          <SplitFullCoordination split={split} members={members}/>
        )}

        {/* Member, split still open */}
        {isMember && isOpen && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center mb-2.5">
            <div className="text-[15px] font-bold" style={{ color: '#0f7a4b' }}>✓ You're in this split</div>
            <div className="text-[12px] text-gray-400 mt-1">
              Waiting for {left} more person{left !== 1 ? 's' : ''} to join
            </div>
          </div>
        )}

        {/* Not member, open — show join */}
        {!isMember && isOpen && (
          <button onClick={handleJoin} disabled={joining}
            className="w-full text-white rounded-2xl py-4 text-[16px] font-bold disabled:opacity-50 mb-2.5"
            style={{ background: '#0f7a4b', boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
            {joining ? 'Joining...' : 'Join This Split'}
          </button>
        )}

        {/* Not member, closed */}
        {!isMember && !isOpen && (
          <div className="bg-gray-100 rounded-2xl p-4 text-center text-[14px] font-semibold text-gray-500 mb-2.5">
            {isFull ? 'This split is full — no spots left' : `This split is ${split.status}`}
          </div>
        )}

        {/* Share always visible */}
        <button onClick={() => setShare(true)}
          className="w-full bg-transparent border border-gray-200 rounded-2xl py-3.5 text-[14px] font-semibold text-gray-600 flex items-center justify-center gap-2 active:bg-gray-50">
          <Share2 size={17}/> Share to WhatsApp
        </button>
      </div>

      <ShareSheet split={split} open={shareOpen} onClose={() => setShare(false)}/>
    </div>
  )
}

// WhatsApp coordination panel — shown when split is full and user is a member
function SplitFullCoordination({ split, members }) {
  const per   = Math.round(split.total_price / split.people_needed)
  const date  = split.preferred_date
    ? new Date(split.preferred_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'the agreed date'
  const time  = split.preferred_time ?? ''
  const store = split.store?.name ?? 'the store'
  const addr  = split.store?.address ?? ''
  const names = members.map(m => m.user?.name).filter(Boolean).join(', ')

  const coordMessage = encodeURIComponent(
    `Hi team! 👋 Our Choma Share split is FULL! 🎉\n\n` +
    `📦 Item: ${split.title}\n` +
    `🏪 Store: ${store}${addr ? ', ' + addr : ''}\n` +
    `📅 When: ${date}${time ? ' at ' + time : ''}\n` +
    `💰 Each person pays: £${per} directly to the store\n\n` +
    `Members: ${names}\n\n` +
    `See you there! Bring £${per} cash or card. ✅\n\n` +
    `Split details: ${window.location.href}`
  )

  const waUrl = `https://wa.me/?text=${coordMessage}`

  return (
    <div className="mb-3">
      <div className="rounded-2xl p-4 mb-2.5"
        style={{ background: 'linear-gradient(135deg,#062f23,#0a4a35)', border: '1px solid rgba(200,242,109,0.2)' }}>
        <div className="text-center mb-3">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-display font-bold text-[17px] text-white mb-1">Split is Full!</div>
          <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            All {split.people_needed} members joined. Time to coordinate!
          </div>
        </div>

        {/* Quick summary */}
        <div className="bg-white/10 rounded-xl p-3 mb-3 space-y-1">
          {[
            { icon: '📅', text: `${date}${time ? ' at ' + time : ''}` },
            { icon: '🏪', text: `${store}${addr ? ' · ' + addr : ''}` },
            { icon: '💰', text: `£${per} each — pay store directly` },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[14px]">{r.icon}</span>
              <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.text}</span>
            </div>
          ))}
        </div>

        {/* Member avatars */}
        <div className="flex items-center justify-center gap-1 flex-wrap mb-3">
          {members.map((m, i) => {
            const colours = ['#d1fae5','#fef3c7','#dbeafe','#ede9fe','#fce7f3']
            const tColours = ['#065f46','#92400e','#1e40af','#5b21b6','#9d174d']
            return (
              <div key={m.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: colours[i % colours.length], color: tColours[i % tColours.length] }}>
                {m.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )
          })}
        </div>

        {/* WhatsApp button */}
        <a href={waUrl} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[14px] font-bold"
          style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 14px rgba(37,211,102,0.4)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send coordination message
        </a>
      </div>
    </div>
  )
}
