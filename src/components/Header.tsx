import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDivisionsByGender } from '@/lib/divisions';
import { useAuth } from '@/lib/auth';
import '@/styles/header.css';
import '@/styles/auth.css';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, fighterId, logout } = useAuth();
  const maleDivisions = getDivisionsByGender('male');
  const femaleDivisions = getDivisionsByGender('female');

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <img src="/images/logos/ftra-logo.png" alt="FTRA" className="header-logo-img" />
            <span className="accent">FTRA</span>
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
              <Link to="/admin/login" className="nav-link">Login</Link>
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
              <Link to="/admin/login" className="nav-mobile-link" onClick={closeMobile}>Admin Login</Link>
              <Link to="/fighter-portal/login" className="nav-mobile-link" onClick={closeMobile}>Fighter Login</Link>
            </>
          )}
          {user && role === 'admin' && (
            <Link to="/admin" className="nav-mobile-link" onClick={closeMobile}>Admin Portal</Link>
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
