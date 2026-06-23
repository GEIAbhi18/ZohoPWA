import React, { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

// Allowed emails and developer account
const ALLOWED_EMAILS = ['kanav@goodearthinfra.in']
const DEVELOPER_EMAIL = 'digitaltransformationgei@gmail.com'
const DEVELOPER_PASSWORD = 'dev@123'

function isAllowedEmail(email) {
  if (!email) return false
  if (email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase()) return true
  return ALLOWED_EMAILS.includes(email.toLowerCase())
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gei_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && isAllowedEmail(firebaseUser.email)) {
        const userData = {
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role: firebaseUser.email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase() ? 'Developer' : 'User',
          initials: getInitials(firebaseUser.displayName || firebaseUser.email.split('@')[0]),
          photoURL: firebaseUser.photoURL || null,
          authType: 'google',
        }
        setUser(userData)
        localStorage.setItem('gei_user', JSON.stringify(userData))
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Google Sign-In
  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const email = result.user.email

      if (!isAllowedEmail(email)) {
        await signOut(auth)
        return {
          ok: false,
          error: `Access denied. Only authorized users can login. (${email} is not authorized)`,
        }
      }

      const userData = {
        name: result.user.displayName || email.split('@')[0],
        email: email,
        role: email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase() ? 'Developer' : 'User',
        initials: getInitials(result.user.displayName || email.split('@')[0]),
        photoURL: result.user.photoURL || null,
        authType: 'google',
      }

      setUser(userData)
      localStorage.setItem('gei_user', JSON.stringify(userData))
      return { ok: true }
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        return { ok: false, error: 'Sign-in was cancelled.' }
      }
      return { ok: false, error: err.message || 'Google sign-in failed. Please try again.' }
    }
  }

  // Developer Login (email + password)
  function loginDeveloper(email, password) {
    if (
      email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase() &&
      password === DEVELOPER_PASSWORD
    ) {
      const userData = {
        name: 'Developer',
        email: DEVELOPER_EMAIL,
        role: 'Developer',
        initials: 'DV',
        photoURL: null,
        authType: 'developer',
      }
      setUser(userData)
      localStorage.setItem('gei_user', JSON.stringify(userData))
      return { ok: true }
    }
    return { ok: false, error: 'Invalid developer credentials.' }
  }

  // Logout
  async function logout() {
    try {
      if (user?.authType === 'google') {
        await signOut(auth)
      }
    } catch (err) {
      console.error('[Auth] Sign-out error:', err)
    }
    setUser(null)
    localStorage.removeItem('gei_user')
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, loginDeveloper, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

export const useAuth = () => useContext(AuthContext)
