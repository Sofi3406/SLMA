// components/AuthWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { authService } from '@/services/authService';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
    setIsLoading(false);
  }, [pathname]); // Re-check on route change

  useEffect(() => {
    if (isLoading) return;

    const isRegisterRoute = pathname.startsWith('/auth/register');
    const isPublicRoute = pathname === '/' || pathname.startsWith('/auth');

    if (!isAuthenticated && isRegisterRoute) {
      router.replace('/auth/login');
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Landing page should show only home content (no header/footer)
  const isLandingPage = pathname === '/';
  const isAuthRoute = pathname.startsWith('/auth');
  const shouldShowHeader = !isLandingPage && !isAuthRoute;
  const shouldShowFooter = isAuthenticated && !isLandingPage && !isAuthRoute;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {isLandingPage && (
        <div className="landing-banner" role="img" aria-label="Header Banner"></div>
      )}
      {shouldShowHeader && <Header />}
      <main>{children}</main>
      {shouldShowFooter && <Footer />}
    </>
  );
}