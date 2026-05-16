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

function getWeekends() {
  const dates = []; const d = new Date()
  while (dates.length < 6) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() === 6 || d.getDay() === 0) dates.push(new Date(d))
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
  const [store,     setStore]    = useState(null) // selected store id
  const [people,    setPeople]   = useState(3)
  const [date,      setDate]     = useState(null)
  const [time,      setTime]     = useState('11:00 AM')
  const [recurring, setRecur]    = useState(false)
  const [notes,     setNotes]    = useState('')
  const [submitting,setSub]      = useState(false)
  const [created,   setCreated]  = useState(null)
  const [shareOpen, setShare]    = useState(false)
  const weekends = getWeekends()

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
    if (!item || !store || !date) {
      toast('Please select an item, store and date', 'error'); return
    }
    setSub(true)
    try {
      const newSplit = await createSplit({
        item_id:         item.id,
        store_id:        store,
        creator_id:      user.id,
        title:           item.name,
        total_price:     midPrice,
        price_min:       parseFloat(priceMin) || item.bulk_price || 0,
        price_max:       parseFloat(priceMax) || item.bulk_price || 0,
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
  const isSunderland = !profile?.city || profile?.city === 'Sunderland'

  // Coming soon gate for non-Sunderland users
  if (profile && !isSunderland) return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium">
          <ArrowLeft size={16}/> Back
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">📍</div>
        <h2 className="font-display font-bold text-[22px] text-gray-900 tracking-tight mb-2">
          Coming to {profile.city} soon
        </h2>
        <p className="text-[14px] text-gray-400 mb-6 leading-relaxed">
          Splits are live in Sunderland right now. We're expanding to {profile.city} very soon — you'll be notified first.
        </p>
        <div className="px-5 py-3 rounded-2xl text-[13px] font-bold"
          style={{ background: '#f0fdf4', color: '#0f7a4b', border: '1px solid #b6f0d4' }}>
          🔔 You're on the waitlist for {profile.city}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Coming soon gate */}
      {!isSunderland && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
          <div className="text-5xl mb-4">📍</div>
          <h2 className="font-display font-bold text-[22px] text-gray-900 tracking-tight mb-2">
            Coming to {profile?.city} soon
          </h2>
          <p className="text-[14px] text-gray-400 mb-6 leading-relaxed">
            Splits are currently only available in Sunderland. We're expanding to {profile?.city} very soon — you'll be the first to know.
          </p>
          <div className="px-5 py-3 rounded-2xl text-[13px] font-bold"
            style={{ background: '#f0fdf4', color: '#0f7a4b', border: '1px solid #b6f0d4' }}>
            🔔 You're on the waitlist for {profile?.city}
          </div>
        </div>
      )}

      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium mb-3">
          <ArrowLeft size={16}/> Back
        </button>
        <h1 className="font-display font-black text-[24px] text-gray-900 tracking-tight">Create a Split</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Find people to buy bulk with you</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="px-4 pt-3 pb-4 space-y-3">

          {/* STEP 1 — Select Store First */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
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
                      <div className="text-[14px] font-bold text-gray-900">{s.name}</div>
                      <div className="text-[11px] text-gray-400">{s.address}</div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ background: store === s.id ? G : 'transparent', borderColor: store === s.id ? G : '#d1d5db' }}>
                      {store === s.id && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2 — Select Item (from store's real items) */}
          {store && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                2. What are you splitting?
              </label>
              {allItems.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[13px] text-amber-700">
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
                        <div className="text-[13px] font-bold text-gray-900">{it.name}</div>
                        <div className="text-[11px] font-semibold mt-0.5" style={{ color: G }}>£{it.bulk_price}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2b — Price Range */}
          {item && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                2b. What's the price range? (optional)
              </label>
              <p className="text-[11px] text-gray-400 mb-2">
                Prices vary at stores. Enter a min and max so members know what to expect.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-3 py-3 flex items-center gap-2 focus-within:border-[#0f7a4b]">
                  <span className="text-[14px] font-bold text-gray-400">£</span>
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
                  <span className="text-[14px] font-bold text-gray-400">£</span>
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
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: '#ecfff5', border: '1px solid #d1fae5' }}>
                    <div className="font-display font-bold text-[16px]" style={{ color: '#0f7a4b' }}>£{perMin}–£{perMax}</div>
                    <div className="text-[10px] text-gray-400 font-semibold">per person</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — People */}
          {item && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
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
                  <div className="text-[11px] text-gray-400 mt-0.5">people total</div>
                </div>
                <button onClick={() => setPeople(p => Math.min(6, p+1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#ecfff5', border: '1px solid #b6f0d4' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                {[{ v: `£${perHead}`, l: 'each pays' }, { v: `£${saving}`, l: 'each saves' }].map(s => (
                  <div key={s.l} className="flex-1 rounded-xl p-2.5 text-center" style={{ background: '#ecfff5', border: '1px solid #d1fae5' }}>
                    <div className="font-display font-bold text-[18px]" style={{ color: G }}>{s.v}</div>
                    <div className="text-[10px] text-gray-400 font-semibold">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Date */}
          {item && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                4. Preferred day
              </label>
              <div className="grid grid-cols-3 gap-2">
                {weekends.map(d => {
                  const sel = date?.toDateString() === d.toDateString()
                  return (
                    <button key={d.toDateString()} onClick={() => setDate(d)}
                      className="py-2.5 rounded-xl border transition-all"
                      style={{ background: sel ? '#f0fdf4' : '#fff', borderColor: sel ? G : '#e5e7eb', borderWidth: sel ? 2 : 1.5 }}>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                      <div className="font-display font-bold text-[19px] leading-tight" style={{ color: sel ? G : '#111827' }}>{d.getDate()}</div>
                      <div className="text-[9px] text-gray-400">{d.toLocaleDateString('en-GB', { month: 'short' })}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 5 — Time */}
          {item && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                5. Preferred time
              </label>
              <div className="flex gap-2 flex-wrap">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setTime(t)}
                    className="text-[12px] font-bold px-3 py-2 rounded-xl border transition-all"
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
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Monthly recurring
              </label>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-gray-900">Make this a monthly split</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Repeat automatically each month</div>
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
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Notes (optional)
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any extra details for your split partners..."
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[14px] text-gray-900 outline-none resize-none placeholder:text-gray-300"/>
            </div>
          )}

          {/* Submit */}
          <button onClick={submit}
            disabled={!item || !store || !date || submitting}
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
