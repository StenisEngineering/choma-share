import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={20} color="#6b7280"/>
        </button>
        <h1 className="font-display font-bold text-[18px] text-gray-900">Privacy Policy</h1>
      </div>
      <div className="px-5 py-5 max-w-2xl mx-auto prose prose-sm text-gray-600">
        <p className="text-[12px] text-gray-400 mb-4">Last updated: May 2026 · © Creovate Global Ltd</p>

        <Section title="1. Who We Are">
          Choma Share is a product of Creovate Global Ltd, based in Sunderland, United Kingdom. We built Choma Share to help African households in the UK coordinate bulk grocery purchases together.
          Contact: hello@choma.app
        </Section>

        <Section title="2. What Information We Collect">
          When you sign up we collect your name, email address, and city. When you create or join a split we store the split details including item, store, date, and member list. We do not collect payment information — all payments are made directly to stores.
        </Section>

        <Section title="3. How We Use Your Information">
          We use your information to match you with nearby shoppers for bulk splits, show your name and city to other split members, calculate your reliability score, and send you notifications about splits you have joined or created.
        </Section>

        <Section title="4. Who We Share It With">
          Your name and city are visible to other members of splits you join. We do not sell your data to third parties. We use Supabase to store your data securely.
        </Section>

        <Section title="5. Data Storage">
          Your data is stored on Supabase servers located in the European Union. We retain your data for as long as your account is active. You can request deletion at any time by emailing hello@choma.app.
        </Section>

        <Section title="6. Your Rights">
          Under UK GDPR you have the right to access your data, correct inaccurate data, request deletion of your data, and object to processing. Contact hello@choma.app to exercise any of these rights.
        </Section>

        <Section title="7. Cookies">
          We use only essential cookies required for authentication. We do not use advertising or tracking cookies.
        </Section>

        <Section title="8. Changes">
          We may update this policy from time to time. We will notify you of significant changes through the app.
        </Section>

        <Section title="9. Contact">
          For any privacy concerns contact us at hello@choma.app or write to Creovate Global Ltd, Sunderland, United Kingdom.
        </Section>
      </div>

      {/* Footer */}
      <div className="px-5 py-6 border-t border-gray-100 text-center">
        <p className="text-[11px] text-gray-300">© 2026 Creovate Global Ltd. All rights reserved.</p>
        <p className="text-[11px] text-gray-300 mt-1">Choma Share · share.choma.app</p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="font-display font-bold text-[15px] text-gray-900 mb-1.5">{title}</h2>
      <p className="text-[13px] text-gray-600 leading-relaxed">{children}</p>
    </div>
  )
}
