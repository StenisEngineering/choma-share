import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('exit'), 2400)
    const t3 = setTimeout(() => onDone?.(), 2750)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[999]"
      style={{
        background: 'linear-gradient(160deg, #062f23 0%, #0a4a35 50%, #0f6647 100%)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-25"
        style={{ background: 'radial-gradient(circle at 50% 40%, #c8f26d 0%, transparent 55%)' }}/>

      {/* Main content */}
      <div
        style={{
          transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease',
          transform: phase === 'enter' ? 'scale(0.6) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
        }}
        className="relative flex flex-col items-center px-8"
      >
        {/* Logo */}
        <picture>
          <source srcSet="/logo.webp" type="image/webp"/>
          <img
            src="/logo.png"
            alt="Choma Share"
            width="160"
            height="160"
            className="rounded-3xl mb-6"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
          />
        </picture>

        {/* App name — clear and large */}
        <div
          style={{
            transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(8px)' : 'translateY(0)',
          }}
          className="text-center mb-3"
        >
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '36px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}>
            Choma <span style={{ color: '#c8f26d' }}>Share</span>
          </h1>
        </div>

        {/* Tagline — bigger, clearer, easier to read */}
        <div
          style={{
            transition: 'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s',
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(8px)' : 'translateY(0)',
          }}
          className="text-center mb-5"
        >
          <p style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#f8c85a',
            letterSpacing: '0.5px',
          }}>
            Buy in Bulk · Split the Cost · Save Together
          </p>
        </div>

        {/* Description — fills the space your friend noticed */}
        <div
          style={{
            transition: 'opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s',
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(8px)' : 'translateY(0)',
          }}
          className="text-center"
        >
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.5,
          }}>
            Community bulk buying for African<br/>households in the UK 🇬🇧🇳🇬
          </p>
        </div>
      </div>

      {/* Loading dots */}
      <div
        className="absolute bottom-16 flex gap-2"
        style={{
          transition: 'opacity 0.4s ease 0.5s',
          opacity: phase === 'enter' ? 0 : 1,
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: '#c8f26d',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* City badge */}
      <div
        className="absolute bottom-28"
        style={{
          transition: 'opacity 0.5s ease 0.7s',
          opacity: phase === 'enter' ? 0 : 0.6,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C2.69 0 0 2.69 0 6C0 10.5 6 15 6 15C6 15 12 10.5 12 6C12 2.69 9.31 0 6 0ZM6 8.5C4.62 8.5 3.5 7.38 3.5 6C3.5 4.62 4.62 3.5 6 3.5C7.38 3.5 8.5 4.62 8.5 6C8.5 7.38 7.38 8.5 6 8.5Z"
              fill="#c8f26d" opacity="0.7"/>
          </svg>
          Live in Sunderland
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
