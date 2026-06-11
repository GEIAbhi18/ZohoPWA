import React from 'react'
import { X, Printer, FileDown } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const ADDRESS_DETAILS = {
  'O P KHURANA & SON': {
    line: 'Office No.1, Ground Floor, Good Earth Business Bay - II, Sector-58, Sector-58, Haryana, 122101, India',
    phone: '9958480648',
    gst: '06AAAF02336D1ZT',
  },
  'SAS Maintenance Services LLP': {
    line: 'SAS Maintenance Services LLP, Gurugram, Haryana, India',
    phone: '9958480648',
    gst: '06AAAF02336D1ZT',
  },
  'Arcadian Facilities Pvt Ltd.': {
    line: 'Arcadian Facilities Pvt Ltd., Gurugram, Haryana, India',
    phone: '9958480648',
    gst: '06AAAF02336D1ZT',
  },
  'Good Earth Infra HO, DLF Cyber City': {
    line: 'Good Earth Infra HO, DLF Cyber City, Gurugram, Haryana, India',
    phone: '9958480648',
    gst: '06AAAF02336D1ZT',
  },
}

const DEFAULT_BILLING = 'O P KHURANA & SON'

function fmt(n) {
  return '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PODocumentModal({ po, onClose }) {
  const { addNotification } = useNotifications()
  if (!po) return null

  const billingAddr = po.billingAddress || DEFAULT_BILLING
  const addrDetail = ADDRESS_DETAILS[billingAddr] || ADDRESS_DETAILS[DEFAULT_BILLING]
  const shippingAddr = po.shippingAddress || billingAddr
  const shippingDetail = ADDRESS_DETAILS[shippingAddr] || addrDetail

  const lineItems = po.lineItems || [{
    name: po.products || 'N/A',
    qty: po.quantity ?? 0,
    unit: po.measurementUnit || 'Pieces/ Quantity',
    unitPrice: po.unitPrice ?? 0,
    total: po.totalCost ?? po.amount ?? 0,
  }]

  const subTotal = lineItems.reduce((s, li) => s + (li.total || 0), 0)
  const shippingCharge = po.shippingCharge || 0
  const advanceAmount = po.advanceAmount || 0
  const netTotal = po.amount || subTotal

  function handlePrint() {
    addNotification('PO Printed', `${po.orderId} — ${po.vendor} document sent to printer`, 'pdf')
    window.print()
  }

  function handlePDF() {
    addNotification('PO PDF Downloaded', `${po.orderId} — ${po.vendor} PDF generated`, 'pdf')
    window.print()
  }

  return (
    <div className="po-doc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="po-doc-modal">
        {/* Header */}
        <div className="po-doc-header">
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Purchase Order</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="po-doc-action-btn" onClick={handlePrint}>
              <Printer size={14} /> Print
            </button>
            <button className="po-doc-action-btn po-doc-action-pdf" onClick={handlePDF}>
              <FileDown size={14} /> PDF
            </button>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="po-doc-body">
          <div className="po-doc-content" id="po-doc-printable">
            {/* Billing Address & PO Info */}
            <div className="po-doc-billing-row">
              <div className="po-doc-billing-left">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: '#1B3A6B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'serif' }}>GEI</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>BILLING ADDRESS</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', marginBottom: 2 }}>{billingAddr}</div>
                    <div style={{ fontSize: 11, color: '#718096', lineHeight: 1.5, maxWidth: 400 }}>{addrDetail.line}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 3 }}>
                  Phone : <strong>{addrDetail.phone}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#4A5568' }}>
                  GSTIN/Tax No : <strong>{addrDetail.gst}</strong>
                </div>
              </div>
              <div className="po-doc-billing-right">
                <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>
                  PO No : <strong style={{ color: '#1A202C' }}>{po.orderId}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#718096' }}>
                  PO Date : <strong style={{ color: '#1A202C' }}>{fmtDate(po.date || po.approvedAt || new Date().toISOString())}</strong>
                </div>
              </div>
            </div>

            {/* Vendor + Shipping Address */}
            <div className="po-doc-parties">
              <div className="po-doc-party-box">
                <div className="po-doc-party-label">Vendor</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', marginBottom: 6 }}>{po.vendor || 'N/A'}</div>
                <div style={{ fontSize: 12, color: '#718096', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📞 {po.vendorPhone || '8595818474'}
                </div>
              </div>
              <div className="po-doc-party-box">
                <div className="po-doc-party-label">Shipping Address</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>{shippingAddr}</div>
                <div style={{ fontSize: 11, color: '#718096', lineHeight: 1.5, marginBottom: 6 }}>{shippingDetail.line}</div>
                <div style={{ fontSize: 11, color: '#718096', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span>📞 {shippingDetail.phone}</span>
                  <span>🔑 {shippingDetail.gst}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="po-doc-table">
              <thead>
                <tr>
                  <th style={{ width: 50, textAlign: 'center' }}>S.No</th>
                  <th style={{ textAlign: 'left' }}>Product</th>
                  <th style={{ textAlign: 'center' }}>Quantity</th>
                  <th>Unit Price</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Total (Incl Taxes)</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((li, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, color: '#1A202C' }}>{li.name}</div>
                      <div style={{ fontSize: 10, color: '#718096' }}>{li.unit || 'Pieces/ Quantity'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{li.qty}</td>
                    <td>{fmt(li.unitPrice)}</td>
                    <td>{fmt(li.unitPrice * (li.qty || 1))}</td>
                    <td>{fmt(po.discountAmount || 0)}</td>
                    <td>{fmt(po.taxAmount || 0)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(li.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Comments + Totals row */}
            <div className="po-doc-footer-row">
              <div className="po-doc-comments-section">
                {(po.comments || po.approval_comments) && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>Comments</div>
                    <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>
                      {po.comments || po.approval_comments || 'Test comment'}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 6 }}>Terms & Conditions</div>
                  <div style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.7 }}>
                    {(po.termsConditions || po.approval_terms_conditions || `1. The Material Supplied must be fresh & Confirm to international norms.
2. Late Delivery Penalty: - If delivery delayed beyond the agreed date, a penalty 10% of order value per day.
3. Service Delivery Penalty: - If Service are not complete on time, a penalty 10% of order value per day.
4. Delivery Timeline: - 5-7 working days`).split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="po-doc-totals-section">
                <div className="po-doc-total-line">
                  <span>Sub Total</span>
                  <span>{fmt(subTotal)}</span>
                </div>
                <div className="po-doc-total-line">
                  <span>Shipping</span>
                  <span>{fmt(shippingCharge)}</span>
                </div>
                <div className="po-doc-total-line">
                  <span>Advance</span>
                  <span>{fmt(advanceAmount)}</span>
                </div>
                <div className="po-doc-total-line po-doc-net-total">
                  <span>Net Total</span>
                  <span>{fmt(netTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
