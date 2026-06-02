import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

const TEST_USERS = [
  { email: 'admin@goodearth.in', password: 'Admin@123', name: 'Admin User', role: 'Administrator', initials: 'AU' },
  { email: 'manager@goodearth.in', password: 'Manager@123', name: 'Rajesh Kumar', role: 'Manager', initials: 'RK' },
  { email: 'director@goodearth.in', password: 'Director@123', name: 'Priya Sharma', role: 'Director', initials: 'PS' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gei_user')
    return saved ? JSON.parse(saved) : null
  })

  function login(email, password) {
    const found = TEST_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safe } = found
      setUser(safe)
      localStorage.setItem('gei_user', JSON.stringify(safe))
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials. Please try again.' }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('gei_user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
