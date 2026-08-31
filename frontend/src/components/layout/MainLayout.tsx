import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-dark-900 dark:text-white">SecureChain</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How It Works</a>
              <a href="#architecture" className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Architecture</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/login" className="btn-ghost hidden sm:inline-flex">Login</a>
              <a href="/register" className="btn-primary">Get Started</a>
            </div>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-dark-900 dark:text-white">SecureChain</span>
              </div>
              <p className="text-dark-600 dark:text-dark-400 max-w-xs">
                Decentralized Identity, NFT Asset Ownership & Immutable Audit Platform.
                Building trust through blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-dark-600 dark:text-dark-400">
                <li><a href="/docs" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="/api" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">API Reference</a></li>
                <li><a href="/github" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-dark-600 dark:text-dark-400">
                <li><a href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-200 dark:border-dark-700 text-center text-dark-500 dark:text-dark-400 text-sm">
            <p>© 2024 SecureChain. Built for SIH26125.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}