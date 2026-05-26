import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, toast } from '../shared/UI';

const navItems = [
  { to: '/member/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/member/tasks', icon: '✅', label: 'My Tasks' },
  { to: '/member/profile', icon: '👤', label: 'My Profile' },
];

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    toast('Logged out', 'info');
    nav('/member');
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden' }}>
      <header style={{ height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 24px',borderBottom:'1px solid var(--border)',background:'rgba(6,11,20,0.95)',
        backdropFilter:'blur(20px)',flexShrink:0,zIndex:50 }}>
        <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
          <div style={{ width:'32px',height:'32px',borderRadius:'8px',background:'#0ea5e9',
            display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontWeight:700,fontSize:'11px',color:'#fff' }}>ASL</div>
          <span style={{ fontWeight:800,fontSize:'16px' }}><span style={{ color:'#0ea5e9' }}>ASL</span> Wallets</span>
          <span style={{ fontFamily:'var(--font-mono)',fontSize:'10px',color:'#0ea5e9',background:'rgba(14,165,233,0.08)',border:'1px solid rgba(14,165,233,0.2)',padding:'3px 10px',borderRadius:'4px',letterSpacing:'1px' }}>MEMBER PORTAL</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'6px 12px' }}>
            <Avatar name={user?.name} size={26} />
            <div><div style={{ fontSize:'13px',fontWeight:600 }}>{user?.name?.split(' ')[0]}</div>
              <div style={{ fontSize:'10px',color:'var(--muted)',fontFamily:'var(--font-mono)' }}>{user?.role}</div></div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </header>

      <div style={{ display:'flex',flex:1,overflow:'hidden' }}>
        <nav style={{ width:'200px',flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border)',padding:'20px 14px' }}>
          <div style={{ fontSize:'10px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'1.2px',fontFamily:'var(--font-mono)',marginBottom:'8px',paddingLeft:'8px' }}>My Work</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({ display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'8px',
                fontSize:'13px',fontWeight:500,textDecoration:'none',marginBottom:'2px',transition:'all 0.15s',
                background:isActive?'rgba(14,165,233,0.08)':'transparent',
                color:isActive?'#0ea5e9':'var(--muted2)',
                border:isActive?'1px solid rgba(14,165,233,0.15)':'1px solid transparent' })}>
              <span style={{ fontSize:'16px',width:'20px',textAlign:'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <main style={{ flex:1,overflowY:'auto',padding:'24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
