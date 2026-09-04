import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { SkeletonPageHeader, SkeletonStatGrid, SkeletonList } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

interface LazyLoadOptions {
  preload?: boolean;
  fallback?: React.ReactNode;
  delay?: number;
}

export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { preload = false, fallback, delay = 200 } = options;

  const LazyComponent = lazy(async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return importFn();
  });

  if (preload) {
    importFn();
  }

  return LazyComponent;
}

export function createLazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazyLoad(importFn, options);
  
  const displayName = importFn.toString().match(/pages\/([^\/]+)/)?.[1] || 'Page';
  
  LazyComponent.displayName = `Lazy${displayName.charAt(0).toUpperCase() + displayName.slice(1)}`;
  
  return LazyComponent;
}

export const pageLoaders = {
  DashboardPage: () => import('../pages/DashboardPage'),
  IdentitiesPage: () => import('../pages/IdentitiesPage'),
  AssetsPage: () => import('../pages/AssetsPage'),
  TransfersPage: () => import('../pages/TransfersPage'),
  AuditPage: () => import('../pages/AuditPage'),
  BlockchainPage: () => import('../pages/BlockchainPage'),
  MyIdentityPage: () => import('../pages/MyIdentityPage'),
  MyAssetsPage: () => import('../pages/MyAssetsPage'),
  MyTransfersPage: () => import('../pages/MyTransfersPage'),
  MyActivityPage: () => import('../pages/MyActivityPage'),
  AdminUsersPage: () => import('../pages/AdminUsersPage'),
  AdminRolesPage: () => import('../pages/AdminRolesPage'),
  AdminConfigPage: () => import('../pages/AdminConfigPage'),
  SettingsPage: () => import('../pages/SettingsPage'),
  SecurityCenterPage: () => import('../pages/SecurityCenterPage'),
  SecurityResourcesPage: () => import('../pages/SecurityResourcesPage'),
  LandingPage: () => import('../pages/LandingPage'),
  LoginPage: () => import('../pages/LoginPage'),
  RegisterPage: () => import('../pages/RegisterPage'),
};

export type PageName = keyof typeof pageLoaders;

export function getLazyPage(name: PageName, options?: LazyLoadOptions) {
  const loader = pageLoaders[name];
  if (!loader) {
    throw new Error(`Page "${name}" not found`);
  }
  return createLazyPage(loader, options);
}

export function PageLoadingFallback({ title = 'Loading...', showSkeleton = true }) {
  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonPageHeader />
        </div>
      </div>
      {showSkeleton && (
        <>
          <SkeletonStatGrid count={6} />
          <Card className="p-6">
            <SkeletonList items={5} />
          </Card>
        </>
      )}
    </div>
  );
}

export function withPageTransition<P extends object>(
  WrappedComponent: ComponentType<P>,
  pageName: string
) {
  return function WithPageTransition(props: P) {
    return (
      <div className="page-transition-enter">
        <WrappedComponent {...props} />
      </div>
    );
  };
}

export function preloadPages(pageNames: PageName[]) {
  pageNames.forEach(name => {
    const loader = pageLoaders[name];
    if (loader) {
      loader();
    }
  });
}

export function preloadCriticalPages() {
  preloadPages(['DashboardPage', 'IdentitiesPage', 'AssetsPage', 'TransfersPage']);
}

export function preloadAdminPages() {
  preloadPages(['AdminUsersPage', 'AdminRolesPage', 'AdminConfigPage']);
}

export function preloadUserPages() {
  preloadPages(['MyIdentityPage', 'MyAssetsPage', 'MyTransfersPage', 'MyActivityPage']);
}