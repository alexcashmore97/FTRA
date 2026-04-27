import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import '@/styles/auth.css';

export default function LoginPage() {
  const { login, user, role, fighterId, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [signOutReason, setSignOutReason] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('signOutReason') : null
  );

  useEffect(() => {
    if (signOutReason) sessionStorage.removeItem('signOutReason');
  }, [signOutReason]);

  // Redirect once auth context resolves the role
  useEffect(() => {
    if (loading || !user) return;
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'fighter' && fighterId) {
      navigate(`/fighter-portal/${fighterId}`, { replace: true });
    } else if (role === null) {
      setSubmitting(false);
    }
  }, [user, role, fighterId, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setSubmitting(true);

    try {
      setSignOutReason(null);
      await login(email, password);
    } catch {
      setError('Invalid email or password');
      setSubmitting(false);
    }
  };

  const handleSendReset = async () => {
    setError('');
    setResetSent(false);
    if (!email.trim()) {
      setError('Enter your email above first.');
      return;
    }
    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge fighter-badge">Portal</div>
          <h2>Fighter Login</h2>
          <p className="auth-subtitle">Sign in to manage your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {signOutReason === 'no-profile' && (
            <div className="auth-error">
              Your account isn't linked to a fighter profile. If your registration was rejected,
              you can re-register or contact an admin.
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleSendReset}
            disabled={resetSending}
            style={{ alignSelf: 'center' }}
          >
            {resetSending ? 'Sending...' : 'Forgot password?'}
          </button>

          {resetSent && (
            <div className="auth-subtitle" style={{ textAlign: 'center' }}>
              Password reset email sent. Check your inbox and spam folder, then sign in.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
