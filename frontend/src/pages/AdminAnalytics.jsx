import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { KpiCard, BarRow, Spinner } from '../components/shared/UI';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:'60px' }}><Spinner size={40} /></div>;

  const maxCat = Math.max(...(data?.byCategory?.map(c=>c.total)||[1]));

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div className="page-title">Analytics <span>Dashboard</span></div>
        <div className="page-sub">Task & System Performance Metrics</div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px' }}>
        <KpiCard icon="📋" value={data?.total} label="Total Tasks" delta={`↑ ${data?.total - data?.done} active`} accent="linear-gradient(90deg,var(--accent),var(--accent2))" />
        <KpiCard icon="⚡" value={data?.progress} label="In Progress" color="var(--accent2)" delta={`${data?.total ? Math.round(data.progress/data.total*100) : 0}% of total`} accent="linear-gradient(90deg,var(--accent3),var(--purple))" />
        <KpiCard icon="✅" value={data?.done} label="Completed" color="var(--success)" delta={`${data?.completionRate}% completion`} accent="linear-gradient(90deg,var(--gold),#fb923c)" />
        <KpiCard icon="🚨" value={data?.urgent} label="Urgent Tasks" color="var(--danger)" delta="Needs attention" accent="linear-gradient(90deg,var(--success),var(--accent2))" />
      </div>

      {/* Progress & Categories */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px' }}>
        {/* Overall Progress */}
        <div className="card">
          <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'20px' }}>Overall Progress</div>
          <div style={{ textAlign:'center',padding:'20px 0' }}>
            <div style={{ fontFamily:'var(--font-mono)',fontSize:'48px',fontWeight:700,color:'var(--accent)' }}>{data?.completionRate}%</div>
            <div style={{ fontSize:'13px',color:'var(--muted)',marginTop:'8px' }}>{data?.done} of {data?.total} tasks completed</div>
            <div style={{ height:'8px',background:'var(--surface2)',borderRadius:'99px',overflow:'hidden',marginTop:'16px' }}>
              <div style={{ height:'100%',background:'linear-gradient(90deg,var(--accent),var(--accent2))',borderRadius:'99px',width:`${data?.completionRate}%`,transition:'width 1s ease' }} />
            </div>
          </div>
          {data?.overdue > 0 && <div style={{ marginTop:'12px',padding:'8px 12px',background:'rgba(244,63,94,0.08)',borderRadius:'8px',fontSize:'12px',color:'var(--danger)',textAlign:'center' }}>
            ⚠️ {data.overdue} overdue task{data.overdue!==1?'s':''}
          </div>}
        </div>

        {/* Tasks by Category */}
        <div className="card">
          <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'16px' }}>Tasks by Category</div>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            {data?.byCategory?.map(c => (
              <BarRow key={c.tag} label={c.tag} value={c.total} max={maxCat}
                color={c.tag==='agent'?'var(--accent)':c.tag==='expansion'?'var(--purple)':c.tag==='finance'?'var(--gold)':c.tag==='tech'?'var(--accent2)':'var(--accent3)'} />
            ))}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card">
        <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'16px' }}>Status Distribution</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px' }}>
          <div style={{ padding:'16px',background:'var(--surface2)',borderRadius:'12px',textAlign:'center',border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-mono)',fontSize:'32px',fontWeight:700,color:'var(--gold)' }}>{data?.todo}</div>
            <div style={{ fontSize:'12px',color:'var(--muted)',marginTop:'6px' }}>To Do</div>
          </div>
          <div style={{ padding:'16px',background:'var(--surface2)',borderRadius:'12px',textAlign:'center',border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-mono)',fontSize:'32px',fontWeight:700,color:'var(--accent2)' }}>{data?.progress}</div>
            <div style={{ fontSize:'12px',color:'var(--muted)',marginTop:'6px' }}>In Progress</div>
          </div>
          <div style={{ padding:'16px',background:'var(--surface2)',borderRadius:'12px',textAlign:'center',border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-mono)',fontSize:'32px',fontWeight:700,color:'var(--success)' }}>{data?.done}</div>
            <div style={{ fontSize:'12px',color:'var(--muted)',marginTop:'6px' }}>Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
