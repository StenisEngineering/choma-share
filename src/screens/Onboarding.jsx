import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { createProfile, getProfile } from '../lib/api'
import { useAuth }  from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

const CITIES = ['Sunderland','Newcastle','Leeds','Birmingham','Manchester','London','Other']

export default function Onboarding() {
  const navigate           = useNavigate()
  const toast              = useToast()
  const { refreshProfile } = useAuth()

  const [mode,     setMode]     = useState('signup')  // signup | login
  const [step,     setStep]     = useState('auth')    // auth | profile
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [name,     setName]     = useState('')
  const [city,     setCity]     = useState('')
  const [loading,  setLoading]  = useState(false)

  const G = '#0f7a4b'

  async function handleAuth(e) {
    e.preventDefault()
    if (!email.trim() || password.length < 6) return
    setLoading(true)
    try {
      if (mode === 'signup') {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) throw error
        // Check if profile exists already
        if (data.user) {
          try {
            await getProfile(data.user.id)
            await refreshProfile()
            navigate('/', { replace: true })
          } catch {
            setStep('profile')
          }
        }
      } else {
        // Log in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        if (data.user) {
          try {
            await getProfile(data.user.id)
            await refreshProfile()
            navigate('/', { replace: true })
          } catch {
            setStep('profile')
          }
        }
      }
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally { setLoading(false) }
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!name.trim()) { toast('Please enter your name', 'error'); return }
    if (!city)        { toast('Please select your city', 'error'); return }
    setLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) throw new Error('Session lost — please sign in again')
      await createProfile({ id: user.id, name: name.trim(), phone: null, city })
      await refreshProfile()
      toast('Welcome to Choma Share! 🎉', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Hero */}
      <div className="flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(170deg, #041f16 0%, #062f23 50%, #0a3d2e 100%)' }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 75% 10%, rgba(200,242,109,0.12) 0%, transparent 50%)' }}/>

        <div className="relative px-6 pt-10 pb-8 text-center">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <picture>
              <source srcSet="/logo.webp" type="image/webp"/>
              <img src="/logo.png" alt="Choma Share" width="110" height="110"
                style={{ borderRadius: '26px', boxShadow: '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)' }}/>
            </picture>
          </div>

          {/* App name */}
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '36px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-1px',
            lineHeight: 1,
            marginBottom: '8px',
          }}>
            Choma <span style={{ color: '#c8f26d' }}>Share</span>
          </h1>

          {/* Tagline */}
          <p style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#f8c85a',
            letterSpacing: '0.2px',
            marginBottom: '6px',
          }}>
            Share bulk food. Save money together.
          </p>

          {/* Description */}
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.55,
            marginBottom: '18px',
          }}>
            Find people nearby to split African<br/>food items in your area.
          </p>

          {/* Pills with SVG icons */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { label: '5 Stores · Sunderland', svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              { label: 'Free to join',           svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> },
              { label: 'No payments',            svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg> },
            ].map(p => (
              <span key={p.label} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '5px 11px',
                borderRadius: '99px',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.11)',
              }}>
                {p.svg}{p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-10 overflow-y-auto">

        {/* ── Auth step ── */}
        {step === 'auth' && (
          <form onSubmit={handleAuth}>
            {/* Toggle signup / login */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              {['signup','login'].map(m => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className="flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all"
                  style={{ background: mode===m ? '#fff' : 'transparent', color: mode===m ? '#111827' : '#6b7280', boxShadow: mode===m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  {m === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              ))}
            </div>

            <h2 className="font-display font-bold text-[22px] text-gray-900 tracking-tight mb-1">
              {mode === 'signup' ? 'Join Choma Share' : 'Welcome back'}
            </h2>
            <p className="text-[14px] text-gray-400 mb-5">
              {mode === 'signup' ? 'Create your account to start splitting.' : 'Sign in to your account.'}
            </p>

            {/* Email */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-3 focus-within:border-[#0f7a4b] transition-colors">
              <Mail size={17} color="#9ca3af"/>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" autoFocus autoComplete="email"
                className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-300"/>
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-6 focus-within:border-[#0f7a4b] transition-colors">
              <Lock size={17} color="#9ca3af"/>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Your password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-300"/>
              <button type="button" onClick={() => setShowPw(s => !s)}>
                {showPw ? <EyeOff size={17} color="#9ca3af"/> : <Eye size={17} color="#9ca3af"/>}
              </button>
            </div>

            <button type="submit" disabled={!email.trim() || password.length < 6 || loading}
              className="w-full text-white rounded-2xl py-4 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
              style={{ background: G, boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
              {loading ? <Spinner size={20} color="white"/> : <>{mode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight size={18}/></>}
            </button>
          </form>
        )}

        {/* ── Profile step ── */}
        {step === 'profile' && (
          <form onSubmit={saveProfile}>
            <div className="flex items-center gap-2 mb-5 p-3 rounded-2xl" style={{ background: '#ecfff5' }}>
              <span style={{ color: G }}>✓</span>
              <span className="text-[13px] font-semibold" style={{ color: G }}>Account created successfully!</span>
            </div>

            <h2 className="font-display font-bold text-[23px] text-gray-900 tracking-tight mb-1">Almost there 👋</h2>
            <p className="text-[14px] text-gray-400 mb-5">Your name and city so nearby shoppers can find you.</p>

            <div className="mb-5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="First name" autoFocus autoComplete="given-name"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#0f7a4b] transition-colors placeholder:text-gray-300"/>
            </div>

            <div className="mb-8">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Your city</label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => {
                  const live = c === 'Sunderland'
                  const sel  = city === c
                  return (
                    <button key={c} type="button"
                      onClick={() => setCity(c)}
                      className="py-3 rounded-xl text-[13px] font-bold transition-all relative overflow-hidden"
                      style={{
                        background: sel ? '#f0fdf4' : '#f9fafb',
                        border: `${sel ? 2 : 1.5}px solid ${sel ? G : '#e5e7eb'}`,
                        color: sel ? G : live ? '#4b5563' : '#9ca3af',
                      }}>
                      {c}
                      {live && <span className="block text-[9px] font-semibold mt-0.5" style={{color:G}}>✓ Live now</span>}
                      {!live && <span className="block text-[9px] font-semibold mt-0.5" style={{color:'#f8c85a'}}>Coming soon</span>}
                    </button>
                  )
                })}
              </div>
              {city && <p className="text-[12px] mt-2 text-center font-semibold" style={{ color: G }}>✓ {city} selected</p>}
            </div>

            <button type="submit" disabled={!name.trim() || !city || loading}
              className="w-full text-white rounded-2xl py-4 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: G, boxShadow: '0 6px 20px rgba(15,122,75,.3)' }}>
              {loading ? <Spinner size={20} color="white"/> : <>Let's go <ArrowRight size={18}/></>}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
