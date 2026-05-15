import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 500)
    const t2 = setTimeout(() => setPhase('exit'), 2600)
    const t3 = setTimeout(() => onDone?.(), 2950)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onDone])

  const entered = phase !== 'enter'

  return (
    <div className="fixed inset-0 z-[999] flex flex-col"
      style={{
        background: 'linear-gradient(170deg, #041f16 0%, #062f23 45%, #0a3d2e 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}>

      {/* Radial glow top right */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 75% 15%, rgba(200,242,109,0.13) 0%, transparent 55%)' }}/>

      {/* Radial glow bottom left */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 85%, rgba(248,200,90,0.08) 0%, transparent 45%)' }}/>

      {/* Content — vertically centred with generous spacing */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">

        {/* Logo */}
        <div style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'scale(1) translateY(0)' : 'scale(0.65) translateY(24px)',
          transition: 'opacity 0.55s ease, transform 0.65s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <picture>
            <source srcSet="/logo.webp" type="image/webp"/>
            <img src="/logo.png" alt="Choma Share"
              width="140" height="140"
              style={{
                borderRadius: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
                display: 'block',
              }}/>
          </picture>
        </div>

        {/* App name */}
        <div style={{
          marginTop: '24px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '40px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-1.5px',
            lineHeight: 1,
            margin: 0,
          }}>
            Choma <span style={{ color: '#c8f26d' }}>Share</span>
          </h1>
        </div>

        {/* Primary tagline — BIG and bold */}
        <div style={{
          marginTop: '14px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease 0.32s, transform 0.5s ease 0.32s',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#f8c85a',
            letterSpacing: '0.2px',
            lineHeight: 1.3,
            margin: 0,
          }}>
            Buy in Bulk · Split the Cost<br/>Save Together
          </p>
        </div>

        {/* Sub-tagline */}
        <div style={{
          marginTop: '12px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease 0.46s, transform 0.5s ease 0.46s',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.5,
            margin: 0,
          }}>
            Your community. Your groceries.<br/>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Half the cost.</span>
          </p>
        </div>

        {/* Divider line */}
        <div style={{
          marginTop: '20px',
          opacity: entered ? 0.2 : 0,
          transition: 'opacity 0.5s ease 0.55s',
          width: '48px',
          height: '1px',
          background: '#c8f26d',
        }}/>

        {/* Description */}
        <div style={{
          marginTop: '14px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.3px',
            margin: 0,
            lineHeight: 1.6,
          }}>
            African raw food & groceries<br/>for households in the UK
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center pb-12 gap-4">

        {/* Location badge */}
        <div style={{
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.5s ease 0.7s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(200,242,109,0.1)',
          border: '1px solid rgba(200,242,109,0.2)',
          borderRadius: '99px',
          padding: '5px 14px',
        }}>
          <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
            <path d="M5 0C2.24 0 0 2.24 0 5C0 8.75 5 13 5 13C5 13 10 8.75 10 5C10 2.24 7.76 0 5 0ZM5 6.5C4.17 6.5 3.5 5.83 3.5 5C3.5 4.17 4.17 3.5 5 3.5C5.83 3.5 6.5 4.17 6.5 5C6.5 5.83 5.83 6.5 5 6.5Z"
              fill="#c8f26d"/>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#c8f26d', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Live in Sunderland
          </span>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '6px', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.6s' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#c8f26d',
              animation: `splash-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes splash-bounce {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.35; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
