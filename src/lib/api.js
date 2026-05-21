import { supabase } from './supabase'

// AUTH
export async function signInWithPhone(phone) {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

export async function verifyOtp(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

// PROFILE
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('users').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function createProfile({ id, name, phone, city }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ id, name, phone, city, reliability_score: 5.0, total_splits: 0, total_saved: 0 })
    .select().single()
  if (error) throw error
  return data
}

// STORES
export async function getStores() {
  // Only return active stores — respects admin hide/show setting
  const { data, error } = await supabase
    .from('stores')
    .select('*, store_items(*)')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

// SPLITS
export async function getSplits() {
  // Only show open and full splits — hide done, cancelled, archived
  const { data, error } = await supabase
    .from('splits')
    .select(`
      *,
      store:stores(id, name, address, city),
      item:store_items(id, name, bulk_price),
      creator:users!splits_creator_id_fkey(id, name, city),
      split_members(id, user_id, status, user:users(id, name, city, reliability_score))
    `)
    .in('status', ['open', 'full'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getSplit(id) {
  const { data, error } = await supabase
    .from('splits')
    .select(`
      *,
      store:stores(id, name, address, city, phone),
      item:store_items(id, name, bulk_price),
      creator:users!splits_creator_id_fkey(id, name, city, reliability_score),
      split_members(id, user_id, status, joined_at, user:users(id, name, city, reliability_score))
    `)
    .eq('id', id).single()
  if (error) throw error
  return data
}

export async function createSplit(payload) {
  const { data, error } = await supabase
    .from('splits').insert(payload).select().single()
  if (error) throw error
  // add creator as first member
  await supabase.from('split_members')
    .insert({ split_id: data.id, user_id: payload.creator_id, status: 'confirmed' })

  // Notify users in same city
  try {
    const { notifyNewSplit } = await import('./notifications')
    const { data: creator } = await supabase.from('users').select('name').eq('id', payload.creator_id).single()
    const splitWithStore = await getSplit(data.id)
    await notifyNewSplit(splitWithStore, creator?.name ?? 'Someone')
  } catch (e) { console.error('Notification error:', e) }

  return data
}

export async function joinSplit(splitId, userId) {
  // Always get fresh data from DB to avoid race conditions
  const split = await getSplit(splitId)
  if (!split) throw new Error('Split not found')

  // Hard checks
  if (split.status === 'full')      throw new Error('This split is full — no spots left')
  if (split.status === 'cancelled') throw new Error('This split has been cancelled')
  if (split.status === 'done')      throw new Error('This split has already happened')
  if (split.status !== 'open')      throw new Error('This split is no longer accepting members')

  // Count actual members from DB (source of truth)
  const currentMembers = split.split_members?.length ?? 0
  if (currentMembers >= split.people_needed) {
    // Fix status if it wasn't updated properly
    await supabase.from('splits').update({ status: 'full' }).eq('id', splitId)
    throw new Error('This split is full — no spots left')
  }

  // Check already joined
  const already = split.split_members?.some(m => m.user_id === userId)
  if (already) throw new Error('You have already joined this split')

  // Add member
  const { error: me } = await supabase.from('split_members')
    .insert({ split_id: splitId, user_id: userId, status: 'confirmed' })
  if (me) throw me

  // Update count — use actual member count as source of truth
  const newCount = currentMembers + 1
  const newStatus = newCount >= split.people_needed ? 'full' : 'open'

  await supabase.from('splits')
    .update({ people_joined: newCount, status: newStatus })
    .eq('id', splitId)

  // Send notifications
  try {
    const { notifySplitJoined, notifySplitFull } = await import('./notifications')
    const freshSplit = await getSplit(splitId)
    const joiner = freshSplit.split_members?.find(m => m.user_id === userId)
    const joinerName = joiner?.user?.name ?? 'Someone'
    await notifySplitJoined(freshSplit, joinerName)
    if (newStatus === 'full') await notifySplitFull(freshSplit)
  } catch (e) { console.error('Notification error:', e) }

  return { full: newStatus === 'full' }
}

export async function getMySplits(userId) {
  const { data, error } = await supabase
    .from('split_members')
    .select(`split_id, status, joined_at, split:splits(*, store:stores(name, city), item:store_items(name))`)
    .eq('user_id', userId).order('joined_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// HELPERS
export const pricePerPerson = (s) => Math.round((s.total_price || 0) / (s.people_needed || 1))

export const priceRangePerPerson = (s) => {
  if (!s.price_min || !s.price_max || s.price_min === s.price_max) return null
  const min = Math.round(s.price_min / s.people_needed)
  const max = Math.round(s.price_max / s.people_needed)
  return { min, max, text: `£${min}–£${max}` }
}

export const savingPerPerson = (s) => (s.total_price || 0) - pricePerPerson(s)
export const spotsLeft = (s) => s.people_needed - s.people_joined
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''

export function buildWhatsAppMessage(split) {
  const members    = split.split_members?.length ?? split.people_joined ?? 1
  const left       = Math.max(0, split.people_needed - members)
  const per        = split.total_price > 0 ? Math.round(split.total_price / split.people_needed) : 0
  const saving     = split.total_price > 0 ? split.total_price - per : 0
  const storeName  = split.store?.name ?? 'local African store'
  const storeCity  = split.store?.city ?? 'Sunderland'
  const url        = `${window.location.origin}/split/${split.id}`

  const priceText  = per > 0
    ? `Each person pays just £${per} — saving £${saving} each.`
    : `Price to be confirmed at the store.`

  return encodeURIComponent(
    `Hey! I'm splitting a ${split.title || 'bulk item'}` +
    (split.total_price > 0 ? ` (£${split.total_price} total)` : '') +
    ` at ${storeName}, ${storeCity}.\n\n` +
    `${priceText} ${left} spot${left !== 1 ? 's' : ''} left.\n\n` +
    `Join here 👉 ${url}`
  )
}
