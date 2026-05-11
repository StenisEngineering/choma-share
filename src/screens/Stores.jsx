import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, ShoppingBag } from 'lucide-react'
import { getStores } from '../lib/api'
import Spinner from '../components/Spinner'

export default function Stores() {
  const navigate = useNavigate()
  const [stores,  setStores]  = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getStores().then(setStores).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <h1 className="font-display font-black text-[26px] text-gray-900 tracking-tight">Partner Stores</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">5 African stores in Sunderland</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {loading && <Spinner/>}

        <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
          {stores.map(store => (
            <div key={store.id}>
              {/* Store card */}
              <div
                onClick={() => setSelected(selected === store.id ? null : store.id)}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm cursor-pointer active:scale-[.985] transition-transform">

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: '#ecfff5' }}>
                    🏪
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-[16px] text-gray-900 tracking-tight mb-1">{store.name}</h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-1">
                      <MapPin size={12}/> {store.address}
                    </div>
                    {store.phone && (
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                        <Phone size={12}/> {store.phone}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-300 text-lg">{selected === store.id ? '▲' : '▼'}</div>
                </div>

                {/* Items expandable */}
                {selected === store.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {store.store_items?.length > 0 ? (
                      <>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Available Items
                        </div>
                        <div className="flex flex-col gap-2">
                          {store.store_items.map(item => (
                            <div key={item.id}
                              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-2">
                                <ShoppingBag size={13} color="#0f7a4b"/>
                                <span className="text-[13px] font-semibold text-gray-900">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-[14px]" style={{ color: '#0f7a4b' }}>
                                  £{item.bulk_price}
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
                      <p className="text-[13px] text-gray-400 text-center py-2">No items listed yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mx-4 mb-6 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div className="font-bold text-[14px] text-gray-900 mb-1">💡 How stores work</div>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            These are verified partner stores in Sunderland. When you create a split, you meet at the store together, choose your own portions, and pay the store directly. Choma Share only coordinates — we never handle payments or deliveries.
          </p>
        </div>
      </div>
    </div>
  )
}
