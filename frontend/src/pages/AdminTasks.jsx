import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Modal, ConfirmModal, Avatar, StatusBadge, PriorityBadge, TagBadge, toast, Spinner } from '../components/shared/UI';

const EMPTY = { title:'', description:'', priority:'medium', tag:'agent', assignee:'', due_date:'', status:'todo' };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);
  const [filters, setFilters] = useState({ search:'', status:'', priority:'', tag:'' });

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.tag) params.tag = filters.tag;
    if (filters.search) params.search = filters.search;
    const res = await api.get('/tasks', { params });
    setTasks(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (t) => { setForm({ title:t.title, description:t.description||'', priority:t.priority, tag:t.tag, assignee:t.assignee||'', due_date:t.due_date||'', status:t.status }); setEditId(t.id); setModal(true); };

  const save = async () => {
    if (!form.title.trim()) { toast('Title required', 'error'); return; }
    try {
      if (editId) { await api.put(`/tasks/${editId}`, form); toast('Task updated!', 'success'); }
      else { await api.post('/tasks', form); toast('Task added!', 'success'); }
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.error || 'Error', 'error'); }
  };

  const confirmDel = async () => {
    await api.delete(`/tasks/${delId}`);
    toast('Task deleted', 'error');
    setDelModal(false); load();
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—';
  const isOverdue = d => d && new Date(d) < new Date();

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px' }}>
        <div><div className="page-title">All <span>Tasks</span></div><div className="page-sub">Full task control</div></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Task</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex',gap:'10px',marginBottom:'18px',flexWrap:'wrap' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'9px',padding:'8px 14px',flex:1,maxWidth:'300px' }}>
          🔍 <input placeholder="Search tasks..." value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))} style={{ border:'none',background:'none',padding:0,flex:1 }} />
        </div>
        {[['status',['','todo','progress','done']],['priority',['','high','medium','low']],['tag',['','agent','expansion','finance','tech','marketing']]].map(([k,opts])=>(
          <select key={k} value={filters[k]} onChange={e=>setFilters(f=>({...f,[k]:e.target.value}))} style={{ width:'auto',padding:'8px 14px' }}>
            {opts.map(o=><option key={o} value={o}>{o||`All ${k}`}</option>)}
          </select>
        ))}
      </div>

      {loading ? <div style={{ textAlign:'center',padding:'60px' }}><Spinner size={36} /></div> : (
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>{['#','Task','Category','Assignee','Priority','Status','Due','Actions'].map(h=>(
              <th key={h} style={{ fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.8px',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid var(--border)',fontFamily:'var(--font-mono)' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{tasks.map((t,i)=>(
              <tr key={t.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'12px 14px',fontFamily:'var(--font-mono)',fontSize:'11px',color:'var(--muted)' }}>{i+1}</td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ fontWeight:600,fontSize:'13px' }}>{t.title.slice(0,40)}{t.title.length>40?'…':''}</div>
                  {t.description && <div style={{ fontSize:'11px',color:'var(--muted)',marginTop:'2px' }}>{t.description.slice(0,50)}…</div>}
                </td>
                <td style={{ padding:'12px 14px' }}><TagBadge v={t.tag} /></td>
                <td style={{ padding:'12px 14px' }}><div style={{ display:'flex',alignItems:'center',gap:'6px' }}><Avatar name={t.assignee} size={24} /><span style={{ fontSize:'12px' }}>{t.assignee||'—'}</span></div></td>
                <td style={{ padding:'12px 14px' }}><PriorityBadge v={t.priority} /></td>
                <td style={{ padding:'12px 14px' }}><StatusBadge v={t.status} /></td>
                <td style={{ padding:'12px 14px',fontSize:'12px',color:isOverdue(t.due_date)&&t.status!=='done'?'var(--danger)':'var(--muted2)' }}>{fmtDate(t.due_date)}{isOverdue(t.due_date)&&t.status!=='done'?' ⚠️':''}</td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex',gap:'6px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(t)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>{setDelId(t.id);setDelModal(true);}}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {!tasks.length && <div style={{ textAlign:'center',padding:'50px',color:'var(--muted)' }}>🔍 No tasks found</div>}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId ? 'Edit <span style="color:var(--accent)">Task</span>' : 'New <span style="color:var(--accent)">Task</span>'}>
        <div className="form-group"><label>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task title" /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Details..." /></div>
        <div className="form-row">
          <div className="form-group"><label>Priority</label>
            <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
              <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
            </select></div>
          <div className="form-group"><label>Category</label>
            <select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}>
              {['agent','expansion','finance','tech','marketing'].map(t=><option key={t} value={t}>{t}</option>)}
            </select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Assignee</label><input value={form.assignee} onChange={e=>setForm(f=>({...f,assignee:e.target.value}))} placeholder="Name" /></div>
          <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} /></div>
        </div>
        <div className="form-group"><label>Status</label>
          <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
            <option value="todo">📋 To Do</option><option value="progress">⚡ In Progress</option><option value="done">✅ Done</option>
          </select></div>
        <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2 }} onClick={save}>Save Task ✓</button>
        </div>
      </Modal>

      <ConfirmModal open={delModal} onClose={()=>setDelModal(false)} onConfirm={confirmDel}
        title='Delete <span style="color:var(--danger)">Task</span>'
        message="This task will be permanently deleted. This action cannot be undone." />
    </div>
  );
}
