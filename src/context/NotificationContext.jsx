import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

/**
 * Notification types:
 * - 'approval'  → PO approved
 * - 'rejection' → PO rejected
 * - 'login'     → User logged in
 * - 'pdf'       → PDF downloaded/printed
 * - 'info'      → General info
 */

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('gei_notifications')
    return saved ? JSON.parse(saved) : []
  })
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem('gei_notifications')
    if (!saved) return 0
    return JSON.parse(saved).filter(n => !n.read).length
  })

  const addNotification = useCallback((title, description, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      title,
      description,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 50) // Keep max 50
      localStorage.setItem('gei_notifications', JSON.stringify(updated))
      return updated
    })
    setUnreadCount(c => c + 1)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('gei_notifications', JSON.stringify(updated))
      return updated
    })
    setUnreadCount(0)
  }, [])

  const markOneRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem('gei_notifications', JSON.stringify(updated))
      return updated
    })
    setUnreadCount(c => Math.max(0, c - 1))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem('gei_notifications')
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      markOneRead,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
