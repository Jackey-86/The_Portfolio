import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ServiceCategory, PortfolioProject} from '../../types';
import { useNavigate } from 'react-router-dom';
//import { PortfolioProject } from '../../types';


interface WhatIDoProps {
  onStartProject: () => void;
}

const FALLBACK_SERVICES: Partial<ServiceCategory>[] = [
  { id: '1', name: 'Brand Identity', description: 'Logo systems, colour theory, typography & brand guidelines.', price_label: 'from GHC550', timeline: '1–2 weeks' },
  { id: '2', name: 'UI/UX Design', description: 'User research, wireframes, prototypes & design systems.', price_label: 'from GHC1,500', timeline: '2–3 weeks' },
  { id: '3', name: 'Web Applications', description: 'Full-stack, performant apps built with modern tooling.', price_label: 'from GHC2,000', timeline: '3–6 weeks' },
  { id: '4', name: 'E-Commerce', description: 'Online stores with payment integration & admin dashboard.', price_label: 'from GHC2,500', timeline: '2–4 weeks' },
  { id: '5', name: 'Mobile-First Design', description: 'Touch-optimised responsive interfaces for all screens.', price_label: 'from GHC1,200', timeline: '2–3 weeks' },
  { id: '6', name: 'Retainer Support', description: 'Ongoing updates, monitoring & feature development.', price_label: 'from GHC700/mo', timeline: 'ongoing' },
];


const WorksGrid: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const mono = "'JetBrains Mono',monospace";

  useEffect(() => {
    supabase.from('portfolio_projects').select('*').order('sort_order').limit(4)
      .then(({ data }) => { if (data) setProjects(data as PortfolioProject[]); });
  }, []);

  useEffect(() => {
    if (!projects.length) return;
    const t = setInterval(() => {
      setIdx(prev => {
        const next = { ...prev };
        projects.forEach(p => {
          if (p.images?.length > 1) {
            next[p.id] = ((prev[p.id] ?? 0) + 1) % p.images.length;
          }
        });
        return next;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [projects]);

  if (!projects.length) return null;

  return (
    <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {projects.map((p, i) => (
        <div key={p.id}
          onClick={() => navigate('/works')}
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>

          {/* Image */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--bg3)' }}>
            {p.images?.length > 0 ? (
              <>
                <img src={p.images[idx[p.id] ?? 0]} alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', pointerEvents: 'none' }} />
                {p.images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {p.images.map((_, di) => (
                      <div key={di} style={{ width: (idx[p.id] ?? 0) === di ? 14 : 5, height: 5, borderRadius: 3, background: (idx[p.id] ?? 0) === di ? 'var(--green)' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '0.62rem', color: 'var(--fg3)' }}>// no_images</div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--fg3)' }}>{String(i + 1).padStart(2, '0')}_</span>
              <span style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--green)', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', padding: '0.15rem 0.45rem', borderRadius: 2 }}>{p.status}</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>{p.name}</div>
            <div style={{ fontFamily: mono, fontSize: '0.68rem', color: 'var(--cyan)' }}>{p.category}{p.year ? ` · ${p.year}` : ''}</div>
            {p.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.65rem' }}>
                {p.tags.slice(0, 3).map(t => (
                  <span key={t} style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)', border: '1px solid var(--border2)', borderRadius: 2, padding: '0.1rem 0.4rem' }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const WhatIDo: React.FC<WhatIDoProps> = ({ onStartProject }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await supabase
          .from('service_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (data) setServices(data);
      } catch (err) {
        console.warn('[WhatIDo] Could not fetch services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const displayServices = services.length > 0 ? services : (FALLBACK_SERVICES as ServiceCategory[]);

  return (
    <section style={{ padding: '5rem 3rem', maxWidth: 1000, margin: '0 auto' }}>
      <div className="section-label">services_available</div>
      <div className="section-title">What I Do</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'stretch' }}>

        {/* LEFT — Intro video / placeholder */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100% - 36px)',
            minHeight: 380,
            background: '#000',
          }}
        >
          <video
            src="/intro.mp4"
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* RIGHT — Services & Pricing panel */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>// rate_card.json</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Services & Pricing</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
            {loading ? (
              <div style={{ padding: '2rem 1.25rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--fg3)' }}>loading services...</div>
            ) : (
              displayServices.map((svc, i) => (
                <div key={svc.id || i}
                  style={{ padding: '0.85rem 1.25rem', borderBottom: i < displayServices.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  onClick={onStartProject}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.3 }}>{svc.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--green)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{svc.price_label}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: 'var(--fg3)', lineHeight: 1.6, marginBottom: '0.3rem' }}>{svc.description}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--cyan)' }}>⏱ {svc.timeline}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <button className="btn-primary" onClick={onStartProject} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.72rem' }}>
              request_quote() →
            </button>
          </div>
        </div>
      </div>

      {/* Live works grid */}
      <WorksGrid />

      <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/works')}>see_all_projects →</button>
        <button className="btn-primary" onClick={onStartProject}>./start_project</button>
      </div>

      {/* <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button className="btn-primary" onClick={onStartProject}>./start_project</button>
      </div> */}
    </section>
  );
};

export default WhatIDo;
