import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onStartProject: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartProject }) => {
  const navigate = useNavigate();
  const mono = "'JetBrains Mono',monospace";

  return (
    <>
      <style>{`
        .hero-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .hero-badge {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,255,136,0.08);
          border: 1px solid rgba(0,255,136,0.25);
          color: var(--green);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          padding: 0.3rem 0.85rem;
          border-radius: 2px;
          white-space: nowrap;
        }
        .hero-section {
          background-image: url('/Hero_bg.jpeg');
          background-size: cover;
          background-position: center;
          padding: 5rem 1.5rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.97), rgba(0,0,0,0.6), rgba(0,0,0,0.2));
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
        }
        .hero-terminal {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: var(--fg3);
          margin-bottom: 2rem;
          line-height: 2;
        }
        .hero-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: var(--green);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .hero-h1 {
          font-size: clamp(2.8rem, 10vw, 5.5rem);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: 0.03em;
          margin-bottom: 1.25rem;
        }
        .hero-p {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          color: var(--fg2);
          line-height: 1.9;
          max-width: 540px;
          margin-bottom: 2.5rem;
        }
        .hero-cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          max-width: 480px;
        }
        .hero-stat {
          background: var(--bg2);
          padding: 1rem 1.25rem;
        }
        .hero-stat-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--green);
        }
        .hero-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          color: var(--fg3);
          margin-top: 0.2rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .hero-profile { padding: 1rem; gap: 0.75rem; }
          .hero-badge { margin-left: 0; width: 100%; justify-content: center; }
          .hero-section { padding: 3.5rem 1.25rem 3rem; }
          .hero-overlay { background: linear-gradient(to bottom, rgba(0,0,0,0.92), rgba(0,0,0,0.75)); }
          .hero-terminal { font-size: 0.6rem; margin-bottom: 1.5rem; }
          .hero-p { font-size: 0.72rem; }
          .hero-cta { flex-direction: column; }
          .hero-cta button, .hero-cta a { width: 100%; justify-content: center; text-align: center; }
          .hero-stats { max-width: 100%; }
          .hero-stat { padding: 0.85rem 0.75rem; }
          .hero-stat-num { font-size: 1.2rem; }
          .hero-stat-label { font-size: 0.55rem; }
        }
        @media (max-width: 480px) {
          .hero-terminal { display: none; }
          .hero-label { font-size: 0.6rem; }
        }
      `}</style>

      {/* Profile row */}
      <div className="hero-profile">
        <img src="/Placeholder.jpeg" alt="Enoch Jackson"
          style={{ width: 60, height: 60, borderRadius: 4, border: '2px solid var(--green)', objectFit: 'cover', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Enoch K. Jackson</h2>
          <p style={{ fontFamily: mono, fontSize: '0.68rem', color: 'var(--green)', marginTop: '0.2rem' }}>// full-stack designer + developer @ The Jackson</p>
          <p style={{ fontFamily: mono, fontSize: '0.63rem', color: 'var(--fg3)', marginTop: '0.15rem' }}>📍 Accra, Ghana · working remotely</p>
        </div>
        <div className="hero-badge">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'blink 2s infinite', display: 'inline-block' }} />
          available_for_hire: true
        </div>
      </div>

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-terminal">
            <div><span style={{ color: 'var(--fg3)' }}>$</span> <span style={{ color: 'var(--green)' }}>jackson</span> <span style={{ color: 'var(--cyan)' }}>--init</span> portfolio.config.js</div>
            <div><span style={{ color: 'var(--fg3)' }}>✓</span> <span style={{ color: 'var(--fg2)' }}>loading modules:</span> <span style={{ color: 'var(--amber)' }}>design</span>, <span style={{ color: 'var(--amber)' }}>development</span>, <span style={{ color: 'var(--amber)' }}>strategy</span></div>
            <div><span style={{ color: 'var(--fg3)' }}>✓</span> <span style={{ color: 'var(--fg2)' }}>ready to build</span> <span style={{ color: 'var(--green)' }}>exceptional</span> <span style={{ color: 'var(--fg2)' }}>digital products</span></div>
          </div>

          <div className="hero-label">// creative technologist · The Jackson Studio</div>

          <h1 className="hero-h1">
            Design.<br />Build.<br />
            <em style={{ fontStyle: 'normal', color: 'var(--green)', display: 'block' }}>Ship.</em>
          </h1>

          <p className="hero-p">
            I craft digital experiences that <span style={{ color: 'var(--cyan)' }}>perform</span> as well as they look.{' '}
            From <span style={{ color: 'var(--cyan)' }}>brand identity</span> systems to full-stack <span style={{ color: 'var(--cyan)' }}>web applications</span> —{' '}
            built clean, built fast, built to last.
          </p>

          <div className="hero-cta">
            <button className="btn-primary" onClick={() => navigate('/works')}>view_works() →</button>
            <button className="btn-secondary" onClick={onStartProject}>./start_project</button>
          </div>

          <div className="hero-stats">
            {[['10+', 'projects_shipped'], ['3+', 'years_experience'], ['15+', 'happy_clients']].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <div className="hero-stat-num">{n}</div>
                <div className="hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;