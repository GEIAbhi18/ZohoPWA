import React, { useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function ApproveModal({ ids, orders, onConfirm, onClose }) {
  const targets = orders.filter(o => ids.includes(o.id) && o.status === 'Pending')
  if (!targets.length) return null
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 400, padding: 28, animation: 'slideUp 200ms ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="var(--green)" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Approve {targets.length > 1 ? `${targets.length} Orders` : 'Order'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>This action cannot be undone</div>
          </div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          {targets.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0' }}>
              <span style={{ fontFamily: 'var(--mono)' }}>{o.orderId}</span>
              <span>{o.vendor}</span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>₹{Number(o.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={() => { onConfirm(); onClose() }}>
            <CheckCircle size={15} /> Confirm Approval
          </button>
        </div>
      </div>
    </div>
  )
}

export function RejectModal({ ids, orders, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const targets = orders.filter(o => ids.includes(o.id) && o.status === 'Pending')
  if (!targets.length) return null
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 420, padding: 28, animation: 'slideUp 200ms ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} color="var(--red)" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Reject {targets.length > 1 ? `${targets.length} Orders` : 'Order'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {targets.map(o => o.orderId).join(', ')}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reason for Rejection <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" style={{ background: 'var(--red)', color: 'white', border: 'none' }} onClick={() => { onConfirm(reason); onClose() }}>
            <XCircle size={15} /> Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}
