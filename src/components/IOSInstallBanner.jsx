import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show on iOS Safari, not if already installed as PWA
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const isDismissed = localStorage.getItem('ios-install-dismissed')
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)

    if (isIOS && isSafari && !isStandalone && !isDismissed) {
      // Show after 3 seconds
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem('ios-install-dismissed', '1')
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: `calc(16px + env(safe-area-inset-bottom))`,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '400px',
      background: '#07130e',
      borderRadius: '20px',
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      border: '1px solid rgba(200,242,109,0.2)',
      animation: 'slideUp 0.3s ease',
    }}>
      <img src="/icon-192.png" alt="Choma Share"
        style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}/>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>
          Install Choma Share
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>
          Tap{' '}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 1 }}>
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          {' '}then <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Add to Home Screen</strong>
        </p>
      </div>

      <button onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
        <X size={16} color="rgba(255,255,255,0.5)"/>
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
