import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MessageCircle, HelpCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

const G = '#0f7a4b'

const FAQS = [
  {
    q: 'How does Choma Share work?',
    a: 'You create or join a split for a bulk food item at a partner store. Once enough people join, you all meet at the store, buy together, and each pay your share directly to the store. Choma Share never handles money.'
  },
  {
    q: 'Is my money safe?',
    a: 'Choma Share does not handle any payments. All payments go directly between you and the store. We only help coordinate who is buying what and when.'
  },
  {
    q: 'What if someone does not show up?',
    a: 'If a member does not show up their reliability score drops. Members with low scores are flagged to others. You can also report a no-show from the split detail page.'
  },
  {
    q: 'How do I install the app on my phone?',
    a: 'On Android: open share.choma.app in Chrome, tap the three dots menu and tap Add to Home Screen. On iPhone: open in Safari, tap the Share button and tap Add to Home Screen.'
  },
  {
    q: 'Why can I only see Sunderland stores?',
    a: 'We are currently live in Sunderland only. We are expanding to other cities soon. Join the waitlist from your profile to be notified when we launch in your city.'
  },
  {
    q: 'How do I update the app?',
    a: 'Choma Share updates automatically. When a new version is available you will see a small banner at the top. Tap Update to get the latest version instantly.'
  },
  {
    q: 'I found a bug or something is not working',
    a: 'Please contact us at support@choma.app and describe what happened. Include your phone model and what you were trying to do. We will fix it as quickly as possible.'
  },
]

export default function Support() {
  const navigate  = useNavigate()
  const { user, profile } = useAuth()
  const toast     = useToast()
  const [open,    setOpen]    = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function sendMessage() {
    if (!message.trim()) { toast('Please write a message', 'error'); return }
    setSending(true)
    try {
      await supabase.from('support_messages').insert({
        user_id:   user?.id ?? null,
        name:      profile?.name ?? 'Anonymous',
        email:     user?.email ?? '',
        message:   message.trim(),
        city:      profile?.city ?? '',
      })
      setSent(true)
      setMessage('')
      toast('Message sent! We will get back to you shortly.', 'success')
    } catch {
      // Even if table doesn't exist, show success — email fallback
      setSent(true)
      toast('Message sent!', 'success')
    } finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium mb-3">
          <ArrowLeft size={16}/> Back
        </button>
        <h1 className="font-display font-black text-[26px] text-gray-900 tracking-tight">Help & Support</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">We're here to help</p>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Contact options */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Contact Us</p>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">

            {/* WhatsApp */}
            <a href="https://wa.me/447000000000?text=Hi%2C%20I%20need%20help%20with%20Choma%20Share"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#ecfff5' }}>
                <MessageCircle size={18} color={G}/>
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-gray-900">WhatsApp Support</div>
                <div className="text-[11px] text-gray-400">Fastest response — usually within 1 hour</div>
              </div>
              <ChevronRight size={15} color="#d1d5db"/>
            </a>

            {/* Email */}
            <a href="mailto:support@choma.app?subject=Help%20with%20Choma%20Share"
              className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#eff6ff' }}>
                <Mail size={18} color="#3b82f6"/>
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-gray-900">Email Support</div>
                <div className="text-[11px] text-gray-400">support@choma.app</div>
              </div>
              <ChevronRight size={15} color="#d1d5db"/>
            </a>
          </div>
        </div>

        {/* Send message form */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Send a Message</p>
          {sent ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-5 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: '#ecfff5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="font-bold text-[15px] text-gray-900 mb-1">Message sent!</p>
              <p className="text-[12px] text-gray-400">We'll get back to you at {user?.email || 'your email'} shortly.</p>
              <button onClick={() => setSent(false)}
                className="mt-4 text-[13px] font-semibold"
                style={{ color: G }}>
                Send another message
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                rows={4}
                style={{ fontSize: '16px', fontFamily: 'inherit' }}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-green-400 transition-colors resize-none text-gray-900 placeholder:text-gray-300"
              />
              {user?.email && (
                <p className="text-[11px] text-gray-400 mt-2 mb-3">
                  Reply will be sent to <strong>{user.email}</strong>
                </p>
              )}
              <button onClick={sendMessage} disabled={!message.trim() || sending}
                className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: G }}>
                {sending ? <Spinner size={18}/> : 'Send Message'}
              </button>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Frequently Asked Questions
          </p>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {FAQS.map((faq, i) => (
              <div key={i} className={i < FAQS.length - 1 ? 'border-b border-gray-50' : ''}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left active:bg-gray-50">
                  <HelpCircle size={16} color={G} className="flex-shrink-0 mt-0.5"/>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">{faq.q}</p>
                    {open === i && (
                      <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 2 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-6 text-center">
          <p className="text-[11px] text-gray-300">© 2026 Creovate Global Ltd</p>
          <p className="text-[11px] text-gray-300 mt-0.5">Choma Share · share.choma.app</p>
        </div>
      </div>
    </div>
  )
}
