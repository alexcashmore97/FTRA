import { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import { AdminRoute, FighterRoute } from '@/components/ProtectedRoute';
import LazyErrorBoundary from '@/components/LazyErrorBoundary';
import { lazyWithRetry } from '@/lib/lazyWithRetry';
import '@/styles/rankings.css';
import '@/styles/fighter.css';
import '@/styles/auth.css';

const DivisionRankingsPage = lazyWithRetry(() => import('@/pages/DivisionRankingsPage'));
const P4PRankingsPage = lazyWithRetry(() => import('@/pages/P4PRankingsPage'));
const FighterProfilePage = lazyWithRetry(() => import('@/pages/FighterProfilePage'));
const ContactPage = lazyWithRetry(() => import('@/pages/ContactPage'));
const SearchPage = lazyWithRetry(() => import('@/pages/SearchPage'));
const LoginPage = lazyWithRetry(() => import('@/pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('@/pages/RegisterPage'));
const AdminDashboardPage = lazyWithRetry(() => import('@/pages/AdminDashboardPage'));
const FighterEditorPage = lazyWithRetry(() => import('@/pages/FighterEditorPage'));

function PageLoader() {
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStalled(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleReload = () => {
    try {
      sessionStorage.removeItem('ftra:chunk-reload-attempted');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="auth-loading" style={{ flexDirection: 'column', gap: 16 }}>
      <div className="auth-loading-spinner" />
      {stalled && (
        <button
          type="button"
          onClick={handleReload}
          style={{
            padding: '8px 20px',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Tap to refresh
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/rankings/p4p" element={<P4PRankingsPage />} />
            <Route path="/rankings/:divisionId" element={<DivisionRankingsPage />} />
            <Route path="/fighters/:id" element={<FighterProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin — protected */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Fighter — protected */}
            <Route element={<FighterRoute />}>
              <Route path="/fighter-portal/:id" element={<FighterEditorPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </LazyErrorBoundary>
  );
}
