import { useState, useRef, useEffect } from 'react'

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling,   setPulling]   = useState(false)
  const [distance,  setDistance]  = useState(0)
  const [refreshing,setRefreshing]= useState(false)
  const startY  = useRef(null)
  const el      = useRef(null)
  const THRESHOLD = 70

  useEffect(() => {
    const node = el.current
    if (!node) return

    function onTouchStart(e) {
      // Only trigger if scrolled to top
      if (node.scrollTop > 0) return
      startY.current = e.touches[0].clientY
    }

    function onTouchMove(e) {
      if (startY.current === null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy < 0) { startY.current = null; return }
      if (dy > 0 && node.scrollTop === 0) {
        e.preventDefault()
        setDistance(Math.min(dy * 0.5, THRESHOLD + 20))
        setPulling(true)
      }
    }

    async function onTouchEnd() {
      if (distance >= THRESHOLD) {
        setRefreshing(true)
        setDistance(THRESHOLD)
        try { await onRefresh?.() } catch {}
        setRefreshing(false)
      }
      setDistance(0)
      setPulling(false)
      startY.current = null
    }

    node.addEventListener('touchstart', onTouchStart, { passive: true })
    node.addEventListener('touchmove',  onTouchMove,  { passive: false })
    node.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchmove',  onTouchMove)
      node.removeEventListener('touchend',   onTouchEnd)
    }
  }, [distance, onRefresh])

  return (
    <div ref={el} style={{
      flex: 1, overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none',
      minHeight: 0,
    }}>
      {/* Pull indicator */}
      {(pulling || refreshing) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: `${distance}px`, overflow: 'hidden',
          transition: refreshing ? 'none' : 'height 0.1s',
          background: '#f0fdf4',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2.5px solid #0f7a4b',
            borderTopColor: 'transparent',
            animation: refreshing ? 'ptr-spin 0.8s linear infinite' : 'none',
            transform: refreshing ? 'none' : `rotate(${(distance / THRESHOLD) * 270}deg)`,
            transition: refreshing ? 'none' : 'transform 0.1s',
          }}/>
        </div>
      )}
      {children}
      <style>{`
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
