import React, { createContext, useContext, useState } from 'react'

const DEFAULT_POS = [
  {
    id: 'PO-001', requestId: 'PR-873', orderId: 'PO-423',
    project: 'Project - R & M (GETT)',
    products: 'Service - 1hp Motor Rewinding | Qty - 1',
    shippingAddress: 'Arcadian Facilities Pvt Ltd., Plot 12, Sector 5, Gurugram, Haryana - 122001',
    vendor: 'Santosh Electricals',
    vendorGST: '06AABCS1681F1ZV',
    department: 'Projects',
    requestedBy: 'Manish Verma',
    date: '2024-11-12',
    amount: 8500,
    status: 'Pending',
    lineItems: [
      { name: '1hp Motor Rewinding Service', qty: 1, unit: 'Service', unitPrice: 7500, total: 7500 },
      { name: 'Winding Wire & Insulation Material', qty: 1, unit: 'Lot', unitPrice: 1000, total: 1000 },
    ]
  },
  {
    id: 'PO-002', requestId: 'PR-851', orderId: 'PO-420',
    project: 'Project - R & M (GEBB-I)',
    products: 'Air Blower (M-450TG/PD22071504) Air Blower (M-450TG/PD22071504) | Qty - 1',
    shippingAddress: 'SAS Maintenance Services LLP, Unit 7, Industrial Area Phase-II, Chandigarh - 160002',
    vendor: 'B S WATER SOLUTION',
    vendorGST: '03AADCB2714Q1ZR',
    department: 'Projects',
    requestedBy: 'Suresh Patel',
    date: '2024-11-13',
    amount: 45000,
    status: 'Pending',
    lineItems: [
      { name: 'Air Blower M-450TG (PD22071504)', qty: 1, unit: 'Unit', unitPrice: 42000, total: 42000 },
      { name: 'Installation & Commissioning', qty: 1, unit: 'Service', unitPrice: 3000, total: 3000 },
    ]
  },
  {
    id: 'PO-003', requestId: 'PR-849', orderId: 'PO-418',
    project: 'Project - Civil (GETT Phase 2)',
    products: 'OPC Cement 43 Grade | Qty - 200 Bags',
    shippingAddress: 'Good Earth Infra Site, NH-8, Manesar, Gurugram - 122051',
    vendor: 'BuildRight Supplies Pvt Ltd.',
    vendorGST: '06AAKCB1921H2ZS',
    department: 'Projects',
    requestedBy: 'Amitabh Singh',
    date: '2024-11-13',
    amount: 89000,
    status: 'Pending',
    lineItems: [
      { name: 'OPC Cement 43 Grade (50kg bag)', qty: 200, unit: 'Bags', unitPrice: 380, total: 76000 },
      { name: 'TMT Steel Bars Fe-500 (12mm)', qty: 0.5, unit: 'MT', unitPrice: 26000, total: 13000 },
    ]
  },
  {
    id: 'PO-004', requestId: 'PR-845', orderId: 'PO-414',
    project: 'Electrical Upgrade — Block C',
    products: 'MCB Distribution Panels & Wiring Accessories | Qty - 1 Lot',
    shippingAddress: 'Good Earth Infra HO, DLF Cyber City, Gurugram - 122002',
    vendor: 'PowerGrid Electricals',
    vendorGST: '06AAFCP7234N1Z8',
    department: 'Engineering',
    requestedBy: 'Dinesh Rawat',
    date: '2024-11-14',
    amount: 125400,
    status: 'Pending',
    lineItems: [
      { name: 'MCB Distribution Panel 32A (12-way)', qty: 4, unit: 'Units', unitPrice: 22000, total: 88000 },
      { name: 'Copper Flexible Wire 4 Sqmm (100m roll)', qty: 6, unit: 'Rolls', unitPrice: 5400, total: 32400 },
      { name: 'RCCB 63A 30mA', qty: 5, unit: 'Units', unitPrice: 1000, total: 5000 },
    ]
  },
  {
    id: 'PO-005', requestId: 'PR-840', orderId: 'PO-410',
    project: 'Corporate Office Furnishing',
    products: 'Ergonomic Office Chairs | Qty - 20',
    shippingAddress: 'Good Earth Infra HO, DLF Cyber City, Gurugram - 122002',
    vendor: 'FurnishPro India',
    vendorGST: '06AABCF4521G1ZK',
    department: 'HR & Admin',
    requestedBy: 'Pooja Nair',
    date: '2024-11-14',
    amount: 220000,
    status: 'Approved',
    approvedBy: 'Admin User',
    approvedAt: '2024-11-15T10:23:00',
    lineItems: [
      { name: 'Ergonomic Mesh Office Chair (High Back)', qty: 20, unit: 'Units', unitPrice: 11000, total: 220000 },
    ]
  },
  {
    id: 'PO-006', requestId: 'PR-838', orderId: 'PO-408',
    project: 'Site Safety Compliance — All Sites',
    products: 'ISI Certified Safety Helmets, Full Body Harnesses, Safety Gloves | Qty - 50 Sets',
    shippingAddress: 'Multiple Sites (Gurugram, Manesar, Faridabad)',
    vendor: 'SafeGuard Exports Ltd.',
    vendorGST: '06AAECS7812F1ZL',
    department: 'EHS',
    requestedBy: 'Vikas Bhardwaj',
    date: '2024-11-15',
    amount: 67500,
    status: 'Pending',
    lineItems: [
      { name: 'ISI Certified Safety Helmet (ABS)', qty: 50, unit: 'Units', unitPrice: 650, total: 32500 },
      { name: 'Full Body Safety Harness (Double Lanyard)', qty: 25, unit: 'Units', unitPrice: 1200, total: 30000 },
      { name: 'Cut-Resistant Safety Gloves (Pair)', qty: 100, unit: 'Pairs', unitPrice: 50, total: 5000 },
    ]
  },
  {
    id: 'PO-007', requestId: 'PR-832', orderId: 'PO-402',
    project: 'Design Department Licensing',
    products: 'AutoCAD 2025 Annual License | Qty - 3',
    shippingAddress: 'Good Earth Infra HO, DLF Cyber City, Gurugram - 122002',
    vendor: 'Autodesk India Pvt. Ltd.',
    vendorGST: '19AABCA1234D1Z5',
    department: 'Design',
    requestedBy: 'Karan Mehta',
    date: '2024-11-15',
    amount: 189000,
    status: 'Rejected',
    rejectedBy: 'Admin User',
    rejectedAt: '2024-11-16T09:15:00',
    rejectionReason: 'Budget not allocated for FY24-25. Defer to next quarter.',
    lineItems: [
      { name: 'AutoCAD 2025 Annual Subscription License', qty: 3, unit: 'Licenses', unitPrice: 63000, total: 189000 },
    ]
  },
  {
    id: 'PO-008', requestId: 'PR-829', orderId: 'PO-399',
    project: 'Plumbing Works — Tower B',
    products: 'CPVC Pipes, Ball Valves, Elbow Fittings | Qty - 1 Lot',
    shippingAddress: 'Good Earth Infra Site, Sector 88, Faridabad - 121002',
    vendor: 'AquaPipe Industries',
    vendorGST: '06AADCA9921K1ZT',
    department: 'Projects',
    requestedBy: 'Ramesh Yadav',
    date: '2024-11-16',
    amount: 312000,
    status: 'Pending',
    lineItems: [
      { name: 'CPVC Pipe 1 inch (3m length)', qty: 200, unit: 'Pieces', unitPrice: 780, total: 156000 },
      { name: 'Ball Valve 1 inch (Brass)', qty: 60, unit: 'Units', unitPrice: 1200, total: 72000 },
      { name: 'CPVC Elbow & Tee Fittings', qty: 1, unit: 'Lot', unitPrice: 84000, total: 84000 },
    ]
  },
  {
    id: 'PO-009', requestId: 'PR-824', orderId: 'PO-394',
    project: 'General — Corporate Office',
    products: 'Monthly Canteen Grocery & Consumables | Qty - 1 Month',
    shippingAddress: 'Good Earth Infra HO, DLF Cyber City, Gurugram - 122002',
    vendor: 'FreshMart Wholesale Pvt. Ltd.',
    vendorGST: '06AABCF9210H1ZM',
    department: 'Admin',
    requestedBy: 'Sunita Kapoor',
    date: '2024-11-16',
    amount: 38800,
    status: 'Pending',
    lineItems: [
      { name: 'Tea, Coffee & Beverages (Monthly)', qty: 1, unit: 'Month', unitPrice: 12000, total: 12000 },
      { name: 'Snacks, Biscuits & Packaged Food', qty: 1, unit: 'Month', unitPrice: 15800, total: 15800 },
      { name: 'Cleaning & Pantry Supplies', qty: 1, unit: 'Month', unitPrice: 11000, total: 11000 },
    ]
  },
  {
    id: 'PO-010', requestId: 'PR-820', orderId: 'PO-390',
    project: 'Brand & Marketing — Q4 2024',
    products: 'Corporate Brochures, Flex Banners, Standees | Qty - 1 Lot',
    shippingAddress: 'Good Earth Infra HO, DLF Cyber City, Gurugram - 122002',
    vendor: 'PrintMaster Studio',
    vendorGST: '06AABCP5621J1ZQ',
    department: 'Marketing',
    requestedBy: 'Neha Gupta',
    date: '2024-11-17',
    amount: 55000,
    status: 'Pending',
    lineItems: [
      { name: 'Corporate Brochures (A4, 4-colour, 1000 copies)', qty: 1000, unit: 'Copies', unitPrice: 35, total: 35000 },
      { name: 'Flex Banner (6x4 ft)', qty: 10, unit: 'Units', unitPrice: 1200, total: 12000 },
      { name: 'Retractable Standee (6.5 ft)', qty: 4, unit: 'Units', unitPrice: 2000, total: 8000 },
    ]
  },
]

