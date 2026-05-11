import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'
import { Plus, Trash2, Edit3, ChevronDown, ChevronUp, Store, ShoppingBag, X, Check } from 'lucide-react'

// Admin emails — add yours here
const ADMIN_EMAILS = ['engineeringstenis@gmail.com']

const G = '#0f7a4b'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()

  const [stores,   setStores]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  // Check admin access
  useEffect(() => {
    if (!user) { navigate('/onboarding'); return }
    if (!ADMIN_EMAILS.includes(user.email)) {
      toast('Access denied', 'error')
      navigate('/')
      return
    }
    loadStores()
  }, [user])

  async function loadStores() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*, store_items(*)')
        .order('name')
      if (error) throw error
      setStores(data ?? [])
    } catch (err) {
      toast(err.message, 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#07130e] px-5 pt-10 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#c8f26d' }}>Admin Panel</p>
            <h1 className="font-display font-black text-[26px] text-white tracking-tight">Choma Share</h1>
          </div>
          <button onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)' }}>
            <X size={18} color="white"/>
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-8">

        {/* Stats */}
        <StatsBar/>

        {/* Stores section */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <h2 className="font-display font-bold text-[18px] text-gray-900 tracking-tight">Stores & Items</h2>
          <AddStoreButton onAdded={loadStores} toast={toast}/>
        </div>

        {loading ? <Spinner/> : (
          <div className="flex flex-col gap-3">
            {stores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                expanded={expanded === store.id}
                onToggle={() => setExpanded(expanded === store.id ? null : store.id)}
                onRefresh={loadStores}
                toast={toast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatsBar() {
  const [stats, setStats] = useState({ splits: 0, users: 0, members: 0 })

  useEffect(() => {
    async function load() {
      const [s, u, m] = await Promise.all([
        supabase.from('splits').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('split_members').select('id', { count: 'exact' }),
      ])
      setStats({ splits: s.count ?? 0, users: u.count ?? 0, members: m.count ?? 0 })
    }
    load()
  }, [])

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { v: stats.users,   l: 'Users'   },
        { v: stats.splits,  l: 'Splits'  },
        { v: stats.members, l: 'Joins'   },
      ].map(s => (
        <div key={s.l} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
          <div className="font-display font-bold text-[22px]" style={{ color: G }}>{s.v}</div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{s.l}</div>
        </div>
      ))}
    </div>
  )
}

function StoreCard({ store, expanded, onToggle, onRefresh, toast }) {
  const [editingStore, setEditingStore] = useState(false)
  const [storeName,    setStoreName]    = useState(store.name)
  const [storeAddr,    setStoreAddr]    = useState(store.address ?? '')
  const [saving,       setSaving]       = useState(false)

  async function saveStore() {
    setSaving(true)
    try {
      const { error } = await supabase.from('stores')
        .update({ name: storeName, address: storeAddr })
        .eq('id', store.id)
      if (error) throw error
      toast('Store updated', 'success')
      setEditingStore(false)
      onRefresh()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  async function toggleActive() {
    const { error } = await supabase.from('stores')
      .update({ active: !store.active }).eq('id', store.id)
    if (error) toast(error.message, 'error')
    else { toast(store.active ? 'Store hidden' : 'Store visible', 'success'); onRefresh() }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      {/* Store header */}
      <div className="p-4">
        {editingStore ? (
          <div className="space-y-2">
            <input value={storeName} onChange={e => setStoreName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] font-semibold outline-none focus:border-[#0f7a4b]"
              placeholder="Store name"/>
            <input value={storeAddr} onChange={e => setStoreAddr(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#0f7a4b]"
              placeholder="Address"/>
            <div className="flex gap-2">
              <button onClick={saveStore} disabled={saving}
                className="flex-1 py-2 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-1"
                style={{ background: G }}>
                {saving ? <Spinner size={14} color="white"/> : <><Check size={14}/> Save</>}
              </button>
              <button onClick={() => setEditingStore(false)}
                className="flex-1 py-2 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: store.active ? '#ecfff5' : '#f3f4f6' }}>
              🏪
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] text-gray-900">{store.name}</h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: store.active ? '#ecfff5' : '#f3f4f6', color: store.active ? G : '#9ca3af' }}>
                  {store.active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-[12px] text-gray-400">{store.address}</p>
              <p className="text-[11px] text-gray-300 mt-0.5">{store.store_items?.length ?? 0} items</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditingStore(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#eff6ff' }}>
                <Edit3 size={14} color="#1e40af"/>
              </button>
              <button onClick={toggleActive}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: store.active ? '#fef2f2' : '#ecfff5' }}>
                {store.active
                  ? <X size={14} color="#ef4444"/>
                  : <Check size={14} color={G}/>}
              </button>
              <button onClick={onToggle}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100">
                {expanded ? <ChevronUp size={14} color="#6b7280"/> : <ChevronDown size={14} color="#6b7280"/>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Items section */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="flex items-center justify-between py-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Items</span>
            <AddItemButton storeId={store.id} onAdded={onRefresh} toast={toast}/>
          </div>
          <div className="flex flex-col gap-2">
            {store.store_items?.length === 0 && (
              <p className="text-[13px] text-gray-400 text-center py-3">No items yet — add one above</p>
            )}
            {store.store_items?.map(item => (
              <ItemRow key={item.id} item={item} onRefresh={onRefresh} toast={toast}/>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, onRefresh, toast }) {
  const [editing, setEditing] = useState(false)
  const [name,    setName]    = useState(item.name)
  const [price,   setPrice]   = useState(item.bulk_price)
  const [saving,  setSaving]  = useState(false)

  async function save() {
    setSaving(true)
    try {
      const { error } = await supabase.from('store_items')
        .update({ name, bulk_price: parseFloat(price) })
        .eq('id', item.id)
      if (error) throw error
      toast('Item updated ✓', 'success')
      setEditing(false)
      onRefresh()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  async function toggleAvail() {
    const { error } = await supabase.from('store_items')
      .update({ available: !item.available }).eq('id', item.id)
    if (error) toast(error.message, 'error')
    else onRefresh()
  }

  async function deleteItem() {
    if (!window.confirm(`Delete ${item.name}?`)) return
    const { error } = await supabase.from('store_items').delete().eq('id', item.id)
    if (error) toast(error.message, 'error')
    else { toast('Item deleted', 'success'); onRefresh() }
  }

  if (editing) return (
    <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
      <input value={name} onChange={e => setName(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] font-semibold outline-none focus:border-[#0f7a4b]"
        placeholder="Item name"/>
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-bold text-gray-500">£</span>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0f7a4b]"
          placeholder="Price" step="0.50"/>
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center"
          style={{ background: G }}>
          {saving ? '...' : 'Save'}
        </button>
        <button onClick={() => setEditing(false)}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-gray-600 bg-white border border-gray-200">
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-3 py-2 px-1 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-900">{item.name}</span>
          {!item.available && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">Hidden</span>
          )}
        </div>
        <span className="font-display font-bold text-[15px]" style={{ color: G }}>£{item.bulk_price}</span>
      </div>
      <div className="flex gap-1">
        <button onClick={() => setEditing(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50">
          <Edit3 size={12} color="#1e40af"/>
        </button>
        <button onClick={toggleAvail}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: item.available ? '#fef2f2' : '#ecfff5' }}>
          {item.available ? <X size={12} color="#ef4444"/> : <Check size={12} color={G}/>}
        </button>
        <button onClick={deleteItem}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50">
          <Trash2 size={12} color="#ef4444"/>
        </button>
      </div>
    </div>
  )
}

function AddItemButton({ storeId, onAdded, toast }) {
  const [open,  setOpen]  = useState(false)
  const [name,  setName]  = useState('')
  const [price, setPrice] = useState('')
  const [saving,setSaving] = useState(false)

  async function add() {
    if (!name.trim() || !price) { toast('Enter name and price', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('store_items').insert({
        store_id: storeId, name: name.trim(),
        bulk_price: parseFloat(price), available: true, category: 'general'
      })
      if (error) throw error
      toast(`${name} added ✓`, 'success')
      setName(''); setPrice(''); setOpen(false)
      onAdded()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-bold text-white"
      style={{ background: G }}>
      <Plus size={13}/> Add Item
    </button>
  )

  return (
    <div className="w-full mt-2 bg-gray-50 rounded-2xl p-3 space-y-2">
      <input value={name} onChange={e => setName(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0f7a4b]"
        placeholder="Item name e.g. Yam Box" autoFocus/>
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-bold text-gray-500">£</span>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0f7a4b]"
          placeholder="Bulk price" step="0.50"/>
      </div>
      <div className="flex gap-2">
        <button onClick={add} disabled={saving}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white"
          style={{ background: G }}>
          {saving ? '...' : 'Add Item'}
        </button>
        <button onClick={() => setOpen(false)}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-gray-600 bg-white border border-gray-200">
          Cancel
        </button>
      </div>
    </div>
  )
}

function AddStoreButton({ onAdded, toast }) {
  const [open,    setOpen]    = useState(false)
  const [name,    setName]    = useState('')
  const [address, setAddress] = useState('')
  const [city,    setCity]    = useState('Sunderland')
  const [saving,  setSaving]  = useState(false)

  async function add() {
    if (!name.trim()) { toast('Enter store name', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('stores').insert({
        name: name.trim(), address, city, active: true
      })
      if (error) throw error
      toast(`${name} added ✓`, 'success')
      setName(''); setAddress(''); setOpen(false)
      onAdded()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-bold border"
      style={{ color: G, borderColor: G, background: '#f0fdf4' }}>
      <Plus size={13}/> Add Store
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
        <h3 className="font-display font-bold text-[18px] text-gray-900 mb-4">Add New Store</h3>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"
            placeholder="Store name" autoFocus/>
          <input value={address} onChange={e => setAddress(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"
            placeholder="Full address"/>
          <input value={city} onChange={e => setCity(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"
            placeholder="City"/>
          <button onClick={add} disabled={saving}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white"
            style={{ background: G }}>
            {saving ? 'Adding...' : 'Add Store'}
          </button>
        </div>
      </div>
    </div>
  )
}
