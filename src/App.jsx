import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ApprovalsProvider } from './context/ApprovalsContext'
import { ToastProvider } from './context/ToastContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './pages/DashboardLayout'
import BlankPage from './pages/BlankPage'
import ApprovalsPage from './components/ApprovalsPage'
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
  ['/procurements', 'Procurements'],
  ['/orders', 'Orders'],
  ['/products', 'Products'],
  ['/projects', 'Projects'],
  ['/screening', 'Screening'],
  ['/rfp', 'RFP'],
  ['/contracts', 'Contracts'],
  ['/inventory', 'Inventory'],
  ['/inventory/warehouses', 'Warehouses'],
  ['/inventory/warehouse-requests', 'Warehouse Requests'],
  ['/setup', 'Setup'],
  ['/setup/vendors', 'Vendors'],
  ['/setup/products', 'Setup — Products'],
  ['/setup/users', 'Users'],
  ['/setup/approval-setup', 'Approval Setup'],
  ['/setup/preferences', 'Preferences'],
  ['/setup/vendor-preferences', 'Vendor Preferences'],
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

      {/* Dashboard sub-routes */}
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />

      {/* Approvals — the main active page */}
      <Route path="/approvals" element={
        <ProtectedRoute>
          <PageWrapper><ApprovalsPage /></PageWrapper>
        </ProtectedRoute>
      } />

      {/* All other stub pages */}
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
      <ApprovalsProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </ApprovalsProvider>
    </AuthProvider>
  )
}
