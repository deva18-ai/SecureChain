import { Suspense, lazy, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useWallet } from './context/WalletContext';
import { MainLayout, AuthLayout, LandingLayout } from './components/layout/MainLayout';
import { PageLoadingFallback, getLazyPage } from './lib/lazyLoad';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = getLazyPage('DashboardPage', { preload: true });
const IdentitiesPage = getLazyPage('IdentitiesPage');
const AssetsPage = getLazyPage('AssetsPage');
const TransfersPage = getLazyPage('TransfersPage');
const AuditPage = getLazyPage('AuditPage');
const BlockchainPage = getLazyPage('BlockchainPage');
const MyIdentityPage = getLazyPage('MyIdentityPage');
const MyAssetsPage = getLazyPage('MyAssetsPage');
const MyTransfersPage = getLazyPage('MyTransfersPage');
const MyActivityPage = getLazyPage('MyActivityPage');
const AdminUsersPage = getLazyPage('AdminUsersPage');
const AdminRolesPage = getLazyPage('AdminRolesPage');
const AdminConfigPage = getLazyPage('AdminConfigPage');
const SettingsPage = getLazyPage('SettingsPage');
const SecurityCenterPage = getLazyPage('SecurityCenterPage');
const SecurityResourcesPage = getLazyPage('SecurityResourcesPage');

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles as any)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-primary" />
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
        <Route path="/register" element={<AuthLayout><PublicRoute><RegisterPage /></PublicRoute></AuthLayout>} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/security-center" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'AUDITOR', 'USER']}><SecurityCenterPage /></ProtectedRoute>} />
          <Route path="/security-resources" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'AUDITOR', 'USER']}><SecurityResourcesPage /></ProtectedRoute>} />

          <Route path="/identities" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'AUDITOR', 'USER']}><IdentitiesPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR']}><AuditPage /></ProtectedRoute>} />
          <Route path="/blockchain" element={<ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR']}><BlockchainPage /></ProtectedRoute>} />

          <Route path="/identity" element={<ProtectedRoute allowedRoles={['USER']}><MyIdentityPage /></ProtectedRoute>} />
          <Route path="/my-assets" element={<ProtectedRoute allowedRoles={['USER']}><MyAssetsPage /></ProtectedRoute>} />
          <Route path="/my-transfers" element={<ProtectedRoute allowedRoles={['USER']}><MyTransfersPage /></ProtectedRoute>} />
          <Route path="/my-activity" element={<ProtectedRoute allowedRoles={['USER']}><MyActivityPage /></ProtectedRoute>} />

          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminRolesPage /></ProtectedRoute>} />
          <Route path="/admin/config" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConfigPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;