import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { KpiCard, BarRow, Avatar, StatusBadge, PriorityBadge, Spinner } from '../components/shared/UI';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics'),
      api.get('/tasks'),
      api.get('/logs'),
    ]).then(([a, t, l]) => {
      setAnalytics(a.data);
      setTasks(t.data.slice(0, 5));
      setLogs(l.data.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:'60px' }}><Spinner size={40} /></div>;

  const maxCat = Math.max(...(analytics?.byCategory?.map(c=>c.total)||[1]));
  const logColors = { info:'var(--accent)', success:'var(--success)', warning:'var(--gold)', error:'var(--danger)' };

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px' }}>
        <div><div className="page-title">Admin <span>Dashboard</span></div>
          <div className="page-sub">ASL Wallets Control Center</div></div>
        <Link to="/admin/tasks"><button className="btn btn-primary">+ New Task</button></Link>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px' }}>
        <KpiCard icon="📋" value={analytics?.total} label="Total Tasks" delta={`↑ ${analytics?.total - analytics?.done} active`} accent="linear-gradient(90deg,var(--accent),var(--accent2))" />
        <KpiCard icon="⚡" value={analytics?.progress} label="In Progress" color="var(--accent2)" delta={`${analytics?.total ? Math.round(analytics.progress/analytics.total*100) : 0}% of total`} accent="linear-gradient(90deg,var(--accent3),var(--purple))" />
        <KpiCard icon="✅" value={analytics?.done} label="Completed" color="var(--success)" delta={`${analytics?.completionRate}% completion`} accent="linear-gradient(90deg,var(--gold),#fb923c)" />
        <KpiCard icon="🚨" value={analytics?.urgent} label="Urgent Tasks" color="var(--danger)" delta="Needs attention" accent="linear-gradient(90deg,var(--success),var(--accent2))" />
      </div>

      {/* Charts + Recent */}
      <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:'16px',marginBottom:'16px' }}>
        <div className="card">
          <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'16px' }}>Tasks by Category</div>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            {analytics?.byCategory?.map(c => (
              <BarRow key={c.tag} label={c.tag} value={c.total} max={maxCat}
                color={c.tag==='agent'?'var(--accent)':c.tag==='expansion'?'var(--purple)':c.tag==='finance'?'var(--gold)':c.tag==='tech'?'var(--accent2)':'var(--accent3)'} />
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'16px' }}>Overall Progress</div>
          <div style={{ textAlign:'center',padding:'20px 0' }}>
            <div style={{ fontFamily:'var(--font-mono)',fontSize:'48px',fontWeight:700,color:'var(--accent)' }}>{analytics?.completionRate}%</div>
            <div style={{ fontSize:'13px',color:'var(--muted)',marginTop:'8px' }}>{analytics?.done} of {analytics?.total} tasks done</div>
            <div style={{ height:'8px',background:'var(--surface2)',borderRadius:'99px',overflow:'hidden',marginTop:'16px' }}>
              <div style={{ height:'100%',background:'linear-gradient(90deg,var(--accent),var(--accent2))',borderRadius:'99px',width:`${analytics?.completionRate}%`,transition:'width 1s ease' }} />
            </div>
          </div>
          {analytics?.overdue > 0 && <div style={{ marginTop:'12px',padding:'8px 12px',background:'rgba(244,63,94,0.08)',borderRadius:'8px',fontSize:'12px',color:'var(--danger)',textAlign:'center' }}>
            ⚠️ {analytics.overdue} overdue task{analytics.overdue!==1?'s':''}
          </div>}
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px' }}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px' }}>
            <div style={{ fontWeight:700,fontSize:'14px' }}>Recent Tasks</div>
            <Link to="/admin/tasks" style={{ fontSize:'12px',color:'var(--accent)',textDecoration:'none',fontWeight:600 }}>View All →</Link>
          </div>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>{['Task','Assignee','Status','Priority'].map(h=>(
              <th key={h} style={{ fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.8px',padding:'8px 10px',textAlign:'left',borderBottom:'1px solid var(--border)',fontFamily:'var(--font-mono)' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{tasks.map(t=>(
              <tr key={t.id}><td style={{ padding:'10px',borderBottom:'1px solid var(--border)',fontSize:'13px',fontWeight:600 }}>{t.title.slice(0,28)}{t.title.length>28?'…':''}</td>
                <td style={{ padding:'10px',borderBottom:'1px solid var(--border)' }}><div style={{ display:'flex',alignItems:'center',gap:'6px' }}><Avatar name={t.assignee} size={22} /><span style={{ fontSize:'12px' }}>{t.assignee||'—'}</span></div></td>
                <td style={{ padding:'10px',borderBottom:'1px solid var(--border)' }}><StatusBadge v={t.status} /></td>
                <td style={{ padding:'10px',borderBottom:'1px solid var(--border)' }}><PriorityBadge v={t.priority} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {/* Activity Logs */}
        <div className="card">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px' }}>
            <div style={{ fontWeight:700,fontSize:'14px' }}>Activity Log</div>
            <Link to="/admin/logs" style={{ fontSize:'12px',color:'var(--accent)',textDecoration:'none',fontWeight:600 }}>View All →</Link>
          </div>
          {logs.map(l=>(
            <div key={l.id} style={{ display:'flex',gap:'10px',padding:'8px 0',borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:logColors[l.type]||'var(--accent)',flexShrink:0,marginTop:'5px' }} />
              <div>
                <div style={{ fontSize:'13px' }}><strong>{l.action}</strong> — {l.detail}</div>
                <div style={{ fontSize:'11px',color:'var(--muted)',fontFamily:'var(--font-mono)',marginTop:'2px' }}>{new Date(l.created_at).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
