# GEI Procurement PWA

A modern, offline-capable Progressive Web Application (PWA) built for **GEI Procurement**. This application serves as a mobile and web-friendly approval interface that seamlessly integrates with the **Zoho Ecosystem** (Procurement and Inventory) via a **Supabase** middleware layer.

## 🚀 Key Features

- **Progressive Web App (PWA):** Installable on mobile and desktop devices with offline caching via Workbox and `vite-plugin-pwa`.
- **Enterprise Integration:** Real-time bi-directional synchronization with Zoho Procurement and Zoho Inventory through Zoho Flow.
- **Approval Workflows:** Streamlined purchase order approvals for Managers, Directors, and Admins.
- **Secure Document Handling:** Built-in capability to sign documents directly on the screen and attach relevant files, securely stored in Supabase.
- **Real-time Updates:** WebSocket-powered real-time updates ensure all connected clients see state changes instantly.
- **Role-Based Access Control:** Distinct workflows and permissions based on user roles.

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, Vite 5 |
| **Routing** | React Router v6 |
| **Styling & UI** | Custom CSS, Lucide React (Icons) |
| **PWA Capabilities** | `vite-plugin-pwa`, Workbox |
| **Backend & Database**| Supabase (PostgreSQL) |
| **Realtime Engine** | Supabase Realtime |
| **File Storage** | Supabase Storage (`po-approvals`, `signature` buckets) |
| **Enterprise Backend** | Zoho Procurement, Zoho Inventory |
| **Automation** | Zoho Flow, Deluge Scripts |

## 🏗️ System Architecture

The application acts as the front-end interface, communicating with Supabase, which bridges the gap to Zoho:

1. **Zoho ↔ Supabase Sync:** Zoho Flow detects new Purchase Orders and pushes them to Supabase.
2. **Real-time PWA Updates:** Supabase pushes new data to the PWA via WebSockets.
3. **Approval Action:** An approver reviews the PO, fills out necessary details (Reference, Billing, T&C, Signatures, Attachments) and approves or rejects it.
4. **Write-back:** Supabase updates its PostgreSQL database and triggers a webhook back to Zoho Flow to finalize the PO status in Zoho Procurement.

For more detailed sequence diagrams and schema definitions, please refer to the [System Architecture Documentation](system_architecture.md).

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase Project
- Zoho Procurement / Inventory Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GEIAbhi18/ZohoPWA.git
   cd ZohoPWA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

## 🔒 Security

- Row-Level Security (RLS) is enforced at the Supabase database and storage layers.
- Authentication ensures only authorized personnel can view or act on purchase orders.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
