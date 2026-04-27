import React from 'react';
import CTABand from '../components/sections/CTABand';

const stack = [
  ['Languages',  'TypeScript · JavaScript · Python · SQL'],
  ['Frontend',   'React · Vite · Tailwind · Framer Motion'],
  ['Backend',    'Node.js · Supabase · PostgreSQL · REST'],
  ['Design',     'Figma · Adobe CC · After Effects'],
  ['DevOps',     'Git · Vercel · Netlify · GitHub Actions'],
];

interface AboutProps {
  onStartProject: () => void;
}

const About: React.FC<AboutProps> = ({ onStartProject }) => {
  const mono = "'JetBrains Mono',monospace";

  return (
    <>
      <style>{`
        .about-section {
          padding: 5rem 3rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 3rem;
          align-items: start;
        }
        .about-profile {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 6px;
        }
        @media (max-width: 768px) {
          .about-section { padding: 3rem 1.25rem; }
          .about-grid { grid-template-columns: 1fr; gap: 2rem; }
          .about-profile { gap: 1rem; padding: 1.25rem; }
        }
        @media (max-width: 480px) {
          .about-profile { flex-direction: column; text-align: center; align-items: center; }
        }
      `}</style>

      <section className="about-section">
        <div className="section-label">about_me</div>
        <div className="section-title">The Person Behind the Code</div>

        <div className="about-grid">
          {/* Left — bio */}
          <div>
            <div className="about-profile">
              <div /*style={{ width: 80, height: 80, borderRadius: 6, border: '2px solid var(--green)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '1.6rem', color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}*/>
                <img src="/Main Favicon.jpeg" alt="Enoch Jackson"
                   style={{ width: 70, height: 70, borderRadius: 4, border: '2px solid var(--green)', objectFit: 'cover', flexShrink: 0 }} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Enoch K. Jackson</div>
                <div style={{ fontFamily: mono, fontSize: '0.7rem', color: 'var(--green)' }}>// Full-Stack Designer + Developer</div>
                <div style={{ fontFamily: mono, fontSize: '0.65rem', color: 'var(--fg3)', marginTop: '0.2rem' }}>📍 Accra, Ghana · Remote-friendly</div>
              </div>
            </div>

            {[
              "I'm a creative technologist with 3+ years of experience building digital products that are both beautiful and functional. I founded The Jackson Studio to bring high-quality design and engineering to Ghanaian businesses and beyond.",
              "My work sits at the intersection of design systems, full-stack development, and product thinking. I care deeply about the details — from pixel-perfect interfaces to clean, maintainable code.",
              "When I'm not building, I'm learning. Currently deep into advanced TypeScript patterns, motion design, and AI-augmented workflows.",
            ].map((para, i) => (
              <p key={i} style={{ fontFamily: mono, fontSize: '0.78rem', color: 'var(--fg2)', lineHeight: 1.9, marginBottom: '1.25rem' }}>{para}</p>
            ))}
          </div>

          {/* Right — tech stack */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em' }}>// tech_stack.json</div>
            </div>
            {stack.map(([cat, items], i) => (
              <div key={cat} style={{ padding: '1rem 1.25rem', borderBottom: i < stack.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{cat}</div>
                <div style={{ fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg)', lineHeight: 1.6 }}>{items}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand onStartProject={onStartProject} />
    </>
  );
};

export default About;