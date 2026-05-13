import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../lib/api'

const TYPE_ICON = {
  split_joined:  '👋',
  split_full:    '🎉',
  split_confirm: '📅',
  new_split:     '🛒',
  default:       '🔔',
}

export default function NotificationBell() {
  const { user }    = useAuth()
  const [open,      setOpen]     = useState(false)
  const [notifs,    setNotifs]   = useState([])
  const [unread,    setUnread]   = useState(0)

  useEffect(() => {
    if (!user) return
    loadNotifs()

    // Realtime subscription
    const ch = supabase.channel(`notifs-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        setNotifs(prev => [payload.new, ...prev])
        setUnread(n => n + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [user])

  async function loadNotifs() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs(data ?? [])
    setUnread((data ?? []).filter(n => !n.read).length)
  }

  async function markAllRead() {
    await supabase.from('notifications')
      .update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(n => Math.max(0, n - 1))
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(o => !o); if (!open && unread > 0) markAllRead() }}
        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
        <Bell size={18} color="#6b7280"/>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#ef4444' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100"
            style={{ maxHeight: '70vh' }}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-[16px] text-gray-900">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-[11px] font-semibold" style={{ color: '#0f7a4b' }}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 50px)' }}>
              {notifs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-[13px] text-gray-400">No notifications yet</p>
                  <p className="text-[11px] text-gray-300 mt-1">
                    You'll be notified when someone joins your split or a new split is created nearby
                  </p>
                </div>
              ) : notifs.map(n => (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition-colors"
                  style={{ background: n.read ? 'white' : '#f0fdf4' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: n.read ? '#f3f4f6' : '#ecfff5' }}>
                    {TYPE_ICON[n.type] ?? TYPE_ICON.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-gray-900 leading-tight">{n.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.body}</div>
                    <div className="text-[10px] text-gray-300 mt-1">
                      {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#0f7a4b' }}/>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
