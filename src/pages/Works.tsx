import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PortfolioProject } from '../types';
import CTABand from '../components/sections/CTABand';

const mono = "'JetBrains Mono',monospace";

/* ── Full-screen image lightbox ── */
const Lightbox: React.FC<{ images: string[]; startIdx: number; name: string; onClose: () => void }> = ({ images, startIdx, name, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [idx]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '90vw', maxWidth: 1100, maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '1.4rem', cursor: 'pointer', fontFamily: mono, letterSpacing: '0.1em' }}>✕ close</button>

        {/* Image */}
        <img src={images[idx]} alt={`${name} ${idx + 1}`}
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4, display: 'block', userSelect: 'none' }} />

        {/* Counter */}
        <div style={{ fontFamily: mono, fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem' }}>{idx + 1} / {images.length}</div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            {[{ label: '‹', fn: prev, side: 'left' }, { label: '›', fn: next, side: 'right' }].map(btn => (
              <button key={btn.side} onClick={btn.fn}
                style={{ position: 'absolute', top: '50%', [btn.side]: -52, transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,136,0.3)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'}>
                {btn.label}
              </button>
            ))}
            {/* Dot strip */}
            <div style={{ display: 'flex', gap: 6, marginTop: '0.75rem' }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 4, background: i === idx ? 'var(--green)' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Project detail modal ── */
const ProjectModal: React.FC<{ project: PortfolioProject; onClose: () => void; onStartProject: () => void }> = ({ project: p, onClose, onStartProject }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && lightboxIdx === null) onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightboxIdx]);

  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox images={p.images} startIdx={lightboxIdx} name={p.name} onClose={() => setLightboxIdx(null)} />
      )}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, width: '100%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>

          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>// project_details</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{p.name}</h2>
              <div style={{ fontFamily: mono, fontSize: '0.72rem', color: 'var(--cyan)' }}>{p.category}{p.year ? ` · ${p.year}` : ''}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--green)', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', padding: '0.25rem 0.65rem', borderRadius: 3 }}>{p.status}</span>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 3, background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--fg3)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>

          {/* Image grid — click to open lightbox */}
          {p.images?.length > 0 && (
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>images — click to enlarge</div>
              <div style={{ display: 'grid', gridTemplateColumns: p.images.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem' }}>
                {p.images.map((url, i) => (
                  <div key={i} onClick={() => setLightboxIdx(i)}
                    style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 4, border: '1px solid var(--border)', cursor: 'zoom-in', position: 'relative' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}>
                    <img src={url} alt={`${p.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', background: 'rgba(0,0,0,0.35)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}>
                      <span style={{ fontSize: '1.4rem' }}>🔍</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>about_this_project</div>
              <p style={{ fontFamily: mono, fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.9 }}>{p.description}</p>
            </div>
          )}

          {/* Tags + link */}
          <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {p.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {p.tags.map(t => (
                  <span key={t} style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--fg3)', border: '1px solid var(--border2)', borderRadius: 2, padding: '0.2rem 0.55rem' }}>{t}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {p.project_url && (
                <a href={p.project_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.45rem 1rem' }}>
                  view_live →
                </a>
              )}
              <button onClick={() => { onClose(); onStartProject(); }} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.45rem 1rem' }}>
                start_similar →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Card carousel ── */
const Carousel: React.FC<{ images: string[]; name: string; onImageClick: (i: number) => void }> = ({ images, name, onImageClick }) => {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback((next: number) => {
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 200);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => go((idx + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [idx, images.length, go]);

  if (!images.length) return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '0.65rem', color: 'var(--fg3)' }}>// no_images</div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000', borderRadius: '6px 6px 0 0' }}>
      <img src={images[idx]} alt={`${name} ${idx + 1}`}
        onClick={() => onImageClick(idx)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: fading ? 0 : 1, transition: 'opacity 0.2s ease', cursor: 'zoom-in' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', pointerEvents: 'none' }} />
      {images.length > 1 && (
        <>
          {[{ label: '‹', fn: () => go((idx - 1 + images.length) % images.length), side: 'left' }, { label: '›', fn: () => go((idx + 1) % images.length), side: 'right' }].map(btn => (
            <button key={btn.side} onClick={e => { e.stopPropagation(); btn.fn(); }}
              style={{ position: 'absolute', top: '50%', [btn.side]: 8, transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}>
              {btn.label}
            </button>
          ))}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 2 }}>
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); go(i); }}
                style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? 'var(--green)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, fontFamily: mono, fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.4)', padding: '0.18rem 0.45rem', borderRadius: 3, backdropFilter: 'blur(4px)' }}>
            {idx + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Works page ── */
interface WorksProps { onStartProject: () => void; }

const Works: React.FC<WorksProps> = ({ onStartProject }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const [lightboxState, setLightboxState] = useState<{ project: PortfolioProject; idx: number } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    supabase.from('portfolio_projects').select('*').order('sort_order')
      .then(({ data }) => { if (data) setProjects(data as PortfolioProject[]); })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <>
      {/* Lightbox */}
      {lightboxState && (
        <Lightbox images={lightboxState.project.images} startIdx={lightboxState.idx} name={lightboxState.project.name} onClose={() => setLightboxState(null)} />
      )}

      {/* Project detail modal */}
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} onStartProject={onStartProject} />
      )}

      <section style={{ padding: '5rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-label">selected_works</div>
        <div className="section-title">Projects</div>

        {categories.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ fontFamily: mono, fontSize: '0.65rem', padding: '0.35rem 0.9rem', borderRadius: 3, border: '1px solid var(--border2)', cursor: 'pointer', background: filter === c ? 'var(--green)' : 'var(--bg2)', color: filter === c ? '#080B0F' : 'var(--fg3)', transition: 'all 0.2s' }}>
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg3)', padding: '3rem 0' }}>▮ loading projects...</div>
        ) : filtered.length === 0 ? (
          <div style={{ fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg3)', padding: '3rem 0', textAlign: 'center' }}>// no projects yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((p, i) => (
              <div key={p.id}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s', animation: `fadeUp 0.4s ease ${i * 0.05}s both`, cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>

                <Carousel images={p.images || []} name={p.name}
                  onImageClick={idx => setLightboxState({ project: p, idx })} />

                {/* Card body — click opens detail modal */}
                <div style={{ padding: '1.25rem' }} onClick={() => setSelected(p)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--fg3)' }}>{String(i + 1).padStart(2, '0')}_</div>
                    <span style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--green)', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', padding: '0.18rem 0.5rem', borderRadius: 2 }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem', lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontFamily: mono, fontSize: '0.7rem', color: 'var(--cyan)', marginBottom: '0.75rem' }}>
                    {p.category}{p.year ? ` · ${p.year}` : ''}
                  </div>
                  {p.description && (
                    <p style={{ fontFamily: mono, fontSize: '0.68rem', color: 'var(--fg3)', lineHeight: 1.7, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.description}
                    </p>
                  )}
                  {p.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {p.tags.map(t => (
                        <span key={t} style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--fg3)', border: '1px solid var(--border2)', borderRadius: 2, padding: '0.15rem 0.5rem' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem', fontFamily: mono, fontSize: '0.62rem', color: 'var(--green)' }}>
                    view details →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <CTABand onStartProject={onStartProject} />
    </>
  );
};

export default Works;