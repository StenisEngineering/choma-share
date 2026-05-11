import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Mail, CheckCircle } from 'lucide-react'
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

  const [step,    setStep]    = useState('email')
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [city,    setCity]    = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  // Handle magic link callback — when user clicks link in email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // Check if profile exists
        try {
          await getProfile(session.user.id)
          // Profile exists — go home
          await refreshProfile()
          navigate('/', { replace: true })
        } catch {
          // No profile yet — go to profile step
          setStep('profile')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate, refreshProfile])

  async function sendMagicLink(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin + '/onboarding',
        }
      })
      if (error) throw error
      setSent(true)
      toast('Magic link sent! Check your email.', 'success')
    } catch (err) {
      toast(err.message || 'Could not send email', 'error')
    } finally { setLoading(false) }
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!name.trim()) { toast('Please enter your name', 'error'); return }
    if (!city)        { toast('Please select your city', 'error'); return }
    setLoading(true)
    try {
      const { data: { user }, error: ue } = await supabase.auth.getUser()
      if (ue || !user) throw new Error('Session lost — please sign in again')
      await createProfile({ id: user.id, name: name.trim(), phone: null, city })
      await refreshProfile()
      toast('Welcome to Choma Share! 🎉', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally { setLoading(false) }
  }

  const G = '#0f7a4b'

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Hero */}
      <div className="px-6 pt-14 pb-8 flex-shrink-0" style={{ background: '#07130e' }}>
        <div className="mb-6">
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="url(#g)"/>
            <defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40"><stop offset="0%" stopColor="#c8f26d"/><stop offset="100%" stopColor="#f8c85a"/></linearGradient></defs>
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

      <div className="flex-1 px-6 pt-8 pb-10 overflow-y-auto">

        {/* ── Email step ── */}
        {step === 'email' && !sent && (
          <form onSubmit={sendMagicLink}>
            <h2 className="font-display font-bold text-[23px] text-gray-900 tracking-tight mb-1">Sign in</h2>
            <p className="text-[14px] text-gray-400 mb-6">Enter your email and we'll send you a magic link to sign in instantly.</p>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-3 focus-within:border-[#0f7a4b] transition-colors">
              <Mail size={18} color={G}/>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                autoComplete="email"
                className="flex-1 bg-transparent text-[16px] font-medium text-gray-900 outline-none placeholder:text-gray-300"
              />
            </div>

            <div className="flex items-start gap-2 mb-6 text-[12px] text-gray-400">
              <Shield size={13} className="mt-0.5 flex-shrink-0" color={G}/>
              We'll send a magic link — no password needed.
            </div>

            <button type="submit" disabled={!email.trim() || loading}
              className="w-full text-white rounded-2xl py-4 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: G }}>
              {loading ? <Spinner size={20} color="white"/> : <>Send magic link <ArrowRight size={18}/></>}
            </button>
          </form>
        )}

        {/* ── Sent confirmation ── */}
        {step === 'email' && sent && (
          <div className="text-center pt-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#ecfff5' }}>
              <Mail size={32} color={G}/>
            </div>
            <h2 className="font-display font-bold text-[23px] text-gray-900 tracking-tight mb-2">Check your email</h2>
            <p className="text-[15px] text-gray-500 mb-2">We sent a magic link to</p>
            <p className="text-[15px] font-bold text-gray-900 mb-6">{email}</p>
            <p className="text-[13px] text-gray-400 mb-8">Click the link in your email to sign in. It will bring you back here automatically.</p>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[13px] text-gray-500 mb-6">
              <strong className="text-gray-700">Tip:</strong> Check your spam folder if you don't see it within 1 minute.
            </div>

            <button onClick={() => setSent(false)}
              className="w-full py-3 text-[14px] font-semibold text-gray-400 border border-gray-200 rounded-2xl">
              ← Use a different email
            </button>
          </div>
        )}

        {/* ── Profile step ── */}
        {step === 'profile' && (
          <form onSubmit={saveProfile}>
            <div className="flex items-center gap-2 mb-6 p-3 rounded-2xl" style={{ background: '#ecfff5' }}>
              <CheckCircle size={18} color={G}/>
              <span className="text-[13px] font-semibold" style={{ color: G }}>Email verified successfully!</span>
            </div>

            <h2 className="font-display font-bold text-[23px] text-gray-900 tracking-tight mb-1">Almost there 👋</h2>
            <p className="text-[14px] text-gray-400 mb-5">Your name and city so nearby shoppers can find you.</p>

            <div className="mb-5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First name"
                autoFocus
                autoComplete="given-name"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#0f7a4b] transition-colors placeholder:text-gray-300"
              />
            </div>

            <div className="mb-8">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Your city</label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => (
                  <button key={c} type="button" onClick={() => setCity(c)}
                    className="py-3 rounded-xl text-[13px] font-bold transition-all"
                    style={{
                      background:  city === c ? '#f0fdf4' : '#f9fafb',
                      border:      `${city === c ? 2 : 1.5}px solid ${city === c ? G : '#e5e7eb'}`,
                      color:       city === c ? G : '#4b5563',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
              {city && <p className="text-[12px] mt-2 text-center font-semibold" style={{ color: G }}>✓ {city} selected</p>}
            </div>

            <button type="submit" disabled={!name.trim() || !city || loading}
              className="w-full text-white rounded-2xl py-4 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: G }}>
              {loading ? <Spinner size={20} color="white"/> : <>Let's go <ArrowRight size={18}/></>}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
