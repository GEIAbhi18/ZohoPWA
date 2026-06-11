# GEI Procurement — System Architecture

## 1. High-Level System Overview

This diagram shows how **Zoho** (the enterprise source of truth) and your **PWA** (the mobile/web approval interface) communicate through **Supabase** as the middleware data layer.

```mermaid
graph TB
    subgraph ZOHO["☁️ Zoho Ecosystem"]
        direction TB
        ZP["🏢 Zoho Procurement<br/><i>Purchase Orders, Vendors,<br/>Products, Contracts</i>"]
        ZI["📋 Zoho Inventory<br/><i>Warehouses, Stock</i>"]
        ZF["🔄 Zoho Flow / Deluge<br/><i>Automation & Webhooks</i>"]
        ZP --- ZF
        ZI --- ZF
    end

    subgraph SUPABASE["⚡ Supabase (Middleware)"]
        direction TB
        DB[("🗄️ PostgreSQL DB<br/><code>purchase_orders_for_approval</code>")]
        RT["📡 Realtime Engine<br/><i>Postgres Changes</i>"]
        ST["📦 Storage Buckets<br/><i>po-approvals, signature</i>"]
        AUTH["🔐 Row-Level Security<br/><i>Anon Key Access</i>"]
        DB --- RT
        DB --- AUTH
        ST --- AUTH
    end

    subgraph PWA["📱 GEI Procurement PWA"]
        direction TB
        UI["🖥️ React SPA<br/><i>Vite + vite-plugin-pwa</i>"]
        SW["⚙️ Service Worker<br/><i>Workbox — Offline Cache</i>"]
        CTX["🧠 State Management<br/><i>ApprovalsContext<br/>AuthContext<br/>ToastContext</i>"]
        UI --- CTX
        UI --- SW
    end

    subgraph USERS["👥 End Users"]
        direction LR
        MGR["👔 Manager<br/><i>Approve / Reject</i>"]
        DIR["🏛️ Director<br/><i>Final Approval</i>"]
        ADM["🛡️ Admin<br/><i>Full Access</i>"]
    end

    ZF -->|"Sync POs via<br/>Webhook / API"| DB
    DB -->|"Write-back status<br/>to Zoho"| ZF
    RT -->|"Realtime push<br/>(WebSocket)"| CTX
    CTX -->|"CRUD Operations<br/>(REST + Realtime)"| DB
    CTX -->|"Upload signatures<br/>& attachments"| ST
    USERS -->|"Login & Actions<br/>(Mobile / Desktop)"| UI

    style ZOHO fill:#1a73e8,stroke:#1557b0,color:#fff,rx:12
    style SUPABASE fill:#3ecf8e,stroke:#2da86e,color:#fff,rx:12
    style PWA fill:#6c5ce7,stroke:#5641c7,color:#fff,rx:12
    style USERS fill:#fd9644,stroke:#d97b30,color:#fff,rx:12
```

---

## 2. Detailed Data Flow

This shows the exact sequence of data movement from Zoho → Supabase → PWA → back to Zoho when a Purchase Order is created and approved.

```mermaid
sequenceDiagram
    autonumber
    participant Z as 🏢 Zoho Procurement
    participant ZF as 🔄 Zoho Flow/Deluge
    participant DB as 🗄️ Supabase PostgreSQL
    participant RT as 📡 Supabase Realtime
    participant PWA as 📱 PWA (React)
    participant ST as 📦 Supabase Storage
    participant U as 👔 Approver

    Note over Z,U: ── Phase 1: PO Creation ──
    Z->>ZF: New PO created in Zoho
    ZF->>DB: INSERT into purchase_orders_for_approval<br/>(order_id, product, vendor, quantity,<br/>unit_price, tax, total, status='Pending')
    DB->>RT: Postgres Change event triggered
    RT-->>PWA: WebSocket push (new row)
    PWA->>PWA: ApprovalsContext.fetchOrders()<br/>Re-renders Approvals table

    Note over Z,U: ── Phase 2: Approval Workflow ──
    U->>PWA: Opens PO → clicks "Approve"
    PWA->>PWA: POApprovalModal opens<br/>(Reference No, Billing Address,<br/>Advance, T&C, Signature, Attachment)
    U->>PWA: Fills form + draws signature
    PWA->>ST: uploadSignature(canvas, poId) → PNG
    ST-->>PWA: Returns public URL
    PWA->>ST: uploadAttachment(file, poId)
    ST-->>PWA: Returns public URL
    PWA->>DB: UPDATE status='Approved',<br/>signature_url, attachment_url,<br/>approved_by, approved_at,<br/>reference_number, billing_address,<br/>advance_amount, approval_comments
    DB->>RT: Postgres Change event
    RT-->>PWA: Status update pushed to all clients

    Note over Z,U: ── Phase 3: Sync Back to Zoho ──
    DB->>ZF: Webhook/trigger on status change
    ZF->>Z: Update PO status in Zoho Procurement<br/>(Approved + metadata)
```

