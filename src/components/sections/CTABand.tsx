import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTABand: React.FC<{ onStartProject: () => void }> = ({ onStartProject }) => {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 3rem', textAlign: 'center' }}>
      <div className="section-label" style={{ justifyContent: 'center', marginBottom: '1rem' }}>ready_to_build</div>
      <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
        Got a project in mind?<br /><span style={{ color: 'var(--green)' }}>Let's ship it.</span>
      </h2>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--fg2)', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.9 }}>
        I'm currently accepting new projects. Reach out on WhatsApp for the fastest response — usually within a few hours.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={onStartProject}>./start_project →</button>
        <button className="btn-secondary" onClick={() => navigate('/hire')}>view_contact_info</button>
      </div>
    </div>
  );
};

export default CTABand;
