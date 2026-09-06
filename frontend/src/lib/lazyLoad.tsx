import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { SkeletonPageHeader, SkeletonStatGrid, SkeletonList } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

interface LazyLoadOptions {
  preload?: boolean;
  fallback?: React.ReactNode;
  delay?: number;
}

export function lazyLoad<T extends ComponentType<object>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { preload = false, delay = 200 } = options;

  const LazyComponent = lazy(async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return importFn();
  });

  if (preload) {
    importFn();
  }

  return LazyComponent;
}

export function createLazyPage<T extends ComponentType<object>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazyLoad(importFn, options);
  
  const displayName = importFn.toString().match(/pages\/([^\/]+)/)?.[1] || 'Page';
  
  (LazyComponent as unknown as { displayName?: string }).displayName = `Lazy${displayName.charAt(0).toUpperCase() + displayName.slice(1)}`;
  
  return LazyComponent;
}

export const pageLoaders = {
  DashboardPage: () => import('../pages/DashboardPage'),
  UsersPage: () => import('../pages/UsersPage'),
  AssetsPage: () => import('../pages/AssetsPage'),
  RequestsPage: () => import('../pages/RequestsPage'),
  IdentitiesPage: () => import('../pages/IdentitiesPage'),
  BlockchainPage: () => import('../pages/BlockchainPage'),
  AuditPage: () => import('../pages/AuditPage'),
  SecurityCenterPage: () => import('../pages/SecurityCenterPage'),
  LandingPage: () => import('../pages/LandingPage'),
  LoginPage: () => import('../pages/LoginPage'),
};

export type PageName = keyof typeof pageLoaders;

export function getLazyPage(name: PageName, options?: LazyLoadOptions) {
  const loader = pageLoaders[name];
  if (!loader) {
    throw new Error(`Page "${name}" not found`);
  }
  return createLazyPage(loader, options);
}

export function PageLoadingFallback({ title = 'Loading...', showSkeleton = true }: { title?: string; showSkeleton?: boolean }) {
  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-cyber-text">{title}</h2>
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
  pageName?: string
) {
  const ComponentWithTransition = function (props: P) {
    return (
      <div className="page-transition-enter">
        <WrappedComponent {...props} />
      </div>
    );
  };
  ComponentWithTransition.displayName = pageName ? `WithPageTransition(${pageName})` : 'WithPageTransition';
  return ComponentWithTransition;
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
  preloadPages(['DashboardPage', 'IdentitiesPage', 'AssetsPage', 'UsersPage']);
}

export function preloadAdminPages() {
  preloadPages(['DashboardPage', 'UsersPage', 'AssetsPage']);
}

export function preloadUserPages() {
  preloadPages(['DashboardPage', 'IdentitiesPage', 'AssetsPage']);
}
