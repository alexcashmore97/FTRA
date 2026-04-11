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
        {/* CSI partner */}
        <div className="footer-partners">
          <span className="label">Insurance Partner</span>
          <img src="/images/logos/csi.png" alt="Combat Sports Insurance" className="partner-logo" />
        </div>

        <div className="footer-inner">
          <div>
            <Link to="/" className="header-logo">
              <img src="/images/logos/ftra-logo.png" alt="FTRA" className="header-logo-img" />
              <span className="accent">Full Thai Rules Australia</span>
            </Link>
            <p className="footer-tagline">
              Shining a spotlight on the warriors of Australian Muay Thai.
            </p>
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
