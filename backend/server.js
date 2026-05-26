require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbAll, dbRun, init } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors({ origin: process.env.ALLOW_ORIGIN?.split(','), credentials: true }));
app.use(express.json());

// ===== MIDDLEWARE =====
function authAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

function authMember(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

async function addLog(action, detail, type = 'info', user = 'admin') {
  await dbRun('INSERT INTO logs (action,detail,type,user) VALUES (?,?,?,?)', [action, detail, type, user]);
}

// ===== PUBLIC ROUTES =====
app.get('/api', (req, res) => {
  res.status(200).json({ app: 'ASL Wallets', version: '1.0.0', description: 'Task management API for ASL Wallets team' });
});

// ===== AUTH ROUTES =====
// Admin login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await dbGet('SELECT * FROM admins WHERE username = ?', [username]);
    if (!admin || !bcrypt.compareSync(password, admin.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    await addLog('Admin Login', `Admin "${username}" logged in`, 'success', username);
    res.json({ token, user: { id: admin.id, username: admin.username, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin change password
app.put('/api/auth/admin/password', authAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await dbGet('SELECT * FROM admins WHERE id = ?', [req.user.id]);
    if (!bcrypt.compareSync(currentPassword, admin.password))
      return res.status(400).json({ error: 'Current password incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password too short' });
    await dbRun('UPDATE admins SET password = ? WHERE id = ?', [bcrypt.hashSync(newPassword, 10), admin.id]);
    await addLog('Password Changed', 'Admin password updated', 'warning', admin.username);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Member login
app.post('/api/auth/member/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = await dbGet('SELECT * FROM members WHERE email = ?', [email]);
    if (!member || !bcrypt.compareSync(password, member.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    if (member.status === 'inactive')
      return res.status(403).json({ error: 'Account inactive. Contact admin.' });
    const token = jwt.sign({ id: member.id, email: member.email, name: member.name, role: 'member' }, JWT_SECRET, { expiresIn: '24h' });
    await addLog('Member Login', `Member "${member.name}" logged in`, 'success', member.name);
    res.json({
      token,
      user: { id: member.id, name: member.name, email: member.email, role: member.role, dept: member.dept,
        perms: { view: !!member.perm_view, edit: !!member.perm_edit, delete: !!member.perm_delete } }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Member change password
app.put('/api/auth/member/password', authMember, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const member = await dbGet('SELECT * FROM members WHERE id = ?', [req.user.id]);
    if (!bcrypt.compareSync(currentPassword, member.password))
      return res.status(400).json({ error: 'Current password incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password too short' });
    await dbRun('UPDATE members SET password = ? WHERE id = ?', [bcrypt.hashSync(newPassword, 10), member.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TASKS ROUTES =====
// Get all tasks (admin)
app.get('/api/tasks', authAdmin, async (req, res) => {
  try {
    const { status, priority, tag, search } = req.query;
    let q = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    if (status) { q += ' AND status = ?'; params.push(status); }
    if (priority) { q += ' AND priority = ?'; params.push(priority); }
    if (tag) { q += ' AND tag = ?'; params.push(tag); }
    if (search) { q += ' AND (title LIKE ? OR assignee LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    q += ' ORDER BY created_at DESC';
    const tasks = await dbAll(q, params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my tasks (member)
app.get('/api/tasks/my', authMember, async (req, res) => {
  try {
    const member = await dbGet('SELECT * FROM members WHERE id = ?', [req.user.id]);
    if (!member.perm_view) return res.status(403).json({ error: 'View permission denied' });
    const firstName = member.name.split(' ')[0];
    const tasks = await dbAll('SELECT * FROM tasks WHERE assignee = ? ORDER BY created_at DESC', [firstName]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task (admin)
app.post('/api/tasks', authAdmin, async (req, res) => {
  try {
    const { title, description, priority, tag, assignee, due_date, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const result = await dbRun(
      'INSERT INTO tasks (title,description,priority,tag,assignee,due_date,status) VALUES (?,?,?,?,?,?,?)',
      [title, description || '', priority || 'medium', tag || 'agent', assignee || '', due_date || '', status || 'todo']
    );
    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [result.id]);
    await addLog('Task Created', `"${title}" added`, 'success');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task (admin full, member with perm)
app.put('/api/tasks/:id', authMember, async (req, res) => {
  try {
    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role === 'member') {
      const member = await dbGet('SELECT * FROM members WHERE id = ?', [req.user.id]);
      if (!member.perm_edit) return res.status(403).json({ error: 'Edit permission denied' });
      const firstName = member.name.split(' ')[0];
      if (task.assignee !== firstName) return res.status(403).json({ error: 'Not your task' });
      await dbRun('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.body.status, task.id]);
    } else {
      const { title, description, priority, tag, assignee, due_date, status } = req.body;
      await dbRun('UPDATE tasks SET title=?,description=?,priority=?,tag=?,assignee=?,due_date=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
        [title, description, priority, tag, assignee, due_date, status, task.id]);
      await addLog('Task Updated', `"${title}" edited`, 'info');
    }
    const updated = await dbGet('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', authMember, async (req, res) => {
  try {
    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role === 'member') {
      const member = await dbGet('SELECT * FROM members WHERE id = ?', [req.user.id]);
      if (!member.perm_delete) return res.status(403).json({ error: 'Delete permission denied' });
      const firstName = member.name.split(' ')[0];
      if (task.assignee !== firstName) return res.status(403).json({ error: 'Not your task' });
    }
    await dbRun('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    await addLog('Task Deleted', `"${task.title}" removed`, 'warning');
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MEMBERS ROUTES =====
app.get('/api/members', authAdmin, async (req, res) => {
  try {
    const members = await dbAll('SELECT id,name,role,email,dept,status,perm_view,perm_edit,perm_delete,created_at FROM members ORDER BY created_at ASC');
    res.json(members.map(m => ({
      ...m,
      perms: { view: !!m.perm_view, edit: !!m.perm_edit, delete: !!m.perm_delete }
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', authAdmin, async (req, res) => {
  try {
    const { name, role, email, dept, status, perms } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    const existing = await dbGet('SELECT id FROM members WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = bcrypt.hashSync('member@123', 10);
    const result = await dbRun(
      'INSERT INTO members (name,role,email,password,dept,status,perm_view,perm_edit,perm_delete) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, role || '', email, hash, dept || 'agent', status || 'active',
        perms?.view ? 1 : 0, perms?.edit ? 1 : 0, perms?.delete ? 1 : 0]
    );
    await addLog('Member Added', `${name} joined the team`, 'success');
    res.status(201).json({ id: result.id, name, email, message: 'Default password: member@123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/members/:id', authAdmin, async (req, res) => {
  try {
    const { name, role, email, dept, status, perms } = req.body;
    const member = await dbGet('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await dbRun('UPDATE members SET name=?,role=?,email=?,dept=?,status=?,perm_view=?,perm_edit=?,perm_delete=? WHERE id=?',
      [name, role, email, dept, status, perms?.view ? 1 : 0, perms?.edit ? 1 : 0, perms?.delete ? 1 : 0, req.params.id]);
    await addLog('Member Updated', `${name} permissions updated`, 'info');
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', authAdmin, async (req, res) => {
  try {
    const member = await dbGet('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Not found' });
    await dbRun('DELETE FROM members WHERE id = ?', [req.params.id]);
    await addLog('Member Removed', `${member.name} removed`, 'warning');
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== LOGS ROUTES =====
app.get('/api/logs', authAdmin, async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM logs ORDER BY created_at DESC LIMIT 100');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/logs', authAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM logs');
    res.json({ message: 'Logs cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ANALYTICS =====
app.get('/api/analytics', authAdmin, async (req, res) => {
  try {
    const tasks = await dbAll('SELECT * FROM tasks');
    const members = await dbAll('SELECT id,name,dept,status FROM members');
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.filter(t => t.status === 'progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const urgent = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
    const byCategory = ['agent','expansion','finance','tech','marketing'].map(tag => ({
      tag, total: tasks.filter(t => t.tag === tag).length,
      done: tasks.filter(t => t.tag === tag && t.status === 'done').length
    }));
    const memberPerf = members.map(m => {
      const fn = m.name.split(' ')[0];
      const mt = tasks.filter(t => t.assignee === fn);
      return { name: m.name, dept: m.dept, assigned: mt.length, done: mt.filter(t => t.status === 'done').length, progress: mt.filter(t => t.status === 'progress').length };
    });
    res.json({ total, done, progress, todo, urgent, overdue, completionRate: total ? Math.round(done/total*100) : 0, byCategory, memberPerf, activeMembers: members.filter(m => m.status === 'active').length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

init().then(() => {
  app.listen(PORT, () => console.log(`🚀 ASL Wallets API running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
