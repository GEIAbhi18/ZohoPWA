import React from 'react'
import { X, CheckCircle, XCircle, Building2, MapPin, User, Calendar, Hash, Package, FileText, CreditCard, ExternalLink } from 'lucide-react'

function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN') }
function fmtDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }

export default function PODetailModal({ po, onClose, onApprove, onReject, onOpenApproval }) {
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
              <span className={`badge badge-${po.status.toLowerCase()}`}>{po.rawStatus || po.status}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{po.type ? `${po.type} • ` : ''}{fmtDate(po.date)}</div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}><X size={20} /></button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', WebkitOverflowScrolling: 'touch' }}>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { icon: Building2, label: 'Vendor', value: po.vendor },
              { icon: Package, label: 'Product', value: po.products },
              { icon: Hash, label: 'Type', value: po.type || '-' },
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

          {/* Payment & Terms info */}
          {(po.paymentTerms || po.termsConditions) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {po.paymentTerms && (
                <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <CreditCard size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Payment Terms</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{po.paymentTerms}</div>
                </div>
              )}
              {po.termsConditions && (
                <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <FileText size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Terms & Conditions</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{po.termsConditions}</div>
                </div>
              )}
            </div>
          )}

          {/* Reference Document */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <FileText size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Reference Document</span>
            </div>
            {po.referenceDocument ? (
              <a
                href={po.referenceDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="ref-doc-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  background: '#EBF5FF',
                  color: '#1B3A6B',
                  border: '1px solid #B3D4FC',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 150ms',
                }}
              >
                <FileText size={13} />
                Reference Document
                <ExternalLink size={11} style={{ opacity: 0.6 }} />
              </a>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  cursor: 'default',
                }}
              >
                <FileText size={13} />
                Reference Document
              </span>
            )}
          </div>

          {/* Cost Breakdown */}
          <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost Breakdown</div>

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
                {li.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border)' }}>
                    <span>Tax ({li.taxRate}%)</span>
                    <span style={{ fontFamily: 'var(--mono)' }}>{fmt(li.taxAmount)}</span>
                  </div>
                )}
              </div>
            ))}
            {/* Extra cost rows */}
            {(po.discountAmount > 0 || po.shippingCharge > 0) && (
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
                {po.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--green)', padding: '2px 0' }}>
                    <span>Discount</span>
                    <span style={{ fontFamily: 'var(--mono)' }}>-{fmt(po.discountAmount)}</span>
                  </div>
                )}
                {po.shippingCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', padding: '2px 0' }}>
                    <span>Shipping</span>
                    <span style={{ fontFamily: 'var(--mono)' }}>{fmt(po.shippingCharge)}</span>
                  </div>
                )}
              </div>
            )}
            {/* Total row */}
            <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--blue-mid)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Final Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--mono)' }}>{fmt(po.amount)}</span>
            </div>
          </div>

          {/* Desktop: table */}
          <div className="line-items-desktop" style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Item', 'Qty', 'Unit', 'Unit Price', 'Tax', 'Subtotal'].map(h => (
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
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                      {li.taxAmount > 0 ? `${li.taxRate}% (${fmt(li.taxAmount)})` : '-'}
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{fmt(li.total)}</td>
                  </tr>
                ))}
                {/* Discount, shipping rows */}
                {po.discountAmount > 0 && (
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td colSpan={5} style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, color: 'var(--green)' }}>Discount</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--green)', whiteSpace: 'nowrap' }}>-{fmt(po.discountAmount)}</td>
                  </tr>
                )}
                {po.shippingCharge > 0 && (
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td colSpan={5} style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, color: 'var(--text-secondary)' }}>Shipping</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmt(po.shippingCharge)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
                  <td colSpan={5} style={{ padding: '10px', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textAlign: 'right' }}>Final Total</td>
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
              <div style={{ fontSize: 13, color: 'var(--green-text)' }}>
                {po.approvedBy || 'Unknown'} on {po.approvedAt ? new Date(po.approvedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) : '-'}
              </div>
              {po.deviceName && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', marginTop: 8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approver's Device</div>
                  <div style={{ fontSize: 13, color: 'var(--green-text)' }}>{po.deviceName}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {po.status === 'Pending' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--surface)', flexShrink: 0 }}>
            <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onReject([po.id]); onClose() }}>
              <XCircle size={15} /> Reject
            </button>
            <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { if (onOpenApproval) { onOpenApproval(po) } else { onApprove([po.id]); onClose() } }}>
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
        .ref-doc-btn:hover {
          background: #D4E8FF !important;
          border-color: #7BB4F5 !important;
        }
      `}</style>
    </div>
  )
}
