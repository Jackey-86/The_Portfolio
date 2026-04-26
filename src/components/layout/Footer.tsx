import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC<{ onStartProject: () => void }> = ({ onStartProject }) => {
  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '3rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.9rem', fontWeight: 700, color: 'var(--green)', marginBottom: '0.75rem' }}>the.jackson_</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--fg3)', lineHeight: 1.9, marginBottom: '1rem' }}>
              Full-stack designer + developer based in Accra, Ghana.<br />Building digital products that actually work.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[['WA','https://wa.me/233531421815'],['@','mailto:enochjackson2@gmail.com'],['in','https://www.linkedin.com/in/enoch-jackson-kwofie/'],['Be','https://behance.net'],['GH','https://github.com/Jackey-86']].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" style={{ width: 30, height: 30, border: '1px solid var(--border2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--fg3)', transition: 'all 0.2s', fontFamily: "'JetBrains Mono',monospace" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg3)'; }}
                >{label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: '1rem' }}>navigate</h4>
            {[['/', 'home'], ['/works', 'works'], ['/about', 'about'], ['/hire', 'hire_me']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg2)', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg2)'}
              >{label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: '1rem' }}>services</h4>
            {['brand_identity', 'ui_ux_design', 'web_apps', 'ecommerce', 'retainer'].map(s => (
              <button key={s} onClick={onStartProject} style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg2)', marginBottom: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--green)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg2)'}
              >{s}</button>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: '1rem' }}>contact</h4>
            {[['WhatsApp', 'https://wa.me/233531421815'], ['Email', 'mailto:enochjackson2@gmail.com'], ['LinkedIn', 'https://linkedin.com'], ['Behance', 'https://behance.net']].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg2)', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg2)'}
              >{label}</a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--fg3)' }}>
          <span>© 2025 The Jackson · Enoch K. Jackson</span>
          <span style={{ color: 'var(--green)' }}>status: open_to_work</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
