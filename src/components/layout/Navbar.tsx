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
  const [, setMenuOpen] = useState(false);

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
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'var(--nav)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2.5rem',
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background 0.3s',
    }}>
      {/* Logo */}
      <Link to="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--green)' }}>
        the<span style={{ color: 'var(--fg2)' }}>.</span>jackson<span style={{ color: 'var(--fg3)' }}>_</span>
      </Link>

      {/* Desktop Nav */}
      <div style={{ display: 'flex', gap: '2.5rem' }} className="desktop-nav">
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            fontWeight: 400,
            color: isActive(l.to) ? 'var(--green)' : 'var(--fg3)',
            letterSpacing: '0.1em',
            transition: 'color 0.2s',
          }}>
            {isActive(l.to) ? '> ' : ''}{l.label}
          </Link>
        ))}
        {isAdmin && (
          <Link to="/admin" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: isActive('/admin') ? 'var(--amber)' : 'var(--fg3)',
            letterSpacing: '0.1em',
            transition: 'color 0.2s',
          }}>
            {isActive('/admin') ? '> ' : ''}admin
          </Link>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          style={{
            width: 34, height: 34, borderRadius: 4,
            border: '1px solid var(--border2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem',
            color: 'var(--fg3)', background: 'var(--bg2)',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--green)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg3)'; }}
        >
          {theme === 'dark' ? '○' : '●'}
        </button>

        {user ? (
          <>
            <Link
              to="/dashboard"
              style={{
                padding: '0.4rem 1rem',
                border: '1px solid var(--border2)',
                borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                color: 'var(--fg2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg2)'; }}
            >
              my_requests
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.4rem 0.75rem',
                border: '1px solid var(--border2)',
                borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                color: 'var(--fg3)',
                cursor: 'pointer',
                background: 'none',
                transition: 'all 0.2s',
              }}
            >
              logout
            </button>
          </>
        ) : (
          <Link to="/auth" style={{
            padding: '0.4rem 1rem',
            border: '1px solid var(--border2)',
            borderRadius: 3,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--fg2)',
            transition: 'all 0.2s',
          }}>
            sign_in
          </Link>
        )}

        <button
          onClick={onStartProject}
          className="btn-primary"
          style={{ padding: '0.4rem 1.1rem', fontSize: '0.72rem' }}
        >
          ./start_project
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
