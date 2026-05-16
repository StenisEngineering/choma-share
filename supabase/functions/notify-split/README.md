# notify-split Edge Function

Sends real push notifications via OneSignal when splits are created or joined.

## Deploy steps

1. Install Supabase CLI (if not already):
   npm install -g supabase

2. Login:
   supabase login

3. Link to your project:
   supabase link --project-ref uwrzebafgmmlhlqglcmv

4. Set secrets:
   supabase secrets set ONESIGNAL_APP_ID=bee90f91-ad77-42e0-98ea-6f528c83f073
   supabase secrets set ONESIGNAL_API_KEY=YOUR_REST_API_KEY_HERE
   supabase secrets set SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

5. Deploy:
   supabase functions deploy notify-split

6. Set up database webhooks in Supabase dashboard:
   - Go to Database → Webhooks → Create webhook
   
   Webhook 1 — New split created:
   - Name: on_split_created
   - Table: splits
   - Events: INSERT
   - URL: https://uwrzebafgmmlhlqglcmv.supabase.co/functions/v1/notify-split
   
   Webhook 2 — Member joined:
   - Name: on_member_joined
   - Table: split_members  
   - Events: INSERT
   - URL: https://uwrzebafgmmlhlqglcmv.supabase.co/functions/v1/notify-split

## Environment variables needed

- ONESIGNAL_APP_ID: bee90f91-ad77-42e0-98ea-6f528c83f073
- ONESIGNAL_API_KEY: Get from OneSignal → Settings → Keys & IDs → REST API Key
- SUPABASE_URL: https://uwrzebafgmmlhlqglcmv.supabase.co (auto-set)
- SUPABASE_SERVICE_KEY: Get from Supabase → Settings → API → service_role key
