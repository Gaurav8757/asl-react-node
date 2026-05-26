import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/shared/UI';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await loginAdmin(username, password);
      toast('Welcome back, Admin!', 'success');
      nav('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#060b14',backgroundImage:'radial-gradient(ellipse at 50% 0%,rgba(29,158,117,0.12) 0%,transparent 60%)' }}>
      <div style={{ width:'100%',maxWidth:'380px',padding:'20px' }}>
        <div style={{ background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:'20px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}>
          {/* Green Header */}
          <div style={{ background:'#1d9e75',padding:'30px 28px 28px',textAlign:'center',position:'relative' }}>
            <div style={{ position:'absolute',bottom:'-1px',left:0,right:0,height:'20px',background:'var(--surface)',clipPath:'ellipse(55% 100% at 50% 100%)' }} />
            <div style={{ display:'inline-flex',alignItems:'center',gap:'10px',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:'10px',padding:'8px 18px',marginBottom:'12px' }}>
              <div style={{ width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,0.5)' }} />
              <span style={{ color:'#fff',fontWeight:800,fontSize:'15px',letterSpacing:'1.5px',fontFamily:'var(--font-mono)' }}>ASL WALLETS</span>
              <div style={{ width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,0.5)' }} />
            </div>
            <div style={{ fontSize:'12px',color:'rgba(255,255,255,0.6)',letterSpacing:'2px',textTransform:'uppercase',fontFamily:'var(--font-mono)' }}>Admin Portal</div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ padding:'28px' }}>
            <div style={{ fontSize:'18px',fontWeight:800,marginBottom:'20px' }}>Access Dashboard</div>
            {error && <div style={{ background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.25)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'#fca5a5',marginBottom:'16px',textAlign:'center' }}>❌ {error}</div>}
            <div className="form-group">
              <label>Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" required style={{ borderColor: error?'var(--danger)':'' }} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required style={{ paddingRight:'40px',borderColor:error?'var(--danger)':'' }} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--muted)' }}>{showPw?'🙈':'👁️'}</button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%',padding:'12px',fontSize:'15px',marginTop:'4px',background:'#1d9e75',color:'#fff' }} disabled={loading}>
              {loading ? '⏳ Logging in...' : 'Access Dashboard →'}
            </button>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',marginTop:'14px',fontSize:'11px',color:'var(--muted)' }}>
              <div style={{ width:'5px',height:'5px',borderRadius:'50%',background:'#1d9e75' }} /> Secured Access — Authorized Personnel Only
            </div>
            <div style={{ marginTop:'16px',padding:'12px 16px',background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'10px' }}>
              <div style={{ fontSize:'10px',color:'#1d9e75',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px',fontFamily:'var(--font-mono)' }}>Default Credentials</div>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'4px' }}>
                <span style={{ fontSize:'12px',color:'var(--muted2)' }}>Username</span>
                <span style={{ fontFamily:'var(--font-mono)',fontSize:'12px',background:'var(--surface2)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'2px 8px',color:'#1d9e75' }}>admin</span>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <span style={{ fontSize:'12px',color:'var(--muted2)' }}>Password</span>
                <span style={{ fontFamily:'var(--font-mono)',fontSize:'12px',background:'var(--surface2)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'2px 8px',color:'#1d9e75' }}>asl@2026</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
