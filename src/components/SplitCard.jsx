import { useNavigate } from 'react-router-dom'
import { pricePerPerson, priceRangePerPerson, formatDate } from '../lib/api'

// Food item colour themes and icons
function getItemTheme(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('yam'))     return { bg: '#f5f0e8', icon: '🍠', accent: '#92400e' }
  if (n.includes('turkey'))  return { bg: '#fef3e8', icon: '🦃', accent: '#c2410c' }
  if (n.includes('chicken')) return { bg: '#fef9e8', icon: '🍗', accent: '#b45309' }
  if (n.includes('fish'))    return { bg: '#e8f4f5', icon: '🐟', accent: '#0e7490' }
  if (n.includes('pepper') || n.includes('scotch') || n.includes('bonnet'))
                             return { bg: '#fef2f2', icon: '🌶️', accent: '#dc2626' }
  if (n.includes('banana') || n.includes('plantain'))
                             return { bg: '#fefce8', icon: '🍌', accent: '#ca8a04' }
  if (n.includes('tomato'))  return { bg: '#fef2f2', icon: '🍅', accent: '#dc2626' }
  if (n.includes('indomie') || n.includes('noodle'))
                             return { bg: '#fef9e8', icon: '🍜', accent: '#b45309' }
  if (n.includes('rice'))    return { bg: '#f0fdf4', icon: '🌾', accent: '#15803d' }
  if (n.includes('palm'))    return { bg: '#fef9e8', icon: '🫙', accent: '#b45309' }
  return                           { bg: '#f0fdf4', icon: '🛒', accent: '#0f7a4b' }
}

const AVATAR_COLOURS = [
  { bg: '#ecfff5', color: '#0f7a4b' },
  { bg: '#fef3c7', color: '#a16207' },
  { bg: '#eff6ff', color: '#1e40af' },
  { bg: '#faf5ff', color: '#7c3aed' },
]

export default function SplitCard({ split, onJoin, joining }) {
  const navigate    = useNavigate()
  const memberCount = split.split_members?.length ?? split.people_joined ?? 0
  const left        = Math.max(0, split.people_needed - memberCount)
  const isFull      = left === 0 || split.status === 'full'
  const perHead     = pricePerPerson(split)
  const priceRange  = priceRangePerPerson(split)
  const members     = split.split_members ?? []
  const theme       = getItemTheme(split.title || split.item?.name || '')

  const priceLabel = isFull
    ? null
    : split.price_tbc
      ? 'Price TBC'
      : priceRange
        ? priceRange.text
        : perHead > 0
          ? `£${perHead} each`
          : 'Price TBC'

  const dateLabel = split.preferred_date
    ? formatDate(split.preferred_date) + (split.preferred_time ? ` · ${split.preferred_time}` : '')
    : null

  return (
    <article
      onClick={() => navigate(`/split/${split.id}`)}
      className="bg-white rounded-3xl shadow-sm cursor-pointer active:scale-[.985] transition-transform overflow-hidden"
      style={{ border: '1px solid #f0f0f0' }}>

      <div className="flex items-stretch">

        {/* Left — food thumbnail */}
        <div className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 80,
            background: theme.bg,
            fontSize: 36,
            borderRight: '1px solid rgba(0,0,0,0.04)',
          }}>
          {theme.icon}
        </div>

        {/* Right — content */}
        <div className="flex-1 min-w-0 p-3">

          {/* Title + price badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-[17px] tracking-tight text-gray-900 leading-tight flex-1 min-w-0">
              {split.title || split.item?.name}
            </h3>
            {isFull ? (
              <span className="text-[17px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap flex-shrink-0">
                Full
              </span>
            ) : (
              <span className="text-[17px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                style={{ background: '#ecfff5', color: '#0f7a4b', border: '1px solid #b6f0d4' }}>
                {priceLabel}
              </span>
            )}
          </div>

          {/* Store + date */}
          <div className="text-[17px] text-gray-400 font-medium mb-2 space-y-0.5">
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span className="truncate">{split.store?.name}</span>
            </div>
            {dateLabel && (
              <div className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{dateLabel}</span>
              </div>
            )}
          </div>

          {/* Members row + join button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Avatars */}
              <div className="flex">
                {members.slice(0, 3).map((m, i) => (
                  <div key={m.id}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[17px] font-bold -ml-1 first:ml-0"
                    style={{ background: AVATAR_COLOURS[i % AVATAR_COLOURS.length].bg, color: AVATAR_COLOURS[i % AVATAR_COLOURS.length].color }}>
                    {m.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                ))}
                {!isFull && Array.from({ length: Math.min(left, 2) }).map((_, i) => (
                  <div key={`e${i}`}
                    className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 -ml-1 flex items-center justify-center"
                    style={{ color: '#d1d5db', fontSize: 10 }}>+</div>
                ))}
              </div>

              {/* Count label */}
              <span className={`text-[17px] font-bold px-1.5 py-0.5 rounded-full ${
                isFull
                  ? 'bg-gray-100 text-gray-500'
                  : left === 1
                    ? 'bg-red-50 text-red-500'
                    : 'bg-amber-50 text-amber-600'
              }`}>
                {memberCount}/{split.people_needed}
                {isFull ? ' · Full' : ` · ${left} left`}
              </span>
            </div>

            {/* Join button */}
            {!isFull && (
              <button
                onClick={e => { e.stopPropagation(); onJoin?.(split.id) }}
                disabled={joining}
                className="text-white text-[17px] font-bold px-4 py-1.5 rounded-full active:scale-95 transition-transform disabled:opacity-50"
                style={{ background: '#0f7a4b', boxShadow: '0 2px 8px rgba(15,122,75,0.3)' }}>
                {joining ? '...' : 'Join'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-[3px]"
        style={{ background: isFull
          ? 'linear-gradient(90deg,#e5e7eb,#f3f4f6)'
          : `linear-gradient(90deg,${theme.accent}33,#0f7a4b66)`
        }}/>
    </article>
  )
}
