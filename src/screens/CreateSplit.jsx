import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth }   from '../hooks/useAuth'
import { getStores, createSplit } from '../lib/api'
import ShareSheet from '../components/ShareSheet'
import Spinner    from '../components/Spinner'
import { useToast } from '../components/Toast'

function getIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('yam'))      return { icon: '🍠', bg: '#ecfff5' }
  if (n.includes('turkey'))   return { icon: '🦃', bg: '#eff6ff' }
  if (n.includes('chicken'))  return { icon: '🍗', bg: '#fff7ed' }
  if (n.includes('fish'))     return { icon: '🐟', bg: '#f0fdf4' }
  if (n.includes('pepper') || n.includes('scotch') || n.includes('bonnet')) return { icon: '🌶️', bg: '#fff7ed' }
  if (n.includes('banana'))   return { icon: '🍌', bg: '#fefce8' }
  if (n.includes('tomato'))   return { icon: '🍅', bg: '#fef2f2' }
  if (n.includes('indomie') || n.includes('noodle')) return { icon: '🍜', bg: '#fefce8' }
  if (n.includes('rice'))     return { icon: '🌾', bg: '#f0fdf4' }
  if (n.includes('palm'))     return { icon: '🫙', bg: '#fefce8' }
  if (n.includes('crayfish')) return { icon: '🦐', bg: '#fff7ed' }
  return { icon: '🛒', bg: '#f3f4f6' }
}

const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM']

function getNext14Days() {
  const dates = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 1; i <= 14; i++) {
    const day = new Date(d)
    day.setDate(d.getDate() + i)
    dates.push(day)
  }
  return dates
}

