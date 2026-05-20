import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, Share2 } from 'lucide-react'
import { useAuth }   from '../hooks/useAuth'
import { useSplit }  from '../hooks/useSplits'
import { joinSplit, pricePerPerson, priceRangePerPerson, formatDate } from '../lib/api'
import ShareSheet       from '../components/ShareSheet'
import CompletionPrompt from '../components/CompletionPrompt'
import Spinner          from '../components/Spinner'
import { useToast }     from '../components/Toast'

const G = '#0f7a4b'

const COLOURS = [
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#fce7f3', text: '#9d174d' },
]

export default function SplitDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast    = useToast()
  const { split, loading } = useSplit(id)
  const [joining,   setJoining] = useState(false)
  const [shareOpen, setShare]   = useState(false)

  async function handleJoin() {
    if (!user) { navigate('/onboarding'); return }
    setJoining(true)
    try {
      const r = await joinSplit(id, user.id)
      toast(r.full ? 'Split is full!' : 'You joined!', 'success')
    } catch (err) { toast(err.message, 'error') }
    finally { setJoining(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Spinner/>
    </div>
  )

  if (!split) return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-gray-500 mb-4">Split not found</p>
      <button onClick={() => navigate('/')} className="font-semibold" style={{ color: G }}>
        Go home
      </button>
    </div>
  )

  const members     = split.split_members ?? []
  const memberCount = members.length
  const left        = Math.max(0, split.people_needed - memberCount)
  const perHead     = pricePerPerson(split)
  const priceRange  = priceRangePerPerson(split)
  const isMember    = members.some(m => m.user_id === user?.id)
  const isCreator   = split.creator_id === user?.id
  const status      = split.status

  const isOpen      = status === 'open' && left > 0
  const isFull      = status === 'full' || (status === 'open' && left === 0)
  const isDone      = status === 'done'
  const isCancelled = status === 'cancelled'
  const isArchived  = status === 'archived'

  // ── DONE screen ──────────────────────────────────────────────
  if (isDone) return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-4 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#062f23,#0a4a35)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 text-[15px] font-medium mb-4">
          <ArrowLeft size={16}/> Back
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[13px] font-bold"
          style={{ background: 'rgba(200,242,109,.15)', color: '#c8f26d', border: '1px solid rgba(200,242,109,.25)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c8f26d" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          COMPLETED
        </div>
        <h1 className="font-display font-black text-[28px] text-white tracking-tight leading-none mb-2">
          {split.title}
        </h1>
        <div className="flex items-center gap-1.5 text-gray-400 text-[13px]">
          <MapPin size={12}/> {split.store?.name || split.custom_store}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Completion card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#ecfff5' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="font-display font-bold text-[22px] text-gray-900 mb-1">
            Split Completed!
          </div>
          <div className="text-[13px] text-gray-400 mb-4">
            This split has been successfully completed.
          </div>
          {perHead > 0 && (
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="font-display font-black text-[30px]" style={{ color: G }}>
                  £{perHead}
                </div>
                <div className="text-[12px] text-gray-400">each paid</div>
              </div>
              <div className="w-px bg-gray-100"/>
              <div className="text-center">
                <div className="font-display font-black text-[30px] text-gray-900">
                  {memberCount}
                </div>
                <div className="text-[12px] text-gray-400">members</div>
              </div>
            </div>
          )}
        </div>

        {/* Members */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Members</div>
          </div>
          {members.map((m, i) => {
            const c = COLOURS[i % COLOURS.length]
            return (
              <div key={m.id} className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px]"
                  style={{ background: c.bg, color: c.text }}>
                  {m.user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-gray-900">{m.user?.name}</div>
                </div>
                {m.user_id === split.creator_id && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#ecfff5', color: G }}>Organiser</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Create new split CTA */}
        <button onClick={() => navigate('/create')}
          className="w-full py-4 rounded-2xl text-[15px] font-bold text-white"
          style={{ background: G, boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
          Create a New Split
        </button>
      </div>
    </div>
  )

  // ── CANCELLED screen ─────────────────────────────────────────
  if (isCancelled || isArchived) return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-4 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#1a0505,#3b0f0f)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 text-[15px] font-medium mb-4">
          <ArrowLeft size={16}/> Back
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[13px] font-bold"
          style={{ background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          {isCancelled ? 'CANCELLED' : 'UNAVAILABLE'}
        </div>
        <h1 className="font-display font-black text-[28px] text-white tracking-tight leading-none mb-2">
          {split.title}
        </h1>
        <div className="flex items-center gap-1.5 text-gray-400 text-[13px]">
          <MapPin size={12}/> {split.store?.name || split.custom_store}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#fef2f2' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="font-display font-bold text-[20px] text-gray-900 mb-2">
            {isCancelled ? 'This split was cancelled' : 'This split is no longer available'}
          </div>
          <div className="text-[13px] text-gray-400 mb-5 leading-relaxed">
            {isCancelled
              ? 'The organiser or admin has cancelled this split. No action is needed from you.'
              : 'This split has been removed from the listing.'}
          </div>
          <button onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white"
            style={{ background: G }}>
            Find Other Splits
          </button>
        </div>
      </div>
    </div>
  )

  // ── MAIN DETAIL view (open / full) ───────────────────────────
  const priceLabel = split.price_tbc
    ? 'Price TBC'
    : priceRange
      ? priceRange.text + ' each'
      : perHead > 0
        ? `£${perHead} each`
        : null

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Dark hero */}
      <div className="flex-shrink-0 px-5 pt-4 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0c2118,#0f2d1e)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 text-[15px] font-medium mb-4">
          <ArrowLeft size={16}/> Back
        </button>

        {/* Status badge */}
        {isOpen && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[13px] font-bold"
            style={{ background: 'rgba(200,242,109,.15)', color: '#c8f26d', border: '1px solid rgba(200,242,109,.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c8f26d' }}/>
            LIVE · {left} spot{left !== 1 ? 's' : ''} left
          </div>
        )}
        {isFull && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[13px] font-bold"
            style={{ background: 'rgba(248,200,90,.15)', color: '#f8c85a', border: '1px solid rgba(248,200,90,.25)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f8c85a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Split is Full
          </div>
        )}

        <h1 className="font-display font-black text-[28px] text-white tracking-tight leading-none mb-2">
          {split.title || split.item?.name}
        </h1>
        <div className="flex items-center gap-1.5 text-gray-400 text-[13px]">
          <MapPin size={12}/> {split.store?.name || split.custom_store} · {split.store?.city || split.custom_address || ''}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-2">

        {/* Price card */}
        {(perHead > 0 || split.price_tbc || priceRange) && (
          <div className="mx-4 mt-3 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            {split.price_tbc ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-content-center flex-shrink-0"
                  style={{ background: '#fffbeb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" className="mx-auto">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-[16px] text-amber-800">Price to be confirmed</div>
                  <div className="text-[12px] text-amber-600 mt-0.5">Confirm price with the store before meeting</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">Your share</div>
                  <div className="font-display font-black text-[34px] leading-none" style={{ color: G }}>
                    {priceRange ? priceRange.text : `£${perHead}`}
                  </div>
                  {priceRange && <div className="text-[12px] text-gray-400 mt-1">estimated per person</div>}
                </div>
                {!priceRange && split.total_price > 0 && (
                  <div className="text-right">
                    <div className="text-[13px] text-gray-300 line-through">£{split.total_price} alone</div>
                    <div className="font-display font-black text-[26px] text-gray-900 leading-none">
                      £{Math.max(0, split.total_price - perHead)}
                    </div>
                    <div className="text-[12px] text-gray-400 mt-1">you save</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info list */}
        <div className="mx-4 mt-3 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {[
            split.preferred_date && {
              icon: <Calendar size={15} color="#a16207"/>, bg: '#fffbeb',
              p: `${formatDate(split.preferred_date)}${split.preferred_time ? ' · ' + split.preferred_time : ''}`,
              s: 'Meet at the store together'
            },
            {
              icon: <MapPin size={15} color={G}/>, bg: '#ecfff5',
              p: split.store?.name || split.custom_store || 'Store TBC',
              s: split.store?.address || split.custom_address || split.store?.city || ''
            },
            {
              icon: <Users size={15} color="#1e40af"/>, bg: '#eff6ff',
              p: `${memberCount}/${split.people_needed} joined · ${left > 0 ? left + ' spot' + (left !== 1 ? 's' : '') + ' left' : 'Full'}`,
              s: 'Everyone pays the store directly'
            },
          ].filter(Boolean).map((r, i, arr) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.bg }}>{r.icon}</div>
              <div>
                <div className="text-[14px] font-semibold text-gray-900">{r.p}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">{r.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Members */}
        <div className="mx-4 mt-3 mb-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Members</div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            {members.map((m, i) => {
              const c = COLOURS[i % COLOURS.length]
              return (
                <div key={m.id} className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0"
                    style={{ background: c.bg, color: c.text }}>
                    {m.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-gray-900">{m.user?.name}</div>
                    <div className="text-[12px] text-gray-400">{m.user?.city}</div>
                  </div>
                  {m.user_id === split.creator_id && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#ecfff5', color: G }}>Organiser</span>
                  )}
                  {perHead > 0 && (
                    <span className="text-[13px] font-bold" style={{ color: G }}>£{perHead}</span>
                  )}
                </div>
              )
            })}

            {/* Empty spots */}
            {Array.from({ length: left }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-300 text-[14px]">+</div>
                <div className="text-[13px] text-gray-400">Open spot — waiting for someone to join</div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion prompt for past splits */}
        <CompletionPrompt split={split} userId={user?.id} onDone={() => window.location.reload()}/>

        {/* Trust note */}
        <div className="mx-4 mb-3 p-3 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <p className="text-[12px] text-amber-700 leading-relaxed">
            <strong>Choma Share only coordinates splits.</strong> All payments go directly to the store. Never send money to other members in advance.
          </p>
        </div>
      </div>

      {/* CTA footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>

        {/* Full + member — WhatsApp coordination */}
        {isFull && isMember && (
          <SplitFullCoordination split={split} members={members}/>
        )}

        {/* Member, split still open */}
        {isMember && isOpen && (
          <div className="rounded-2xl p-3.5 text-center mb-2"
            style={{ background: '#ecfff5', border: '1px solid #b6f0d4' }}>
            <div className="text-[14px] font-bold" style={{ color: G }}>✓ You're in this split</div>
            <div className="text-[12px] text-gray-400 mt-1">
              Waiting for {left} more person{left !== 1 ? 's' : ''} to join
            </div>
          </div>
        )}

        {/* Not member, open */}
        {!isMember && isOpen && (
          <button onClick={handleJoin} disabled={joining}
            className="w-full text-white rounded-2xl py-4 text-[15px] font-bold disabled:opacity-50 mb-2"
            style={{ background: G, boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
            {joining ? 'Joining...' : `Join This Split${priceLabel ? ' · ' + priceLabel : ''}`}
          </button>
        )}

        {/* Not member, full */}
        {!isMember && isFull && (
          <div className="bg-gray-100 rounded-2xl p-3.5 text-center mb-2">
            <div className="text-[14px] font-semibold text-gray-500">This split is full — no spots left</div>
          </div>
        )}

        {/* Share always visible */}
        <button onClick={() => setShare(true)}
          className="w-full bg-transparent border border-gray-200 rounded-2xl py-3.5 text-[14px] font-semibold text-gray-600 flex items-center justify-center gap-2 active:bg-gray-50">
          <Share2 size={16}/> Share to WhatsApp
        </button>
      </div>

      <ShareSheet split={split} open={shareOpen} onClose={() => setShare(false)}/>
    </div>
  )
}

// ── WhatsApp coordination panel ──────────────────────────────────
function SplitFullCoordination({ split, members }) {
  const per   = Math.round(split.total_price / split.people_needed)
  const date  = split.preferred_date
    ? new Date(split.preferred_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'the agreed date'
  const time  = split.preferred_time ?? ''
  const store = split.store?.name || split.custom_store || 'the store'
  const addr  = split.store?.address || split.custom_address || ''
  const names = members.map(m => m.user?.name).filter(Boolean).join(', ')

  const msg = encodeURIComponent(
    `Hi team! 👋 Our Choma Share split is FULL!\n\n` +
    `📦 ${split.title}\n` +
    `🏪 ${store}${addr ? ', ' + addr : ''}\n` +
    `📅 ${date}${time ? ' at ' + time : ''}\n` +
    `💰 Each person pays: ${per > 0 ? `£${per}` : 'agreed price'} directly to store\n\n` +
    `Members: ${names}\n\n` +
    `See you there! ✅\n${window.location.href}`
  )

  return (
    <div className="mb-2 rounded-2xl p-4"
      style={{ background: 'linear-gradient(135deg,#062f23,#0a4a35)', border: '1px solid rgba(200,242,109,0.2)' }}>
      <div className="text-center mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
          style={{ background: 'rgba(200,242,109,0.15)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8f26d" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="font-display font-bold text-[16px] text-white mb-1">Split is Full!</div>
        <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          All {split.people_needed} members joined. Coordinate below.
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl p-3 mb-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        {[
          { label: split.preferred_date ? `${date}${time ? ' at ' + time : ''}` : 'Date TBC' },
          { label: `${store}${addr ? ' · ' + addr : ''}` },
          { label: per > 0 ? `£${per} each — pay store directly` : 'Confirm price at store' },
        ].map((r, i) => (
          <div key={i} className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            · {r.label}
          </div>
        ))}
      </div>

      {/* Avatars */}
      <div className="flex items-center justify-center gap-1 flex-wrap mb-3">
        {members.map((m, i) => {
          const colours  = ['#d1fae5','#fef3c7','#dbeafe','#ede9fe','#fce7f3']
          const tcolours = ['#065f46','#92400e','#1e40af','#5b21b6','#9d174d']
          return (
            <div key={m.id}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
              style={{ background: colours[i % colours.length], color: tcolours[i % tcolours.length] }}>
              {m.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )
        })}
      </div>

      <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[14px] font-bold"
        style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Send coordination message
      </a>
    </div>
  )
}
