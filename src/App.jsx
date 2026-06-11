import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ApprovalsProvider } from './context/ApprovalsContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import BlankPage from './pages/BlankPage'
import ApprovalsPage from './components/ApprovalsPage'
import OrdersPage from './components/OrdersPage'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PageWrapper({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div className="sidebar-desktop" style={{ flexShrink: 0, height: '100%', overflow: 'hidden' }}>
        <Sidebar />
      </div>
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div style={{ width: 'var(--sidebar-w)', height: '100%' }}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <style>{`.sidebar-desktop{width:var(--sidebar-w)}@media(max-width:768px){.sidebar-desktop{display:none}}`}</style>
    </div>
  )
}

const stubRoutes = [
  ['/requests', 'Requests'],
  ['/purchase-request', 'Purchase Request'],
  ['/purchase-request/my-dashboard', 'My Dashboard'],
  ['/purchase-request/my-requests', 'My Requests'],
  ['/purchase-request/all-requests', 'All Requests'],
  ['/purchase-request/purchase-orders', 'Purchase Orders'],
]

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/approvals" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/approvals" replace /> : <LoginPage />} />

      {/* Approvals — the main active page */}
      <Route path="/approvals" element={
        <ProtectedRoute>
          <PageWrapper><ApprovalsPage /></PageWrapper>
        </ProtectedRoute>
      } />

      {/* Orders — shows approved POs */}
      <Route path="/orders" element={
        <ProtectedRoute>
          <PageWrapper><OrdersPage /></PageWrapper>
        </ProtectedRoute>
      } />

      {/* Remaining stub pages */}
      {stubRoutes.map(([path, title]) => (
        <Route key={path} path={path} element={
          <ProtectedRoute>
            <PageWrapper><BlankPage title={title} /></PageWrapper>
          </ProtectedRoute>
        } />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ApprovalsProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </ApprovalsProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
