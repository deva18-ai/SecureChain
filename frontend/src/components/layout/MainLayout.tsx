import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="min-h-screen" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', background: '#0b0d12' }}>
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto" style={{ padding: '26px 30px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0b0d12' }}>
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0b0d12' }}>
      {children}
    </div>
  );
}