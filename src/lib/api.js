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
  const { data, error } = await supabase
    .from('stores').select('*, store_items(*)').eq('active', true).order('name')
  if (error) throw error
  return data ?? []
}

// SPLITS
export async function getSplits() {
  const { data, error } = await supabase
    .from('splits')
    .select(`
      *,
      store:stores(id, name, address, city),
      item:store_items(id, name, bulk_price),
      creator:users!splits_creator_id_fkey(id, name, city),
      split_members(id, user_id, status, user:users(id, name, city, reliability_score))
    `)
    .eq('status', 'open')
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
export const pricePerPerson = (s) => Math.round(s.total_price / s.people_needed)
export const savingPerPerson = (s) => s.total_price - pricePerPerson(s)
export const spotsLeft = (s) => s.people_needed - s.people_joined
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''

export function buildWhatsAppMessage(split) {
  const per    = pricePerPerson(split)
  const saving = savingPerPerson(split)
  const left   = spotsLeft(split)
  const url    = `${window.location.origin}/split/${split.id}`
  return encodeURIComponent(
    `Hey! I'm splitting a ${split.title} (£${split.total_price}) at ${split.store?.name}, ${split.store?.city}.\n\n` +
    `Each person pays just £${per} — saving £${saving} each. ${left} spot${left !== 1 ? 's' : ''} left.\n\n` +
    `Join here 👉 ${url}`
  )
}
