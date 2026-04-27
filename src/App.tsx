import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import { AdminRoute, FighterRoute } from '@/components/ProtectedRoute';
import '@/styles/rankings.css';
import '@/styles/fighter.css';
import '@/styles/auth.css';

const DivisionRankingsPage = lazy(() => import('@/pages/DivisionRankingsPage'));
const P4PRankingsPage = lazy(() => import('@/pages/P4PRankingsPage'));
const FighterProfilePage = lazy(() => import('@/pages/FighterProfilePage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const FighterEditorPage = lazy(() => import('@/pages/FighterEditorPage'));

function PageLoader() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-spinner" />
    </div>
  );
}

export default function App() {
  return (
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
  );
}
