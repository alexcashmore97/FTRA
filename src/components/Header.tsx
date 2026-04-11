import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDivisionsByGender } from '@/lib/divisions';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import '@/styles/header.css';
import '@/styles/auth.css';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, fighterId, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const maleDivisions = getDivisionsByGender('male');
  const femaleDivisions = getDivisionsByGender('female');

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <img src="/images/logos/ftra-logo.png" alt="FTRA" className="header-logo-img" />
            <span className="accent">Full Thai Rules Australia</span>
          </Link>

          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>

            <div className="nav-dropdown">
              <button className="nav-dropdown-trigger">
                Male Rankings
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>
              <div className="nav-dropdown-menu">
                <Link to="/rankings/p4p?gender=male" className="nav-dropdown-item">
                  <span>P4P Rankings</span>
                </Link>
                {maleDivisions.map(div => (
                  <Link key={div.id} to={`/rankings/${div.id}`} className="nav-dropdown-item">
                    <span>{div.name}</span>
                    <span className="weight">{div.weight}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-dropdown">
              <button className="nav-dropdown-trigger">
                Female Rankings
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>
              <div className="nav-dropdown-menu">
                <Link to="/rankings/p4p?gender=female" className="nav-dropdown-item">
                  <span>P4P Rankings</span>
                </Link>
                {femaleDivisions.map(div => (
                  <Link key={div.id} to={`/rankings/${div.id}`} className="nav-dropdown-item">
                    <span>{div.name}</span>
                    <span className="weight">{div.weight}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/contact" className="nav-link">Contact</Link>

            {!user && (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.7rem' }}>Register</Link>
              </>
            )}
            {user && (
              <div className="auth-user-bar">
                {role === 'admin' && (
                  <Link to="/admin" className="nav-link">
                    <span className="auth-user-role admin">Admin</span>
                  </Link>
                )}
                {role === 'fighter' && fighterId && (
                  <Link to={`/fighter-portal/${fighterId}`} className="nav-link">
                    <span className="auth-user-role fighter">My Profile</span>
                  </Link>
                )}
                <button className="auth-logout-btn" onClick={logout}>Logout</button>
              </div>
            )}
          </nav>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          <button
            className="menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className={`nav-mobile ${mobileOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-mobile-link" onClick={closeMobile}>Home</Link>

        <div className="nav-mobile-section">
          <div className="nav-mobile-section-title">Male Rankings</div>
          <Link to="/rankings/p4p?gender=male" className="nav-mobile-link" onClick={closeMobile}>P4P Rankings</Link>
          {maleDivisions.map(div => (
            <Link key={div.id} to={`/rankings/${div.id}`} className="nav-mobile-link" onClick={closeMobile}>
              {div.name} — {div.weight}
            </Link>
          ))}
        </div>

        <div className="nav-mobile-section">
          <div className="nav-mobile-section-title">Female Rankings</div>
          <Link to="/rankings/p4p?gender=female" className="nav-mobile-link" onClick={closeMobile}>P4P Rankings</Link>
          {femaleDivisions.map(div => (
            <Link key={div.id} to={`/rankings/${div.id}`} className="nav-mobile-link" onClick={closeMobile}>
              {div.name} — {div.weight}
            </Link>
          ))}
        </div>

        <Link to="/contact" className="nav-mobile-link" onClick={closeMobile}>Contact</Link>

        <div className="nav-mobile-section">
          {!user && (
            <>
              <Link to="/login" className="nav-mobile-link" onClick={closeMobile}>Login</Link>
              <Link to="/register" className="nav-mobile-link" onClick={closeMobile}>Register as Fighter</Link>
            </>
          )}
          {user && role === 'admin' && (
            <Link to="/admin" className="nav-mobile-link" onClick={closeMobile}>Dashboard</Link>
          )}
          {user && role === 'fighter' && fighterId && (
            <Link to={`/fighter-portal/${fighterId}`} className="nav-mobile-link" onClick={closeMobile}>My Profile</Link>
          )}
          {user && (
            <button className="nav-mobile-link" onClick={() => { logout(); closeMobile(); }}>Logout</button>
          )}
        </div>
      </nav>
    </>
  );
}
