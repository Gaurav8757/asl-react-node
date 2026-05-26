const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// Promisify db methods for async/await
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows || []);
  });
});

const dbExec = (sql) => new Promise((resolve, reject) => {
  db.exec(sql, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

async function init() {
  try {
    await dbExec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        dept TEXT DEFAULT 'agent',
        status TEXT DEFAULT 'active',
        perm_view INTEGER DEFAULT 1,
        perm_edit INTEGER DEFAULT 0,
        perm_delete INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        tag TEXT DEFAULT 'agent',
        assignee TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'todo',
        created_by TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        detail TEXT,
        type TEXT DEFAULT 'info',
        user TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed admin
    const admin = await dbGet('SELECT id FROM admins WHERE username = ?', ['admin']);
    if (!admin) {
      const hash = bcrypt.hashSync('asl@2026', 10);
      await dbRun('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hash]);
    }

    // Seed members
    const memberCount = await dbGet('SELECT COUNT(*) as c FROM members');
    if (memberCount.c === 0) {
      const hash = bcrypt.hashSync('member@123', 10);
      const members = [
        { name: 'Rahul Sharma', role: 'Agent Manager', email: 'rahul@aslwallets.com', dept: 'agent', perm_view: 1, perm_edit: 1, perm_delete: 0 },
        { name: 'Priya Das', role: 'Expansion Lead', email: 'priya@aslwallets.com', dept: 'expansion', perm_view: 1, perm_edit: 1, perm_delete: 0 },
        { name: 'Sneha Roy', role: 'Finance Analyst', email: 'sneha@aslwallets.com', dept: 'finance', perm_view: 1, perm_edit: 0, perm_delete: 0 },
        { name: 'Dev Kumar', role: 'Tech Lead', email: 'dev@aslwallets.com', dept: 'tech', perm_view: 1, perm_edit: 1, perm_delete: 0 },
        { name: 'Ananya Sen', role: 'Marketing Head', email: 'ananya@aslwallets.com', dept: 'marketing', perm_view: 1, perm_edit: 0, perm_delete: 0 },
      ];
      for (const m of members) {
        await dbRun('INSERT INTO members (name,role,email,password,dept,perm_view,perm_edit,perm_delete) VALUES (?,?,?,?,?,?,?,?)',
          [m.name, m.role, m.email, hash, m.dept, m.perm_view, m.perm_edit, m.perm_delete]);
      }
    }

    // Seed tasks
    const taskCount = await dbGet('SELECT COUNT(*) as c FROM tasks');
    if (taskCount.c === 0) {
      const tasks = [
        { title: 'Onboard 100 agents in West Bengal', description: 'Recruit and train new retail agents across districts', priority: 'high', tag: 'agent', assignee: 'Rahul', due_date: '2026-06-15', status: 'progress' },
        { title: 'Launch Bihar expansion campaign', description: 'Set up distributor network and run FB ads targeting Bihar', priority: 'high', tag: 'expansion', assignee: 'Priya', due_date: '2026-06-30', status: 'todo' },
        { title: 'GST filing for May 2026', description: 'Compile all transactions and file monthly GST returns', priority: 'medium', tag: 'finance', assignee: 'Sneha', due_date: '2026-06-10', status: 'todo' },
        { title: 'Fix UPI timeout bug', description: 'Agents reporting transaction failures after 30s', priority: 'high', tag: 'tech', assignee: 'Dev', due_date: '2026-05-30', status: 'progress' },
        { title: 'Create Hindi training videos', description: 'YouTube tutorials for agent onboarding in Hindi', priority: 'medium', tag: 'marketing', assignee: 'Ananya', due_date: '2026-06-20', status: 'todo' },
        { title: 'Set up WhatsApp broadcast list', description: 'Categorize agents by state for targeted broadcasts', priority: 'low', tag: 'marketing', assignee: 'Rahul', due_date: '2026-06-05', status: 'done' },
        { title: 'Odisha distributor agreements', description: 'Sign MOU with 3 distributors in Bhubaneswar and Cuttack', priority: 'high', tag: 'expansion', assignee: 'Priya', due_date: '2026-07-05', status: 'todo' },
        { title: 'Q2 revenue reconciliation', description: 'Match agent commissions with bank statements', priority: 'medium', tag: 'finance', assignee: 'Sneha', due_date: '2026-07-10', status: 'todo' },
      ];
      for (const t of tasks) {
        await dbRun('INSERT INTO tasks (title,description,priority,tag,assignee,due_date,status) VALUES (?,?,?,?,?,?,?)',
          [t.title, t.description, t.priority, t.tag, t.assignee, t.due_date, t.status]);
      }
    }

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database init error:', err);
  }
}

module.exports = { db, dbGet, dbAll, dbRun, dbExec, init };

