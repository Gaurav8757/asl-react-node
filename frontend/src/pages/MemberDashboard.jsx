import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { KpiCard, StatusBadge, PriorityBadge, TagBadge, toast, Spinner } from '../components/shared/UI';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/tasks/my');
    setTasks(res.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const moveTask = async (id, status) => {
    if (!user?.perms?.edit) { toast('Edit permission denied. Contact admin.', 'error'); return; }
    await api.put(`/tasks/${id}`, { status });
    toast(`Moved to ${status === 'progress' ? 'In Progress' : 'Done'}!`, 'success');
    load();
  };

  const deleteTask = async (id) => {
    if (!user?.perms?.delete) { toast('Delete permission denied. Contact admin.', 'error'); return; }
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    toast('Task deleted', 'error');
    load();
  };

  const todo = tasks.filter(t => t.status === 'todo');
  const progress = tasks.filter(t => t.status === 'progress');
  const done = tasks.filter(t => t.status === 'done');
  const pct = tasks.length ? Math.round(done.length / tasks.length * 100) : 0;
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '';
  const isOverdue = d => d && new Date(d) < new Date();

  const TaskCard = ({ t }) => {
    if (!user?.perms?.view) return (
      <div className="card" style={{ textAlign:'center',color:'var(--muted)',padding:'20px' }}>🔒 View permission denied</div>
    );
    const prev = t.status==='done'?'progress':t.status==='progress'?'todo':null;
    const next = t.status==='todo'?'progress':t.status==='progress'?'done':null;
    return (
      <div style={{ background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'12px',padding:'16px',position:'relative',overflow:'hidden',borderLeft:`3px solid ${t.priority==='high'?'var(--danger)':t.priority==='medium'?'var(--gold)':'var(--success)'}` }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',marginBottom:'8px' }}>
          <div style={{ fontWeight:600,fontSize:'14px',lineHeight:1.4 }}>{t.title}</div>
          <StatusBadge v={t.status} />
        </div>
        {t.description && <div style={{ fontSize:'12px',color:'var(--muted)',marginBottom:'10px',lineHeight:1.5 }}>{t.description}</div>}
        <div style={{ display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'10px' }}>
          <PriorityBadge v={t.priority} />
          <TagBadge v={t.tag} />
          {t.due_date && <span style={{ fontSize:'11px',color:isOverdue(t.due_date)&&t.status!=='done'?'var(--danger)':'var(--muted)' }}>📅 {fmtDate(t.due_date)}{isOverdue(t.due_date)&&t.status!=='done'?' ⚠️':''}</span>}
        </div>
        <div style={{ display:'flex',gap:'8px' }}>
          {user?.perms?.edit ? (
            <>
              {prev && <button className="btn btn-ghost btn-sm" onClick={()=>moveTask(t.id,prev)}>← Back</button>}
              {next && <button className="btn btn-sm" style={{ background:next==='done'?'rgba(16,185,129,0.12)':'rgba(14,165,233,0.12)',border:`1px solid ${next==='done'?'rgba(16,185,129,0.3)':'rgba(14,165,233,0.3)'}`,color:next==='done'?'var(--success)':'var(--accent2)' }} onClick={()=>moveTask(t.id,next)}>→ {next==='progress'?'Start Task':'Mark Done'}</button>}
            </>
          ) : <span style={{ fontSize:'11px',color:'var(--muted)',padding:'4px 8px',background:'rgba(77,107,138,0.08)',borderRadius:'6px',border:'1px solid var(--border)' }}>🔒 Edit not permitted</span>}
          {user?.perms?.delete && <button className="btn btn-danger btn-sm" onClick={()=>deleteTask(t.id)}>🗑️</button>}
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ textAlign:'center',padding:'60px' }}><Spinner size={36} /></div>;

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div className="page-title">My <span>Dashboard</span></div>
        <div className="page-sub">Welcome back, {user?.name?.split(' ')[0]}! You have {todo.length} pending task{todo.length!==1?'s':''}.</div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'24px' }}>
        <KpiCard icon="📋" value={tasks.length} label="Total Assigned" color="var(--accent2)" accent="#0ea5e9" />
        <KpiCard icon="⚡" value={progress.length} label="In Progress" color="var(--gold)" accent="var(--gold)" />
        <KpiCard icon="✅" value={done.length} label="Completed" color="var(--success)" accent="var(--success)" />
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'10px' }}>
          <div style={{ fontWeight:700,fontSize:'14px' }}>My Overall Progress</div>
          <span style={{ fontFamily:'var(--font-mono)',fontSize:'14px',fontWeight:700,color:'var(--accent2)' }}>{pct}%</span>
        </div>
        <div style={{ height:'10px',background:'var(--surface2)',borderRadius:'99px',overflow:'hidden' }}>
          <div style={{ height:'100%',background:'var(--accent2)',borderRadius:'99px',width:`${pct}%`,transition:'width 0.6s ease' }} />
        </div>
      </div>

      {/* Kanban Columns */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px' }}>
        {[['📋 To Do',todo,'var(--gold)'],['⚡ In Progress',progress,'var(--accent2)'],['✅ Done',done,'var(--success)']].map(([label,list,color])=>(
          <div key={label}>
            <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px' }}>
              <div style={{ width:'10px',height:'10px',borderRadius:'50%',background:color }} />
              <span style={{ fontWeight:700,fontSize:'14px' }}>{label}</span>
              <span style={{ marginLeft:'auto',background:'var(--surface2)',borderRadius:'20px',padding:'2px 10px',fontSize:'12px',color:'var(--muted)' }}>{list.length}</span>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
              {list.map(t=><TaskCard key={t.id} t={t} />)}
              {!list.length && <div style={{ textAlign:'center',padding:'30px',color:'var(--muted)',fontSize:'13px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px' }}>Empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
