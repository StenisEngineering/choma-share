import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter') // enter | hold | exit

  useEffect(() => {
    // enter → hold after 600ms
    const t1 = setTimeout(() => setPhase('hold'), 600)
    // hold → exit after 2000ms
    const t2 = setTimeout(() => setPhase('exit'), 2000)
    // call onDone after exit animation (300ms)
    const t3 = setTimeout(() => onDone?.(), 2350)
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
      <div className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(circle at 50% 40%, #c8f26d 0%, transparent 55%)' }}/>

      {/* Logo */}
      <div
        style={{
          transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease',
          transform: phase === 'enter' ? 'scale(0.6) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
        }}
        className="relative flex flex-col items-center"
      >
        {/* Logo image */}
        <picture>
          <source srcSet="/logo.webp" type="image/webp"/>
          <img
            src="/logo.png"
            alt="Choma Share"
            width="160"
            height="160"
            className="rounded-3xl mb-5"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
          />
        </picture>

        {/* Tagline */}
        <div
          style={{
            transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(10px)' : 'translateY(0)',
          }}
          className="text-center"
        >
          <p className="text-[12px] font-bold uppercase tracking-[3px]"
            style={{ color: '#f8c85a' }}>
            Buy in Bulk · Split the Cost
          </p>
          <p className="text-[12px] font-bold uppercase tracking-[3px] mt-0.5"
            style={{ color: '#f8c85a' }}>
            Save Together
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
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#c8f26d',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
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
