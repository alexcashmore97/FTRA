import { useState, type FormEvent } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Wire to email service or Firestore
    setSubmitted(true);
  };

  return (
    <div className="rankings-page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="rankings-header">
          <div className="label">Get in touch</div>
          <h1>Contact Us</h1>
        </div>

        {submitted ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--gold)', marginBottom: '12px' }}>Message Sent</h3>
            <p style={{ color: 'var(--text-secondary)' }}>We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Name</label>
              <input className="input" type="text" required placeholder="Your name" />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
              <input className="input" type="email" required placeholder="you@email.com" />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Message</label>
              <textarea
                className="input"
                required
                rows={6}
                placeholder="How can we help?"
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
