import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'
import { Store, Edit3, Check, X, Plus, Trash2, ArrowLeft, LogOut } from 'lucide-react'

export default function StoreOwner() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [step,    setStep]    = useState('login') // login | dashboard
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [loading, setLoading] = useState(false)
  const [store,   setStore]   = useState(null)
  const [items,   setItems]   = useState([])

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Check if this email is linked to a store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*, store_items(*)')
        .eq('owner_email', email.trim().toLowerCase())
        .single()

      if (storeError || !storeData) {
        await supabase.auth.signOut()
        throw new Error('No store found for this account. Contact hello@choma.app to get set up.')
      }

      setStore(storeData)
      setItems(storeData.store_items ?? [])
      setStep('dashboard')
      toast(`Welcome, ${storeData.name}!`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally { setLoading(false) }
  }

  async function logout() {
    await supabase.auth.signOut()
    setStep('login')
    setStore(null)
    setItems([])
  }

  if (step === 'login') return <StoreLoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={login} loading={loading}/>
  return <StoreDashboard store={store} items={items} setItems={setItems} onLogout={logout} toast={toast} navigate={navigate}/>
}

function StoreLoginScreen({ email, setEmail, password, setPassword, onLogin, loading }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(145deg,#062f23,#0a4a35)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(200,242,109,0.15)', border: '1px solid rgba(200,242,109,0.3)' }}>
            <Store size={32} color="#c8f26d"/>
          </div>
          <h1 className="font-display font-black text-[22px] text-white tracking-tight">Store Portal</h1>
          <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Choma Share · Partner Stores
          </p>
        </div>
        <form onSubmit={onLogin} className="px-6 py-5 space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Store email" autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"/>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"/>
          <button type="submit" disabled={!email||!password||loading}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40"
            style={{ background: '#0f7a4b' }}>
            {loading ? <Spinner size={18} color="white"/> : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-[12px] text-gray-400 pb-2 px-6">Not set up yet? Email <span style={{ color: '#0f7a4b' }}>hello@choma.app</span></p>
        <p className="text-center text-[11px] text-gray-300 pb-5">© 2026 Creovate Global Ltd</p>
      </div>
    </div>
  )
}

function StoreDashboard({ store, items, setItems, onLogout, toast, navigate }) {
  const [expanded, setExpanded] = useState(true)

  async function reload() {
    const { data } = await supabase
      .from('store_items').select('*').eq('store_id', store.id).order('name')
    setItems(data ?? [])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex-shrink-0"
        style={{ background: 'linear-gradient(145deg,#062f23,#0a4a35)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#c8f26d' }}>Store Portal</p>
            <h1 className="font-display font-black text-[22px] text-white tracking-tight">{store.name}</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{store.address}</p>
          </div>
          <button onClick={onLogout}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)' }}>
            <LogOut size={17} color="white"/>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { v: items.filter(i => i.available).length, l: 'Active Items' },
            { v: items.filter(i => i.bulk_price > 0).length, l: 'Prices Set' },
          ].map(s => (
            <div key={s.l} className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="font-display font-bold text-[24px] text-white">{s.v}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        {/* Items */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[18px] text-gray-900">Your Items</h2>
          <AddItemBtn storeId={store.id} onAdded={reload} toast={toast}/>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {items.length === 0 && (
            <div className="p-6 text-center text-[13px] text-gray-400">
              No items yet — add your first item above
            </div>
          )}
          {items.map((item, i) => (
            <ItemRow key={item.id} item={item}
              isLast={i === items.length - 1}
              onRefresh={reload} toast={toast}/>
          ))}
        </div>

        {/* Splits info */}
        <div className="mt-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="font-bold text-[14px] text-gray-900 mb-1">💡 How it works</h3>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Customers see your items on Choma Share and organise splits together. They come to your store, choose their own portions, and pay you directly. Update prices here whenever they change.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <p className="text-[12px] text-emerald-700">
            Need help? Contact us at <strong>hello@choma.app</strong> or WhatsApp us directly.
          </p>
        </div>
      </div>
    </div>
  )
}

function ItemRow({ item, isLast, onRefresh, toast }) {
  const [editing, setEditing] = useState(false)
  const [name,    setName]    = useState(item.name)
  const [price,   setPrice]   = useState(item.bulk_price)
  const [saving,  setSaving]  = useState(false)
  const G = '#0f7a4b'

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.from('store_items')
        .update({ name: name.trim(), bulk_price: parseFloat(price) || 0 })
        .eq('id', item.id)
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

  if (editing) return (
    <div className={`p-3 bg-gray-50 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0f7a4b]"
          placeholder="Item name"/>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-bold text-gray-500">£</span>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0f7a4b]"
            placeholder="Current price" step="0.50" min="0"/>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="flex-1 py-2 rounded-xl text-[13px] font-bold text-white"
            style={{ background: G }}>
            {saving ? '...' : '✓ Save'}
          </button>
          <button onClick={() => { setEditing(false); setName(item.name); setPrice(item.bulk_price) }}
            className="flex-1 py-2 rounded-xl text-[13px] font-bold text-gray-600 bg-white border border-gray-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-900 truncate">{item.name}</span>
          {!item.available && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 flex-shrink-0">Hidden</span>
          )}
        </div>
        <span className="font-display font-bold text-[15px]"
          style={{ color: item.bulk_price > 0 ? G : '#f59e0b' }}>
          {item.bulk_price > 0 ? `£${item.bulk_price}` : 'Price not set'}
        </span>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => setEditing(true)}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50">
          <Edit3 size={14} color="#1e40af"/>
        </button>
        <button onClick={toggleAvail}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: item.available ? '#fef2f2' : '#ecfff5' }}>
          {item.available ? <X size={14} color="#ef4444"/> : <Check size={14} color={G}/>}
        </button>
      </div>
    </div>
  )
}

function AddItemBtn({ storeId, onAdded, toast }) {
  const [open,   setOpen]   = useState(false)
  const [name,   setName]   = useState('')
  const [price,  setPrice]  = useState('')
  const [saving, setSaving] = useState(false)
  const G = '#0f7a4b'

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
        <h3 className="font-display font-bold text-[18px] text-gray-900 mb-4">Add New Item</h3>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"
            placeholder="e.g. Yam Box" autoFocus/>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-gray-500">£</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b]"
              placeholder="Current bulk price" step="0.50" min="0"/>
          </div>
          <button onClick={add} disabled={saving}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white"
            style={{ background: G }}>
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  )
}
