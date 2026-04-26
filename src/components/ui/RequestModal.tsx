import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ServiceCategory } from '../../types';

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
}

const BUDGET_OPTIONS = [
  'Under GHC500',
  'GHC500 – GHC1,500',
  'GHC1,500 – GHC3,000',
  'GHC3,000 – GHC6,000',
  'GHC6,000+',
  "Let's discuss",
];

const RequestModal: React.FC<RequestModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_id: '',
    budget_range: '',
    project_details: '',
  });

  useEffect(() => {
    if (!open) return;
    setStep('form');
    setError('');
    setForm(f => ({
      ...f,
      full_name: user?.user_metadata?.full_name || f.full_name,
      email: user?.email || f.email,
    }));

    // Fetch services, silently fail
    supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { if (data) setServices(data); })
      .catch(() => {});
  }, [open, user]);

  const selectedService = services.find(s => s.id === form.service_id);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.service_id || !form.project_details) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error: err } = await supabase.from('client_requests').insert([{
        user_id: user?.id || null,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        service_id: form.service_id,
        service_name: selectedService?.name || '',
        budget_range: form.budget_range,
        project_details: form.project_details,
        status: 'submitted',
      }]);
      if (err) throw err;
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, maxWidth: 540, width: '100%', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', width: 30, height: 30, borderRadius: 3, background: 'var(--bg3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', cursor: 'pointer', color: 'var(--fg2)' }}>✕</button>

        {step === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <div className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>request_received</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>We've got it!</h2>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--fg2)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              Your project request has been submitted. Enoch will review it and reach out within 24 hours.
            </p>
            {user ? (
              <button className="btn-primary" onClick={() => { onClose(); navigate('/dashboard'); }}>track_my_request() →</button>
            ) : (
              <div>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg3)', marginBottom: '1rem' }}>// Create an account to track your request status</p>
                <button className="btn-primary" onClick={() => { onClose(); navigate('/auth'); }}>create_account() →</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="section-label">new_request</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Start a Project</h2>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg3)', marginBottom: '1.75rem', lineHeight: 1.7 }}>
              // Fill in the details and I'll get back to you within 24 hours.
            </p>

            {!user && (
              <div style={{ background: 'rgba(0,201,255,0.06)', border: '1px solid rgba(0,201,255,0.2)', borderRadius: 3, padding: '0.65rem 1rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--cyan)', marginBottom: '1.25rem' }}>
                💡{' '}
                <button onClick={() => { onClose(); navigate('/auth'); }} style={{ color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Sign in</button>
                {' '}to track your request status in real-time.
              </div>
            )}

            <div className="form-group">
              <label>your_name *</label>
              <input value={form.full_name} onChange={set('full_name')} placeholder="e.g. Ama Asante" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>email *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
              </div>
              <div className="form-group">
                <label>phone (optional)</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+233..." />
              </div>
            </div>

            <div className="form-group">
              <label>service_needed *</label>
              <select value={form.service_id} onChange={set('service_id')}>
                <option value="">// select a service...</option>
                {services.length > 0
                  ? services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.price_label}</option>)
                  : [
                      ['brand', 'Brand Identity'],
                      ['uiux', 'UI/UX Design'],
                      ['webapp', 'Web Application'],
                      ['ecommerce', 'E-Commerce'],
                      ['retainer', 'Retainer Support'],
                    ].map(([v, l]) => <option key={v} value={v}>{l}</option>)
                }
              </select>
            </div>

            {selectedService && (
              <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 3, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--green)' }}>✓</span>{' '}
                <span style={{ color: 'var(--fg2)' }}>{selectedService.description}</span>
                <span style={{ color: 'var(--fg3)', marginLeft: '0.5rem' }}>· {selectedService.timeline}</span>
              </div>
            )}

            <div className="form-group">
              <label>budget_range</label>
              <select value={form.budget_range} onChange={set('budget_range')}>
                <option value="">// select range...</option>
                {BUDGET_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>project_details *</label>
              <textarea value={form.project_details} onChange={set('project_details')} placeholder="// describe your project, goals, timeline, any references..." />
            </div>

            {error && (
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--red)', marginBottom: '1rem', padding: '0.65rem 1rem', border: '1px solid rgba(255,75,75,0.3)', borderRadius: 3 }}>
                ✕ {error}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
              {loading ? 'submitting...' : 'submit_request() →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestModal;
