import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 seconds
      r && setInterval(() => r.update(), 60 * 1000)
    },
  })

  if (!needRefresh) return null

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
          Update available
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          Tap to get the latest version
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
