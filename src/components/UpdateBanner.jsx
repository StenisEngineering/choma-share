import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (!r) return

      // Check for update every 60 seconds while app is open
      setInterval(() => r.update(), 60 * 1000)

      // Also check when app comes back to foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          r.update()
        }
      })
    },
  })

  useEffect(() => {
    // If update is available — auto apply silently on app open
    // Only if the page has just loaded (not mid-session)
    if (needRefresh) {
      // Use performance.now() — works on all browsers including iOS Safari
      const pageAge = performance.now()
      if (pageAge < 4000) {
        updateServiceWorker(true)
      }
      // Otherwise keep the banner (user might be mid-session)
    }
  }, [needRefresh])

  // Show subtle banner only if page has been open a while
  // (user is mid-session — don't force refresh)
  if (!needRefresh) return null

  const pageAge = performance.now()
  if (pageAge < 4000) return null // silently updating, no banner needed

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(16px + env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '400px',
      background: '#062f23',
      borderRadius: '16px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid rgba(200,242,109,0.25)',
      animation: 'slideDown 0.3s ease',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 2px' }}>
          New update available
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          Tap to refresh when ready
        </p>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#c8f26d',
          color: '#062f23',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
          fontFamily: 'inherit',
        }}>
        Update
      </button>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
