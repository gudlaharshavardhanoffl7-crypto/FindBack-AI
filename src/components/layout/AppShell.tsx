'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <div className="min-h-screen relative flex flex-col bg-[#f2f0ec]">
        <Navbar />
        <main className="flex-1 relative">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0d0c0b] relative">
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
