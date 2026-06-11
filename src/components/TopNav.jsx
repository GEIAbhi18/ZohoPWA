import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, Settings, CheckCircle, XCircle, LogIn, FileDown, Info, Trash2, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const NOTIF_ICONS = {
  approval: { icon: CheckCircle, color: '#16A34A', bg: '#DCFCE7' },
  rejection: { icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
  login: { icon: LogIn, color: '#2563EB', bg: '#DBEAFE' },
  pdf: { icon: FileDown, color: '#7C3AED', bg: '#EDE9FE' },
  info: { icon: Info, color: '#1B3A6B', bg: '#E8F0FE' },
}

function timeAgo(timestamp) {
  const now = new Date()
  const t = new Date(timestamp)
  const diff = Math.floor((now - t) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return t.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAllRead, markOneRead, clearAll } = useNotifications()
  const navigate = useNavigate()

  const [ddOpen, setDdOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const userRef = useRef(null)
  const bellRef = useRef(null)

  useEffect(() => {
    function click(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setDdOpen(false)
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
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

        {/* ── Notification Bell ── */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setBellOpen(!bellOpen)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                minWidth: 16, height: 16, borderRadius: '50%',
                background: 'var(--red)', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: 'white', padding: '0 3px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 360, maxWidth: 'calc(100vw - 32px)',
              background: 'white', border: '1px solid var(--border)', borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 999,
              animation: 'slideUp 150ms ease',
            }}>
              {/* Header */}
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                      background: 'var(--red)', color: 'white',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 11, color: 'var(--blue)', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px',
                        borderRadius: 4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => { clearAll(); setBellOpen(false) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px',
                        borderRadius: 4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <Bell size={28} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.4 }} />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>No notifications yet</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Activity will appear here</div>
                  </div>
                ) : (
                  notifications.map(n => {
                    const config = NOTIF_ICONS[n.type] || NOTIF_ICONS.info
                    const Icon = config.icon
                    return (
                      <button
                        key={n.id}
                        onClick={() => { markOneRead(n.id) }}
                        style={{
                          width: '100%', display: 'flex', gap: 10, padding: '12px 16px',
                          background: n.read ? 'white' : '#F8FAFF',
                          border: 'none', borderBottom: '1px solid #F0F0F0',
                          cursor: 'pointer', textAlign: 'left', transition: 'background 100ms',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'white' : '#F8FAFF'}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, background: config.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={16} color={config.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: n.read ? 500 : 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {n.description}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, opacity: 0.7 }}>
                            {timeAgo(n.timestamp)}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button onClick={() => setDdOpen(!ddOpen)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            background: ddOpen ? 'var(--surface)' : 'transparent', border: '1px solid transparent',
            borderRadius: 8, cursor: 'pointer', transition: 'all 150ms',
          }}
            onMouseEnter={e => { if (!ddOpen) e.currentTarget.style.background = 'var(--surface)' }}
            onMouseLeave={e => { if (!ddOpen) e.currentTarget.style.background = 'transparent' }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--navy)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0,
              }}>
                {user?.initials || 'U'}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.role || 'User'}</div>
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
