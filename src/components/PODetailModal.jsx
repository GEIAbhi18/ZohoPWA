import React from 'react'
import { X, CheckCircle, XCircle, Building2, MapPin, User, Calendar, Hash } from 'lucide-react'

function fmt(n) { return '₹' + n.toLocaleString('en-IN') }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }

export default function PODetailModal({ po, onClose, onApprove, onReject }) {
  if (!po) return null

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ alignItems: 'flex-end', padding: 0 }}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px 20px 0 0',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '92vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 220ms ease',
      }}
        className="modal-sheet"
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}>{po.orderId}</span>
              <span className={`badge badge-${po.status.toLowerCase()}`}>{po.status}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Request: {po.requestId} • {fmtDate(po.date)}</div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}><X size={20} /></button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', WebkitOverflowScrolling: 'touch' }}>

          {/* Info grid — 2 col on all sizes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { icon: Building2, label: 'Vendor', value: po.vendor },
              { icon: User, label: 'Requested By', value: po.requestedBy },
              { icon: Hash, label: 'Department', value: po.department },
              { icon: Calendar, label: 'Date', value: fmtDate(po.date) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <Icon size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div style={{ marginBottom: 12, background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <MapPin size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Shipping Address</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{po.shippingAddress}</div>
          </div>

          {po.vendorGST && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
              GST: <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-secondary)', fontWeight: 500 }}>{po.vendorGST}</span>
            </div>
          )}

          {/* Line Items label */}
          <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Line Items</div>

          {/* Mobile: stacked cards instead of table */}
          <div className="line-items-mobile" style={{ display: 'none', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {po.lineItems.map((li, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{li.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Qty: <strong>{li.qty}</strong> {li.unit}</span>
                  <span>@ {fmt(li.unitPrice)}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--navy)', fontSize: 12 }}>{fmt(li.total)}</span>
                </div>
              </div>
            ))}
            {/* Total row */}
            <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--blue-mid)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Total Amount</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--mono)' }}>{fmt(po.amount)}</span>
            </div>
          </div>

          {/* Desktop: table */}
          <div className="line-items-desktop" style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Item', 'Qty', 'Unit', 'Unit Price', 'Total'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Item' ? 'left' : 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {po.lineItems.map((li, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{li.name}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>{li.qty}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>{li.unit}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{fmt(li.unitPrice)}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{fmt(li.total)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
                  <td colSpan={4} style={{ padding: '10px', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textAlign: 'right' }}>Total Amount</td>
                  <td style={{ padding: '10px', fontWeight: 800, fontSize: 15, color: 'var(--navy)', textAlign: 'right', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{fmt(po.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status notes */}
          {po.status === 'Rejected' && po.rejectionReason && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</div>
              <div style={{ fontSize: 13, color: 'var(--red-text)' }}>{po.rejectionReason}</div>
            </div>
          )}
          {po.status === 'Approved' && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved By</div>
              <div style={{ fontSize: 13, color: 'var(--green-text)' }}>{po.approvedBy} on {po.approvedAt ? new Date(po.approvedAt).toLocaleString('en-IN') : '-'}</div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {po.status === 'Pending' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--surface)', flexShrink: 0 }}>
            <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onReject([po.id]); onClose() }}>
              <XCircle size={15} /> Reject
            </button>
            <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onApprove([po.id]); onClose() }}>
              <CheckCircle size={15} /> Approve
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 600px) {
          .modal-sheet {
            border-radius: 20px !important;
            max-width: 560px !important;
            margin: auto;
            max-height: 90vh !important;
          }
          .overlay { align-items: center !important; padding: 16px !important; }
        }
        @media (max-width: 599px) {
          .line-items-mobile { display: flex !important; }
          .line-items-desktop { display: none !important; }
        }
      `}</style>
    </div>
  )
}
