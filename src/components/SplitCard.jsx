import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import { spotsLeft, pricePerPerson, priceRangePerPerson, formatDate } from '../lib/api'

const COLOURS = [
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-blue-100 text-blue-800',
  'bg-violet-100 text-violet-800',
]

export default function SplitCard({ split, onJoin, joining }) {
  const navigate = useNavigate()

  // Use actual member count as source of truth
  const memberCount = split.split_members?.length ?? split.people_joined ?? 0
  const left        = Math.max(0, split.people_needed - memberCount)
  const isFull      = left === 0 || split.status === 'full'
  const perHead     = pricePerPerson(split)
  const priceRange  = priceRangePerPerson(split)
  const members     = split.split_members ?? []

  return (
    <article
      onClick={() => navigate(`/split/${split.id}`)}
      className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm cursor-pointer active:scale-[.985] transition-transform relative overflow-hidden">

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
        style={{ background: isFull
          ? 'linear-gradient(90deg,#9ca3af,#d1d5db)'
          : 'linear-gradient(90deg,#0f7a4b,#c8f26d)'
        }}/>

      {/* Header */}
      <div className="flex justify-between items-start mb-2 mt-0.5">
        <h3 className="font-display font-bold text-[17px] tracking-tight text-gray-900 leading-tight">
          {split.title || split.item?.name}
        </h3>
        {isFull ? (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-2 bg-gray-100 text-gray-500 whitespace-nowrap">
            Full
          </span>
        ) : (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-2 bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            {priceRange ? priceRange.text : perHead > 0 ? `£${perHead} each` : 'Price TBC'}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium mb-3 flex-wrap">
        <MapPin size={12}/>
        {split.store?.name} · {split.store?.city}
        {split.preferred_date && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-300"/>
            <Calendar size={12}/>
            {formatDate(split.preferred_date)}
          </>
        )}
      </div>

      {/* Members avatars + spots */}
      <div className="flex items-center mb-3">
        {members.slice(0, 4).map((m, i) => (
          <div key={m.id}
            className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold -ml-1.5 first:ml-0 ${COLOURS[i % COLOURS.length]}`}>
            {m.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        ))}

        {/* Empty slot circles */}
        {!isFull && Array.from({ length: Math.min(left, 3) }).map((_, i) => (
          <div key={`empty-${i}`}
            className="w-7 h-7 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center -ml-1.5 text-gray-300 text-[13px]">
            +
          </div>
        ))}

        {/* Spots label */}
        <span className={`text-[11px] font-bold ml-2 px-2 py-0.5 rounded-full ${
          isFull
            ? 'bg-gray-100 text-gray-500'
            : left === 1
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
        }`}>
          {isFull
            ? `${split.people_needed}/${split.people_needed} · No spots left`
            : `${memberCount}/${split.people_needed} · ${left} spot${left !== 1 ? 's' : ''} left`
          }
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-semibold" style={{ color: isFull ? '#9ca3af' : '#0f7a4b' }}>
          {isFull ? 'Split is full' : `Instead of £${split.total_price} alone`}
        </div>

        {!isFull && (
          <button
            onClick={e => { e.stopPropagation(); onJoin?.(split.id) }}
            disabled={joining}
            className="text-white text-[12px] font-bold px-4 py-1.5 rounded-full active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: '#0f7a4b' }}>
            {joining ? '...' : 'Join'}
          </button>
        )}
      </div>
    </article>
  )
}
