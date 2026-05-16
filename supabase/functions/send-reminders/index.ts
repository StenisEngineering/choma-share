// Supabase Edge Function — send-reminders
// Run daily via Supabase cron to send split reminders
// Set up: Database → Extensions → pg_cron
// Cron: SELECT cron.schedule('daily-reminders', '0 8 * * *', 'SELECT net.http_post(...)');

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ONESIGNAL_APP_ID  = Deno.env.get('ONESIGNAL_APP_ID')  || 'bee90f91-ad77-42e0-98ea-6f528c83f073'
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY')  || ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')       || ''
const SERVICE_ROLE_KEY  = Deno.env.get('SERVICE_ROLE_KEY')   || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendPush(title: string, body: string, url: string, userIds: string[]) {
  if (!ONESIGNAL_API_KEY || !userIds.length) return

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: body },
    url,
    chrome_web_icon: 'https://share.choma.app/icon-192.png',
    filters: userIds.flatMap((id, i) => [
      ...(i > 0 ? [{ operator: 'OR' }] : []),
      { field: 'tag', key: 'user_id', relation: '=', value: id }
    ])
  }

  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const today = new Date().toISOString().split('T')[0]

    // Get all splits happening tomorrow or today
    const { data: splits } = await supabase
      .from('splits')
      .select(`
        id, title, preferred_date, preferred_time, status,
        store:stores(name, address),
        split_members(user_id)
      `)
      .in('preferred_date', [tomorrowStr, today])
      .in('status', ['open', 'full'])

    if (!splits?.length) {
      return new Response(JSON.stringify({ ok: true, message: 'No splits to remind' }), { headers: corsHeaders })
    }

    let sent = 0
    for (const split of splits) {
      const members = split.split_members?.map((m: any) => m.user_id) ?? []
      if (!members.length) continue

      const isToday    = split.preferred_date === today
      const storeName  = split.store?.name || 'the store'
      const time       = split.preferred_time || ''
      const dateLabel  = isToday ? 'today' : 'tomorrow'

      const title = isToday
        ? `Your split is today! 📅`
        : `Split reminder for tomorrow`

      const body = `${split.title} at ${storeName}${time ? ' at ' + time : ''} — ${dateLabel}. Don't forget to show up!`

      await sendPush(title, body, `https://share.choma.app/split/${split.id}`, members)
      sent++
    }

    return new Response(
      JSON.stringify({ ok: true, reminders_sent: sent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders
    })
  }
})
