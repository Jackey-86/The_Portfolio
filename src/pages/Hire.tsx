import React from 'react';

interface HireProps {
  onStartProject: () => void;
}

const contacts = [
  { label: 'WhatsApp', value: '+233 531 421 815', href: 'https://wa.me/233531421815', tag: 'fastest_response' },
  { label: 'Email',    value: 'enochjackson2@gmail.com', href: 'mailto:enochjackson2@gmail.com', tag: null },
  { label: 'LinkedIn', value: 'linkedin.com/in/enoch-jackson-kwofie', href: 'https://www.linkedin.com/in/enoch-jackson-kwofie/', tag: null },
  { label: 'GitHub',   value: 'github.com/Jackey-86', href: 'https://github.com/Jackey-86', tag: null },
];

const Hire: React.FC<HireProps> = ({ onStartProject }) => (
  <section style={{ padding: '5rem 3rem', maxWidth: 800, margin: '0 auto' }}>
    <div className="section-label">contact</div>
    <div className="section-title">Hire Me</div>

    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', marginBottom: '2.5rem' }}>
      <div style={{ padding: '1rem 1.5rem', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em' }}>// contact_info.json</div>
      </div>
      {contacts.map((c, i) => (
        <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', borderBottom: i < contacts.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg3)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
        >
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--fg3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{c.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', color: 'var(--fg)' }}>{c.value}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {c.tag && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--green)', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', padding: '0.2rem 0.6rem', borderRadius: 2 }}>{c.tag}</span>}
            <span style={{ color: 'var(--fg3)', fontSize: '0.8rem' }}>→</span>
          </div>
        </a>
      ))}
    </div>

    <div style={{ textAlign: 'center' }}>
      <button className="btn-primary" onClick={onStartProject}>./start_project →</button>
    </div>
  </section>
);

export default Hire;