export default function CreateSplit() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const toast    = useToast()

  const [stores,    setStores]   = useState([])
  const [allItems,  setAllItems] = useState([]) // all items from selected store
  const [loadingS,  setLS]       = useState(true)
  const [item,      setItem]     = useState(null) // selected store_item object
  const [priceMin,  setPriceMin]  = useState('')
  const [priceMax,  setPriceMax]  = useState('')
  const [priceTBC,  setPriceTBC]  = useState(false)
  const [store,     setStore]    = useState(null) // selected store id
  const [useOtherStore,   setUseOtherStore]   = useState(false)
  const [otherStoreName,  setOtherStoreName]  = useState('')
  const [otherStoreAddr,  setOtherStoreAddr]  = useState('')
  const [customItemName,  setCustomItemName]  = useState('')
  const [people,    setPeople]   = useState(3)
  const [date,      setDate]     = useState(null)
  const [time,      setTime]     = useState('11:00 AM')
  const [recurring, setRecur]    = useState(false)
  const [notes,     setNotes]    = useState('')
  const [submitting,setSub]      = useState(false)
  const [created,   setCreated]  = useState(null)
  const [shareOpen, setShare]    = useState(false)
  const next14Days = getNext14Days()

  useEffect(() => {
    if (!user) { navigate('/onboarding'); return }
    getStores().then(data => {
      setStores(data)
    }).catch(() => {}).finally(() => setLS(false))
  }, [user, navigate])

  // When store changes, update available items
  useEffect(() => {
    if (!store) { setAllItems([]); setItem(null); return }
    const selectedStore = stores.find(s => s.id === store)
    const items = selectedStore?.store_items?.filter(i => i.available) ?? []
    setAllItems(items)
    setItem(null) // reset item selection
    setPriceMin('')
    setPriceMax('')
  }, [store, stores])

  const midPrice = (priceMin && priceMax)
    ? (parseFloat(priceMin) + parseFloat(priceMax)) / 2
    : item?.bulk_price ?? 0
  const perMin = (priceMin && people) ? Math.round(parseFloat(priceMin) / people) : 0
  const perMax = (priceMax && people) ? Math.round(parseFloat(priceMax) / people) : 0
  const perHead = midPrice > 0 ? Math.round(midPrice / people) : 0

  async function submit() {
    if (useOtherStore) {
      if (!otherStoreName.trim()) { toast('Please enter the store name', 'error'); return }
      if (!customItemName.trim()) { toast('Please enter the item name', 'error'); return }
      if (!date) { toast('Please select a date', 'error'); return }
    } else {
      if (!item || !store || !date) {
        toast('Please select an item, store and date', 'error'); return
      }
    }
    setSub(true)
    try {
      const newSplit = await createSplit({
        item_id:         useOtherStore ? null : item.id,
        store_id:        useOtherStore ? null : store,
        creator_id:      user.id,
        title:           useOtherStore ? customItemName.trim() : item.name,
        custom_store:    useOtherStore ? otherStoreName.trim() : null,
        custom_address:  useOtherStore ? otherStoreAddr.trim() : null,
        total_price:     priceTBC ? 0 : midPrice,
        price_min:       priceTBC ? 0 : (parseFloat(priceMin) || item.bulk_price || 0),
        price_max:       priceTBC ? 0 : (parseFloat(priceMax) || item.bulk_price || 0),
        price_tbc:       priceTBC,
        people_needed:   people,
        people_joined:   1,
        preferred_date:  date.toISOString().split('T')[0],
        preferred_time:  time,
        is_recurring:    recurring,
        recur_frequency: recurring ? 'monthly' : null,
        notes,
        status:          'open',
      })
      setCreated(newSplit)
      toast('Split posted! 🎉', 'success')
      setTimeout(() => setShare(true), 600)
    } catch (err) {
      toast(err.message || 'Failed to post split', 'error')
    } finally { setSub(false) }
  }

  const G = '#0f7a4b'

  // Wait for profile to load
  if (!profile) return <div className="flex items-center justify-center h-full"><Spinner/></div>

  const isSunderland = profile.city === 'Sunderland'

  // Coming soon gate for non-Sunderland users
  if (!isSunderland) return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 text-[16px] font-medium">
          <ArrowLeft size={16}/> Back
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'#f0fdf4'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0f7a4b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <h2 className="font-display font-bold text-[22px] text-gray-900 tracking-tight mb-2">
          Coming to {profile.city} soon
        </h2>
        <p className="text-[16px] text-gray-400 mb-6 leading-relaxed">
          Splits are live in Sunderland right now. We're expanding to {profile.city} very soon — you'll be notified first.
        </p>
        <div className="px-5 py-3 rounded-2xl text-[16px] font-bold"
          style={{ background: '#f0fdf4', color: '#0f7a4b', border: '1px solid #b6f0d4' }}>
          You're on the waitlist for {profile.city}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 text-[16px] font-medium mb-3">
          <ArrowLeft size={16}/> Back
        </button>
        <h1 className="font-display font-black text-[24px] text-gray-900 tracking-tight">Create a Split</h1>
        <p className="text-[16px] text-gray-400 mt-0.5">Find people to buy bulk with you</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="px-4 pt-3 pb-4 space-y-3">

          {/* STEP 1 — Select Store First */}
          <div>
            <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              1. Which store?
            </label>
            {loadingS ? <Spinner size={20}/> : (
              <div className="space-y-2">
                {stores.map(s => (
                  <button key={s.id} onClick={() => setStore(s.id)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all"
                    style={{
                      background:   store === s.id ? '#f0fdf4' : '#fff',
                      borderColor:  store === s.id ? G : '#e5e7eb',
                      borderWidth:  store === s.id ? 2 : 1.5,
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: '#ecfff5' }}>🏪</div>
                    <div className="text-left flex-1">
                      <div className="text-[16px] font-bold text-gray-900">{s.name}</div>
                      <div className="text-[16px] text-gray-400">{s.address}</div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ background: store === s.id ? G : 'transparent', borderColor: store === s.id ? G : '#d1d5db' }}>
                      {store === s.id && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Other store option */}
            <button
              onClick={() => {
                setUseOtherStore(o => {
                  if (!o) { setStore(null); setItem(null); setAllItems([]) }
                  return !o
                })
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all mt-2"
              style={{
                background:  useOtherStore ? '#f0fdf4' : '#fff',
                borderColor: useOtherStore ? G : '#e5e7eb',
                borderWidth: useOtherStore ? 2 : 1.5,
                borderStyle: 'dashed',
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: useOtherStore ? '#ecfff5' : '#f9fafb' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={useOtherStore ? G : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="text-[14px] font-bold" style={{ color: useOtherStore ? G : '#6b7280' }}>
                  My store isn't listed
                </div>
                <div className="text-[11px] text-gray-400">Add a store not on Choma Share yet</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ background: useOtherStore ? G : 'transparent', borderColor: useOtherStore ? G : '#d1d5db' }}>
                {useOtherStore && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </button>

            {/* Other store inputs */}
            {useOtherStore && (
              <div className="space-y-2 mt-2">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#0f7a4b]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Store name *</div>
                  <input
                    type="text"
                    value={otherStoreName}
                    onChange={e => setOtherStoreName(e.target.value)}
                    placeholder="e.g. Afro Caribbean Foods"
                    style={{ fontSize: '16px', fontFamily: 'inherit' }}
                    className="w-full bg-transparent outline-none text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#0f7a4b]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Store address (optional)</div>
                  <input
                    type="text"
                    value={otherStoreAddr}
                    onChange={e => setOtherStoreAddr(e.target.value)}
                    placeholder="e.g. 12 High Street, Sunderland"
                    style={{ fontSize: '16px', fontFamily: 'inherit' }}
                    className="w-full bg-transparent outline-none text-gray-900 font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2 — Custom item if other store */}
          {useOtherStore && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                2. What are you splitting?
              </label>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#0f7a4b]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Item name *</div>
                <input
                  type="text"
                  value={customItemName}
                  onChange={e => setCustomItemName(e.target.value)}
                  placeholder="e.g. Yam Box, Turkey Carton..."
                  style={{ fontSize: '16px', fontFamily: 'inherit' }}
                  className="w-full bg-transparent outline-none text-gray-900 font-semibold"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Select Item (from store's real items) */}
          {store && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                2. What are you splitting?
              </label>
              {allItems.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[16px] text-amber-700">
                  No items listed for this store yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {allItems.map(it => {
                    const { icon, bg } = getIcon(it.name)
                    return (
                      <button key={it.id} onClick={() => setItem(it)}
                        className="flex flex-col items-center p-3.5 rounded-2xl border transition-all"
                        style={{
                          background:  item?.id === it.id ? '#f0fdf4' : '#fff',
                          borderColor: item?.id === it.id ? G : '#e5e7eb',
                          borderWidth: item?.id === it.id ? 2 : 1.5,
                        }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2" style={{ background: bg }}>
                          {icon}
                        </div>
                        <div className="text-[16px] font-bold text-gray-900">{it.name}</div>
                        <div className="text-[16px] font-semibold mt-0.5" style={{ color: G }}>£{it.bulk_price}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2b — Price (with TBC toggle) */}
          {item && (
            <div>
              {/* Header + toggle */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400">
                  2b. Price range?
                </label>
                {/* TBC Toggle */}
                <button
                  onClick={() => {
                    setPriceTBC(t => !t)
                    if (!priceTBC) { setPriceMin(''); setPriceMax('') }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all"
                  style={{
                    background: priceTBC ? '#fef3c7' : '#f3f4f6',
                    color:      priceTBC ? '#a16207' : '#6b7280',
                    border:     priceTBC ? '1.5px solid #fcd34d' : '1.5px solid #e5e7eb',
                  }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: priceTBC ? '#f59e0b' : '#d1d5db' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      {priceTBC
                        ? <polyline points="20 6 9 17 4 12"/>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                      }
                    </svg>
                  </div>
                  {priceTBC ? 'TBC — price unknown' : 'Set as TBC'}
                </button>
              </div>

              {priceTBC ? (
                /* TBC state */
                <div className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: '#fffbeb', border: '1.5px solid #fcd34d' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <div className="text-[13px] font-bold text-amber-800">Price to be confirmed</div>
                    <div className="text-[11px] text-amber-600 mt-0.5">Members will see "Price TBC" on this split</div>
                  </div>
                </div>
              ) : (
                /* Price input state */
                <div>
                  <p className="text-[12px] text-gray-400 mb-2">
                    Enter a min and max — prices vary at stores.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-3 py-3 flex items-center gap-2 focus-within:border-[#0f7a4b]">
                      <span className="text-[13px] font-bold text-gray-400">£</span>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={e => setPriceMin(e.target.value)}
                        placeholder="Min e.g. 60"
                        style={{ fontSize: '16px' }}
                        className="flex-1 bg-transparent outline-none text-gray-900 font-semibold"
                      />
                    </div>
                    <span className="text-gray-400 font-bold">—</span>
                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-3 py-3 flex items-center gap-2 focus-within:border-[#0f7a4b]">
                      <span className="text-[13px] font-bold text-gray-400">£</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={e => setPriceMax(e.target.value)}
                        placeholder="Max e.g. 80"
                        style={{ fontSize: '16px' }}
                        className="flex-1 bg-transparent outline-none text-gray-900 font-semibold"
                      />
                    </div>
                  </div>
                  {priceMin && priceMax && (
                    <div className="mt-2 rounded-xl p-2.5 text-center" style={{ background: '#ecfff5', border: '1px solid #d1fae5' }}>
                      <div className="font-display font-bold text-[16px]" style={{ color: '#0f7a4b' }}>£{perMin}–£{perMax} each</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — People */}
          {item && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                3. How many people?
              </label>
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3">
                <button onClick={() => setPeople(p => Math.max(2, p-1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#ecfff5', border: '1px solid #b6f0d4' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <div className="flex-1 text-center">
                  <div className="font-display font-bold text-[28px] leading-none" style={{ color: G }}>{people}</div>
                  <div className="text-[16px] text-gray-400 mt-0.5">people total</div>
                </div>
                <button onClick={() => setPeople(p => Math.min(6, p+1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#ecfff5', border: '1px solid #b6f0d4' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: '#ecfff5', border: '1px solid #d1fae5' }}>
                  <div className="font-display font-bold text-[20px]" style={{ color: G }}>
                    {priceMin && priceMax ? `£${perMin}–£${perMax}` : perHead > 0 ? `£${perHead}` : '£0'}
                  </div>
                  <div className="text-[16px] text-gray-400 font-semibold">each pays</div>
                </div>
                <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: '#ecfff5', border: '1px solid #d1fae5' }}>
                  <div className="font-display font-bold text-[20px]" style={{ color: G }}>
                    {midPrice > 0 ? `£${Math.round(midPrice - perHead)}` : '£0'}
                  </div>
                  <div className="text-[16px] text-gray-400 font-semibold">each saves</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Date */}
          {item && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                4. Preferred day
              </label>
              <div className="grid grid-cols-4 gap-2">
                {next14Days.map(d => {
                  const sel = date?.toDateString() === d.toDateString()
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <button key={d.toDateString()} onClick={() => setDate(d)}
                      className="py-2.5 rounded-xl border transition-all relative"
                      style={{
                        background: sel ? '#f0fdf4' : '#fff',
                        borderColor: sel ? G : isWeekend ? '#d1fae5' : '#e5e7eb',
                        borderWidth: sel ? 2 : 1.5,
                      }}>
                      <div className="text-[16px] font-bold uppercase"
                        style={{ color: sel ? G : isWeekend ? '#059669' : '#9ca3af' }}>
                        {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </div>
                      <div className="font-display font-bold text-[16px] leading-tight"
                        style={{ color: sel ? G : '#111827' }}>
                        {d.getDate()}
                      </div>
                      <div className="text-[16px] text-gray-400">
                        {d.toLocaleDateString('en-GB', { month: 'short' })}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-[16px] text-gray-400 mt-1">
                <span style={{ color: '#059669', fontWeight: 600 }}>Green border</span> = weekend
              </p>
            </div>
          )}

          {/* STEP 5 — Time */}
          {item && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                5. Preferred time
              </label>
              <div className="flex gap-2 flex-wrap">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setTime(t)}
                    className="text-[16px] font-bold px-3 py-2 rounded-xl border transition-all"
                    style={{ background: time === t ? '#f0fdf4' : '#fff', borderColor: time === t ? G : '#e5e7eb', color: time === t ? G : '#4b5563' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurring */}
          {item && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Monthly recurring
              </label>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[16px] font-semibold text-gray-900">Make this a monthly split</div>
                  <div className="text-[16px] text-gray-400 mt-0.5">Repeat automatically each month</div>
                </div>
                <button onClick={() => setRecur(r => !r)}
                  className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
                  style={{ background: recurring ? G : '#d1d5db' }}>
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: recurring ? 'translateX(20px)' : 'translateX(2px)' }}/>
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          {item && (
            <div>
              <label className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Notes (optional)
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any extra details for your split partners..."
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[16px] text-gray-900 outline-none resize-none placeholder:text-gray-300"/>
            </div>
          )}

          {/* Submit */}
          <button onClick={submit}
            disabled={useOtherStore ? (!otherStoreName.trim() || !customItemName.trim() || !date || submitting) : (!item || !store || !date || submitting)}
            className="w-full text-white rounded-2xl py-4 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: G, boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
            {submitting ? <Spinner size={20} color="white"/> : <>Post My Split <ArrowRight size={18}/></>}
          </button>
        </div>
      </div>

      <ShareSheet split={created} open={shareOpen} onClose={() => { setShare(false); navigate('/') }}/>
    </div>
  )
}
