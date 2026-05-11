import { useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, Plus, Users, User } from 'lucide-react'

const tabs = [
  { path: '/',        icon: Home,        label: 'Home'    },
  { path: '/splits',  icon: LayoutGrid,  label: 'Splits'  },
  { path: '/create',  icon: Plus,        label: '',       create: true },
  { path: '/circles', icon: Users,       label: 'Circles' },
  { path: '/profile', icon: User,        label: 'Me'      },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  return (
    <nav className="flex-shrink-0 h-20 bg-[#07130e] flex items-center justify-around px-2 pb-5 pt-2">
      {tabs.map(t => {
        const active = pathname === t.path
        const Icon   = t.icon

        if (t.create) return (
          <button key={t.path} onClick={() => navigate('/create')}
            className="rounded-full flex items-center justify-center -mt-4"
            style={{ width: 52, height: 52, marginTop: -18, background: 'linear-gradient(135deg,#0f7a4b,#15a66a)', boxShadow: '0 6px 20px rgba(15,122,75,.5)' }}>
            <Plus size={24} color="white" strokeWidth={2.5}/>
          </button>
        )

        return (
          <button key={t.path} onClick={() => navigate(t.path)}
            className="flex flex-col items-center gap-1 flex-1 py-1 transition-opacity"
            style={{ opacity: active ? 1 : 0.4 }}>
            <Icon size={22} color={active ? '#c8f26d' : '#fff'} strokeWidth={2}/>
            <span className="text-[10px] font-bold" style={{ color: active ? '#c8f26d' : '#fff' }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
