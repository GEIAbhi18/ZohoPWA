import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'
import ApprovalsPage from '../components/ApprovalsPage'
import BlankPage from './BlankPage'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ flexShrink: 0, height: '100%', overflow: 'hidden' }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div style={{ width: 'var(--sidebar-w)', height: '100%', animation: 'slideIn 200ms ease' }}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<BlankPage title="Procurement Dashboard" />} />
            <Route path="/finance" element={<BlankPage title="Finance Dashboard" />} />
            <Route path="/vms" element={<BlankPage title="VMS Dashboard" />} />
          </Routes>
        </main>
      </div>

      <style>{`
        .sidebar-desktop { width: var(--sidebar-w); }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>
    </div>
  )
}
