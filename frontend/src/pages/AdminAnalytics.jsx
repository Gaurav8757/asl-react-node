import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Spinner } from '../components/shared/UI';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = 'AdminAnalytics' === 'AdminAnalytics' ? '/analytics'
      : 'AdminAnalytics' === 'AdminLogs' ? '/logs'
      : 'AdminAnalytics' === 'MemberTasks' ? '/tasks/my'
      : null;
    if (endpoint) {
      api.get(endpoint).then(r => setData(r.data)).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:'60px' }}><Spinner size={36} /></div>;

  return (
    <div>
      <div className="page-title" style={{ marginBottom:'24px' }}>AdminAnalytics</div>
      <pre style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',padding:'20px',overflow:'auto',fontSize:'12px',fontFamily:'var(--font-mono)',color:'var(--muted2)' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
