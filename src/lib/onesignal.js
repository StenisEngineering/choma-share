// OneSignal Push Notifications for Choma Share
// App ID: bee90f91-ad77-42e0-98ea-6f528c83f073

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || 'bee90f91-ad77-42e0-98ea-6f528c83f073'

let initialized = false

export async function initOneSignal() {
  if (initialized || typeof window === 'undefined') return
  if (!APP_ID) return

  try {
    // Load OneSignal SDK
    await new Promise((resolve, reject) => {
      if (window.OneSignalDeferred) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: APP_ID,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
        welcomeNotification: {
          title: 'Welcome to Choma Share!',
          message: "You'll be notified when new splits are available near you.",
        },
      })
      initialized = true
      console.log('OneSignal initialized')
    })
  } catch (err) {
    console.error('OneSignal init error:', err)
  }
}

export async function requestPushPermission(userId, city) {
  if (typeof window === 'undefined') return false
  try {
    await initOneSignal()
    if (!window.OneSignal) return false

    const permission = await window.OneSignal.Notifications.requestPermission()
    if (permission) {
      // Tag user for targeted notifications
      await window.OneSignal.User.addTags({
        user_id: userId,
        city: city || 'Sunderland',
        app: 'choma-share',
      })
      console.log('Push permission granted, user tagged')
      return true
    }
    return false
  } catch (err) {
    console.error('Push permission error:', err)
    return false
  }
}

export async function setUserCity(city) {
  if (typeof window === 'undefined' || !window.OneSignal) return
  try {
    await window.OneSignal.User.addTag('city', city)
  } catch (err) {
    console.error('OneSignal tag error:', err)
  }
}

export async function isPushEnabled() {
  try {
    if (!window.OneSignal) return false
    return await window.OneSignal.Notifications.isPushSupported()
  } catch { return false }
}
