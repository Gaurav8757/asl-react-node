import React, { useState } from 'react';

// ===== MODAL =====
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',
        zIndex:300,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:'var(--radius-xl)',
        padding:'28px',width:'90%',maxWidth:'500px',animation:'mIn 0.2s ease' }}>
        <style>{`@keyframes mIn{from{opacity:0;transform:scale(0.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
        <h3 style={{ fontSize:'18px',fontWeight:800,marginBottom:'20px' }}
          dangerouslySetInnerHTML={{ __html: title }} />
        {children}
      </div>
    </div>
  );
}

// ===== TOAST =====
let toastContainer = null;
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  toastContainer = { add: (msg, type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }};
  return (
    <div style={{ position:'fixed',bottom:'24px',right:'24px',zIndex:500,display:'flex',flexDirection:'column',gap:'8px' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:'var(--surface)',border:`1px solid ${t.type==='success'?'rgba(16,185,129,0.3)':t.type==='error'?'rgba(244,63,94,0.3)':'rgba(14,165,233,0.3)'}`,
          borderRadius:'12px',padding:'14px 20px',fontSize:'13px',fontWeight:600,
          color:t.type==='success'?'var(--success)':t.type==='error'?'var(--danger)':'var(--accent2)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.4)',animation:'mIn 0.3s ease',display:'flex',alignItems:'center',gap:'8px' }}>
          {t.type==='success'?'✅':t.type==='error'?'❌':'ℹ️'} {t.msg}
        </div>
      ))}
    </div>
  );
}
export const toast = (msg, type='info') => toastContainer?.add(msg, type);

// ===== SPINNER =====
export function Spinner({ size=24 }) {
  return (
    <div style={{ width:size,height:size,border:`2px solid var(--border2)`,
      borderTop:`2px solid var(--accent)`,borderRadius:'50%',
      animation:'spin 0.8s linear infinite',display:'inline-block' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ===== CONFIRM MODAL =====
export function ConfirmModal({ open, onClose, onConfirm, title, message, danger=true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div style={{ background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.2)',
        borderRadius:'10px',padding:'14px',marginBottom:'20px',fontSize:'13px',
        color:'#fca5a5',lineHeight:1.6 }}>⚠️ {message}</div>
      <div style={{ display:'flex',gap:'10px' }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className={`btn ${danger?'btn-danger':'btn-primary'}`} style={{ flex:2 }} onClick={onConfirm}>
          {danger ? '🗑️ Delete' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}

// ===== STAT CARD =====
export function KpiCard({ icon, value, label, delta, color='var(--accent)', accent }) {
  return (
    <div className="card" style={{ position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:accent||color }} />
      <div style={{ fontSize:'24px',marginBottom:'10px' }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-mono)',fontSize:'28px',fontWeight:700,color }}>{value}</div>
      <div style={{ fontSize:'12px',color:'var(--muted)',marginTop:'6px' }}>{label}</div>
      {delta && <div style={{ fontSize:'11px',color,marginTop:'8px' }}>{delta}</div>}
    </div>
  );
}

// ===== BAR CHART ROW =====
export function BarRow({ label, value, max, color }) {
  const pct = max ? Math.round(value/max*100) : 0;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
      <div style={{ fontSize:'12px',color:'var(--muted2)',width:'80px',flexShrink:0 }}>{label}</div>
      <div style={{ flex:1,height:'8px',background:'var(--surface3)',borderRadius:'99px',overflow:'hidden' }}>
        <div style={{ height:'100%',borderRadius:'99px',background:color,width:`${pct}%`,transition:'width 1s ease' }} />
      </div>
      <div style={{ fontSize:'12px',fontFamily:'var(--font-mono)',color:'var(--muted2)',width:'30px',textAlign:'right' }}>{value}</div>
    </div>
  );
}

// ===== PRIORITY BADGE =====
const priorityMap = { high:'pill-red', medium:'pill-gold', low:'pill-green' };
const statusMap = { todo:'pill-gold', progress:'pill-blue', done:'pill-green' };
const tagMap = { agent:'pill-accent', expansion:'pill-purple', finance:'pill-gold', tech:'pill-blue', marketing:'pill-purple' };
export const PriorityBadge = ({ v }) => <span className={`pill ${priorityMap[v]||'pill-blue'}`}>{v}</span>;
export const StatusBadge = ({ v }) => <span className={`pill ${statusMap[v]||'pill-blue'}`}>{v==='todo'?'To Do':v==='progress'?'In Progress':'Done'}</span>;
export const TagBadge = ({ v }) => <span className={`pill ${tagMap[v]||'pill-blue'}`}>{v}</span>;

// ===== AVATAR =====
const aColors = ['#00e5c0','#0ea5e9','#a78bfa','#f59e0b','#f43f5e','#10b981','#f472b6','#fb923c'];
export function Avatar({ name, size=28 }) {
  let h=0; for(let c of(name||'?')) h=c.charCodeAt(0)+((h<<5)-h);
  const color = aColors[Math.abs(h)%aColors.length];
  const initials = (name||'?').trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  return (
    <div style={{ width:size,height:size,borderRadius:'6px',background:color,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:size*0.38+'px',fontWeight:700,color:'#fff',flexShrink:0 }}>
      {initials}
    </div>
  );
}
