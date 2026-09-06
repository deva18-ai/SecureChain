import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { UserRole } from './types';
import { MainLayout, AuthLayout, LandingLayout } from './components/layout/MainLayout';
import { PageLoadingFallback, getLazyPage } from './lib/lazyLoad';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = getLazyPage('DashboardPage', { preload: true });
const UsersPage = getLazyPage('UsersPage');
const AssetsPage = getLazyPage('AssetsPage');
const RequestsPage = getLazyPage('RequestsPage');
const IdentitiesPage = getLazyPage('IdentitiesPage');
const BlockchainPage = getLazyPage('BlockchainPage');
const AuditPage = getLazyPage('AuditPage');
const SecurityCenterPage = getLazyPage('SecurityCenterPage');

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { isLoading, isAuthenticated, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0d12' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#3d6fe0' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0d12' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#3d6fe0' }} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
        <Route path="/login" element={<AuthLayout><PublicRoute><LoginPage /></PublicRoute></AuthLayout>} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><UsersPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'USER']}><AssetsPage /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><RequestsPage /></ProtectedRoute>} />
          <Route path="/identity" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'USER']}><IdentitiesPage /></ProtectedRoute>} />
          <Route path="/blockchain" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'USER']}><BlockchainPage /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'AUDITOR']}><AuditPage /></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'USER']}><SecurityCenterPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
