import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import '@/styles/auth.css';

export default function FighterEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, fighterId, logout } = useAuth();

  // Fighter can only edit their own profile
  if (fighterId && id !== fighterId) {
    return <Navigate to={`/fighter-portal/${fighterId}`} replace />;
  }

  return (
    <div className="section container">
      <div className="section-header">
        <p className="label">Fighter Portal</p>
        <h2>Edit Profile</h2>
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
        <p>Profile editor coming soon.</p>
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
