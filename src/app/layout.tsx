import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

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

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Find Back with AI - Smart Item Recovery',
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
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://d2ol7oe51mr4n9.cloudfront.net" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} antialiased bg-[#fcfbf9] text-[#0d0c0b] min-h-screen selection:bg-neutral-900 selection:text-white relative`}
      >
        {/* Dynamic App Shell */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
