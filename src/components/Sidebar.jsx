import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, CheckSquare, FileText, Package,
  ClipboardList, Box, Folder, Search, FileStack, FileSignature,
  Warehouse, Settings, ChevronDown, X, BarChart2, DollarSign, Monitor
} from 'lucide-react'

const NAV = [
  {
    id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard',
    children: [
      { label: 'Procurement Dashboard', path: '/dashboard' },
      { label: 'Finance Dashboard', path: '/dashboard/finance' },
      { label: 'VMS Dashboard', path: '/dashboard/vms' },
    ]
  },
  {
    id: 'purchase-request', label: 'Purchase Request', icon: ShoppingCart, path: '/purchase-request',
    children: [
      { label: 'My Dashboard', path: '/purchase-request/my-dashboard', external: 'https://creatorapp.zoho.in/kanav_goodearthinfra/good-earth-infra-procurement#Page:My_Dashboard' },
      { label: 'My Requests', path: '/purchase-request/my-requests', external: 'https://creatorapp.zoho.in/kanav_goodearthinfra/good-earth-infra-procurement#Report:My_Requests1' },
      { label: 'All Requests', path: '/purchase-request/all-requests', external: 'https://creatorapp.zoho.in/kanav_goodearthinfra/good-earth-infra-procurement#Report:All_Requests' },
      { label: 'Purchase Orders', path: '/purchase-request/purchase-orders', external: 'https://creatorapp.zoho.in/kanav_goodearthinfra/good-earth-infra-procurement#Report:Purchase_Orders' },
    ]
  },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare, path: '/approvals' },
  { id: 'requests', label: 'Requests', icon: FileText, path: '/requests' },
  { id: 'procurements', label: 'Procurements', icon: Package, path: '/procurements' },
  { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/orders' },
  { id: 'products', label: 'Products', icon: Box, path: '/products' },
  { id: 'projects', label: 'Projects', icon: Folder, path: '/projects' },
  { id: 'screening', label: 'Screening', icon: Search, path: '/screening' },
  { id: 'rfp', label: 'RFP', icon: FileStack, path: '/rfp' },
  { id: 'contracts', label: 'Contracts', icon: FileSignature, path: '/contracts' },
  {
    id: 'inventory', label: 'Inventory', icon: Warehouse, path: '/inventory',
    children: [
      { label: 'Warehouses', path: '/inventory/warehouses' },
      { label: 'Warehouse Requests', path: '/inventory/warehouse-requests' },
    ]
  },
  {
    id: 'setup', label: 'Setup', icon: Settings, path: '/setup',
    children: [
      { label: 'Vendors', path: '/setup/vendors' },
      { label: 'Products', path: '/setup/products' },
      { label: 'Users', path: '/setup/users' },
      { label: 'Approval Setup', path: '/setup/approval-setup' },
      { label: 'Preferences', path: '/setup/preferences' },
      { label: 'Vendor Preferences', path: '/setup/vendor-preferences' },
    ]
  },
]

export default function Sidebar({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(() => {
    const active = NAV.find(n => location.pathname.startsWith(n.path))
    return active?.children ? { [active.id]: true } : { dashboard: true }
  })

  function toggle(id) {
    setOpen(o => ({ ...o, [id]: !o[id] }))
  }

  function isActive(item) {
    if (item.children) return item.children.some(c => location.pathname === c.path) || location.pathname === item.path
    return location.pathname === item.path
  }

  function handleNav(item, child) {
    if (child?.external) {
      window.open(child.external, '_blank')
      onClose?.()
      return
    }
    const path = child ? child.path : item.path
    navigate(path)
    onClose?.()
  }

  return (
    <nav style={{
      width: 'var(--sidebar-w)', background: '#1B3A6B', height: '100%',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0,
        }}>GEI</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Good Earth Infra</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>Procurement</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
        {NAV.map(item => {
          const Icon = item.icon
          const active = isActive(item)
          const expanded = open[item.id]
          const hasChildren = !!item.children

          return (
            <div key={item.id}>
              <button
                onClick={() => hasChildren ? toggle(item.id) : handleNav(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 16px', background: active && !hasChildren ? 'rgba(255,255,255,0.13)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderLeft: active && !hasChildren ? '3px solid rgba(255,255,255,0.7)' : '3px solid transparent',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!active || hasChildren) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!active || hasChildren) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={16} color={active && !hasChildren ? 'white' : 'rgba(255,255,255,0.55)'} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: active && !hasChildren ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: active && !hasChildren ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {hasChildren && (
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
                )}
              </button>

              {hasChildren && expanded && (
                <div style={{ paddingBottom: 4 }}>
                  {item.children.map(child => {
                    const childActive = location.pathname === child.path
                    return (
                      <button
                        key={child.path}
                        onClick={() => handleNav(item, child)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 16px 7px 42px',
                          background: childActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          borderLeft: childActive ? '3px solid rgba(255,255,255,0.5)' : '3px solid transparent',
                        }}
                        onMouseEnter={e => { if (!childActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                        onMouseLeave={e => { if (!childActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        <span style={{ fontSize: 12, color: childActive ? 'white' : 'rgba(255,255,255,0.55)', fontWeight: childActive ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {child.label}
                        </span>
                        {child.external && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>↗</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
