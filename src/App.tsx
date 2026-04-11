import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import DivisionRankingsPage from '@/pages/DivisionRankingsPage';
import P4PRankingsPage from '@/pages/P4PRankingsPage';
import FighterProfilePage from '@/pages/FighterProfilePage';
import ContactPage from '@/pages/ContactPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import FighterLoginPage from '@/pages/FighterLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import FighterEditorPage from '@/pages/FighterEditorPage';
import { AdminRoute, FighterRoute } from '@/components/ProtectedRoute';
import '@/styles/rankings.css';
import '@/styles/fighter.css';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/rankings/p4p" element={<P4PRankingsPage />} />
        <Route path="/rankings/:divisionId" element={<DivisionRankingsPage />} />
        <Route path="/fighters/:id" element={<FighterProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/fighter-portal/login" element={<FighterLoginPage />} />

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
  );
}
