import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'
import {
  X, Plus, Trash2, Edit3, ChevronDown, ChevronUp,
  Check, Users, ShoppingBag, LayoutGrid, BarChart3,
  AlertTriangle, MapPin, Store
} from 'lucide-react'

const ADMIN_EMAILS = ['engineeringstenis@gmail.com']
const G = '#0f7a4b'

const TABS = [
  { key: 'stats',  label: 'Stats',   icon: BarChart3   },
  { key: 'stores', label: 'Stores',  icon: Store       },
  { key: 'splits', label: 'Splits',  icon: LayoutGrid  },
  { key: 'users',  label: 'Users',   icon: Users       },
]

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()
  const [tab, setTab] = useState('stats')

  useEffect(() => {
    if (!user) { navigate('/admin'); return }
    if (!ADMIN_EMAILS.includes(user.email)) {
      toast('Access denied', 'error')
      navigate('/')
    }
  }, [user])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex-shrink-0"
        style={{ background: 'linear-gradient(145deg,#062f23,#0a4a35)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#c8f26d' }}>
              Admin Panel
            </p>
            <h1 className="font-display font-black text-[24px] text-white tracking-tight">
              Choma Share
            </h1>
          </div>
          <button onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)' }}>
            <X size={18} color="white"/>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all"
                style={{
                  background: tab === t.key ? 'rgba(200,242,109,0.15)' : 'transparent',
                  color: tab === t.key ? '#c8f26d' : 'rgba(255,255,255,0.5)',
                  border: tab === t.key ? '1px solid rgba(200,242,109,0.3)' : '1px solid transparent'
                }}>
                <Icon size={16}/>
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pt-4 pb-8">
        {tab === 'stats'  && <StatsTab toast={toast}/>}
        {tab === 'stores' && <StoresTab toast={toast}/>}
        {tab === 'splits' && <SplitsTab toast={toast}/>}
        {tab === 'users'  && <UsersTab  toast={toast}/>}
      </div>
    </div>
  )
}

