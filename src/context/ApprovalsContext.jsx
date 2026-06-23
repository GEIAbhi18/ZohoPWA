import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ApprovalsContext = createContext(null)

/**
 * Maps a Supabase row from `purchase_orders_for_approval` into the
 * shape every UI component already expects.
 */
function mapRow(row) {
  return {
    // identifiers
    id: row.id,
    requestId: '', // not in the table – left blank
    orderId: row.order_id || '',

    // descriptive fields
    project: '',
    products: row.product || '',
    shippingAddress: '',
    vendor: row.vendor || '',
    vendorGST: '',
    department: '',
    requestedBy: '',

    // dates & financials
    date: row.created_at ? row.created_at.split('T')[0] : '',
    amount: Number(row.final_total) || 0,

    // status mapping — normalise Supabase status strings to the
    // three values the UI already knows: Pending | Approved | Rejected
    status: normaliseStatus(row.status),
    rawStatus: row.status || '',

    // extra Supabase-only fields kept for detail display
    measurementUnit: row.measurement_unit || '',
    quantity: row.quantity ?? 0,
    unitPrice: row.unit_price ?? 0,
    taxRate: row.tax_rate ?? 0,
    taxAmount: row.tax_amount ?? 0,
    discountAmount: row.discount_amount ?? 0,
    shippingCharge: row.shipping_charge ?? 0,
    totalCost: row.total_cost ?? 0,
    type: row.type || '',
    termsConditions: row.terms_conditions || '',
    paymentTerms: row.payment_terms || '',
    approvedBy: row.approved_by || '',
    approvedAt: row.approved_at || '',
    deviceName: row.device_name || '',
    rejectionReason: row.rejection_reason || '',

    // Reference document link from Supabase
    referenceDocument: row.reference_document || '',

    // Construct a single-item lineItems array from flat columns
    lineItems: [
      {
        name: row.product || '',
        qty: row.quantity ?? 0,
        unit: row.measurement_unit || '',
        unitPrice: row.unit_price ?? 0,
        total: row.total_cost ?? 0,
      },
    ],
  }
}

/** Map the many possible Supabase statuses to three UI buckets. */
function normaliseStatus(raw) {
  if (!raw) return 'Pending'
  const s = raw.toLowerCase()
  if (s.includes('approved') || s.includes('accepted')) return 'Approved'
  if (s.includes('rejected') || s.includes('declined') || s.includes('denied') || s.includes('cancelled')) return 'Rejected'
  // everything else (including "Waiting For …") is treated as pending
  return 'Pending'
}

export function ApprovalsProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /** Fetch all rows from Supabase */
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: sbError } = await supabase
        .from('purchase_orders_for_approval')
        .select('*')
        .order('created_at', { ascending: false })

      if (sbError) throw sbError
      
      const mapped = (data || []).map(mapRow)
      const map = new Map()
      mapped.forEach(o => {
        if (!map.has(o.orderId)) {
          map.set(o.orderId, {
            ...o,
            dbIds: [o.id],
            id: o.orderId,
          })
        } else {
          const existing = map.get(o.orderId)
          existing.dbIds.push(o.id)
          // Add product name only if it's not already in the list
          if (!existing.products.includes(o.products)) {
            existing.products += ', ' + o.products
          }
          existing.amount += o.amount
          existing.taxAmount = (existing.taxAmount || 0) + (o.taxAmount || 0)
          existing.discountAmount = (existing.discountAmount || 0) + (o.discountAmount || 0)
          existing.shippingCharge = (existing.shippingCharge || 0) + (o.shippingCharge || 0)
          existing.lineItems.push(...o.lineItems)
        }
      })
      setOrders(Array.from(map.values()))
    } catch (err) {
      console.error('[Supabase] fetch failed:', err)
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // ── Real-time subscription ──
  useEffect(() => {
    const channel = supabase
      .channel('approvals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_orders_for_approval' },
        (_payload) => {
          // Re-fetch everything on any change — simple & correct
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  // ── Approve ──
  async function approve(dbIds, _user, approvalData = {}) {
    // Optimistic update
    setOrders(prev =>
      prev.map(o =>
        o.dbIds && o.dbIds.some(id => dbIds.includes(id)) && o.status === 'Pending'
          ? {
              ...o,
              status: 'Approved',
              rawStatus: 'Approved',
              approvedBy: approvalData.approvedBy || _user || null,
              approvedAt: approvalData.approvedAt || new Date().toISOString(),
            }
          : o
      )
    )

    // Build the update payload
    const updatePayload = {
      status: 'Approved',
      updated_at: new Date().toISOString(),
      approved_by: approvalData.approvedBy || _user || 'Unknown',
      approved_at: approvalData.approvedAt || new Date().toISOString(),
    }

    // Add optional approval metadata if provided
    if (approvalData.referenceNumber !== undefined) updatePayload.reference_number = approvalData.referenceNumber
    if (approvalData.billingAddress !== undefined) updatePayload.billing_address = approvalData.billingAddress
    if (approvalData.advanceAmount !== undefined) updatePayload.advance_amount = approvalData.advanceAmount
    if (approvalData.comments !== undefined) updatePayload.approval_comments = approvalData.comments
    if (approvalData.termsAndConditions !== undefined) updatePayload.approval_terms_conditions = approvalData.termsAndConditions
    if (approvalData.attachmentUrl !== undefined) updatePayload.attachment_url = approvalData.attachmentUrl
    if (approvalData.signatureImageUrl !== undefined) updatePayload.signature_url = approvalData.signatureImageUrl
    if (approvalData.deviceName !== undefined) updatePayload.device_name = approvalData.deviceName

    // Persist to Supabase
    const { error: sbError } = await supabase
      .from('purchase_orders_for_approval')
      .update(updatePayload)
      .in('id', dbIds)

    if (sbError) {
      console.error('[Supabase] approve failed:', sbError)
      fetchOrders() // rollback optimistic update
    }
  }


  // ── Reject ──
  async function reject(dbIds, _reason, _user) {
    setOrders(prev =>
      prev.map(o =>
        o.dbIds && o.dbIds.some(id => dbIds.includes(id)) && o.status === 'Pending'
          ? { ...o, status: 'Rejected', rawStatus: 'Rejected', rejectionReason: _reason }
          : o
      )
    )

    const { error: sbError } = await supabase
      .from('purchase_orders_for_approval')
      .update({ status: 'Rejected', updated_at: new Date().toISOString() })
      .in('id', dbIds)

    if (sbError) {
      console.error('[Supabase] reject failed:', sbError)
      fetchOrders()
    }
  }

  // ── Reset = re-fetch from Supabase ──
  function reset() {
    fetchOrders()
  }

  const stats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    approved: orders.filter(o => o.status === 'Approved').length,
    rejected: orders.filter(o => o.status === 'Rejected').length,
    totalValue: orders.reduce((s, o) => s + o.amount, 0),
  }

  return (
    <ApprovalsContext.Provider value={{ orders, approve, reject, reset, stats, loading, error, refetch: fetchOrders }}>
      {children}
    </ApprovalsContext.Provider>
  )
}

export const useApprovals = () => useContext(ApprovalsContext)
