import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [ddOpen, setDdOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function click(e) { if (ref.current && !ref.current.contains(e.target)) setDdOpen(false) }
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header style={{
      height: 'var(--topnav-h)', background: 'white', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0, zIndex: 100,
    }}>
      {/* Hamburger — mobile only */}
      <button className="btn-icon" onClick={onMenuClick} style={{ display: 'none' }} id="hamburger">
        <Menu size={20} />
      </button>

      {/* Title area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'none' }} id="app-title">GEI Procurement</span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn-icon" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', border: '1.5px solid white' }} />
        </button>

        {/* User dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button onClick={() => setDdOpen(!ddOpen)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            background: ddOpen ? 'var(--surface)' : 'transparent', border: '1px solid transparent',
            borderRadius: 8, cursor: 'pointer', transition: 'all 150ms',
          }}
            onMouseEnter={e => { if (!ddOpen) e.currentTarget.style.background = 'var(--surface)' }}
            onMouseLeave={e => { if (!ddOpen) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: 'var(--navy)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0,
            }}>
              {user?.initials || 'AU'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user?.name || 'Admin User'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.role || 'Administrator'}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transform: ddOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 150ms' }} />
          </button>

          {ddOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 180,
              background: 'white', border: '1px solid var(--border)', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 999,
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              {[
                { icon: User, label: 'My Profile', action: () => {} },
                { icon: Settings, label: 'Settings', action: () => {} },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={() => { action(); setDdOpen(false) }} style={{
                  width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--red)', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #hamburger { display: flex !important; }
          #app-title { display: block !important; }
        }
      `}</style>
    </header>
  )
}
