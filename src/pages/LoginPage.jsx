import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const res = login(email, pw)
    setLoading(false)
    if (res.ok) nav('/approvals')
    else setErr(res.error)
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>Sign in to your GEI Procurement account</p>

          {err && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--red-bg)', border: '1px solid #FCA5A5', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--red-text)' }}>
              <AlertCircle size={15} />
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@goodearth.in" required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, borderRadius: 10, justifyContent: 'center' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          {/* Test creds */}
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#1D4ED8' }}>
              <Info size={13} /> Test Credentials
            </div>
            {[
              ['admin@goodearth.in', 'Admin@123'],
              ['manager@goodearth.in', 'Manager@123'],
              ['director@goodearth.in', 'Director@123'],
            ].map(([e, p]) => (
              <div key={e} style={{ fontSize: 11, color: '#1E40AF', marginBottom: 4, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => { setEmail(e); setPw(p) }}>
                <span>{e}</span><span style={{ fontFamily: 'var(--mono)', opacity: 0.7 }}>{p}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#60A5FA', marginTop: 6 }}>Click a row to auto-fill</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          © 2025 Good Earth Infra
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
