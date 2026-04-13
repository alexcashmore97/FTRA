export default function ContactPage() {
  return (
    <div className="rankings-page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="rankings-header">
          <div className="label">Get in touch</div>
          <h1>Contact Us</h1>
        </div>

        <div style={{ textAlign: 'center', padding: '24px 0 64px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px' }}>
            For all enquiries including ranking disputes, partnership opportunities, event submissions, or general questions, please send us an email and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:fullthairulesaustralia@gmail.com"
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '14px 32px' }}
          >
            fullthairulesaustralia@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
