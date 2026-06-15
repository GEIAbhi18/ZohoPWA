import React, { useState, useMemo } from 'react'
import { Search, Download, Eye, RefreshCw, FileText, Loader2, Clock, CheckCircle2, Truck, PackageCheck, ClipboardList, ExternalLink } from 'lucide-react'
import { useApprovals } from '../context/ApprovalsContext'
import PODocumentModal from './PODocumentModal'

const TABS = ['Open Orders', 'Dispatched Orders', 'Redispatched Orders', 'Received Orders', 'All Orders']
const STATUSES = ['All', 'Order Confirmed', 'Dispatched', 'Received', 'Completed']

function fmt(n) { return '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export default function OrdersPage() {
  const { orders: allOrders, loading, refetch } = useApprovals()

  // Only show approved orders in the Orders page
  const approvedOrders = useMemo(() =>
    allOrders.filter(o => o.status === 'Approved').map((o, i) => ({
      ...o,
      orderStatus: 'Order Confirmed',
      poNumber: o.orderId,
      requestId: o.requestId || `PR-${1000 - i}`,
    })),
    [allOrders]
  )

  const [tab, setTab] = useState('Open Orders')
  const [search, setSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [shippingFilter, setShippingFilter] = useState('')
  const [viewPODoc, setViewPODoc] = useState(null)

  const uniqueVendors = useMemo(() => [...new Set(approvedOrders.map(o => o.vendor).filter(Boolean))], [approvedOrders])
  const uniqueShipping = useMemo(() => {
    const addresses = approvedOrders
      .map(o => o.billingAddress || o.shippingAddress)
      .filter(Boolean)
    return [...new Set(addresses)]
  }, [approvedOrders])

  const filtered = useMemo(() => {
    return approvedOrders.filter(o => {
      const s = search.toLowerCase()
      if (s && !o.orderId.toLowerCase().includes(s) && !o.vendor.toLowerCase().includes(s) && !(o.requestId || '').toLowerCase().includes(s)) return false
      if (vendorFilter && o.vendor !== vendorFilter) return false
      if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false
      if (shippingFilter && (o.billingAddress || o.shippingAddress) !== shippingFilter) return false
      return true
    })
  }, [approvedOrders, search, vendorFilter, statusFilter, shippingFilter])

  // Stats
  const stats = useMemo(() => ({
    pending: 0,
    approved: approvedOrders.length,
    ongoing: 0,
    completed: 0,
    total: approvedOrders.length,
  }), [approvedOrders])

  const statCards = [
    { label: 'Pending Orders', value: stats.pending, icon: Clock, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Approved Orders', value: stats.approved, icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Ongoing Orders', value: stats.ongoing, icon: Truck, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Orders Completed', value: stats.completed, icon: PackageCheck, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Total Orders', value: stats.total, icon: ClipboardList, color: '#1B3A6B', bg: '#E8F0FE' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Purchase Orders</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>View approved purchase orders and PO documents</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh">
            <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="orders-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {statCards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={20} color={c.color} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{c.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap' }}>{c.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main card */}
      <div className="card">
        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '13px 20px', fontSize: 13, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--navy)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid var(--navy)' : '2px solid transparent',
              whiteSpace: 'nowrap', transition: 'color 150ms',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters bar */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Request ID/Order ID" style={{ paddingLeft: 32, fontSize: 12 }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Filter By:</span>
          <select className="select" value={shippingFilter} onChange={e => setShippingFilter(e.target.value)} style={{ fontSize: 12, flex: '0 1 160px' }}>
            <option value="">- Shipping To -</option>
            {uniqueShipping.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="select" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={{ fontSize: 12, flex: '0 1 160px' }}>
            <option value="">- Vendor -</option>
            {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 12, flex: '0 1 130px' }}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? '- Status -' : s}</option>)}
          </select>
        </div>

        {/* Export */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm">
            <Download size={13} /> Export
          </button>
        </div>

        {/* Loading state */}
        {loading && approvedOrders.length === 0 && (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Loading orders…</div>
          </div>
        )}

        {/* Desktop Table */}
        {(!loading || approvedOrders.length > 0) && (
          <div className="orders-desktop-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Project', 'Vendor', 'Net Total', 'Shipping Address', 'Status', 'Reference Document', 'PO Document'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      No approved orders found
                    </td>
                  </tr>
                ) : filtered.map((o, i) => (
                  <tr key={o.id} style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'white' : 'transparent',
                    transition: 'background 100ms',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontSize: 12, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.products || o.project || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: 12 }}>{o.vendor}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{fmt(o.amount)}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: 12, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.billingAddress || o.shippingAddress || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: '#DCFCE7', color: '#15803D',
                      }}>
                        Order Confirmed
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {o.referenceDocument ? (
                        <a
                          href={o.referenceDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn orders-ref-doc-btn"
                          style={{
                            padding: '6px 14px', fontSize: 12, fontWeight: 500,
                            background: '#EBF5FF', color: '#1B3A6B', border: '1px solid #B3D4FC',
                            borderRadius: 6, cursor: 'pointer', transition: 'all 150ms',
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            textDecoration: 'none',
                          }}
                        >
                          <FileText size={13} />
                          Reference Document
                          <ExternalLink size={11} style={{ opacity: 0.6 }} />
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        className="btn orders-po-doc-btn"
                        onClick={() => setViewPODoc(o)}
                        style={{
                          padding: '6px 14px', fontSize: 12, fontWeight: 500,
                          background: '#EBF5FF', color: '#1B3A6B', border: '1px solid #B3D4FC',
                          borderRadius: 6, cursor: 'pointer', transition: 'all 150ms',
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        <FileText size={13} />
                        PO Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        <div className="orders-mobile-cards" style={{ display: 'none', padding: '12px', gap: 10, flexDirection: 'column' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>No approved orders found</div>
          ) : filtered.map(o => (
            <div key={o.id} className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{o.orderId}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                  background: '#DCFCE7', color: '#15803D',
                }}>
                  Order Confirmed
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 500 }}>{o.products || 'N/A'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{o.vendor}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{o.billingAddress || o.shippingAddress || 'N/A'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--navy)' }}>{fmt(o.amount)}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {o.referenceDocument && (
                    <a
                      href={o.referenceDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn orders-ref-doc-btn"
                      style={{
                        padding: '6px 12px', fontSize: 11, fontWeight: 500,
                        background: '#EBF5FF', color: '#1B3A6B', border: '1px solid #B3D4FC',
                        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                        textDecoration: 'none',
                      }}
                    >
                      <FileText size={12} />
                      Ref Doc
                      <ExternalLink size={10} style={{ opacity: 0.6 }} />
                    </a>
                  )}
                  <button
                    className="btn"
                    onClick={() => setViewPODoc(o)}
                    style={{
                      padding: '6px 12px', fontSize: 11, fontWeight: 500,
                      background: '#EBF5FF', color: '#1B3A6B', border: '1px solid #B3D4FC',
                      borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <FileText size={12} />
                    PO Doc
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {filtered.length} of {approvedOrders.length} orders</span>
        </div>
      </div>

      {/* PO Document Modal */}
      {viewPODoc && <PODocumentModal po={viewPODoc} onClose={() => setViewPODoc(null)} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .orders-po-doc-btn:hover {
          background: #D4E8FF !important;
          border-color: #7BB4F5 !important;
        }
        .orders-ref-doc-btn:hover {
          background: #D4E8FF !important;
          border-color: #7BB4F5 !important;
        }
        @media (max-width: 768px) {
          .orders-desktop-table { display: none !important; }
          .orders-mobile-cards { display: flex !important; }
          .orders-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .orders-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
