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
import Support       from './screens/Support'
import Spinner       from './components/Spinner'
import IOSInstallBanner from './components/IOSInstallBanner'
import UpdateBanner    from './components/UpdateBanner'
import { initOneSignal } from './lib/onesignal'
import PullToRefresh from './components/PullToRefresh'
import './index.css'

function Guard({ children }) {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="app-loading"><Spinner/></div>
  if (!isAuthenticated || !hasProfile) return <Navigate to="/onboarding" replace/>
  return children
}

function Shell({ children }) {
  function handleRefresh() {
    window.dispatchEvent(new Event('choma-refresh'))
  }
  return (
    <div className="app-shell">
      <div className="app-inner">
        <PullToRefresh onRefresh={handleRefresh}>
          {children}
        </PullToRefresh>
        <BottomNav/>
      </div>
    </div>
  )
}

const ADMIN_EMAILS = ['engineeringstenis@gmail.com']

function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <div className="app-loading"><Spinner/></div>
  if (!isAuthenticated || !ADMIN_EMAILS.includes(user?.email)) return <AdminLogin/>
  return <Admin/>
}

function AppRoutes() {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="app-loading"><Spinner/></div>

  return (
    <Routes>
      <Route path="/onboarding" element={
        isAuthenticated && hasProfile
          ? <Navigate to="/" replace/>
          : <div className="app-onboarding">
              <div className="app-onboarding-inner">
                <Onboarding/>
              </div>
            </div>
      }/>
      <Route path="/admin"       element={<AdminRoute/>}/>
      <Route path="/split/:id"   element={<Shell><SplitDetail/></Shell>}/>
      <Route path="/"            element={<Guard><Shell><Home/></Shell></Guard>}/>
      <Route path="/splits"      element={<Guard><Shell><MySplits/></Shell></Guard>}/>
      <Route path="/create"      element={<Guard><Shell><CreateSplit/></Shell></Guard>}/>
      <Route path="/circles"     element={<Guard><Shell><Circles/></Shell></Guard>}/>
      <Route path="/stores"      element={<Guard><Shell><Stores/></Shell></Guard>}/>
      <Route path="/profile"     element={<Guard><Shell><Profile/></Shell></Guard>}/>
      <Route path="/privacy"     element={<Privacy/>}/>
      <Route path="/terms"       element={<Terms/>}/>
      <Route path="/store-portal" element={<StoreOwner/>}/>
      <Route path="/support"      element={<Guard><Shell><Support/></Shell></Guard>}/>
      <Route path="*"            element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [firstLoad]  = useState(true)

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
      <div className={`app-root ${splashDone ? 'app-visible' : 'app-hidden'}`}>
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
