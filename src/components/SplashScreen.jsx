import { useEffect, useState } from 'react'

// SVG icons — consistent, clean, no emoji
const IconBasket = ({ size = 28, color = '#c8f26d' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

const IconUsers = ({ size = 20, color = 'rgba(255,255,255,0.5)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const IconPin = ({ size = 14, color = '#c8f26d' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
)

const IconStore = ({ size = 16, color = 'rgba(255,255,255,0.65)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const IconWallet = ({ size = 16, color = 'rgba(255,255,255,0.65)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
    <path d="M3 5v14a2 2 0 002 2h16v-5"/>
    <path d="M18 12a2 2 0 000 4h4v-4z"/>
  </svg>
)

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('exit'), 2800)
    const t3 = setTimeout(() => onDone?.(), 3100)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onDone])

  const show = phase !== 'enter'

  const fade = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  })

  return (
    <div className="fixed inset-0 z-[999] flex flex-col"
      style={{
        background: 'linear-gradient(170deg, #041f16 0%, #062f23 50%, #0a3d2e 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.35s ease',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}>

      {/* Atmospheric glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 10%, rgba(200,242,109,0.12) 0%, transparent 50%)' }}/>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 90%, rgba(248,200,90,0.07) 0%, transparent 45%)' }}/>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-0">

        {/* Logo with spring animation */}
        <div style={{
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
          transition: 'opacity 0.55s ease 0s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) 0s',
          marginBottom: '22px',
        }}>
          <picture>
            <source srcSet="/logo.webp" type="image/webp"/>
            <img src="/logo.png" alt="Choma Share" width="130" height="130"
              style={{ borderRadius: '30px', boxShadow: '0 20px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)', display: 'block' }}/>
          </picture>
        </div>

        {/* App name */}
        <div style={{ ...fade(0.15), marginBottom: '10px' }}>
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '43px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-1.5px',
            lineHeight: 1,
            textAlign: 'center',
            margin: 0,
          }}>
            Choma <span style={{ color: '#c8f26d' }}>Share</span>
          </h1>
        </div>

        {/* Primary tagline */}
        <div style={{ ...fade(0.28), marginBottom: '14px' }}>
          <p style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#f8c85a',
            textAlign: 'center',
            letterSpacing: '0.2px',
            lineHeight: 1.4,
            margin: 0,
          }}>
            Share bulk food.<br/>Save money together.
          </p>
        </div>

        {/* Description */}
        <div style={{ ...fade(0.42), marginBottom: '24px' }}>
          <p style={{
            fontSize: '13.5px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: '260px',
          }}>
            Split yam, turkey, chicken, fish,<br/>
            pepper, plantain &amp; more —<br/>
            with people near you.
          </p>
        </div>

        {/* Feature pills with SVG icons */}
        <div style={{ ...fade(0.55), display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { Icon: IconStore,  text: '5 Stores'    },
            { Icon: IconUsers,  text: 'Community'   },
            { Icon: IconWallet, text: 'Save money'  },
          ].map(({ Icon, text }) => (
            <div key={text} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <Icon size={13} color="rgba(255,255,255,0.55)"/>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3px' }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center pb-10 gap-3">

        {/* Location badge */}
        <div style={{
          ...fade(0.65),
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(200,242,109,0.1)',
          border: '1px solid rgba(200,242,109,0.2)',
          borderRadius: '99px',
          padding: '5px 14px',
        }}>
          <IconPin size={12} color="#c8f26d"/>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#c8f26d', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Live in Sunderland
          </span>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '5px', opacity: show ? 1 : 0, transition: 'opacity 0.4s ease 0.7s' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#c8f26d',
              animation: `sp-bounce 1.2s ease-in-out ${i*0.18}s infinite`,
            }}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes sp-bounce {
          0%,80%,100% { transform:scale(0.45); opacity:0.3; }
          40% { transform:scale(1); opacity:1; }
        }
      `}</style>
    </div>
  )
}
