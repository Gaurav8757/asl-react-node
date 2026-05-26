import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/shared/UI';
import './index.css';

// Pages
import AdminLogin from './pages/AdminLogin';
import MemberLogin from './pages/MemberLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminTasks from './pages/AdminTasks';
import AdminMembers from './pages/AdminMembers';
import MemberDashboard from './pages/MemberDashboard';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import MemberLayout from './components/member/MemberLayout';

// Landing page
import LandingPage from './pages/LandingPage';

// Lazy pages (stub)
const AdminAnalytics = React.lazy(() => import('./pages/AdminAnalytics'));
const AdminLogs = React.lazy(() => import('./pages/AdminLogs'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const MemberProfile = React.lazy(() => import('./pages/MemberProfile'));
const MemberTasks = React.lazy(() => import('./pages/MemberTasks'));

function AdminGuard({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function MemberGuard({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'member') return <Navigate to="/member" replace />;
  return children;
}

function AppRoutes() {
  return (
    <React.Suspense fallback={<div style={{ display:'flex',justifyContent:'center',padding:'60px',color:'var(--accent)' }}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        {/* Member */}
        <Route path="/member" element={<MemberLogin />} />
        <Route path="/member" element={<MemberGuard><MemberLayout /></MemberGuard>}>
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="tasks" element={<MemberTasks />} />
          <Route path="profile" element={<MemberProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}
