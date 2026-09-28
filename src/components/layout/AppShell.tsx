'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingItems3DBackground from '@/components/visuals/FloatingItems3DBackground';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <div className="min-h-screen relative flex flex-col bg-[#f2f0ec] text-[#0d0c0b]">
        <Navbar />
        <main className="flex-1 relative">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#0d0c0b] relative transition-colors duration-300">
      {/* 3D Floating items in background for all other pages */}
      <FloatingItems3DBackground />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
