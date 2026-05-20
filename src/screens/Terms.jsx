import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={20} color="#6b7280"/>
        </button>
        <h1 className="font-display font-bold text-[21px] text-gray-900">Terms of Service</h1>
      </div>
      <div className="px-5 py-5 max-w-2xl mx-auto">
        <p className="text-[17px] text-gray-400 mb-4">Last updated: May 2026 · © Creovate Global Ltd</p>

        <Section title="1. What Choma Share Does">
          Choma Share is a coordination platform that helps people organise bulk grocery purchases together. We connect shoppers — we do not sell goods, handle payments, or provide delivery services.
        </Section>

        <Section title="2. Your Responsibilities">
          You must be 18 or over to use Choma Share. You are responsible for showing up to splits you join. Repeated no-shows will reduce your reliability score. You agree to pay the store directly for your share of any split you join.
        </Section>

        <Section title="3. Payments">
          Choma Share does not process any payments. All payments are made directly between you and the store. We are not liable for any payment disputes between users or between users and stores.
        </Section>

        <Section title="4. Reliability Score">
          We track your attendance at splits. Users who repeatedly fail to show up may have their accounts restricted. Organisers may decline members with low reliability scores.
        </Section>

        <Section title="5. Safety">
          All splits take place at verified partner stores in public locations. You should only join splits with people you are comfortable meeting. Choma Share is not responsible for any disputes between members.
        </Section>

        <Section title="6. Store Listings">
          Stores listed on Choma Share are independent businesses. We do not guarantee stock availability or pricing. Prices shown are subject to change and should be confirmed with the store.
        </Section>

        <Section title="7. Account Termination">
          We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent behaviour, or repeatedly fail to honour split commitments.
        </Section>

        <Section title="8. Limitation of Liability">
          Choma Share is provided as-is. We are not liable for any losses arising from the use of the platform, failed splits, or disputes between members.
        </Section>

        <Section title="9. Governing Law">
          These terms are governed by the laws of England and Wales.
        </Section>

        <Section title="10. Contact">
          For any questions about these terms contact hello@choma.app
        </Section>
      </div>

      {/* Footer */}
      <div className="px-5 py-6 border-t border-gray-100 text-center">
        <p className="text-[17px] text-gray-300">© 2026 Creovate Global Ltd. All rights reserved.</p>
        <p className="text-[17px] text-gray-300 mt-1">Choma Share · share.choma.app</p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="font-display font-bold text-[17px] text-gray-900 mb-1.5">{title}</h2>
      <p className="text-[17px] text-gray-600 leading-relaxed">{children}</p>
    </div>
  )
}