---

## 3. PWA Component Architecture

Shows the internal React component tree and how data flows through contexts.

```mermaid
graph TD
    subgraph APP["🏗️ App.jsx — Root"]
        direction TB
        AP["AuthProvider"]
        APC["ApprovalsProvider"]
        TP["ToastProvider"]
        AR["AppRoutes"]
        AP --> APC --> TP --> AR
    end

    subgraph ROUTES["🛤️ Routes"]
        direction TB
        LP["/ → LandingPage"]
        LGN["/login → LoginPage"]
        APR["/approvals → PageWrapper"]
        STUB["/* → BlankPage stubs<br/>(Requests, Procurements,<br/>Orders, Inventory, Setup, etc.)"]
    end

    subgraph PAGE_WRAPPER["📄 PageWrapper"]
        direction LR
        SB["Sidebar"]
        TN["TopNav"]
        MAIN["main content"]
    end

    subgraph APPROVALS_PAGE["📋 ApprovalsPage"]
        direction TB
        TABS["Tab Bar<br/>(Employee Requests, Procurement,<br/>Purchase Orders, Payment)"]
        FILTERS["Search + Filter Bar<br/>(Vendor, Status)"]
        TABLE["PO Data Table<br/>(Desktop: table, Mobile: cards)"]
        STATS["Stat Cards<br/>(Pending, Approved,<br/>Rejected, Total Value)"]
    end

    subgraph MODALS["🪟 Modals"]
        direction TB
        DETAIL["PODetailModal<br/><i>View PO details</i>"]
        APPROVAL["POApprovalModal<br/><i>Full approval form:<br/>Reference No, Billing,<br/>Advance, T&C, Signature,<br/>Attachment</i>"]
        ACT_A["ApproveModal<br/><i>Quick bulk approve</i>"]
        ACT_R["RejectModal<br/><i>Reject with reason</i>"]
    end

    subgraph DATA_LAYER["🧠 Data Layer"]
        direction TB
        AC["ApprovalsContext<br/><i>orders[], approve(), reject(),<br/>reset(), stats, refetch()</i>"]
        AUC["AuthContext<br/><i>user, login(), logout()</i>"]
        TC["ToastContext<br/><i>toast notifications</i>"]
        SB_LIB["supabase.js<br/><i>Supabase client init</i>"]
        SB_ST["supabaseStorage.js<br/><i>uploadSignature(),<br/>uploadAttachment()</i>"]
    end

    AR --> ROUTES
    APR --> PAGE_WRAPPER
    PAGE_WRAPPER --> APPROVALS_PAGE
    TABLE --> MODALS
    APPROVALS_PAGE --> AC
    APPROVAL --> SB_ST
    AC --> SB_LIB
    SB_ST --> SB_LIB

    style APP fill:#6c5ce7,stroke:#5641c7,color:#fff
    style DATA_LAYER fill:#3ecf8e,stroke:#2da86e,color:#fff
    style MODALS fill:#fd9644,stroke:#d97b30,color:#fff
```

---

## 4. Supabase Table Schema

The `purchase_orders_for_approval` table acts as the bridge between Zoho and the PWA:

