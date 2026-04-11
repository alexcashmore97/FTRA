import { useAuth } from '@/lib/auth';
import '@/styles/auth.css';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="section container">
      <div className="section-header">
        <p className="label">Admin Portal</p>
        <h2>Ranking Manager</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Logged in as {user?.email}
        </p>
      </div>

      <div style={{
        padding: 40,
        background: 'var(--charcoal)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        <p>Ranking manager UI coming soon.</p>
        <button
          className="btn btn-outline"
          style={{ marginTop: 24 }}
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
