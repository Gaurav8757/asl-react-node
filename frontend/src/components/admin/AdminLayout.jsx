import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../shared/UI';

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/tasks', icon: '✅', label: 'All Tasks' },
  { to: '/admin/members', icon: '👥', label: 'Team Members' },
  { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { to: '/admin/logs', icon: '📋', label: 'Activity Logs' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    toast('Logged out', 'info');
    nav('/admin');
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden' }}>
      {/* Top Bar */}
      <header style={{ height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 24px',borderBottom:'1px solid var(--border)',background:'rgba(6,11,20,0.95)',
        backdropFilter:'blur(20px)',position:'relative',zIndex:50,flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
          <div style={{ width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#1d9e75,#0ea5e9)',
            display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontWeight:700,fontSize:'11px',color:'#fff' }}>ASL</div>
          <span style={{ fontWeight:800,fontSize:'16px' }}><span style={{ color:'var(--accent)' }}>ASL</span> Wallets</span>
          <span style={{ fontFamily:'var(--font-mono)',fontSize:'10px',color:'#1d9e75',background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',padding:'3px 10px',borderRadius:'4px',letterSpacing:'1px' }}>ADMIN PANEL</span>
        </div>
        <div style={{ position:'relative' }}>
          <div onClick={()=>setMenuOpen(!menuOpen)} style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'6px 12px',cursor:'pointer' }}>
            <div style={{ width:'26px',height:'26px',borderRadius:'6px',background:'linear-gradient(135deg,var(--accent3),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff' }}>AD</div>
            <div><div style={{ fontSize:'13px',fontWeight:600 }}>{user?.username||'Admin'}</div>
              <div style={{ fontSize:'10px',color:'var(--muted)',fontFamily:'var(--font-mono)' }}>SUPER ADMIN</div></div>
            <span style={{ fontSize:'10px',color:'var(--muted)' }}>▾</span>
          </div>
          {menuOpen && (
            <div onClick={()=>setMenuOpen(false)} style={{ position:'absolute',top:'calc(100% + 8px)',right:0,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:'10px',padding:'6px',minWidth:'160px',zIndex:200,boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
              <div onClick={()=>{nav('/admin/settings');setMenuOpen(false);}} style={{ display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',borderRadius:'7px',cursor:'pointer',fontSize:'13px',color:'var(--muted2)' }}
                onMouseEnter={e=>e.target.style.background='var(--surface2)'} onMouseLeave={e=>e.target.style.background='transparent'}>⚙️ Settings</div>
              <div onClick={handleLogout} style={{ display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',borderRadius:'7px',cursor:'pointer',fontSize:'13px',color:'var(--danger)' }}
                onMouseEnter={e=>e.target.style.background='rgba(244,63,94,0.1)'} onMouseLeave={e=>e.target.style.background='transparent'}>🚪 Logout</div>
            </div>
          )}
        </div>
      </header>

      <div style={{ display:'flex',flex:1,overflow:'hidden' }}>
        {/* Sidebar */}
        <nav style={{ width:'220px',flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',overflowY:'auto' }}>
          <div style={{ padding:'20px 14px 8px' }}>
            <div style={{ fontSize:'10px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'1.2px',fontFamily:'var(--font-mono)',marginBottom:'8px',paddingLeft:'8px' }}>Navigation</div>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to}
                style={({ isActive }) => ({ display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'8px',
                  fontSize:'13px',fontWeight:500,textDecoration:'none',marginBottom:'2px',transition:'all 0.15s',
                  background:isActive?'rgba(0,229,192,0.08)':'transparent',
                  color:isActive?'var(--accent)':'var(--muted2)',
                  border:isActive?'1px solid rgba(0,229,192,0.15)':'1px solid transparent' })}>
                <span style={{ fontSize:'16px',width:'20px',textAlign:'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main style={{ flex:1,overflowY:'auto',padding:'24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
