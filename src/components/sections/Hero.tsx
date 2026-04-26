import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onStartProject: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartProject }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Profile row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2.5rem 3rem', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <img src="/Placeholder.jpeg" alt="Enoch Jackson"style={{width: 72, height: 72, borderRadius: 4, border: '2px solid var(--green)', objectFit: 'cover', flexShrink: 0,}}/>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Enoch K. Jackson</h2>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--green)', marginTop: '0.25rem' }}>// full-stack designer + developer @ The Jackson</p>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--fg3)', marginTop: '0.2rem' }}>📍 Accra, Ghana · working remotely</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', padding: '0.3rem 0.85rem', borderRadius: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'blink 2s infinite', display: 'inline-block' }} />
          available_for_hire: true
        </div>
      </div>

      {/* Hero */}
      <div style={{ backgroundImage: "url('/Hero_Bg.jpeg')", backgroundSize: 'cover', backgroundPosition: 'no-repeat',padding: '7rem 3rem 5rem', maxWidth: 1200, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0, 0, 0, 0.99), rgba(0, 0, 0, 0.41), transparent)', zIndex: 0, }}/>
        {/* Glow accent 
        <div style={{ position: 'absolute', top: '4rem', right: '-5rem', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />*/}

      <div style={{ position: 'relative', zIndex: 1, paddingLeft: '5rem'}}>

        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--fg3)', marginBottom: '2.5rem', lineHeight: 2 }}>
          <div><span style={{ color: 'var(--fg3)' }}>$</span> <span style={{ color: 'var(--green)' }}>jackson</span> <span style={{ color: 'var(--cyan)' }}>--init</span> portfolio.config.js</div>
          <div><span style={{ color: 'var(--fg3)' }}>✓</span> <span style={{ color: 'var(--fg2)' }}>loading modules:</span> <span style={{ color: 'var(--amber)' }}>design</span>, <span style={{ color: 'var(--amber)' }}>development</span>, <span style={{ color: 'var(--amber)' }}>strategy</span></div>
          <div><span style={{ color: 'var(--fg3)' }}>✓</span> <span style={{ color: 'var(--fg2)' }}>ready to build</span> <span style={{ color: 'var(--green)' }}>exceptional</span> <span style={{ color: 'var(--fg2)' }}>digital products</span></div>
        </div>

        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--green)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          // creative technologist · The Jackson Studio
        </div>

        <h1 style={{ fontSize: 'clamp(3rem,8vw,5.5rem)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
          Design.<br />Build.<br /><em style={{ fontStyle: 'normal', color: 'var(--green)', display: 'block' }}>Ship.</em>
        </h1>

        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.85rem', color: 'var(--fg2)', lineHeight: 1.9, maxWidth: 580, marginBottom: '3rem' }}>
          I craft digital experiences that <span style={{ color: 'var(--cyan)' }}>perform</span> as well as they look.<br />
          From <span style={{ color: 'var(--cyan)' }}>brand identity</span> systems to full-stack <span style={{ color: 'var(--cyan)' }}>web applications</span> —<br />
          built clean, built fast, built to last.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <button className="btn-primary" onClick={() => navigate('/works')}>view_works() →</button>
          <button className="btn-secondary" onClick={onStartProject}>./start_project</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', maxWidth: 560 }}>
          {[['10+', 'projects_shipped'], ['3+', 'years_experience'], ['15+', 'happy_clients']].map(([n, l]) => (
            <div key={l} style={{ background: 'var(--bg2)', padding: '1.25rem 1.5rem' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)' }}>{n}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--fg3)', marginTop: '0.2rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Hero;
