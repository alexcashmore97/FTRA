import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import '@/styles/auth.css';

export function AdminRoute() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}

export function FighterRoute() {
  const { user, role, fighterStatus, loading, logout } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'fighter') return <Navigate to="/" replace />;

  if (fighterStatus === 'pending') {
    return <PendingScreen logout={logout} />;
  }

  return <Outlet />;
}

function LoadingScreen() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-spinner" />
    </div>
  );
}

function PendingScreen({ logout }: { logout: () => Promise<void> }) {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <div className="auth-badge fighter-badge">Pending</div>
          <h2>Awaiting Approval</h2>
          <p className="auth-subtitle" style={{ marginTop: 12 }}>
            Your registration has been received. An administrator will review your profile shortly.
          </p>
          <p className="auth-subtitle" style={{ marginTop: 8 }}>
            You'll be able to access your fighter portal once approved. Check back soon.
          </p>
        </div>
        <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={logout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
