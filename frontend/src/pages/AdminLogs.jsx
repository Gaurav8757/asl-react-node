import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Spinner } from '../components/shared/UI';

export default function AdminLogs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    api.get('/logs').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const logColors = { info:'var(--accent)', success:'var(--success)', warning:'var(--gold)', error:'var(--danger)' };
  const logIcons = { info:'ℹ️', success:'✅', warning:'⚠️', error:'❌' };

  const filtered = data.filter(l => {
    const matchesSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || 
                         (l.detail && l.detail.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeCounts = {
    all: data.length,
    info: data.filter(l => l.type === 'info').length,
    success: data.filter(l => l.type === 'success').length,
    warning: data.filter(l => l.type === 'warning').length,
    error: data.filter(l => l.type === 'error').length,
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:'60px' }}><Spinner size={40} /></div>;

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div className="page-title">Activity <span>Logs</span></div>
        <div className="page-sub">System & User Activity Record</div>
      </div>

      {/* Log Type Tabs */}
      <div style={{ display:'flex',gap:'8px',marginBottom:'20px',overflowX:'auto',paddingBottom:'4px' }}>
        {[
          { type:'all', label:'All', icon:'📋' },
          { type:'info', label:'Info', icon:'ℹ️' },
          { type:'success', label:'Success', icon:'✅' },
          { type:'warning', label:'Warnings', icon:'⚠️' },
          { type:'error', label:'Errors', icon:'❌' },
        ].map(tab => (
          <button
            key={tab.type}
            onClick={() => setTypeFilter(tab.type)}
            style={{
              padding:'8px 14px',
              borderRadius:'8px',
              border:`2px solid ${typeFilter === tab.type ? logColors[tab.type] || 'var(--accent)' : 'var(--border)'}`,
              background:typeFilter === tab.type ? `${logColors[tab.type] || 'var(--accent)'}15` : 'var(--surface)',
              color:typeFilter === tab.type ? logColors[tab.type] || 'var(--accent)' : 'var(--muted)',
              cursor:'pointer',
              fontSize:'13px',
              fontWeight:600,
              whiteSpace:'nowrap',
              transition:'all 0.2s'
            }}
          >
            {tab.icon} {tab.label} <span style={{ fontSize:'11px',marginLeft:'4px',opacity:0.7 }}>({typeCounts[tab.type]})</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom:'18px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'9px',padding:'8px 14px',maxWidth:'400px' }}>
          🔍 <input 
            placeholder="Search logs..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ border:'none',background:'none',padding:0,flex:1,outline:'none' }} 
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        {filtered.length > 0 ? (
          <div style={{ maxHeight:'700px',overflow:'auto' }}>
            {filtered.map((l, idx) => (
              <div
                key={l.id || idx}
                style={{
                  display:'flex',
                  gap:'12px',
                  padding:'14px 16px',
                  borderBottom:idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems:'flex-start',
                  hover:{background:'var(--surface2)'}
                }}
              >
                {/* Type Indicator */}
                <div style={{
                  width:'8px',
                  height:'8px',
                  borderRadius:'50%',
                  background:logColors[l.type] || 'var(--accent)',
                  flexShrink:0,
                  marginTop:'6px'
                }} />
                
                {/* Content */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:'13px',marginBottom:'4px' }}>
                    <strong style={{ color:'var(--text)' }}>{l.action}</strong>
                    {l.detail && <span style={{ color:'var(--muted)' }}> — {l.detail}</span>}
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:'12px',fontSize:'11px' }}>
                    <span style={{ fontFamily:'var(--font-mono)',color:'var(--muted)' }}>
                      {new Date(l.created_at).toLocaleString('en-IN')}
                    </span>
                    {l.userId && (
                      <span style={{ padding:'2px 8px',background:logColors[l.type]||'var(--accent)',opacity:0.15,borderRadius:'4px',color:'var(--muted2)' }}>
                        User #{l.userId}
                      </span>
                    )}
                    <span style={{ padding:'2px 8px',background:'var(--border)',borderRadius:'4px',color:'var(--muted2)' }}>
                      {logIcons[l.type]} {l.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center',padding:'60px 20px',color:'var(--muted)' }}>
            📭 No logs found
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ marginTop:'16px',padding:'14px 16px',background:'var(--surface2)',borderRadius:'9px',border:'1px solid var(--border)',fontSize:'12px',color:'var(--muted)' }}>
        <strong>Total Logs:</strong> {data.length} | <strong>Showing:</strong> {filtered.length} | 
        <strong style={{ marginLeft:'12px' }}>Info:</strong> {typeCounts.info} | 
        <strong style={{ marginLeft:'12px' }}>Success:</strong> {typeCounts.success} | 
        <strong style={{ marginLeft:'12px' }}>Warnings:</strong> {typeCounts.warning} | 
        <strong style={{ marginLeft:'12px' }}>Errors:</strong> {typeCounts.error}
      </div>
    </div>
  );
}
