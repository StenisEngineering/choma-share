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
import Spinner       from './components/Spinner'
import './index.css'

function Guard({ children }) {
  const { isAuthenticated, hasProfile, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><Spinner/></div>
  if (!isAuthenticated || !hasProfile) return <Navigate to="/onboarding" replace/>
  return children
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col bg-white shadow-xl min-h-screen relative">
        <div className="flex-1 overflow-y-auto scrollbar-none">
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
          : <div className="min-h-screen bg-gray-100 flex items-start justify-center py-0 md:py-8">
              <div className="w-full max-w-md bg-white md:rounded-3xl md:shadow-xl overflow-hidden min-h-screen md:min-h-0">
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
      <Route path="*"          element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [firstLoad]  = useState(true)

  return (
    <>
      {firstLoad && !splashDone && (
        <SplashScreen onDone={() => setSplashDone(true)}/>
      )}
      <div style={{
        opacity: splashDone ? 1 : 0,
        transition: 'opacity 0.3s ease',
        minHeight: '100vh',
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
