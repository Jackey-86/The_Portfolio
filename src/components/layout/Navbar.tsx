import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onStartProject: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStartProject }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'home' },
    { to: '/works', label: 'works' },
    { to: '/about', label: 'about' },
    { to: '/hire', label: 'hire_me' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const mono = "'JetBrains Mono', monospace";

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--nav)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.3s',
      }}>
        {/* Logo */}
        <Link to="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: mono, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--green)', textDecoration: 'none', flexShrink: 0 }}>
          the<span style={{ color: 'var(--fg2)' }}>.</span>jackson<span style={{ color: 'var(--fg3)' }}>_</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontFamily: mono, fontSize: '0.72rem', fontWeight: 400,
              color: isActive(l.to) ? 'var(--green)' : 'var(--fg3)',
              letterSpacing: '0.1em', transition: 'color 0.2s', textDecoration: 'none',
            }}>
              {isActive(l.to) ? '> ' : ''}{l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              fontFamily: mono, fontSize: '0.72rem',
              color: isActive('/admin') ? 'var(--amber)' : 'var(--fg3)',
              letterSpacing: '0.1em', transition: 'color 0.2s', textDecoration: 'none',
            }}>
              {isActive('/admin') ? '> ' : ''}admin
            </Link>
          )}
        </div>

        {/* Right controls — desktop */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={toggleTheme} title="Toggle theme"
            style={{ width: 34, height: 34, borderRadius: 4, border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '0.9rem', color: 'var(--fg3)', background: 'var(--bg2)', transition: 'all 0.2s', cursor: 'pointer' }}>
            {theme === 'dark' ? '○' : '●'}
          </button>

          {user ? (
            <>
              <Link to="/dashboard"
                style={{ padding: '0.4rem 1rem', border: '1px solid var(--border2)', borderRadius: 3, fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg2)', transition: 'all 0.2s', textDecoration: 'none' }}>
                my_requests
              </Link>
              <button onClick={handleSignOut}
                style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border2)', borderRadius: 3, fontFamily: mono, fontSize: '0.68rem', color: 'var(--fg3)', cursor: 'pointer', background: 'none', transition: 'all 0.2s' }}>
                logout
              </button>
            </>
          ) : (
            <Link to="/auth"
              style={{ padding: '0.4rem 1rem', border: '1px solid var(--border2)', borderRadius: 3, fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg2)', transition: 'all 0.2s', textDecoration: 'none' }}>
              sign_in
            </Link>
          )}

          <button onClick={onStartProject} className="btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '0.72rem' }}>
            ./start_project
          </button>
        </div>

        {/* Mobile right — theme + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="mobile-nav">
          <button onClick={toggleTheme} title="Toggle theme"
            style={{ width: 34, height: 34, borderRadius: 4, border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '0.9rem', color: 'var(--fg3)', background: 'var(--bg2)', cursor: 'pointer' }}>
            {theme === 'dark' ? '○' : '●'}
          </button>
          <button onClick={() => setMenuOpen(o => !o)}
            style={{ width: 34, height: 34, borderRadius: 4, border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--bg2)', cursor: 'pointer', padding: '0 8px' }}>
            <span style={{ display: 'block', width: 18, height: 1.5, background: menuOpen ? 'var(--green)' : 'var(--fg2)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(6.5px)' : 'none' }} />
            <span style={{ display: 'block', width: 18, height: 1.5, background: menuOpen ? 'var(--green)' : 'var(--fg2)', borderRadius: 2, transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 18, height: 1.5, background: menuOpen ? 'var(--green)' : 'var(--fg2)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-6.5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
          background: 'var(--bg)', zIndex: 199,
          display: 'flex', flexDirection: 'column',
          padding: '2rem 1.5rem',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease',
        }} className="mobile-nav">

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: mono, fontSize: '1.1rem', fontWeight: 600,
                  color: isActive(l.to) ? 'var(--green)' : 'var(--fg)',
                  letterSpacing: '0.08em', textDecoration: 'none',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid var(--border)',
                  transition: 'color 0.2s',
                }}>
                {isActive(l.to) ? '> ' : '// '}{l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: mono, fontSize: '1.1rem', fontWeight: 600,
                  color: isActive('/admin') ? 'var(--amber)' : 'var(--fg)',
                  letterSpacing: '0.08em', textDecoration: 'none',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                {isActive('/admin') ? '> ' : '// '}admin
              </Link>
            )}
          </div>

          {/* Auth + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  style={{ padding: '0.75rem 1rem', border: '1px solid var(--border2)', borderRadius: 3, fontFamily: mono, fontSize: '0.78rem', color: 'var(--fg2)', textDecoration: 'none', textAlign: 'center' }}>
                  my_requests
                </Link>
                <button onClick={handleSignOut}
                  style={{ padding: '0.75rem 1rem', border: '1px solid var(--border2)', borderRadius: 3, fontFamily: mono, fontSize: '0.78rem', color: 'var(--fg3)', background: 'none', cursor: 'pointer' }}>
                  logout
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}
                style={{ padding: '0.75rem 1rem', border: '1px solid var(--border2)', borderRadius: 3, fontFamily: mono, fontSize: '0.78rem', color: 'var(--fg2)', textDecoration: 'none', textAlign: 'center' }}>
                sign_in
              </Link>
            )}
            <button onClick={() => { setMenuOpen(false); onStartProject(); }} className="btn-primary"
              style={{ padding: '0.85rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              ./start_project
            </button>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;