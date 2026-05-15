import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Lock, Globe, ChevronRight, X, Check, Copy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

const G = '#0f7a4b'

export default function Circles() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()

  const [myCircles,     setMyCircles]     = useState([])
  const [publicCircles, setPublicCircles] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showCreate,    setShowCreate]    = useState(false)
  const [tab,           setTab]           = useState('mine') // mine | discover

  useEffect(() => {
    if (user) loadAll()
  }, [user])

  async function loadAll() {
    setLoading(true)
    try {
      // My circles
      const { data: mine } = await supabase
        .from('circle_members')
        .select(`
          circle_id, role, joined_at,
          circle:circles(*, circle_members(count))
        `)
        .eq('user_id', user.id)
      setMyCircles(mine ?? [])

      // Public circles I haven't joined
      const myIds = (mine ?? []).map(m => m.circle_id)
      const { data: pub } = await supabase
        .from('circles')
        .select('*, circle_members(count)')
        .eq('is_private', false)
        .not('id', 'in', myIds.length > 0 ? `(${myIds.join(',')})` : '(null)')
        .order('created_at', { ascending: false })
      setPublicCircles(pub ?? [])
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function joinCircle(circleId) {
    try {
      const { error } = await supabase.from('circle_members')
        .insert({ circle_id: circleId, user_id: user.id, role: 'member' })
      if (error) throw error
      toast('Joined circle! 🎉', 'success')
      loadAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function leaveCircle(circleId) {
    if (!window.confirm('Leave this circle?')) return
    try {
      const { error } = await supabase.from('circle_members')
        .delete().eq('circle_id', circleId).eq('user_id', user.id)
      if (error) throw error
      toast('Left circle', 'success')
      loadAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-[26px] text-gray-900 tracking-tight">Circles</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Your trusted buying groups</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: G }}>
            <Plus size={20}/>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mt-3">
          {[['mine','My Circles'],['discover','Discover']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 py-2 rounded-xl text-[13px] font-bold transition-all"
              style={{
                background: tab === key ? '#fff' : 'transparent',
                color: tab === key ? '#111827' : '#6b7280',
                boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {loading ? <Spinner/> : (

          <>
            {/* MY CIRCLES */}
            {tab === 'mine' && (
              <div className="px-4 pt-4 pb-6">
                {myCircles.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{background:'#f3f4f6'}}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <p className="font-display font-bold text-[18px] text-gray-900 mb-2">No circles yet</p>
                    <p className="text-[13px] text-gray-400 mb-5">
                      Create a circle for your church group, family, or community — then split together every month.
                    </p>
                    <button onClick={() => setShowCreate(true)}
                      className="flex items-center gap-2 mx-auto text-white px-5 py-2.5 rounded-2xl font-bold text-[13px]"
                      style={{ background: G }}>
                      <Plus size={15}/> Create a Circle
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myCircles.map(m => (
                      <CircleCard
                        key={m.circle_id}
                        circle={m.circle}
                        role={m.role}
                        onLeave={() => leaveCircle(m.circle_id)}
                        navigate={navigate}
                        toast={toast}
                        userId={user.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DISCOVER */}
            {tab === 'discover' && (
              <div className="px-4 pt-4 pb-6">
                {publicCircles.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{background:'#f3f4f6'}}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                    <p className="font-display font-bold text-[18px] text-gray-900 mb-2">No public circles yet</p>
                    <p className="text-[13px] text-gray-400">Be the first to create a public circle in your area.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {publicCircles.map(circle => (
                      <div key={circle.id}
                        className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: '#ecfff5' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f7a4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[15px] text-gray-900">{circle.name}</h3>
                            {circle.description && (
                              <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-2">{circle.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Globe size={11} color="#9ca3af"/>
                              <span className="text-[11px] text-gray-400">Public · {circle.city}</span>
                            </div>
                          </div>
                          <button onClick={() => joinCircle(circle.id)}
                            className="text-white text-[12px] font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                            style={{ background: G }}>
                            Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Circle Sheet */}
      {showCreate && (
        <CreateCircleSheet
          userId={user.id}
          city={profile?.city}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadAll(); setTab('mine') }}
          toast={toast}
        />
      )}
    </div>
  )
}

function CircleCard({ circle, role, onLeave, navigate, toast, userId }) {
  const [showInvite, setShowInvite] = useState(false)
  const memberCount = circle?.circle_members?.[0]?.count ?? 0

  function copyInviteCode() {
    const link = `${window.location.origin}/join-circle/${circle.invite_code}`
    navigator.clipboard.writeText(link)
    toast('Invite link copied! 📋', 'success')
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: circle?.is_private ? '#fef3c7' : '#ecfff5' }}>
            {circle?.is_private ? '🔒' : '👥'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[15px] text-gray-900">{circle?.name}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={role === 'admin'
                  ? { background: '#fef3c7', color: '#a16207' }
                  : { background: '#ecfff5', color: G }}>
                {role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            {circle?.description && (
              <p className="text-[12px] text-gray-400 mt-0.5">{circle.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Users size={11} color="#9ca3af"/>
                <span className="text-[11px] text-gray-400">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
              </div>
              {circle?.is_private
                ? <div className="flex items-center gap-1"><Lock size={11} color="#9ca3af"/><span className="text-[11px] text-gray-400">Private</span></div>
                : <div className="flex items-center gap-1"><Globe size={11} color="#9ca3af"/><span className="text-[11px] text-gray-400">Public</span></div>
              }
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={copyInviteCode}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold"
            style={{ background: '#f0fdf4', color: G, border: '1px solid #b6f0d4' }}>
            <Copy size={13}/> Copy Invite Link
          </button>
          <button
            onClick={onLeave}
            className="px-3 py-2.5 rounded-xl text-[12px] font-bold bg-red-50 text-red-500">
            Leave
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateCircleSheet({ userId, city, onClose, onCreated, toast }) {
  const [name,       setName]       = useState('')
  const [desc,       setDesc]       = useState('')
  const [isPrivate,  setIsPrivate]  = useState(false)
  const [saving,     setSaving]     = useState(false)

  async function create() {
    if (!name.trim()) { toast('Enter a circle name', 'error'); return }
    setSaving(true)
    try {
      // Generate invite code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data, error } = await supabase.from('circles').insert({
        name: name.trim(),
        description: desc.trim() || null,
        creator_id: userId,
        city: city ?? 'Sunderland',
        is_private: isPrivate,
        invite_code: code,
      }).select().single()
      if (error) throw error

      // Add creator as admin member
      await supabase.from('circle_members').insert({
        circle_id: data.id,
        user_id: userId,
        role: 'admin'
      })

      toast(`${name} created! 🎉`, 'success')
      onCreated()
    } catch (err) {
      toast(err.message, 'error')
    } finally { setSaving(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}/>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 max-w-md mx-auto"
        style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[20px] text-gray-900">Create a Circle</h3>
          <button onClick={onClose}><X size={20} color="#9ca3af"/></button>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Circle name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Church Food Circle, Family Group"
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b] transition-colors"/>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Description (optional)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="What is this circle for?"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] outline-none focus:border-[#0f7a4b] transition-colors"/>
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <div>
              <div className="text-[14px] font-semibold text-gray-900">Private circle</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Only people with invite link can join</div>
            </div>
            <button onClick={() => setIsPrivate(p => !p)}
              className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
              style={{ background: isPrivate ? G : '#d1d5db' }}>
              <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: isPrivate ? 'translateX(20px)' : 'translateX(2px)' }}/>
            </button>
          </div>
        </div>

        <button onClick={create} disabled={!name.trim() || saving}
          className="w-full text-white rounded-2xl py-4 text-[15px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: G }}>
          {saving ? 'Creating...' : '✓ Create Circle'}
        </button>
      </div>
    </>
  )
}
