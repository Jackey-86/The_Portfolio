import React from 'react';

const testimonials = [
  { initials: 'AK', name: 'Ama Korantema', role: 'CEO, Korantema Ventures', text: 'Working with The Jackson was seamless. Enoch understood our vision immediately and delivered beyond expectations — on time and on budget.' },
  { initials: 'KB', name: 'Kwame Boateng', role: 'Founder, Boateng Tech', text: 'Our new brand identity is exactly what we needed to stand out in the market. Professional, creative and a pleasure to collaborate with.' },
  { initials: 'EA', name: 'Efua Asante', role: 'Founder, Kente Luxe', text: 'The e-commerce store Enoch built tripled our online sales within 3 months. Technically skilled, detail-oriented and genuinely cares.' },
];

const Testimonials: React.FC = () => (
  <section style={{ padding: '5rem 3rem', maxWidth: 1000, margin: '0 auto' }}>
    <div className="section-label">client_feedback</div>
    <div className="section-title">What They Say</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
      {testimonials.map(t => (
        <div key={t.name} style={{ background: 'var(--bg2)', padding: '1.75rem' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.4rem', color: 'var(--green)', marginBottom: '0.75rem' }}>/*</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.9, marginBottom: '1rem' }}>{t.text} */</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 3, background: 'var(--bg)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)' }}>{t.initials}</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: 'var(--fg3)' }}>{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
