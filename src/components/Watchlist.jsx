import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'

const COMMON_ITEMS = [
  'Yam Box', 'Carton of Turkey', 'Carton of Chicken', 'Carton of Fish',
  'Box of Tomatoes', 'Box of Scotch Bonnet Pepper', 'Box of Red Long Pepper',
  'Box of Ripe Bananas', 'Box of Unripe Bananas', 'Carton of Indomie',
]

const G = '#0f7a4b'

export default function Watchlist({ userId }) {
  const toast = useToast()
  const [watched,  setWatched]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(null)

  useEffect(() => {
    if (!userId) return
    supabase.from('watchlist').select('item_name').eq('user_id', userId)
      .then(({ data }) => setWatched((data ?? []).map(w => w.item_name)))
      .finally(() => setLoading(false))
  }, [userId])

  async function toggle(itemName) {
    setSaving(itemName)
    const isWatched = watched.includes(itemName)
    try {
      if (isWatched) {
        await supabase.from('watchlist')
          .delete().eq('user_id', userId).eq('item_name', itemName)
        setWatched(w => w.filter(i => i !== itemName))
        toast(`Removed from watchlist`, 'success')
      } else {
        await supabase.from('watchlist')
          .insert({ user_id: userId, item_name: itemName })
        setWatched(w => [...w, itemName])
        toast(`Watching ${itemName} ✓`, 'success')
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally { setSaving(null) }
  }

  if (loading) return null

  return (
    <div className="mx-4 mt-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
        My Watchlist
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Get notified when a split is created for items you watch.
      </p>
      <div className="flex flex-wrap gap-2">
        {COMMON_ITEMS.map(item => {
          const active = watched.includes(item)
          const busy   = saving === item
          return (
            <button key={item} onClick={() => toggle(item)} disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all"
              style={{
                background:   active ? '#f0fdf4' : '#f9fafb',
                borderColor:  active ? G : '#e5e7eb',
                color:        active ? G : '#6b7280',
                borderWidth:  active ? 1.5 : 1,
                opacity:      busy ? 0.5 : 1,
              }}>
              {active ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill={G}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              )}
              {item}
            </button>
          )
        })}
      </div>
      {watched.length > 0 && (
        <p className="text-[11px] mt-2" style={{ color: G }}>
          Watching {watched.length} item{watched.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
