import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const ADMIN_EMAILS = ['engineeringstenis@gmail.com']

export default function AdminLogin() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error

      if (!ADMIN_EMAILS.includes(data.user?.email)) {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin only.')
      }

      toast('Welcome back, Admin 👋', 'success')
      navigate('/admin')
    } catch (err) {
      toast(err.message || 'Login failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(145deg,#062f23,#0a4a35)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(200,242,109,0.15)', border: '1px solid rgba(200,242,109,0.3)' }}>
            <ShieldCheck size={32} color="#c8f26d"/>
          </div>
          <h1 className="font-display font-black text-[25px] text-white tracking-tight">Admin Panel</h1>
          <p className="text-[17px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Choma Share · Restricted Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-6 py-6 space-y-3">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-[#0f7a4b] transition-colors">
            <Mail size={17} color="#9ca3af"/>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Admin email"
              autoFocus
              autoComplete="email"
              className="flex-1 bg-transparent text-[17px] font-medium text-gray-900 outline-none placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-[#0f7a4b] transition-colors">
            <Lock size={17} color="#9ca3af"/>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="flex-1 bg-transparent text-[17px] font-medium text-gray-900 outline-none placeholder:text-gray-300"
            />
            <button type="button" onClick={() => setShowPw(s => !s)}>
              {showPw ? <EyeOff size={17} color="#9ca3af"/> : <Eye size={17} color="#9ca3af"/>}
            </button>
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !password || loading}
            className="w-full text-white rounded-2xl py-4 text-[17px] font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ background: '#0f7a4b', boxShadow: '0 6px 20px rgba(15,122,75,0.3)' }}>
            {loading ? <Spinner size={20} color="white"/> : (
              <><ShieldCheck size={18}/> Sign in as Admin</>
            )}
          </button>
        </form>

        <p className="text-center text-[17px] text-gray-400 pb-5">
          Restricted to authorised users only
        </p>
      </div>
    </div>
  )
}
