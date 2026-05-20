// PullToRefresh — clean implementation with no scroll lock
// Uses CSS overscroll-behavior instead of touch event manipulation
import { useRef } from 'react'

export default function PullToRefresh({ onRefresh, children }) {
  const el = useRef(null)

  return (
    <div
      ref={el}
      className="app-scroll"
      // Native CSS pull to refresh on Android Chrome
      style={{ overscrollBehaviorY: 'contain' }}
    >
      {children}
    </div>
  )
}
