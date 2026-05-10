import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider }         from './components/Toast'
import BottomNav   from './components/BottomNav'
import Onboarding  from './screens/Onboarding'
import Home        from './screens/Home'
import SplitDetail from './screens/SplitDetail'
import CreateSplit  from './screens/CreateSplit'
import Profile      from './screens/Profile'
import Spinner      from './components/Spinner'
import './index.css'

function Guard({ children }) {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><Spinner/></div>
  if (!isAuthenticated || !hasProfile) return <Navigate to="/onboarding" replace/>
  return children
}

function Shell({ children }) {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-hidden">{children}</div>
      <BottomNav/>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><Spinner/></div>

  return (
    <Routes>
      <Route path="/onboarding" element={isAuthenticated && hasProfile ? <Navigate to="/" replace/> : <Onboarding/>}/>
      <Route path="/split/:id"  element={<Shell><SplitDetail/></Shell>}/>
      <Route path="/"           element={<Guard><Shell><Home/></Shell></Guard>}/>
      <Route path="/splits"     element={<Guard><Shell><Home/></Shell></Guard>}/>
      <Route path="/create"     element={<Guard><Shell><CreateSplit/></Shell></Guard>}/>
      <Route path="/stores"     element={<Guard><Shell><Home/></Shell></Guard>}/>
      <Route path="/profile"    element={<Guard><Shell><Profile/></Shell></Guard>}/>
      <Route path="*"           element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes/>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
