import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/shared/UI';

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginMember } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await loginMember(email, password);
      toast('Welcome back!', 'success');
      nav('/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const members = [
    { name: 'Rahul', email: 'rahul@aslwallets.com' },
    { name: 'Priya', email: 'priya@aslwallets.com' },
    { name: 'Sneha', email: 'sneha@aslwallets.com' },
    { name: 'Dev', email: 'dev@aslwallets.com' },
    { name: 'Ananya', email: 'ananya@aslwallets.com' },
  ];

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#060b14',backgroundImage:'radial-gradient(ellipse at 50% 0%,rgba(14,165,233,0.1) 0%,transparent 60%)' }}>
      <div style={{ width:'100%',maxWidth:'380px',padding:'20px' }}>
        <div style={{ background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:'20px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}>
          {/* Blue Header */}
          <div style={{ background:'#0ea5e9',padding:'30px 28px 28px',textAlign:'center',position:'relative' }}>
            <div style={{ position:'absolute',bottom:'-1px',left:0,right:0,height:'20px',background:'var(--surface)',clipPath:'ellipse(55% 100% at 50% 100%)' }} />
            <div style={{ display:'inline-flex',alignItems:'center',gap:'10px',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:'10px',padding:'8px 18px',marginBottom:'12px' }}>
              <div style={{ width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,0.5)' }} />
              <span style={{ color:'#fff',fontWeight:800,fontSize:'15px',letterSpacing:'1.5px',fontFamily:'var(--font-mono)' }}>ASL WALLETS</span>
              <div style={{ width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,0.5)' }} />
            </div>
            <div style={{ fontSize:'12px',color:'rgba(255,255,255,0.6)',letterSpacing:'2px',textTransform:'uppercase',fontFamily:'var(--font-mono)' }}>Member Portal</div>
          </div>
          <form onSubmit={handleLogin} style={{ padding:'28px' }}>
            <div style={{ fontSize:'18px',fontWeight:800,marginBottom:'20px' }}>Member Login</div>
            {error && <div style={{ background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.25)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'#fca5a5',marginBottom:'16px',textAlign:'center' }}>❌ {error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="yourname@aslwallets.com" required style={{ borderColor:error?'var(--danger)':'' }} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required style={{ paddingRight:'40px',borderColor:error?'var(--danger)':'' }} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--muted)' }}>{showPw?'🙈':'👁️'}</button>
              </div>
            </div>
            <button type="submit" className="btn" style={{ width:'100%',padding:'12px',fontSize:'15px',marginTop:'4px',background:'#0ea5e9',border:'none',color:'#fff',fontWeight:800,borderRadius:'var(--radius-sm)',cursor:'pointer' }} disabled={loading}>
              {loading ? '⏳ Logging in...' : 'Login to Portal →'}
            </button>
            <div style={{ marginTop:'16px',padding:'12px 16px',background:'rgba(14,165,233,0.06)',border:'1px solid rgba(14,165,233,0.2)',borderRadius:'10px' }}>
              <div style={{ fontSize:'10px',color:'#0ea5e9',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px',fontFamily:'var(--font-mono)' }}>Member Accounts (Default: member@123)</div>
              {members.map(m => (
                <div key={m.email} style={{ display:'flex',justifyContent:'space-between',marginBottom:'4px',cursor:'pointer' }} onClick={()=>setEmail(m.email)}>
                  <span style={{ fontSize:'12px',color:'var(--muted2)' }}>{m.name}</span>
                  <span style={{ fontFamily:'var(--font-mono)',fontSize:'11px',background:'var(--surface2)',border:'1px solid rgba(14,165,233,0.25)',borderRadius:'6px',padding:'2px 8px',color:'#0ea5e9' }}>{m.email}</span>
                </div>
              ))}
            </div>
          </form>
        </div>
        <div style={{ textAlign:'center',marginTop:'16px',fontSize:'13px',color:'var(--muted)' }}>
          Admin? <a href="/admin" style={{ color:'var(--accent)',textDecoration:'none' }}>Go to Admin Panel →</a>
        </div>
      </div>
    </div>
  );
}
