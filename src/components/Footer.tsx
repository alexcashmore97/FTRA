import { Link } from 'react-router-dom';
import '@/styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Official WBC banner — full width, big deal */}
      <div className="footer-official">
        <div className="footer-official-inner container">
          <img src="/images/logos/wbc.avif" alt="WBC Muay Thai Australia" className="footer-wbc-logo" />
          <div className="footer-official-text">
            <h3 className="footer-official-title">Official WBC Muay Thai Australia Rankings</h3>
            <p className="footer-official-sub">
              The only sanctioned national ranking system recognised by the World Boxing Council Muay Thai.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-inner">
          <div>
            <Link to="/" className="header-logo">
              <img src="/images/logos/ftra-logo.png" alt="FTRA" className="header-logo-img" />
              <span className="accent">Full Thai Rules Australia</span>
            </Link>
            <p className="footer-tagline">
              Shining a spotlight on the warriors of Australian Muay Thai.
            </p>
            <a
              href="https://www.instagram.com/fullthairules_au/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              @fullthairules_au
            </a>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4 className="footer-col-title">Rankings</h4>
              <Link to="/rankings/p4p?gender=male">Male P4P</Link>
              <Link to="/rankings/p4p?gender=female">Female P4P</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">More</h4>
              <Link to="/contact">Contact</Link>
              <Link to="/admin/login">Admin</Link>
              <Link to="/fighter-portal/login">Fighter Portal</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Full Thai Rules Australia. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
