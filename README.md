# ASL Wallets Task Manager — React + Node.js + SQLite

## 🗂️ Project Structure

```
asl-wallets/
├── backend/                  ← Node.js + Express + SQLite API
│   ├── server.js             ← Main Express server (all API routes)
│   ├── database.js           ← SQLite setup + seed data
│   ├── package.json
│   └── .env.example          ← Copy to .env before running
│
├── frontend/                 ← React app
│   ├── src/
│   │   ├── App.js            ← Router + Auth guard
│   │   ├── index.js          ← Entry point
│   │   ├── index.css         ← Global styles + CSS variables
│   │   ├── context/
│   │   │   └── AuthContext.js    ← Login state management
│   │   ├── utils/
│   │   │   └── api.js            ← Axios instance + JWT interceptor
│   │   ├── components/
│   │   │   ├── shared/UI.jsx     ← Modal, Toast, Avatar, Badge, etc.
│   │   │   ├── admin/AdminLayout.jsx
│   │   │   └── member/MemberLayout.jsx
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminTasks.jsx
│   │       ├── AdminMembers.jsx
│   │       ├── AdminAnalytics.jsx
│   │       ├── AdminLogs.jsx
│   │       ├── AdminSettings.jsx
│   │       ├── MemberLogin.jsx
│   │       ├── MemberDashboard.jsx
│   │       ├── MemberTasks.jsx
│   │       └── MemberProfile.jsx
│   ├── public/index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Step 1 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env if needed (change JWT_SECRET for production!)

# Start server
npm run dev        # development (auto-reload)
npm start          # production
```

Backend runs at: **http://localhost:5000**

---

### Step 2 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

Frontend runs at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in frontend/package.json
> automatically forwards `/api/...` requests to the backend.

---

## 🔑 Login Credentials

| Portal | Username / Email | Password |
|--------|-----------------|----------|
| **Admin Panel** | `admin` | `asl@2026` |
| Member — Rahul | `rahul@aslwallets.com` | `member@123` |
| Member — Priya | `priya@aslwallets.com` | `member@123` |
| Member — Sneha | `sneha@aslwallets.com` | `member@123` |
| Member — Dev | `dev@aslwallets.com` | `member@123` |
| Member — Ananya | `ananya@aslwallets.com` | `member@123` |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/admin/login` | Public | Admin login |
| POST | `/api/auth/member/login` | Public | Member login |
| PUT | `/api/auth/admin/password` | Admin | Change admin password |
| PUT | `/api/auth/member/password` | Member | Change member password |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Admin | Get all tasks (filterable) |
| GET | `/api/tasks/my` | Member | Get my tasks |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Admin/Member | Update task |
| DELETE | `/api/tasks/:id` | Admin/Member | Delete task |

### Members
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/members` | Admin | Get all members |
| POST | `/api/members` | Admin | Add member |
| PUT | `/api/members/:id` | Admin | Update member + permissions |
| DELETE | `/api/members/:id` | Admin | Remove member |

### System
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/analytics` | Admin | Dashboard analytics |
| GET | `/api/logs` | Admin | Activity logs |
| DELETE | `/api/logs` | Admin | Clear logs |
| GET | `/api/health` | Public | Health check |

---

## 🗄️ Database

SQLite database file: `backend/database.sqlite` (auto-created on first run)

### Tables
- **admins** — Admin credentials
- **members** — Team members + permissions (perm_view, perm_edit, perm_delete)
- **tasks** — All tasks
- **logs** — Activity logs

---

## 🏗️ Production Build

```bash
# Build React frontend
cd frontend && npm run build

# Serve build from Express (add to server.js):
# const path = require('path');
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));

# Then run only backend:
cd backend && npm start
```

---

## 🔧 Environment Variables (backend/.env)

```
PORT=5000
JWT_SECRET=your_very_secret_key_here_change_this
JWT_EXPIRES_IN=24h
DB_PATH=./database.sqlite
```

> ⚠️ Always change `JWT_SECRET` in production!

---

## 📦 Dependencies

### Backend
- **express** — HTTP server
- **cors** — Cross-origin requests
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **better-sqlite3** — SQLite database (fast, synchronous)
- **dotenv** — Environment variables
- **nodemon** (dev) — Auto-reload

### Frontend
- **react** + **react-dom** — UI framework
- **react-router-dom** — Client-side routing
- **axios** — HTTP client
- **recharts** — Charts (analytics page)

---

*ASL Wallets Task Management System v2.0 — React + Node.js + SQLite*
