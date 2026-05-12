import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, ShoppingBag } from 'lucide-react'
import { getStores } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/Spinner'

export default function Stores() {
  const navigate       = useNavigate()
  const { profile }    = useAuth()
  const [stores,   setStores]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [cityFilter, setCityFilter] = useState('All')

  useEffect(() => {
    getStores().then(data => {
      setStores(data)
      // Default filter to user's city if it has stores
      if (profile?.city && data.some(s => s.city === profile.city)) {
        setCityFilter(profile.city)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [profile])

  // Get unique cities from stores
  const cities = ['All', ...new Set(stores.map(s => s.city).filter(Boolean))]

  // Filter stores by selected city
  const filtered = cityFilter === 'All'
    ? stores
    : stores.filter(s => s.city === cityFilter)

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-3 pb-3 border-b border-gray-100 flex-shrink-0">
        <h1 className="font-display font-black text-[24px] text-gray-900 tracking-tight">Partner Stores</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">{stores.length} verified African stores</p>

        {/* City filter chips */}
        {cities.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-none pb-0.5">
            {cities.map(c => {
              const isLive = c === 'Sunderland' || c === 'All'
              return (
                <button key={c} onClick={() => setCityFilter(c)}
                  className="flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5"
                  style={{
                    background:   cityFilter === c ? '#07130e' : '#fff',
                    color:        cityFilter === c ? '#fff' : '#6b7280',
                    borderColor:  cityFilter === c ? '#07130e' : '#e5e7eb',
                  }}>
                  {c}
                  {c !== 'All' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isLive
                          ? cityFilter === c ? 'rgba(200,242,109,0.3)' : '#ecfff5'
                          : '#fef3c7',
                        color: isLive ? '#0f7a4b' : '#a16207'
                      }}>
                      {isLive ? 'Live' : 'Soon'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {loading && <Spinner/>}

        {!loading && filtered.length === 0 && (
          <div className="mx-4 mt-4 p-6 bg-white border border-gray-100 rounded-3xl text-center shadow-sm">
            <div className="text-3xl mb-2">📍</div>
            <p className="font-semibold text-gray-700 mb-1">No stores in {cityFilter} yet</p>
            <p className="text-[13px] text-gray-400">We're expanding soon. Try viewing All stores.</p>
            <button onClick={() => setCityFilter('All')}
              className="mt-3 text-[12px] font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: '#0f7a4b' }}>
              View all stores
            </button>
          </div>
        )}

        <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
          {filtered.map(store => (
            <div key={store.id}>
              <div
                onClick={() => setSelected(selected === store.id ? null : store.id)}
                className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-sm cursor-pointer active:scale-[.985] transition-transform">

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: '#ecfff5' }}>
                    🏪
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-[15px] text-gray-900 tracking-tight">
                        {store.name}
                      </h3>
                      {/* City label */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: '#ecfff5', color: '#0f7a4b', border: '1px solid #b6f0d4' }}>
                        📍 {store.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mt-0.5">
                      <MapPin size={11}/> {store.address}
                    </div>
                    {store.phone && (
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mt-0.5">
                        <Phone size={11}/> {store.phone}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-300 mt-1">
                      {store.store_items?.filter(i => i.available && i.bulk_price > 0).length ?? 0} items available
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    {selected === store.id ? '▲' : '▼'}
                  </div>
                </div>

                {/* Items expandable */}
                {selected === store.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {store.store_items?.filter(i => i.available).length > 0 ? (
                      <>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Available Items
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {store.store_items.filter(i => i.available).map(item => (
                            <div key={item.id}
                              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-2">
                                <ShoppingBag size={13} color="#0f7a4b"/>
                                <span className="text-[13px] font-semibold text-gray-900">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-[14px]"
                                  style={{ color: item.bulk_price > 0 ? '#0f7a4b' : '#f59e0b' }}>
                                  {item.bulk_price > 0 ? `£${item.bulk_price}` : 'TBC'}
                                </span>
                                <button
                                  onClick={e => { e.stopPropagation(); navigate('/create') }}
                                  className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                                  style={{ background: '#0f7a4b' }}>
                                  Split
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-[13px] text-gray-400 text-center py-2">
                        Items coming soon
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mx-4 mb-4 p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="font-bold text-[13px] text-gray-900 mb-1">💡 How stores work</div>
          <p className="text-[12px] text-gray-400 leading-relaxed">
            Verified partner stores. Meet together, choose your own portions, pay the store directly. Choma Share only coordinates — we never handle payments or deliveries.
          </p>
        </div>
      </div>
    </div>
  )
}
