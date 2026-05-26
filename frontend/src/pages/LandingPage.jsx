import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#060b14',backgroundImage:'radial-gradient(ellipse at 20% 20%,rgba(0,229,192,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(14,165,233,0.05) 0%,transparent 50%)' }}>
      <div style={{ width:'100%',maxWidth:'500px',padding:'24px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'12px',justifyContent:'center',marginBottom:'40px' }}>
          <div style={{ width:'48px',height:'48px',borderRadius:'14px',background:'linear-gradient(135deg,#00e5c0,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Space Mono,monospace',fontWeight:700,fontSize:'14px',color:'#000' }}>ASL</div>
          <span style={{ fontSize:'24px',fontWeight:800 }}><span style={{ color:'#00e5c0' }}>ASL</span> Wallets</span>
        </div>
        <div style={{ textAlign:'center',fontSize:'13px',color:'var(--muted)',marginBottom:'32px',fontFamily:'Space Mono,monospace',letterSpacing:'1px',textTransform:'uppercase' }}>Task Management System</div>

        {[{ to:'/admin', icon:'🛡️', title:'Admin Panel', desc:'Full control — tasks, members, analytics, permissions', color:'rgba(0,229,192,0.1)', border:'rgba(0,229,192,0.15)' },
          { to:'/member', icon:'👤', title:'Member Portal', desc:'Team member login — view & manage your assigned tasks', color:'rgba(14,165,233,0.1)', border:'rgba(14,165,233,0.15)' }
        ].map(p=>(
          <Link key={p.to} to={p.to} style={{ display:'flex',alignItems:'center',gap:'18px',background:'var(--surface)',border:`1px solid var(--border)`,borderRadius:'16px',padding:'22px',marginBottom:'14px',cursor:'pointer',textDecoration:'none',color:'var(--text)',transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=p.border; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
            <div style={{ width:'52px',height:'52px',borderRadius:'12px',background:p.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0 }}>{p.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'16px',fontWeight:700,marginBottom:'4px' }}>{p.title}</div>
              <div style={{ fontSize:'12px',color:'var(--muted)',lineHeight:1.5 }}>{p.desc}</div>
            </div>
            <span style={{ fontSize:'20px',color:'var(--muted)' }}>→</span>
          </Link>
        ))}
        <div style={{ textAlign:'center',marginTop:'24px',fontSize:'11px',color:'var(--muted)',fontFamily:'Space Mono,monospace' }}>ASL Wallets Task Management v2.0 • 2026</div>
      </div>
    </div>
  );
}
