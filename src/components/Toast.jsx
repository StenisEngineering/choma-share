import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'info', ms = 2800) => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms)
  }, [])

  const bg = { info: 'bg-gray-900', success: 'bg-green', error: 'bg-red-500' }

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="fixed bottom-24 inset-x-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4">
        {toasts.map(t => (
          <div key={t.id} className={`${bg[t.type] ?? bg.info} text-white px-5 py-2.5 rounded-full text-[17px] font-semibold shadow-lg animate-fade-up`}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
