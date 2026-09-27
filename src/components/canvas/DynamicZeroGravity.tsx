'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ZeroGravityScene = dynamic(
  () => import('./ZeroGravityScene'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#06090e]" />
    ),
  }
);

export default function DynamicZeroGravity() {
  return <ZeroGravityScene />;
}
