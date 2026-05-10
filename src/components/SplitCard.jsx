import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import { spotsLeft, savingPerPerson, pricePerPerson, formatDate } from '../lib/api'

const COLOURS = ['bg-emerald-100 text-emerald-800','bg-amber-100 text-amber-800','bg-blue-100 text-blue-800','bg-violet-100 text-violet-800']

export default function SplitCard({ split, onJoin, joining }) {
  const navigate = useNavigate()
  const left     = spotsLeft(split)
  const saving   = savingPerPerson(split)
  const members  = split.split_members ?? []

  return (
    <article onClick={() => navigate(`/split/${split.id}`)}
      className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm cursor-pointer active:scale-[.985] transition-transform relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{ background: 'linear-gradient(90deg,#0f7a4b,#c8f26d)' }}/>

      <div className="flex justify-between items-start mb-2 mt-0.5">
        <h3 className="font-display font-bold text-[17px] tracking-tight text-gray-900 leading-tight">{split.title || split.item?.name}</h3>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-2 bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          Save £{saving}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium mb-3 flex-wrap">
        <MapPin size={12}/> {split.store?.name} · {split.store?.city}
        {split.preferred_date && <><span className="w-1 h-1 rounded-full bg-gray-300"/><Calendar size={12}/> {formatDate(split.preferred_date)}</>}
      </div>

      <div className="flex items-center mb-3">
        {members.slice(0, 4).map((m, i) => (
          <div key={m.id} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold -ml-1.5 first:ml-0 ${COLOURS[i % COLOURS.length]}`}>
            {m.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        ))}
        {left > 0 && <span className="text-[11px] font-bold ml-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">{left} spot{left !== 1 ? 's' : ''} left</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12px] text-[#0f7a4b] font-semibold">💚 Each person saves £{saving}</div>
        {left > 0 && (
          <button onClick={e => { e.stopPropagation(); onJoin?.(split.id) }}
            disabled={joining}
            className="bg-[#0f7a4b] text-white text-[12px] font-bold px-4 py-1.5 rounded-full active:scale-95 transition-transform disabled:opacity-50">
            {joining ? '...' : 'Join'}
          </button>
        )}
      </div>
    </article>
  )
}
