import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useWallet } from './context/WalletContext';
import { MainLayout, AuthLayout, LandingLayout } from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
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
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isConnected, connect } = useWallet();

  return (
    <Routes>
      <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
      <Route path="/login" element={<AuthLayout><PublicRoute><LoginPage /></PublicRoute></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><PublicRoute><RegisterPage /></PublicRoute></AuthLayout>} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/identities" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'AUDITOR']}><IdentitiesPage /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR']}><AuditPage /></ProtectedRoute>} />
        <Route path="/blockchain" element={<ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR']}><BlockchainPage /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute allowedRoles={['ADMIN']}><RolesPage /></ProtectedRoute>} />

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
  );
}

function IdentitiesPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Identities Page - Coming Soon</h2></div>;
}

function AssetsPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Assets Page - Coming Soon</h2></div>;
}

function TransfersPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Transfers Page - Coming Soon</h2></div>;
}

function AuditPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Audit Page - Coming Soon</h2></div>;
}

function BlockchainPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Blockchain Page - Coming Soon</h2></div>;
}

function RolesPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Roles Page - Coming Soon</h2></div>;
}

function MyIdentityPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">My Identity Page - Coming Soon</h2></div>;
}

function MyAssetsPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">My Assets Page - Coming Soon</h2></div>;
}

function MyTransfersPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">My Transfers Page - Coming Soon</h2></div>;
}

function MyActivityPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">My Activity Page - Coming Soon</h2></div>;
}

function AdminUsersPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Admin Users Page - Coming Soon</h2></div>;
}

function AdminRolesPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Admin Roles Page - Coming Soon</h2></div>;
}

function AdminConfigPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Admin Config Page - Coming Soon</h2></div>;
}

function SettingsPage() {
  return <div className="text-center py-12"><h2 className="text-2xl font-bold text-dark-900 dark:text-white">Settings Page - Coming Soon</h2></div>;
}

export default App;