import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Modal, ConfirmModal, Avatar, toast, Spinner } from '../components/shared/UI';

const EMPTY = { name:'', role:'', email:'', dept:'agent', status:'active', perms:{ view:true, edit:false, delete:false } };

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await api.get('/members');
    setMembers(res.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (m) => {
    setForm({ name:m.name, role:m.role||'', email:m.email, dept:m.dept, status:m.status, perms:m.perms||{ view:true, edit:false, delete:false } });
    setEditId(m.id); setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast('Name and email required', 'error'); return; }
    try {
      if (editId) { await api.put(`/members/${editId}`, form); toast('Member updated!', 'success'); }
      else { await api.post('/members', form); toast('Member added! Default password: member@123', 'success'); }
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.error || 'Error', 'error'); }
  };

  const confirmDel = async () => {
    await api.delete(`/members/${delId}`);
    toast('Member removed', 'error');
    setDelModal(false); load();
  };

  const setPerm = (key, val) => setForm(f => ({ ...f, perms: { ...f.perms, [key]: val } }));

  const filtered = members.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));

  const permStyle = (active, color) => ({
    display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',padding:'8px 10px',
    borderRadius:'8px',border:`1px solid ${active?color:'var(--border)'}`,
    background:active?`${color}10`:'var(--surface)',transition:'all 0.2s',marginBottom:'8px'
  });

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px' }}>
        <div><div className="page-title">Team <span>Members</span></div><div className="page-sub">Manage team & permissions</div></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>
      </div>

      <div style={{ display:'flex',gap:'10px',marginBottom:'18px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'9px',padding:'8px 14px',flex:1,maxWidth:'300px' }}>
          🔍 <input placeholder="Search members..." value={search} onChange={e=>setSearch(e.target.value)} style={{ border:'none',background:'none',padding:0,flex:1 }} />
        </div>
      </div>

      {loading ? <div style={{ textAlign:'center',padding:'60px' }}><Spinner size={36} /></div> : (
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>{['Member','Role','Dept','Status','Permissions','Actions'].map(h=>(
              <th key={h} style={{ fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.8px',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid var(--border)',fontFamily:'var(--font-mono)' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{filtered.map(m=>(
              <tr key={m.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                    <Avatar name={m.name} size={32} />
                    <div><div style={{ fontWeight:600,fontSize:'13px' }}>{m.name}</div><div style={{ fontSize:'11px',color:'var(--muted)' }}>{m.email}</div></div>
                  </div>
                </td>
                <td style={{ padding:'12px 14px',fontSize:'12px',color:'var(--muted2)' }}>{m.role}</td>
                <td style={{ padding:'12px 14px' }}><span className="pill pill-blue">{m.dept}</span></td>
                <td style={{ padding:'12px 14px' }}><span className={`pill ${m.status==='active'?'pill-green':'pill-red'}`}>{m.status}</span></td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex',gap:'4px',flexWrap:'wrap' }}>
                    {[['👁️','view','var(--accent2)'],['✏️','edit','var(--gold)'],['🗑️','delete','var(--danger)']].map(([icon,k,color])=>(
                      <span key={k} style={{ display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'6px',fontSize:'11px',fontWeight:600,
                        background:m.perms?.[k]?`${color}20`:'rgba(77,107,138,0.1)',color:m.perms?.[k]?color:'var(--muted)' }}>
                        {icon} {m.perms?.[k]?k.charAt(0).toUpperCase()+k.slice(1):`No ${k.charAt(0).toUpperCase()+k.slice(1)}`}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex',gap:'6px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(m)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>{setDelId(m.id);setDelModal(true);}}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {!filtered.length && <div style={{ textAlign:'center',padding:'50px',color:'var(--muted)' }}>👥 No members found</div>}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId ? 'Edit <span style="color:var(--accent)">Member</span>' : 'Add <span style="color:var(--accent)">Member</span>'} >
        <div className="form-row">
          <div className="form-group"><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
          <div className="form-group"><label>Role</label><input value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g. Agent Manager" /></div>
        </div>
        <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
        <div className="form-row">
          <div className="form-group"><label>Department</label>
            <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}>
              {['agent','expansion','finance','tech','marketing'].map(d=><option key={d} value={d}>{d}</option>)}
            </select></div>
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select></div>
        </div>
        {/* Permissions */}
        <div className="form-group">
          <label>Task Permissions</label>
          <div style={{ background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'10px',padding:'14px' }}>
            <div style={{ fontSize:'11px',color:'var(--muted)',marginBottom:'10px',fontFamily:'var(--font-mono)' }}>SELECT WHAT THIS MEMBER CAN DO:</div>
            {[['👁️ View Tasks','view','var(--accent2)','Can see tasks assigned to them'],
              ['✏️ Edit Tasks','edit','var(--gold)','Can update status and details'],
              ['🗑️ Delete Tasks','delete','var(--danger)','Can delete tasks from their list']].map(([label,key,color,desc])=>(
              <label key={key} style={permStyle(form.perms[key], color)}>
                <input type="checkbox" checked={form.perms[key]} onChange={e=>setPerm(key,e.target.checked)} style={{ width:'16px',height:'16px',accentColor:color }} />
                <div><div style={{ fontSize:'13px',fontWeight:600 }}>{label}</div><div style={{ fontSize:'11px',color:'var(--muted)' }}>{desc}</div></div>
              </label>
            ))}
          </div>
        </div>
        {!editId && <div style={{ fontSize:'12px',color:'var(--muted)',padding:'8px 12px',background:'rgba(0,229,192,0.05)',borderRadius:'8px',border:'1px solid rgba(0,229,192,0.15)' }}>
          ℹ️ Default password will be: <strong style={{ color:'var(--accent)' }}>member@123</strong>
        </div>}
        <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2 }} onClick={save}>Save Member ✓</button>
        </div>
      </Modal>

      <ConfirmModal open={delModal} onClose={()=>setDelModal(false)} onConfirm={confirmDel}
        title='Remove <span style="color:var(--danger)">Member</span>'
        message="This member will be removed from the team. Their assigned tasks will remain." />
    </div>
  );
}
