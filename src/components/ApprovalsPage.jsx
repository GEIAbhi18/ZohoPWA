import React, { useState, useMemo } from 'react'
import { Search, Filter, Download, CheckCircle, XCircle, Eye, ChevronDown, RefreshCw, CheckSquare, Square } from 'lucide-react'
import { useApprovals } from '../context/ApprovalsContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApproveModal, RejectModal } from './ActionModals'
import PODetailModal from './PODetailModal'

const TABS = ['Employee Requests', 'Procurement Requests', 'Purchase Orders', 'Payment']
const DEPTS = ['All', 'Projects', 'Engineering', 'HR & Admin', 'Admin', 'EHS', 'Design', 'Marketing']
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']
const PROJECTS = ['All Projects', 'Project - R & M (GETT)', 'Project - R & M (GEBB-I)', 'Project - Civil (GETT Phase 2)', 'Electrical Upgrade — Block C', 'Corporate Office Furnishing', 'Site Safety Compliance — All Sites', 'Design Department Licensing', 'Plumbing Works — Tower B', 'General — Corporate Office', 'Brand & Marketing — Q4 2024']

function fmt(n) { return '₹' + n.toLocaleString('en-IN') }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }

export default function ApprovalsPage() {
  const { orders, approve, reject, reset, stats } = useApprovals()
  const { user } = useAuth()
  const toast = useToast()

  const [tab, setTab] = useState('Purchase Orders')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All Projects')
  const [vendorFilter, setVendorFilter] = useState('')
  const [selected, setSelected] = useState([])
  const [viewPO, setViewPO] = useState(null)
  const [approveIds, setApproveIds] = useState(null)
  const [rejectIds, setRejectIds] = useState(null)

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const s = search.toLowerCase()
      if (s && !o.requestId.toLowerCase().includes(s) && !o.orderId.toLowerCase().includes(s) && !o.vendor.toLowerCase().includes(s) && !o.products.toLowerCase().includes(s) && !o.project.toLowerCase().includes(s)) return false
      if (statusFilter !== 'All' && o.status !== statusFilter) return false
      if (deptFilter !== 'All' && o.department !== deptFilter) return false
      if (projectFilter !== 'All Projects' && o.project !== projectFilter) return false
      if (vendorFilter && !o.vendor.toLowerCase().includes(vendorFilter.toLowerCase())) return false
      return true
    })
  }, [orders, search, statusFilter, deptFilter, projectFilter, vendorFilter])

  const pendingFiltered = filtered.filter(o => o.status === 'Pending')
  const allSelectedPending = pendingFiltered.length > 0 && pendingFiltered.every(o => selected.includes(o.id))

  function toggleAll() {
    if (allSelectedPending) setSelected([])
    else setSelected(pendingFiltered.map(o => o.id))
  }

  function toggleOne(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function doApprove(ids) {
    approve(ids, user?.name)
    setSelected([])
    toast(`${ids.length} order(s) approved successfully`, 'success')
  }

  function doReject(ids, reason) {
    reject(ids, reason, user?.name)
    setSelected([])
    toast(`${ids.length} order(s) rejected`, 'error')
  }

  const statCards = [
    { label: 'Pending Approval', value: stats.pending, color: 'var(--amber)', bg: 'var(--amber-bg)' },
    { label: 'Approved', value: stats.approved, color: 'var(--green)', bg: 'var(--green-bg)' },
    { label: 'Rejected', value: stats.rejected, color: 'var(--red)', bg: 'var(--red-bg)' },
    { label: 'Total Value', value: fmt(stats.totalValue), color: 'var(--navy)', bg: 'var(--blue-light)' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Approvals</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Review and action procurement approval requests</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="select" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ fontSize: 12 }}>
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={reset} title="Reset to demo data">
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statCards.map(c => (
          <div key={c.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="card">
        {/* Tabs — exact match to Zoho */}
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

        {tab === 'Purchase Orders' ? (
          <>
            {/* Filters bar */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Request ID/Order ID" style={{ paddingLeft: 32, fontSize: 12 }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Filter By:</span>
              <select className="select" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ fontSize: 12, flex: '1 1 160px' }}>
                {PROJECTS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select className="select" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={{ fontSize: 12, flex: '0 1 160px' }}>
                <option value="">- Vendor -</option>
                {[...new Set(orders.map(o => o.vendor))].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 12, flex: '0 1 120px' }}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? '- Status -' : s}</option>)}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={() => toast('Exporting...', 'info')}>
                <Download size={13} /> Export
              </button>
            </div>

            {/* Bulk actions bar */}
            {selected.length > 0 && (
              <div style={{ padding: '10px 16px', background: 'var(--blue-light)', borderBottom: '1px solid var(--blue-mid)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>{selected.length} selected</span>
                <button className="btn btn-success btn-sm" onClick={() => setApproveIds(selected)}>
                  <CheckCircle size={13} /> Approve Selected
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setRejectIds(selected)}>
                  <XCircle size={13} /> Reject Selected
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
              </div>
            )}

            {/* Desktop Table */}
            <div className="desktop-table">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', width: 40 }}>
                      <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {allSelectedPending ? <CheckSquare size={16} color="var(--navy)" /> : <Square size={16} />}
                      </button>
                    </th>
                    {['Request ID', 'Order ID', 'Project', 'Products', 'Shipping Address', 'Vendor', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                        No orders match your filters
                      </td>
                    </tr>
                  ) : filtered.map((o, i) => (
                    <tr key={o.id} style={{
                      borderBottom: '1px solid var(--border)',
                      background: selected.includes(o.id) ? 'var(--blue-light)' : i % 2 === 0 ? 'white' : 'transparent',
                      transition: 'background 100ms',
                    }}
                      onMouseEnter={e => { if (!selected.includes(o.id)) e.currentTarget.style.background = 'var(--surface)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = selected.includes(o.id) ? 'var(--blue-light)' : i % 2 === 0 ? 'white' : 'transparent' }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        {o.status === 'Pending' && (
                          <button onClick={() => toggleOne(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                            {selected.includes(o.id) ? <CheckSquare size={15} color="var(--navy)" /> : <Square size={15} />}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--navy)', fontWeight: 500 }}>{o.requestId}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--navy)', fontWeight: 500 }}>{o.orderId}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.project}>{o.project}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.products}>{o.products}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.shippingAddress}>{o.shippingAddress.split(',')[0]}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>{o.vendor}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{fmt(o.amount)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button className="btn-icon" title="View details" onClick={() => setViewPO(o)} style={{ padding: 5 }}>
                            <Eye size={14} />
                          </button>
                          {o.status === 'Pending' && <>
                            <button className="btn btn-success btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setApproveIds([o.id])}>
                              <CheckCircle size={12} />
                            </button>
                            <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setRejectIds([o.id])}>
                              <XCircle size={12} />
                            </button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards" style={{ display: 'none', padding: '12px', gap: 10, flexDirection: 'column' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>No orders match your filters</div>
              ) : filtered.map(o => (
                <div key={o.id} className="card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{o.orderId}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>{o.requestId}</span>
                    </div>
                    <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 500 }}>{o.project}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.products}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.vendor}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(o.date)}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--navy)' }}>{fmt(o.amount)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewPO(o)}>
                      <Eye size={13} /> View
                    </button>
                    {o.status === 'Pending' && <>
                      <button className="btn btn-success btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setApproveIds([o.id])}>
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRejectIds([o.id])}>
                        <XCircle size={13} /> Reject
                      </button>
                    </>}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {filtered.length} of {orders.length} orders</span>
            </div>
          </>
        ) : (
          <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>{tab}</div>
            <div style={{ fontSize: 13 }}>This section is coming soon</div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewPO && <PODetailModal po={viewPO} onClose={() => setViewPO(null)} onApprove={ids => doApprove(ids)} onReject={(ids, reason) => doReject(ids, reason)} />}
      {approveIds && <ApproveModal ids={approveIds} orders={orders} onConfirm={() => doApprove(approveIds)} onClose={() => setApproveIds(null)} />}
      {rejectIds && <RejectModal ids={rejectIds} orders={orders} onConfirm={reason => doReject(rejectIds, reason)} onClose={() => setRejectIds(null)} />}

      <style>{`
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