| Column | Type | Source | Description |
|---|---|---|---|
| `id` | UUID | Supabase | Primary key (auto) |
| `order_id` | text | Zoho → Supabase | PO number from Zoho |
| `product` | text | Zoho → Supabase | Product name/description |
| `vendor` | text | Zoho → Supabase | Vendor name |
| `measurement_unit` | text | Zoho → Supabase | Unit (e.g., Pieces, KG) |
| `quantity` | numeric | Zoho → Supabase | Ordered quantity |
| `unit_price` | numeric | Zoho → Supabase | Price per unit |
| `tax_rate` | numeric | Zoho → Supabase | Tax percentage |
| `tax_amount` | numeric | Zoho → Supabase | Calculated tax |
| `discount_amount` | numeric | Zoho → Supabase | Discount applied |
| `shipping_charge` | numeric | Zoho → Supabase | Shipping cost |
| `total_cost` | numeric | Zoho → Supabase | Line total |
| `final_total` | numeric | Zoho → Supabase | Grand total |
| `type` | text | Zoho → Supabase | PO type |
| `terms_conditions` | text | Zoho → Supabase | Original T&C |
| `payment_terms` | text | Zoho → Supabase | Payment terms |
| `status` | text | **Both** | `Pending` → `Approved` / `Rejected` |
| `reference_number` | text | PWA → Supabase | Approver's reference |
| `billing_address` | text | PWA → Supabase | Selected billing entity |
| `advance_amount` | numeric | PWA → Supabase | Advance payment amount |
| `approval_comments` | text | PWA → Supabase | Approver comments |
| `approval_terms_conditions` | text | PWA → Supabase | Modified T&C by approver |
| `attachment_url` | text | PWA → Supabase | Uploaded file URL |
| `signature_url` | text | PWA → Supabase | Drawn signature image URL |
| `approved_by` | text | PWA → Supabase | Approver name |
| `approved_at` | timestamp | PWA → Supabase | Approval timestamp |
| `created_at` | timestamp | Supabase | Row creation time |
| `updated_at` | timestamp | Supabase | Last modified time |

---

## 5. PO Approval Workflow (State Machine)

```mermaid
stateDiagram-v2
    [*] --> Created: PO Created in Zoho

    Created --> Pending: Zoho Flow syncs to Supabase
    
    Pending --> Reviewing: Approver opens PO
    
    Reviewing --> Approved: Approver fills form\n+ signs + submits
    Reviewing --> Rejected: Approver rejects\nwith reason
    Reviewing --> Pending: Approver closes\nwithout action
    
    Approved --> SyncedToZoho: Webhook triggers\nZoho update
    Rejected --> SyncedToZoho: Webhook triggers\nZoho update
    
    SyncedToZoho --> [*]

    note right of Approved
        Approval data stored:
        - Signature URL
        - Attachment URL
        - Reference Number
        - Billing Address
        - Advance Amount
        - Comments & T&C
    end note

    note left of Pending
        Realtime updates pushed
        to all connected PWA
        clients via WebSocket
    end note
```

---

## 6. Technology Stack Summary

| Layer | Technology | Role |
|---|---|---|
| **Enterprise Backend** | Zoho Procurement + Inventory | Source of truth for POs, vendors, products |
| **Automation** | Zoho Flow / Deluge Scripts | Bi-directional sync between Zoho ↔ Supabase |
| **Database** | Supabase PostgreSQL | Central data store for approval workflow |
| **Realtime** | Supabase Realtime (WebSocket) | Live push updates to all connected PWA clients |
| **File Storage** | Supabase Storage (buckets: `po-approvals`, `signature`) | Signatures & attachment files |
| **Frontend** | React 18 + Vite 5 | SPA with component-based UI |
| **PWA** | vite-plugin-pwa + Workbox | Offline capability, installable app, service worker caching |
| **Routing** | React Router v6 | Client-side navigation |
| **Icons** | Lucide React | UI iconography |
| **Auth** | Local auth (hardcoded users) | Role-based login (Admin, Manager, Director) |
