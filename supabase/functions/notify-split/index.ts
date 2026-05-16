// Supabase Edge Function — notify-split
// Triggered via Supabase webhook when splits or split_members change
// Sends real push notifications via OneSignal

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ONESIGNAL_APP_ID  = Deno.env.get('ONESIGNAL_APP_ID')  || 'bee90f91-ad77-42e0-98ea-6f528c83f073'
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY')  || ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')       || ''
const SUPABASE_KEY      = Deno.env.get('SERVICE_ROLE_KEY')|| ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Send a push notification via OneSignal
async function sendPush({ title, body, url, filters, userIds }: {
  title: string
  body: string
  url?: string
  filters?: any[]
  userIds?: string[]
}) {
  if (!ONESIGNAL_API_KEY) {
    console.log('No OneSignal API key — skipping push')
    return
  }

  const payload: any = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: body },
    url: url || 'https://share.choma.app',
    chrome_web_icon: 'https://share.choma.app/icon-192.png',
    firefox_icon: 'https://share.choma.app/icon-192.png',
  }

  if (userIds?.length) {
    // Target specific users by their OneSignal external_id (user_id tag)
    payload.filters = userIds.flatMap((id, i) => [
      ...(i > 0 ? [{ operator: 'OR' }] : []),
      { field: 'tag', key: 'user_id', relation: '=', value: id }
    ])
  } else if (filters) {
    payload.filters = filters
  } else {
    payload.included_segments = ['All']
  }

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  console.log('OneSignal response:', JSON.stringify(data))
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { type, record, old_record, table } = body

    console.log(`Webhook: ${table} ${type}`, JSON.stringify(record))

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // ── NEW SPLIT CREATED ────────────────────────────────
    if (table === 'splits' && type === 'INSERT') {
      const split = record

      // Get store info
      const { data: store } = await supabase
        .from('stores').select('name, city').eq('id', split.store_id).single()

      // Get creator name
      const { data: creator } = await supabase
        .from('users').select('name').eq('id', split.creator_id).single()

      if (!store) {
        return new Response(JSON.stringify({ ok: true, skipped: 'no store' }), { headers: corsHeaders })
      }

      const per  = split.total_price > 0 ? Math.round(split.total_price / split.people_needed) : 0
      const left = split.people_needed - 1
      const city = store.city || 'Sunderland'

      // Get users watching this item in same city
      const { data: watchers } = await supabase
        .from('watchlist')
        .select('user_id')
        .eq('item_name', split.title)

      const watcherIds = (watchers ?? [])
        .map((w: any) => w.user_id)
        .filter((id: string) => id !== split.creator_id)

      // Notify watchers with higher priority message
      if (watcherIds.length > 0) {
        await sendPush({
          title: `${split.title} split available!`,
          body:  `${creator?.name || 'Someone'} created a ${split.title} split at ${store.name}.${per > 0 ? ` £${per} each.` : ''} You're watching this item.`,
          url:   `https://share.choma.app/split/${split.id}`,
          userIds: watcherIds,
        })
      }

      // Notify all other users in same city
      await sendPush({
        title: `New split in ${city}`,
        body:  `${creator?.name || 'Someone'} is splitting ${split.title} at ${store.name}.${per > 0 ? ` £${per} each.` : ''} ${left} spot${left !== 1 ? 's' : ''} left.`,
        url:   `https://share.choma.app/split/${split.id}`,
        filters: [
          { field: 'tag', key: 'city', relation: '=', value: city },
          { operator: 'AND' },
          { field: 'tag', key: 'user_id', relation: '!=', value: split.creator_id },
        ],
      })
    }

    // ── SOMEONE JOINED A SPLIT ───────────────────────────
    if (table === 'split_members' && type === 'INSERT') {
      const member = record

      // Get split info
      const { data: split } = await supabase
        .from('splits')
        .select('*, store:stores(name)')
        .eq('id', member.split_id)
        .single()

      if (!split) {
        return new Response(JSON.stringify({ ok: true, skipped: 'no split' }), { headers: corsHeaders })
      }

      // Get joiner name
      const { data: joiner } = await supabase
        .from('users').select('name').eq('id', member.user_id).single()

      // Don't notify creator joining their own split
      if (member.user_id === split.creator_id) {
        return new Response(JSON.stringify({ ok: true, skipped: 'creator joined' }), { headers: corsHeaders })
      }

      // Get actual member count
      const { count } = await supabase
        .from('split_members')
        .select('id', { count: 'exact' })
        .eq('split_id', split.id)

      const memberCount = count || 0
      const left = Math.max(0, split.people_needed - memberCount)
      const isFull = left === 0

      // Notify creator someone joined
      await sendPush({
        title: `${joiner?.name || 'Someone'} joined your split!`,
        body:  `${split.title} at ${split.store?.name || 'the store'}. ${left} spot${left !== 1 ? 's' : ''} left.`,
        url:   `https://share.choma.app/split/${split.id}`,
        userIds: [split.creator_id],
      })

      // If split is now full — notify ALL members
      if (isFull) {
        const { data: members } = await supabase
          .from('split_members')
          .select('user_id')
          .eq('split_id', split.id)

        const per = split.total_price > 0
          ? Math.round(split.total_price / split.people_needed)
          : 0

        const date = split.preferred_date
          ? new Date(split.preferred_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
          : 'soon'

        if (members?.length) {
          await sendPush({
            title: 'Your split is full!',
            body:  `${split.title} at ${split.store?.name || 'the store'} on ${date}.${per > 0 ? ` Bring £${per}.` : ''}`,
            url:   `https://share.choma.app/split/${split.id}`,
            userIds: members.map(m => m.user_id),
          })
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
