import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, CheckCircle, Upload, ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'
import { useApprovals } from '../context/ApprovalsContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import { uploadSignature, uploadAttachment } from '../lib/supabaseStorage'

const BILLING_ADDRESSES = [
  'O P KHURANA & SON',
  'SAS Maintenance Services LLP',
  'Arcadian Facilities Pvt Ltd.',
  'Good Earth Infra HO, DLF Cyber City',
]

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

const DEFAULT_TERMS = `1. The Material Supplied must be fresh & Confirm to international norms.
2. Late Delivery Penalty: - If delivery delayed beyond the agreed date, a penalty 10% of order value per day.
3. Service Delivery Penalty: - If Service are not complete on time, a penalty 10% of order value per day.
4. Delivery Timeline: - 5-7 working days`

function fmt(n) {
  return '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

// ─── Signature Canvas Component ────────────────────────────────────
function SignatureCanvas({ canvasRef, onDrawStart }) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    drawBaseline(ctx, rect.width, rect.height)
    drawWatermark(ctx, rect.width, rect.height)
  }, [canvasRef])

  function drawBaseline(ctx, w, h) {
    ctx.save()
    ctx.strokeStyle = '#E2E8F0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(16, h * 0.75)
    ctx.lineTo(w - 16, h * 0.75)
    ctx.stroke()
    ctx.restore()
  }

  function drawWatermark(ctx, w, h) {
    ctx.save()
    ctx.font = '13px DM Sans, sans-serif'
    ctx.fillStyle = '#D1D5DB'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Draw your signature', w / 2, h * 0.45)
    ctx.restore()
  }

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function startDraw(e) {
    e.preventDefault()
    if (!hasDrawn) {
      clearCanvas()
      setHasDrawn(true)
      onDrawStart?.()
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = '#1B3A6B'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setIsDrawing(true)
  }

  function draw(e) {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function endDraw(e) {
    if (e) e.preventDefault()
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBaseline(ctx, rect.width, rect.height)
    if (!hasDrawn) drawWatermark(ctx, rect.width, rect.height)
  }

  function handleClear() {
    setHasDrawn(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBaseline(ctx, rect.width, rect.height)
    drawWatermark(ctx, rect.width, rect.height)
  }

  return (
    <div className="po-sig-wrap">
      <div className="po-sig-header">
        <span className="po-field-sublabel">Draw your signature</span>
        <button type="button" className="po-sig-clear" onClick={handleClear}>[Clear]</button>
      </div>
      <canvas
        ref={canvasRef}
        className="po-sig-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  )
}

// ─── Billing Address Dropdown ──────────────────────────────────────
function BillingDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = BILLING_ADDRESSES.filter(a =>
    a.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="po-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className="po-dropdown-trigger"
        onClick={() => setOpen(!open)}
      >
        <span className="po-dropdown-value">{value}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {value && (
            <span
              className="po-dropdown-x"
              onClick={(e) => { e.stopPropagation(); onChange(BILLING_ADDRESSES[0]) }}
            >×</span>
          )}
          <ChevronDown size={14} color="var(--text-muted)" />
        </span>
      </button>
      {open && (
        <div className="po-dropdown-list">
          <div className="po-dropdown-search-wrap">
            <Search size={13} color="var(--text-muted)" />
            <input
              className="po-dropdown-search"
              placeholder="Search..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              autoFocus
            />
          </div>
          {filtered.map(addr => (
            <button
              key={addr}
              type="button"
              className={`po-dropdown-item ${addr === value ? 'selected' : ''}`}
              onClick={() => { onChange(addr); setOpen(false); setFilter('') }}
            >
              {addr}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="po-dropdown-empty">No results</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── PO Preview Document ───────────────────────────────────────────
function POPreviewDocument({ po, billingAddress, termsAndConditions }) {
  const addrDetail = ADDRESS_DETAILS[billingAddress] || ADDRESS_DETAILS['O P KHURANA & SON']

  return (
    <div className="po-preview-doc">
      {/* Header */}
      <div className="po-preview-header">
        <div className="po-preview-logo-area">
          <div className="po-preview-ribbon">Preview</div>
          <div className="po-preview-company">
            <div className="po-preview-logo-circle">
              <span style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'serif' }}>GEI</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A202C' }}>Good Earth Infra</div>
              <div style={{ fontSize: 10, color: '#718096', lineHeight: 1.4, maxWidth: 320 }}>
                Office No.1, Ground Floor, Good Earth Business Bay - II, Sector-58, Sector-58, Haryana, 122101, India
              </div>
            </div>
          </div>
        </div>
        <div className="po-preview-po-info">
          <div style={{ fontSize: 12, color: '#718096' }}>PO No : <strong style={{ color: '#1A202C' }}>{po.orderId}</strong></div>
          <div style={{ fontSize: 12, color: '#718096' }}>PO Date : <strong style={{ color: '#1A202C' }}>{fmtDate(po.date || new Date().toISOString())}</strong></div>
        </div>
      </div>

      {/* Vendor + Shipping */}
      <div className="po-preview-parties">
        <div className="po-preview-party-box">
          <div className="po-preview-party-label">Vendor</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>{po.vendor || 'N/A'}</div>
          <div style={{ fontSize: 11, color: '#718096', display: 'flex', alignItems: 'center', gap: 4 }}>
            📞 {po.vendorPhone || '8595818474'}
          </div>
        </div>
        <div className="po-preview-party-box">
          <div className="po-preview-party-label">Shipping Location</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>{billingAddress}</div>
          <div style={{ fontSize: 10, color: '#718096', lineHeight: 1.5, marginBottom: 4 }}>{addrDetail.line}</div>
          <div style={{ fontSize: 11, color: '#718096', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>📞 {addrDetail.phone}</span>
            <span>🔑 {addrDetail.gst}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="po-preview-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th style={{ textAlign: 'left' }}>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Discount</th>
            <th>Tax</th>
            <th>Total (Incl Taxes)</th>
          </tr>
        </thead>
        <tbody>
          {po.lineItems.map((li, i) => (
            <tr key={i}>
              <td style={{ textAlign: 'center' }}>{i + 1}</td>
              <td style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>{li.name}</div>
                <div style={{ fontSize: 10, color: '#718096' }}>{li.unit || 'Pieces/ Quantity'}</div>
              </td>
              <td style={{ textAlign: 'center' }}>{li.qty}</td>
              <td>{fmt(li.unitPrice)}</td>
              <td>{fmt(0)}</td>
              <td>{fmt(0)}</td>
              <td style={{ fontWeight: 600 }}>{fmt(li.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="po-preview-totals">
        <div className="po-preview-total-row">
          <span>Sub Total</span>
          <span>{fmt(po.lineItems.reduce((s, li) => s + (li.total || 0), 0))}</span>
        </div>
        <div className="po-preview-total-row">
          <span>Shipping</span>
          <span>{fmt(po.shippingCharge || 0)}</span>
        </div>
        <div className="po-preview-total-row net">
          <span>Net Total</span>
          <span>{fmt(po.amount)}</span>
        </div>
      </div>

      {/* Terms */}
      <div className="po-preview-terms">
        {termsAndConditions
          ? termsAndConditions.split('\n').map((line, i) => (
              <div key={i} style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.6 }}>{line}</div>
            ))
          : <div style={{ fontSize: 11, color: '#718096', fontStyle: 'italic' }}>
              Comments, Terms and Conditions will appear here in the PO document.
            </div>
        }
      </div>

      {/* Contact */}
      <div className="po-preview-contact">
        <span style={{ marginRight: 4 }}>ℹ️</span>
        For any questions regarding this PO, please contact{' '}
        <a href="mailto:anurag@goodearthinfra.in" style={{ color: '#2D5DA6' }}>anurag@goodearthinfra.in</a>
      </div>
    </div>
  )
}

// ─── Main POApprovalModal ──────────────────────────────────────────
export default function POApprovalModal({ po, onClose }) {
  const { approve } = useApprovals()
  const { user } = useAuth()
  const toast = useToast()
  const { addNotification } = useNotifications()
  const canvasRef = useRef(null)

  // Form state
  const [referenceNumber, setReferenceNumber] = useState('')
  const [billingAddress, setBillingAddress] = useState(BILLING_ADDRESSES[0])
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [attachment, setAttachment] = useState(null)
  const [comments, setComments] = useState('')
  const [termsAndConditions, setTermsAndConditions] = useState(DEFAULT_TERMS)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // File picker
  const fileInputRef = useRef(null)
  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) setAttachment(file)
  }

  // Submit
  async function handleApprove() {
    if (submitting) return
    setSubmitting(true)

    try {
      let signatureUrl = null
      let attachmentUrl = null

      // Upload signature if drawn
      if (canvasRef.current && hasDrawnSignature) {
        signatureUrl = await uploadSignature(canvasRef.current, po.orderId)
        if (!signatureUrl) {
          toast('Signature upload failed. Please check Supabase Storage settings.', 'error')
          setSubmitting(false)
          return
        }
      }

      // Upload attachment if selected
      if (attachment) {
        attachmentUrl = await uploadAttachment(attachment, po.orderId)
        if (!attachmentUrl && attachment) {
          toast('Approved, but file upload failed. You can re-attach later.', 'info')
        }
      }

      const approvalData = {
        poId: po.id,
        orderId: po.orderId,
        requestId: po.requestId || '',
        approvedBy: user?.name || 'Unknown',
        approvedAt: new Date().toISOString(),
        projectName: po.project || '',
        referenceNumber: referenceNumber || null,
        billingAddress: billingAddress,
        advanceAmount: advanceAmount || 0,
        comments: comments || null,
        termsAndConditions: termsAndConditions,
        attachmentUrl: attachmentUrl,
        signatureImageUrl: signatureUrl,
      }

      await approve([po.id], user?.name, approvalData)
      toast(`PO ${po.orderId} approved successfully`, 'success')
      addNotification('PO Approved', `${po.orderId} — ${po.vendor} — ₹${Number(po.amount || 0).toLocaleString('en-IN')} approved`, 'approval')
      onClose()
    } catch (err) {
      console.error('Approval failed:', err)
      toast('Approval failed: ' + (err.message || 'Unknown error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!po) return null

  return (
    <div className="po-approval-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="po-approval-modal">
        {/* Header */}
        <div className="po-approval-header">
          <h2 className="po-approval-title">Purchase Order</h2>
          <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}><X size={20} /></button>
        </div>

        {/* Body — two panels */}
        <div className="po-approval-body">
          {/* LEFT PANEL: Form */}
          <div className="po-approval-left">
            <div className="po-approval-form-scroll">
              {/* Field 1: Project Name */}
              <div className="po-field">
                <label className="po-field-label">PROJECT NAME</label>
                <div className="po-field-readonly">{po.project || po.products || 'N/A'}</div>
              </div>

              {/* Field 2: Reference Number */}
              <div className="po-field">
                <label className="po-field-label">REFERENCE NUMBER</label>
                <input
                  className="input po-input"
                  type="text"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  placeholder=""
                />
              </div>

              {/* Field 3: Billing Address */}
              <div className="po-field">
                <label className="po-field-label">BILLING ADDRESS</label>
                <BillingDropdown value={billingAddress} onChange={setBillingAddress} />
              </div>

              {/* Field 4: Advance Amount */}
              <div className="po-field">
                <label className="po-field-label">ADVANCE AMOUNT</label>
                <div className="po-amount-wrap">
                  <span className="po-amount-prefix">₹</span>
                  <input
                    className="input po-input po-amount-input"
                    type="number"
                    min="0"
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Field 5: Attachment */}
              <div className="po-field">
                <label className="po-field-label">ATTACHMENT</label>
                <div className="po-file-wrap">
                  <input
                    className="input po-input po-file-display"
                    readOnly
                    value={attachment ? attachment.name : ''}
                    placeholder="Select File"
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <button
                    type="button"
                    className="po-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {/* Field 6: Comments */}
              <div className="po-field">
                <label className="po-field-label">COMMENTS</label>
                <textarea
                  className="input po-input"
                  rows={4}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder=""
                  style={{ resize: 'vertical', minHeight: 80 }}
                />
              </div>

              {/* Field 7: Terms & Conditions */}
              <div className="po-field">
                <label className="po-field-label">TERMS & CONDITIONS</label>
                <textarea
                  className="input po-input"
                  rows={5}
                  value={termsAndConditions}
                  onChange={e => setTermsAndConditions(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 100, fontSize: 12, lineHeight: 1.5 }}
                />
              </div>

              {/* Field 8: Approver Signature */}
              <div className="po-field">
                <label className="po-field-label">APPROVER SIGNATURE</label>
                <SignatureCanvas 
                  canvasRef={canvasRef} 
                  onDrawStart={() => setHasDrawnSignature(true)} 
                />
              </div>
            </div>

            {/* Approve Button — desktop */}
            <div className="po-approval-btn-wrap po-approval-btn-desktop">
              <button
                className="po-approve-btn"
                onClick={handleApprove}
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 size={16} className="po-spinner" /> Approving...</>
                ) : (
                  <><CheckCircle size={16} /> Approve PO</>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: PO Preview */}
          <div className="po-approval-right">
            {/* Mobile toggle */}
            <button
              className="po-preview-toggle"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide PO Preview' : 'Show PO Preview'}
              {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <div className={`po-preview-content ${showPreview ? 'open' : ''}`}>
              <POPreviewDocument
                po={po}
                billingAddress={billingAddress}
                termsAndConditions={termsAndConditions}
              />
            </div>
          </div>
        </div>

        {/* Approve Button — mobile sticky */}
        <div className="po-approval-btn-wrap po-approval-btn-mobile">
          <button
            className="po-approve-btn"
            onClick={handleApprove}
            disabled={submitting}
          >
            {submitting ? (
              <><Loader2 size={16} className="po-spinner" /> Approving...</>
            ) : (
              <><CheckCircle size={16} /> Approve PO</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
