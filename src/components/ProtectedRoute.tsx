import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function AdminRoute() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}

export function FighterRoute() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/fighter-portal/login" replace />;
  if (role !== 'fighter') return <Navigate to="/" replace />;

  return <Outlet />;
}

function LoadingScreen() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-spinner" />
    </div>
  );
}
