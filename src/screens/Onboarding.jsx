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
      <div className="px-6 pt-14 pb-8 flex-shrink-0" style={{ background: '#07130e' }}>
        <div className="mb-6">
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="url(#g)"/>
            <defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#c8f26d"/>
              <stop offset="100%" stopColor="#f8c85a"/>
            </linearGradient></defs>
            <path d="M26 14.5C24.2 13 21.8 12 19.2 12C13.6 12 9 16.5 9 22C9 27.5 13.6 32 19.2 32C21.8 32 24.2 31 26 29.5" stroke="#07130e" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="29" cy="14" r="2.5" fill="#07130e"/>
            <circle cx="29" cy="22" r="2.5" fill="#07130e"/>
            <circle cx="29" cy="30" r="2.5" fill="#07130e"/>
            <line x1="26.5" y1="15.2" x2="22" y2="19" stroke="#07130e" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="26.5" y1="22"   x2="22" y2="22" stroke="#07130e" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="26.5" y1="28.8" x2="22" y2="25" stroke="#07130e" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="font-display font-black text-4xl text-white tracking-tight leading-none mb-2">
          Choma<br/><span style={{ color: '#c8f26d' }}>Share</span>
        </h1>
        <p className="text-[14px] text-gray-400">Community bulk buying for African<br/>households in the UK.</p>
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
                {CITIES.map(c => (
                  <button key={c} type="button" onClick={() => setCity(c)}
                    className="py-3 rounded-xl text-[13px] font-bold transition-all"
                    style={{
                      background: city===c ? '#f0fdf4' : '#f9fafb',
                      border: `${city===c ? 2 : 1.5}px solid ${city===c ? G : '#e5e7eb'}`,
                      color: city===c ? G : '#4b5563',
                    }}>
                    {c}
                  </button>
                ))}
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
