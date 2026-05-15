import { useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, Plus, Store, User } from 'lucide-react'

const tabs = [
  { path: '/',        icon: Home,        label: 'Home'   },
  { path: '/splits',  icon: LayoutGrid,  label: 'Splits' },
  { path: '/create',  icon: Plus,        label: '',      create: true },
  { path: '/stores',  icon: Store,       label: 'Stores' },
  { path: '/profile', icon: User,        label: 'Me'     },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  return (
    <nav style={{
      background: '#07130e',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingLeft: '8px',
      paddingRight: '8px',
      paddingTop: '8px',
      // Safe area for iPhone home indicator
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
    }}>
      {tabs.map(t => {
        const active = pathname === t.path
        const Icon   = t.icon

        if (t.create) return (
          <button key={t.path} onClick={() => navigate('/create')}
            style={{
              width: 52, height: 52,
              marginTop: -18,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#0f7a4b,#15a66a)',
              boxShadow: '0 6px 20px rgba(15,122,75,.5)',
              border: 'none', cursor: 'pointer', flexShrink: 0,
            }}>
            <Plus size={24} color="white" strokeWidth={2.5}/>
          </button>
        )

        return (
          <button key={t.path} onClick={() => navigate(t.path)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '4px',
              flex: 1, paddingTop: '4px', paddingBottom: '4px',
              opacity: active ? 1 : 0.4,
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
            <Icon size={22} color={active ? '#c8f26d' : '#fff'} strokeWidth={2}/>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              color: active ? '#c8f26d' : '#fff',
              fontFamily: 'DM Sans, sans-serif',
            }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
