import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth }    from '../hooks/useAuth'
import { getMySplits, formatDate, pricePerPerson, savingPerPerson } from '../lib/api'
import Spinner from '../components/Spinner'

const STATUS_STYLE = {
  open:      { bg: '#ecfff5', color: '#0f7a4b', label: 'Open' },
  full:      { bg: '#fffbeb', color: '#a16207', label: 'Full' },
  done:      { bg: '#f3f4f6', color: '#6b7280', label: 'Done' },
  cancelled: { bg: '#fef2f2', color: '#ef4444', label: 'Cancelled' },
}

export default function MySplits() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [splits,  setSplits]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMySplits(user.id)
      .then(setSplits)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const active = splits.filter(m => m.split?.status === 'open' || m.split?.status === 'full')
  const past   = splits.filter(m => m.split?.status === 'done' || m.split?.status === 'cancelled')

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <h1 className="font-display font-black text-[26px] text-gray-900 tracking-tight">My Splits</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Splits you created or joined</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">

        {loading && <Spinner/>}

        {!loading && splits.length === 0 && (
          <div className="mx-4 mt-6 p-8 bg-white border border-gray-100 rounded-3xl text-center shadow-sm">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-display font-bold text-[18px] text-gray-900 mb-2">No splits yet</p>
            <p className="text-[13px] text-gray-400 mb-5">Create your first split and share it with your community.</p>
            <button onClick={() => navigate('/create')}
              className="flex items-center gap-2 mx-auto text-white px-6 py-3 rounded-2xl font-bold text-[14px]"
              style={{ background: '#0f7a4b' }}>
              <Plus size={16}/> Create a Split
            </button>
          </div>
        )}

        {active.length > 0 && (
          <>
            <div className="px-4 pt-4 pb-2">
              <h2 className="font-display font-bold text-[16px] text-gray-900 tracking-tight">Active</h2>
            </div>
            <div className="px-4 flex flex-col gap-3">
              {active.map(m => <SplitRow key={m.split_id} m={m} navigate={navigate}/>)}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="px-4 pt-5 pb-2">
              <h2 className="font-display font-bold text-[16px] text-gray-900 tracking-tight">Past</h2>
            </div>
            <div className="px-4 flex flex-col gap-3 pb-6">
              {past.map(m => <SplitRow key={m.split_id} m={m} navigate={navigate}/>)}
            </div>
          </>
        )}

        <div style={{ height: 24 }}/>
      </div>

      {/* FAB */}
      <div className="absolute bottom-24 right-4">
        <button onClick={() => navigate('/create')}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ background: '#0f7a4b', boxShadow: '0 6px 20px rgba(15,122,75,.4)' }}>
          <Plus size={24}/>
        </button>
      </div>
    </div>
  )
}

function SplitRow({ m, navigate }) {
  const split  = m.split
  const status = STATUS_STYLE[split?.status] ?? STATUS_STYLE.open
  const per    = split ? pricePerPerson(split) : 0
  const saving = split ? savingPerPerson(split) : 0
  const left   = split ? split.people_needed - split.people_joined : 0

  return (
    <div onClick={() => navigate(`/split/${m.split_id}`)}
      className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm cursor-pointer active:scale-[.985] transition-transform relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
        style={{ background: 'linear-gradient(90deg,#0f7a4b,#c8f26d)' }}/>

      <div className="flex justify-between items-start mb-2 mt-0.5">
        <h3 className="font-display font-bold text-[16px] tracking-tight text-gray-900">{split?.title}</h3>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full ml-2 whitespace-nowrap"
          style={{ background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>

      <div className="text-[12px] text-gray-400 mb-3">
        {split?.store?.name} · {split?.preferred_date ? formatDate(split.preferred_date) : 'Date TBC'}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12px] font-semibold" style={{ color: '#0f7a4b' }}>
          £{per} per person · saves £{saving}
        </div>
        <div className="text-[11px] text-gray-400">
          {split?.people_joined}/{split?.people_needed} joined · {left} left
        </div>
      </div>
    </div>
  )
}
