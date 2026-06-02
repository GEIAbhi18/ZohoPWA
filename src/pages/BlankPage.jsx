import React from 'react'
import { Construction } from 'lucide-react'

export default function BlankPage({ title, icon }) {
  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>{title}</h1>
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '80px 24px', textAlign: 'center' }}>
        <Construction size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>This section is under development and will be available soon.</div>
      </div>
    </div>
  )
}
