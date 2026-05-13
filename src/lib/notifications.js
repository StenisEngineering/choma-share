import { supabase } from './supabase'

// Core function to create a notification for a user
async function createNotification(userId, { title, body, type, data = {} }) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId, title, body, type, data, read: false
    })
  } catch (err) {
    console.error('Notification error:', err)
  }
}

// When someone joins a split — notify the creator
export async function notifySplitJoined(split, joinerName) {
  if (!split?.creator_id) return
  await createNotification(split.creator_id, {
    type:  'split_joined',
    title: `${joinerName} joined your split!`,
    body:  `${split.title} at ${split.store?.name ?? 'the store'}. ${Math.max(0, split.people_needed - (split.split_members?.length ?? 0))} spot${Math.max(0, split.people_needed - (split.split_members?.length ?? 0)) !== 1 ? 's' : ''} left.`,
    data:  { split_id: split.id }
  })
}

// When split becomes full — notify all members
export async function notifySplitFull(split) {
  if (!split?.split_members?.length) return
  const per  = split.total_price > 0 ? Math.round(split.total_price / split.people_needed) : 0
  const date = split.preferred_date
    ? new Date(split.preferred_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'soon'

  for (const member of split.split_members) {
    await createNotification(member.user_id, {
      type:  'split_full',
      title: '🎉 Your split is full!',
      body:  `${split.title} at ${split.store?.name ?? 'the store'} on ${date}.${per > 0 ? ` Bring £${per}.` : ''}`,
      data:  { split_id: split.id }
    })
  }
}

// When split date has passed — notify members to confirm
export async function notifySplitConfirmation(split) {
  if (!split?.split_members?.length) return
  for (const member of split.split_members) {
    await createNotification(member.user_id, {
      type:  'split_confirm',
      title: '📅 Did your split happen?',
      body:  `Please confirm whether the ${split.title} split at ${split.store?.name ?? 'the store'} took place. This helps build community trust.`,
      data:  { split_id: split.id }
    })
  }
}

// When a new split is created — notify users in the same city
export async function notifyNewSplit(split, creatorName) {
  if (!split?.store?.city) return
  try {
    // Get all users in the same city except the creator
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('city', split.store.city)
      .neq('id', split.creator_id)
      .limit(50)

    if (!users?.length) return

    const per  = split.total_price > 0 ? Math.round(split.total_price / split.people_needed) : 0
    const left = split.people_needed - 1 // creator is already in

    for (const u of users) {
      await createNotification(u.id, {
        type:  'new_split',
        title: `New split near you 🛒`,
        body:  `${creatorName} is splitting a ${split.title} at ${split.store.name}.${per > 0 ? ` £${per} each.` : ''} ${left} spot${left !== 1 ? 's' : ''} left.`,
        data:  { split_id: split.id }
      })
    }
  } catch (err) {
    console.error('New split notification error:', err)
  }
}
