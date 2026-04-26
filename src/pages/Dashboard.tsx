import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientRequest } from '../types';
import StatusTracker from '../components/dashboard/StatusTracker';

interface DashboardProps {
  onStartProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartProject }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('client_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRequests(data); })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <section style={{ padding: '3rem', maxWidth: 900, margin: '0 auto' }}>
      <div className="section-label">my_dashboard</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          my_requests<span style={{ color: 'var(--green)' }}>_</span>
        </h1>
        <button className="btn-primary" onClick={onStartProject}>./new_project →</button>
      </div>

      {loading ? (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg3)', padding: '3rem 0' }}>▮ loading requests...</div>
      ) : requests.length === 0 ? (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg3)', marginBottom: '1.25rem' }}>// no_requests_yet</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No projects yet</p>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg3)', marginBottom: '1.5rem' }}>Start a project and track its progress right here.</p>
          <button className="btn-primary" onClick={onStartProject}>./start_project →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {requests.map(r => <StatusTracker key={r.id} request={r} />)}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
