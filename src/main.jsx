import React, { StrictMode, useState } from 'react'
import { createRoot }  from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider }         from './components/Toast'
import SplashScreen from './components/SplashScreen'
import BottomNav    from './components/BottomNav'
import Onboarding   from './screens/Onboarding'
import Home         from './screens/Home'
import MySplits     from './screens/MySplits'
import Stores       from './screens/Stores'
import Circles      from './screens/Circles'
import SplitDetail  from './screens/SplitDetail'
import CreateSplit   from './screens/CreateSplit'
import Profile       from './screens/Profile'
import Admin         from './screens/Admin'
import AdminLogin    from './screens/AdminLogin'
import Privacy       from './screens/Privacy'
import Terms         from './screens/Terms'
import StoreOwner    from './screens/StoreOwner'
import Spinner       from './components/Spinner'
import IOSInstallBanner from './components/IOSInstallBanner'
import UpdateBanner    from './components/UpdateBanner'
import { initOneSignal } from './lib/onesignal'
import './index.css'

function Guard({ children }) {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><Spinner/></div>
  if (!isAuthenticated || !hasProfile) return <Navigate to="/onboarding" replace/>
  return children
}

function Shell({ children }) {
  return (
    <div style={{
      height: '100vh',
      height: '100dvh',
      background: '#e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '448px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        boxShadow: '0 0 40px rgba(0,0,0,0.15)',
        height: '100%',
        overflow: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          height: 0, /* critical — forces flex child to scroll */
        }}>
          {children}
        </div>
        <BottomNav/>
      </div>
    </div>
  )
}

const ADMIN_EMAILS = ['engineeringstenis@gmail.com']

function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><Spinner/></div>
  if (!isAuthenticated || !ADMIN_EMAILS.includes(user?.email)) return <AdminLogin/>
  return <Admin/>
}

function AppRoutes() {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><Spinner/></div>

  return (
    <Routes>
      <Route path="/onboarding" element={
        isAuthenticated && hasProfile
          ? <Navigate to="/" replace/>
          : <div style={{ height:'100vh', height:'100dvh', background:'#f3f4f6', display:'flex', alignItems:'flex-start', justifyContent:'center', overflow:'hidden' }}>
              <div style={{ width:'100%', maxWidth:'448px', background:'white', height:'100%', overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
                <Onboarding/>
              </div>
            </div>
      }/>
      <Route path="/admin"     element={<AdminRoute/>}/>
      <Route path="/split/:id" element={<Shell><SplitDetail/></Shell>}/>
      <Route path="/"          element={<Guard><Shell><Home/></Shell></Guard>}/>
      <Route path="/splits"    element={<Guard><Shell><MySplits/></Shell></Guard>}/>
      <Route path="/create"    element={<Guard><Shell><CreateSplit/></Shell></Guard>}/>
      <Route path="/circles"   element={<Guard><Shell><Circles/></Shell></Guard>}/>
      <Route path="/stores"    element={<Guard><Shell><Stores/></Shell></Guard>}/>
      <Route path="/profile"   element={<Guard><Shell><Profile/></Shell></Guard>}/>
      <Route path="/privacy"    element={<Privacy/>}/>
      <Route path="/terms"      element={<Terms/>}/>
      <Route path="/store-portal" element={<StoreOwner/>}/>
      <Route path="*"          element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [firstLoad]  = useState(true)

  // Init OneSignal on mount
  React.useEffect(() => {
    initOneSignal().catch(console.error)
  }, [])

  return (
    <>
      {firstLoad && !splashDone && (
        <SplashScreen onDone={() => setSplashDone(true)}/>
      )}
      <IOSInstallBanner/>
      <UpdateBanner/>
      <div style={{
        opacity: splashDone ? 1 : 0,
        transition: 'opacity 0.3s ease',
        height: '100vh',
        height: '100dvh',
        overflow: 'hidden',
      }}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes/>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>
)
