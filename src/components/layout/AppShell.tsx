'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import DynamicZeroGravity from '@/components/canvas/DynamicZeroGravity';
import GlobalLoader from '@/components/ui/GlobalLoader';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <main className="min-h-screen relative">{children}</main>;
  }

  return (
    <GlobalLoader>
      <DynamicZeroGravity />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </GlobalLoader>
  );
}
