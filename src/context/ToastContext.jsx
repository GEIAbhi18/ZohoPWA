import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const Icon = { success: CheckCircle, error: XCircle, info: Info }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const I = Icon[t.type] || Info
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <I size={16} />
              {t.msg}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
