import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, ShieldCheck, Zap, BarChart3 } from 'lucide-react'

const features = [
  { icon: ShieldCheck, title: 'Smart Approvals', desc: 'Multi-level approval workflows with instant mobile notifications' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track procurement spend, vendor performance and budget utilisation' },
  { icon: Zap, title: 'Fast Processing', desc: 'Approve or reject purchase orders in seconds from anywhere' },
  { icon: Building2, title: 'Multi-Project', desc: 'Manage procurement across all GEI projects from one dashboard' },
]

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D2347 0%, #1B3A6B 45%, #2D5DA6 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Nav bar */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15, color: 'white', fontFamily: 'var(--font)',
          }}>GEI</div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 17 }}>Good Earth Infra</span>
        </div>
        <button className="btn" onClick={() => nav('/login')} style={{
          background: 'rgba(255,255,255,0.12)', color: 'white',
          border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          fontSize: 13,
        }}>
          Sign In <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 40px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 99, marginBottom: 32, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
          Enterprise Procurement Platform
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 20, maxWidth: 700, letterSpacing: '-0.02em' }}>
          Procurement,<br />
          <span style={{ color: '#93C5FD' }}>simplified.</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.65)', maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
          Manage purchase requests, approvals, vendors, and orders — all from your phone. Built for Good Earth Infra's procurement teams.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn" onClick={() => nav('/login')} style={{
            background: 'white', color: 'var(--navy)', fontWeight: 600, fontSize: 15,
            padding: '12px 28px', borderRadius: 10,
          }}>
            Get Started <ArrowRight size={16} />
          </button>
          <button className="btn" style={{
            background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
            fontSize: 15, padding: '12px 28px', borderRadius: 10,
          }}>
            Learn More
          </button>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginTop: 80, maxWidth: 900, width: '100%',
        }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '20px 18px', textAlign: 'left', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color="white" />
              </div>
              <div style={{ fontWeight: 600, color: 'white', fontSize: 14, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.35)', fontSize: 12, position: 'relative', zIndex: 1 }}>
        © 2025 Good Earth Infra. All rights reserved.
      </footer>
    </div>
  )
}
