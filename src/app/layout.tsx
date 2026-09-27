import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CustomCursor from '@/components/ui/CustomCursor';
import GlobalLoader from '@/components/ui/GlobalLoader';
import DynamicZeroGravity from '@/components/canvas/DynamicZeroGravity';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Find Back with AI - Multimodal Property Recovery System',
  description:
    'High-dimensional vector embedding search, Gemini multimodal vision decomposition, and coordinate mapping for lost physical property.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#06090e] text-slate-100 min-h-screen selection:bg-sky-500/30 selection:text-sky-200 relative`}
      >
        {/* Custom Tracking Cursor */}
        <CustomCursor />

        {/* Global Loading Screen & Entrance Reveal */}
        <GlobalLoader>
          {/* Zero-Gravity 3D Background with Mouse Parallax & 7 Stylized Objects */}
          <DynamicZeroGravity />

          {/* Glassmorphism Header / Navbar */}
          <Navbar />

          {/* Main Viewport Content */}
          <main className="flex-1 relative z-10">{children}</main>

          {/* Glassmorphism Footer */}
          <Footer />
        </GlobalLoader>
      </body>
    </html>
  );
}
