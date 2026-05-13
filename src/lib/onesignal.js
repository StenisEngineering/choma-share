// OneSignal Push Notifications
// Sign up at onesignal.com → create a Web Push app → get your App ID
// Then add VITE_ONESIGNAL_APP_ID to your Cloudflare environment variables

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID

export async function initOneSignal() {
  if (!ONESIGNAL_APP_ID) {
    console.log('OneSignal App ID not configured — push notifications disabled')
    return
  }

  try {
    // Load OneSignal SDK
    window.OneSignalDeferred = window.OneSignalDeferred || []
    
    await new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      script.onload = resolve
      document.head.appendChild(script)
    })

    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: '',
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
      })
    })
  } catch (err) {
    console.error('OneSignal init error:', err)
  }
}

export async function requestPushPermission(userId) {
  if (!window.OneSignal || !ONESIGNAL_APP_ID) return false
  try {
    const permission = await window.OneSignal.Notifications.requestPermission()
    if (permission) {
      // Tag user so we can send targeted notifications
      await window.OneSignal.User.addTag('user_id', userId)
      await window.OneSignal.User.addTag('app', 'choma-share')
      return true
    }
    return false
  } catch (err) {
    console.error('Push permission error:', err)
    return false
  }
}

export async function setUserCity(city) {
  if (!window.OneSignal || !ONESIGNAL_APP_ID) return
  try {
    await window.OneSignal.User.addTag('city', city)
  } catch (err) {
    console.error('OneSignal tag error:', err)
  }
}
