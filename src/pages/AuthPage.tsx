import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!form.email || !form.password || (mode === 'signup' && !form.fullName)) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    if (mode === 'signin') {
      const { error: err } = await signIn(form.email, form.password);
      if (err) { setError(err.message); setLoading(false); }
      else navigate('/dashboard');
    } else {
      const { error: err } = await signUp(form.email, form.password, form.fullName);
      if (err) { setError(err.message); setLoading(false); }
      else setSuccess('Account created! Check your email to confirm, then sign in.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, maxWidth: 420, width: '100%', padding: '2.5rem', animation: 'fadeUp 0.3s ease' }}>
        <div className="section-label">{mode === 'signin' ? 'sign_in' : 'create_account'}</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {mode === 'signin' ? 'Welcome back' : 'Join The Jackson'}
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--fg3)', marginBottom: '2rem', lineHeight: 1.7 }}>
          // {mode === 'signin' ? 'Sign in to track your project requests.' : 'Create an account to manage your projects.'}
        </p>

        {mode === 'signup' && (
          <div className="form-group">
            <label>full_name *</label>
            <input value={form.fullName} onChange={set('fullName')} placeholder="e.g. Ama Asante" />
          </div>
        )}
        <div className="form-group">
          <label>email *</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
        </div>
        <div className="form-group">
          <label>password *</label>
          <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
        </div>

        {error && (
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--red)', marginBottom: '1rem', padding: '0.65rem 1rem', border: '1px solid rgba(255,75,75,0.3)', borderRadius: 3 }}>
            ✕ {error}
          </div>
        )}
        {success && (
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--green)', marginBottom: '1rem', padding: '0.65rem 1rem', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 3 }}>
            ✓ {success}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginBottom: '1rem' }}>
          {loading ? 'please wait...' : mode === 'signin' ? 'sign_in() →' : 'create_account() →'}
        </button>

        <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--fg3)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
            style={{ color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
            {mode === 'signin' ? 'create_account →' : 'sign_in →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