const ApprovalsContext = createContext(null)

function loadData() {
  try {
    const saved = localStorage.getItem('gei_approvals')
    return saved ? JSON.parse(saved) : DEFAULT_POS
  } catch { return DEFAULT_POS }
}

export function ApprovalsProvider({ children }) {
  const [orders, setOrders] = useState(loadData)

  function save(newOrders) {
    setOrders(newOrders)
    localStorage.setItem('gei_approvals', JSON.stringify(newOrders))
  }

  function approve(ids, user) {
    save(orders.map(o => ids.includes(o.id) && o.status === 'Pending'
      ? { ...o, status: 'Approved', approvedBy: user, approvedAt: new Date().toISOString() }
      : o
    ))
  }

  function reject(ids, reason, user) {
    save(orders.map(o => ids.includes(o.id) && o.status === 'Pending'
      ? { ...o, status: 'Rejected', rejectedBy: user, rejectedAt: new Date().toISOString(), rejectionReason: reason }
      : o
    ))
  }

  function reset() { save(DEFAULT_POS) }

  const stats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    approved: orders.filter(o => o.status === 'Approved').length,
    rejected: orders.filter(o => o.status === 'Rejected').length,
    totalValue: orders.reduce((s, o) => s + o.amount, 0),
  }

  return (
    <ApprovalsContext.Provider value={{ orders, approve, reject, reset, stats }}>
      {children}
    </ApprovalsContext.Provider>
  )
}

export const useApprovals = () => useContext(ApprovalsContext)
export { DEFAULT_POS }