// ── STATS TAB ──────────────────────────────
function StatsTab({ toast }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [users, splits, members, circles, stores] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('splits').select('id,status', { count: 'exact' }),
        supabase.from('split_members').select('id', { count: 'exact' }),
        supabase.from('circles').select('id', { count: 'exact' }),
        supabase.from('stores').select('id', { count: 'exact' }),
      ])
      const openSplits = splits.data?.filter(s => s.status === 'open').length ?? 0
      const fullSplits = splits.data?.filter(s => s.status === 'full').length ?? 0
      const doneSplits = splits.data?.filter(s => s.status === 'done').length ?? 0
      setStats({
        users:   users.count ?? 0,
        splits:  splits.count ?? 0,
        members: members.count ?? 0,
        circles: circles.count ?? 0,
        stores:  stores.count ?? 0,
        openSplits, fullSplits, doneSplits,
      })
    }
    load()
  }, [])

  if (!stats) return <Spinner/>

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-[18px] text-gray-900">Overview</h2>

      <div className="grid grid-cols-2 gap-3">
        {[
          { v: stats.users,   l: 'Total Users',    c: G },
          { v: stats.splits,  l: 'Total Splits',   c: '#1e40af' },
          { v: stats.members, l: 'Total Joins',     c: '#a16207' },
          { v: stats.circles, l: 'Circles',         c: '#7c3aed' },
          { v: stats.stores,  l: 'Partner Stores',  c: G },
          { v: stats.doneSplits, l: 'Completed',    c: '#059669' },
        ].map(s => (
          <div key={s.l} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="font-display font-bold text-[28px] leading-none" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[11px] text-gray-400 font-semibold mt-1 uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-[14px] text-gray-900 mb-3">Split Status Breakdown</h3>
        {[
          { l: 'Open',      v: stats.openSplits, c: G },
          { l: 'Full',      v: stats.fullSplits, c: '#a16207' },
          { l: 'Completed', v: stats.doneSplits, c: '#059669' },
        ].map(s => (
          <div key={s.l} className="flex items-center gap-3 mb-2">
            <div className="text-[12px] font-semibold text-gray-600 w-20">{s.l}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full transition-all"
                style={{ width: stats.splits ? `${(s.v / stats.splits) * 100}%` : '0%', background: s.c }}/>
            </div>
            <div className="text-[12px] font-bold text-gray-700 w-6 text-right">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── STORES TAB ─────────────────────────────
function StoresTab({ toast }) {
  const [stores,   setStores]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { loadStores() }, [])

  async function loadStores() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores').select('*, store_items(*)').order('name')
      if (error) throw error
      setStores(data ?? [])
    } catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[18px] text-gray-900">Stores & Items</h2>
        <AddStoreButton onAdded={loadStores} toast={toast}/>
      </div>
      {loading ? <Spinner/> : stores.map(store => (
        <StoreCard key={store.id} store={store}
          expanded={expanded === store.id}
          onToggle={() => setExpanded(expanded === store.id ? null : store.id)}
          onRefresh={loadStores} toast={toast}/>
      ))}
    </div>
  )
}

// ── SPLITS TAB ─────────────────────────────
function SplitsTab({ toast }) {
  const [splits,  setSplits]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => { loadSplits() }, [])

  async function loadSplits() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('splits')
        .select(`*, store:stores(name), creator:users!splits_creator_id_fkey(name, email),
          split_members(id)`)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setSplits(data ?? [])
    } catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('splits').update({ status }).eq('id', id)
    if (error) toast(error.message, 'error')
    else { toast(`Split marked as ${status}`, 'success'); loadSplits() }
  }

  async function deleteSplit(id) {
    if (!window.confirm('Delete this split? This cannot be undone.')) return
    const { error } = await supabase.from('splits').delete().eq('id', id)
    if (error) toast(error.message, 'error')
    else { toast('Split deleted', 'success'); loadSplits() }
  }

  const filtered = filter === 'all' ? splits : splits.filter(s => s.status === filter)

  const STATUS_COLORS = {
    open:      { bg: '#ecfff5', color: G },
    full:      { bg: '#fffbeb', color: '#a16207' },
    done:      { bg: '#f3f4f6', color: '#6b7280' },
    cancelled: { bg: '#fef2f2', color: '#ef4444' },
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display font-bold text-[18px] text-gray-900">All Splits</h2>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all','open','full','done','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all capitalize"
            style={filter === f
              ? { background: '#062f23', color: '#fff', borderColor: '#062f23' }
              : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <Spinner/> : filtered.map(split => (
        <div key={split.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px] text-gray-900 truncate">{split.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {split.store?.name} · By {split.creator?.name}
              </div>
              <div className="text-[11px] text-gray-400">
                {split.split_members?.length ?? 0}/{split.people_needed} joined
                {split.preferred_date && ` · ${split.preferred_date}`}
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0 capitalize"
              style={STATUS_COLORS[split.status] ?? STATUS_COLORS.open}>
              {split.status}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {split.status !== 'done' && (
              <button onClick={() => updateStatus(split.id, 'done')}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1"
                style={{ background: '#ecfff5', color: G }}>
                <Check size={12}/> Mark Done
              </button>
            )}
            {split.status === 'open' && (
              <button onClick={() => updateStatus(split.id, 'cancelled')}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1"
                style={{ background: '#fff7ed', color: '#c2410c' }}>
                <AlertTriangle size={12}/> Cancel
              </button>
            )}
            <button onClick={() => deleteSplit(split.id)}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 bg-red-50 text-red-500">
              <Trash2 size={12}/> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── USERS TAB ──────────────────────────────
function UsersTab({ toast }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setUsers(data ?? [])
    } catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }

  async function updateScore(userId, score) {
    const { error } = await supabase.from('users')
      .update({ reliability_score: score }).eq('id', userId)
    if (error) toast(error.message, 'error')
    else { toast('Score updated', 'success'); loadUsers() }
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <h2 className="font-display font-bold text-[18px] text-gray-900">
        Users ({users.length})
      </h2>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or city..."
        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"/>

      {loading ? <Spinner/> : filtered.map(u => (
        <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#0f7a4b,#15a66a)' }}>
              {u.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px] text-gray-900">{u.name}</div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                <MapPin size={10}/> {u.city}
                <span>· {u.total_splits ?? 0} splits</span>
                <span>· Score: {u.reliability_score ?? 5}</span>
              </div>
              <div className="text-[10px] text-gray-300 mt-0.5 truncate">
                {new Date(u.created_at).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Score editor */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-gray-500 font-semibold">Reliability:</span>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => updateScore(u.id, n)}
                className="w-7 h-7 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: (u.reliability_score ?? 5) >= n ? G : '#f3f4f6',
                  color: (u.reliability_score ?? 5) >= n ? '#fff' : '#9ca3af'
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── STORE CARD ─────────────────────────────
function StoreCard({ store, expanded, onToggle, onRefresh, toast }) {
  const [editing,   setEditing]   = useState(false)
  const [storeName, setStoreName] = useState(store.name)
  const [storeAddr, setStoreAddr] = useState(store.address ?? '')
  const [saving,    setSaving]    = useState(false)

  async function saveStore() {
    setSaving(true)
    try {
      const { error } = await supabase.from('stores')
        .update({ name: storeName, address: storeAddr }).eq('id', store.id)
      if (error) throw error
      toast('Store updated ✓', 'success')
      setEditing(false)
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
      <div className="p-4">
        {editing ? (
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
                {saving ? '...' : <><Check size={14}/> Save</>}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: store.active ? '#ecfff5' : '#f3f4f6' }}>🏪</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] text-gray-900">{store.name}</h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={store.active
                    ? { background: '#ecfff5', color: G }
                    : { background: '#f3f4f6', color: '#9ca3af' }}>
                  {store.active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-[12px] text-gray-400">{store.address}</p>
              <p className="text-[11px] text-gray-300 mt-0.5">{store.store_items?.length ?? 0} items</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50">
                <Edit3 size={14} color="#1e40af"/>
              </button>
              <button onClick={toggleActive}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: store.active ? '#fef2f2' : '#ecfff5' }}>
                {store.active ? <X size={14} color="#ef4444"/> : <Check size={14} color={G}/>}
              </button>
              <button onClick={onToggle}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100">
                {expanded ? <ChevronUp size={14} color="#6b7280"/> : <ChevronDown size={14} color="#6b7280"/>}
              </button>
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="flex items-center justify-between py-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Items</span>
            <AddItemButton storeId={store.id} onAdded={onRefresh} toast={toast}/>
          </div>
          <div className="flex flex-col gap-2">
            {store.store_items?.length === 0 && (
              <p className="text-[13px] text-gray-400 text-center py-3">No items yet</p>
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
        .update({ name, bulk_price: parseFloat(price) || 0 }).eq('id', item.id)
      if (error) throw error
      toast('Updated ✓', 'success')
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
    else { toast('Deleted', 'success'); onRefresh() }
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
          placeholder="Price" step="0.50" min="0"/>
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white"
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
        <span className="font-display font-bold text-[15px]" style={{ color: item.bulk_price > 0 ? G : '#f59e0b' }}>
          {item.bulk_price > 0 ? `£${item.bulk_price}` : 'Price not set'}
        </span>
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
  const [open,   setOpen]   = useState(false)
  const [name,   setName]   = useState('')
  const [price,  setPrice]  = useState('')
  const [saving, setSaving] = useState(false)

  async function add() {
    if (!name.trim()) { toast('Enter item name', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('store_items').insert({
        store_id: storeId, name: name.trim(),
        bulk_price: parseFloat(price) || 0,
        available: true, category: 'general'
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
        placeholder="e.g. Yam Box" autoFocus/>
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-bold text-gray-500">£</span>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0f7a4b]"
          placeholder="Price (0 if unknown)" step="0.50" min="0"/>
      </div>
      <div className="flex gap-2">
        <button onClick={add} disabled={saving}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white"
          style={{ background: G }}>
          {saving ? '...' : 'Add'}
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
      const { error } = await supabase.from('stores')
        .insert({ name: name.trim(), address, city, active: true })
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
