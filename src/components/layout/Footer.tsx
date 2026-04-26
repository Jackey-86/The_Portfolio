import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC<{ onStartProject: () => void }> = ({ onStartProject }) => {
  const mono = "'JetBrains Mono',monospace";

  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid var(--border);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--fg3);
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem 1.5rem;
          }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-brand { grid-column: auto; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="footer-grid">

            {/* Brand */}
            <div className="footer-brand">
              <div style={{ fontFamily: mono, fontSize: '0.9rem', fontWeight: 700, color: 'var(--green)', marginBottom: '0.75rem' }}>
                the.jackson_
              </div>
              <div style={{ fontFamily: mono, fontSize: '0.68rem', color: 'var(--fg3)', lineHeight: 1.9, marginBottom: '1rem' }}>
                Full-stack designer + developer based in Accra, Ghana.<br />
                Building digital products that actually work.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  ['WA', 'https://wa.me/233531421815'],
                  ['@', 'mailto:jacksonenoch2@gmail.com'],
                  ['in', 'https://www.linkedin.com/in/enoch-jackson-kwofie/'],
                  ['Be', 'https://behance.net'],
                  ['GH', 'https://github.com/Jackey-86'],
                ].map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    style={{ width: 30, height: 30, border: '1px solid var(--border2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--fg3)', transition: 'all 0.2s', fontFamily: mono, textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg3)'; }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigate */}
            <div>
              <h4 style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: '1rem' }}>navigate</h4>
              {[['/', 'home'], ['/works', 'works'], ['/about', 'about'], ['/hire', 'hire_me']].map(([to, label]) => (
                <Link key={to} to={to}
                  style={{ display: 'block', fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg2)', marginBottom: '0.5rem', transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg2)'}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: '1rem' }}>services</h4>
              {['brand_identity', 'ui_ux_design', 'web_apps', 'ecommerce', 'retainer'].map(s => (
                <button key={s} onClick={onStartProject}
                  style={{ display: 'block', fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg2)', marginBottom: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--green)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg2)'}>
                  {s}
                </button>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: '1rem' }}>contact</h4>
              {[
                ['WhatsApp', 'https://wa.me/233531421815'],
                ['Email', 'mailto:jacksonenoch2@gmail.com'],
                ['LinkedIn', 'https://www.linkedin.com/in/enoch-jackson-kwofie/'],
                ['Behance', 'https://behance.net'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  style={{ display: 'block', fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg2)', marginBottom: '0.5rem', transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg2)'}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <span>© 2025 The Jackson · Enoch K. Jackson</span>
            <span style={{ color: 'var(--green)' }}>status: open_to_work</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;