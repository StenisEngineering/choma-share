import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'
import Spinner from './Spinner'

const G = '#0f7a4b'

export default function CompletionPrompt({ split, userId, onDone }) {
  const toast   = useToast()
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)

  // Only show if split date has passed and status is full/open
  if (!split || !userId) return null
  const splitDate = split.preferred_date ? new Date(split.preferred_date) : null
  const today     = new Date()
  today.setHours(0, 0, 0, 0)
  if (!splitDate || splitDate >= today) return null
  if (!['full', 'open'].includes(split.status)) return null
  const isMember = split.split_members?.some(m => m.user_id === userId)
  if (!isMember) return null
  if (done) return null

  async function confirm(happened) {
    setSaving(true)
    try {
      // Save confirmation
      await supabase.from('split_confirmations').upsert({
        split_id: split.id, user_id: userId, confirmed: happened
      })

      // If confirmed, mark split as done and update reliability scores
      if (happened) {
        // Mark split done
        await supabase.from('splits')
          .update({ status: 'done' }).eq('id', split.id)

        // Update total_splits for all members
        const memberIds = split.split_members?.map(m => m.user_id) ?? []
        for (const uid of memberIds) {
          const { data: u } = await supabase.from('users')
            .select('total_splits, reliability_score').eq('id', uid).single()
          if (u) {
            // Calculate actual saving for this user
            const memberCount = split.split_members?.length ?? split.people_needed
            const saving = split.total_price > 0
              ? Math.round(split.total_price - (split.total_price / memberCount))
              : 0

            await supabase.from('users').update({
              total_splits: (u.total_splits ?? 0) + 1,
              total_saved:  (u.total_saved  ?? 0) + saving,
              reliability_score: Math.min(5, (u.reliability_score ?? 5))
            }).eq('id', uid)
          }
        }

        toast('Split marked as completed! Everyone\'s score updated ✓', 'success')
      } else {
        // No-show — reduce reliability score slightly for non-confirming members
        const { data: u } = await supabase.from('users')
          .select('reliability_score').eq('id', userId).single()
        if (u) {
          const newScore = Math.max(1, (u.reliability_score ?? 5) - 0.5)
          await supabase.from('users').update({ reliability_score: newScore }).eq('id', userId)
        }
        toast('Thanks for letting us know', 'success')
      }

      setDone(true)
      onDone?.()
    } catch (err) {
      toast(err.message, 'error')
    } finally { setSaving(false) }
  }

  const per  = split.total_price > 0 ? Math.round(split.total_price / split.people_needed) : 0
  const date = split.preferred_date
    ? new Date(split.preferred_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'the split date'

  return (
    <div className="mx-4 mb-3">
      <div className="rounded-3xl overflow-hidden border border-amber-200 shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2"
          style={{ background: '#fffbeb' }}>
          <span className="text-xl">📅</span>
          <div>
            <div className="font-bold text-[13px] text-amber-800">Split date has passed</div>
            <div className="text-[11px] text-amber-600">{date}</div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white px-4 py-4">
          <p className="font-display font-bold text-[16px] text-gray-900 mb-1">
            Did this split happen? 🛒
          </p>
          <p className="text-[12px] text-gray-400 mb-4">
            Your answer helps build trust for everyone in the community.
          </p>

          {/* Split summary */}
          <div className="bg-gray-50 rounded-2xl p-3 mb-4 flex items-center gap-3">
            <div className="text-2xl">🍠</div>
            <div>
              <div className="font-semibold text-[13px] text-gray-900">{split.title}</div>
              <div className="text-[11px] text-gray-400">
                {split.store?.name} · {split.split_members?.length ?? 0} members
                {per > 0 ? ` · £${per} each` : ''}
              </div>
            </div>
          </div>

          {/* Buttons */}
          {saving ? (
            <div className="flex justify-center py-2"><Spinner size={24}/></div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => confirm(true)}
                className="py-3 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
                style={{ background: G, boxShadow: '0 4px 12px rgba(15,122,75,.3)' }}>
                ✓ Yes, it happened!
              </button>
              <button onClick={() => confirm(false)}
                className="py-3 rounded-2xl text-[14px] font-bold bg-gray-100 text-gray-600 flex items-center justify-center gap-2">
                ✗ No, it didn't
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
