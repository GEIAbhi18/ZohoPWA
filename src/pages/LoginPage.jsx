import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Code2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const GOOGLE_LOGO = (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

export default function LoginPage() {
  const nav = useNavigate()
  const { signInWithGoogle, loginDeveloper } = useAuth()
  const { addNotification } = useNotifications()
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDev, setShowDev] = useState(false)
  const [devEmail, setDevEmail] = useState('')
  const [devPw, setDevPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [devLoading, setDevLoading] = useState(false)

  async function handleGoogleSignIn() {
    setErr('')
    setLoading(true)
    const res = await signInWithGoogle()
    setLoading(false)
    if (res.ok) {
      addNotification('Login Successful', 'Signed in with Google account', 'login')
      nav('/approvals')
    } else setErr(res.error)
  }

  async function handleDevLogin(e) {
    e.preventDefault()
    setErr('')
    setDevLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const res = loginDeveloper(devEmail, devPw)
    setDevLoading(false)
    if (res.ok) {
      addNotification('Developer Login', 'Signed in as Developer', 'login')
      nav('/approvals')
    } else setErr(res.error)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D2347 0%, #1B3A6B 100%)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: 22, color: 'white', margin: '0 auto 16px',
          }}>GEI</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Good Earth Infra</div>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Welcome</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>Sign in to your GEI Procurement account</p>

          {err && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'var(--red-bg)', border: '1px solid #FCA5A5', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--red-text)' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{err}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="google-signin-btn"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: '1px solid #E2E8F0', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14, fontWeight: 600, color: '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease', opacity: loading ? 0.7 : 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #E2E8F0', borderTopColor: '#1B3A6B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Signing in...
              </span>
            ) : (
              <>
                {GOOGLE_LOGO}
                Sign in with Google
              </>
            )}
          </button>

          <div style={{
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10,
            background: '#F0F7FF', padding: '6px 10px', borderRadius: 6,
          }}>
            Only <strong>@goodearthinfra.in</strong> work emails are allowed
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Developer Login Toggle */}
          <button
            onClick={() => setShowDev(!showDev)}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 10,
              border: '1px solid #E2E8F0', background: showDev ? '#F5F7FA' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 500, color: '#4A5568',
              cursor: 'pointer', transition: 'all 150ms ease',
            }}
          >
            <Code2 size={15} />
            Developer Login
          </button>

          {/* Developer Login Form */}
          {showDev && (
            <form onSubmit={handleDevLogin} style={{ marginTop: 16, animation: 'slideUp 200ms ease' }}>
              <div style={{
                padding: '16px', background: '#F8FAFC', borderRadius: 10,
                border: '1px solid #E2E8F0',
              }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Developer Email</label>
                  <input
                    className="input"
                    type="email"
                    value={devEmail}
                    onChange={e => setDevEmail(e.target.value)}
                    placeholder="developer@email.com"
                    required
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type={showPw ? 'text' : 'password'}
                      value={devPw}
                      onChange={e => setDevPw(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingRight: 40, fontSize: 13 }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={devLoading}
                  style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 600, borderRadius: 8, justifyContent: 'center' }}
                >
                  {devLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In as Developer'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          © 2025 Good Earth Infra
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .google-signin-btn:hover:not(:disabled) {
          background: #F9FAFB !important;
          border-color: #CBD5E1 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  )
}
