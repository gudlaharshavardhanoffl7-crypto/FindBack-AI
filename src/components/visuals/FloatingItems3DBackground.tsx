'use client';

import React, { useEffect, useState } from 'react';

interface FloatingObject {
  id: string;
  name: string;
  top: string;
  left: string;
  depth: number; // 1 to 3
  size: number;
  duration: number;
  delay: number;
  rotationRange: number;
  renderType: 'key' | 'phone' | 'badge' | 'glasses' | 'watch' | 'compass' | 'earbuds' | 'wallet';
}

const FLOATING_OBJECTS: FloatingObject[] = [
  {
    id: 'key-1',
    name: 'Car Key & Fob',
    top: '12%',
    left: '8%',
    depth: 1,
    size: 64,
    duration: 7,
    delay: 0,
    rotationRange: 14,
    renderType: 'key',
  },
  {
    id: 'phone-1',
    name: 'Smartphone',
    top: '22%',
    left: '88%',
    depth: 2,
    size: 78,
    duration: 9,
    delay: 1.2,
    rotationRange: 18,
    renderType: 'phone',
  },
  {
    id: 'badge-1',
    name: 'Campus ID Card',
    top: '55%',
    left: '5%',
    depth: 1,
    size: 72,
    duration: 8,
    delay: 2.1,
    rotationRange: 12,
    renderType: 'badge',
  },
  {
    id: 'glasses-1',
    name: 'Designer Spectacles',
    top: '48%',
    left: '91%',
    depth: 2,
    size: 80,
    duration: 10,
    delay: 0.8,
    rotationRange: 16,
    renderType: 'glasses',
  },
  {
    id: 'watch-1',
    name: 'Smart Watch',
    top: '78%',
    left: '14%',
    depth: 3,
    size: 68,
    duration: 8.5,
    delay: 1.8,
    rotationRange: 15,
    renderType: 'watch',
  },
  {
    id: 'compass-1',
    name: 'Radar Compass',
    top: '82%',
    left: '84%',
    depth: 2,
    size: 66,
    duration: 9.5,
    delay: 2.5,
    rotationRange: 20,
    renderType: 'compass',
  },
  {
    id: 'earbuds-1',
    name: 'Earbuds Case',
    top: '34%',
    left: '18%',
    depth: 3,
    size: 58,
    duration: 7.5,
    delay: 3,
    rotationRange: 14,
    renderType: 'earbuds',
  },
  {
    id: 'wallet-1',
    name: 'Cardholder Wallet',
    top: '68%',
    left: '78%',
    depth: 1,
    size: 74,
    duration: 8.8,
    delay: 1.5,
    rotationRange: 12,
    renderType: 'wallet',
  },
];

export default function FloatingItems3DBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 2;
          const y = (e.clientY / window.innerHeight - 0.5) * 2;
          setMousePos({ x, y });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      <style jsx global>{`
        @keyframes float3D {
          0%,
          100% {
            transform: translate3d(0, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: translate3d(6px, -14px, 18px) rotateX(8deg) rotateY(-10deg) rotateZ(4deg);
          }
          50% {
            transform: translate3d(-4px, -24px, 32px) rotateX(-6deg) rotateY(8deg) rotateZ(-3deg);
          }
          75% {
            transform: translate3d(-10px, -10px, 16px) rotateX(10deg) rotateY(6deg) rotateZ(5deg);
          }
        }

        @keyframes shadowPulse {
          0%,
          100% {
            transform: scale(1) translateZ(0);
            opacity: 0.16;
            filter: blur(8px);
          }
          50% {
            transform: scale(0.78) translateZ(0);
            opacity: 0.08;
            filter: blur(14px);
          }
        }

        .floating-3d-scene {
          transform-style: preserve-3d;
          will-change: transform;
        }

        .floating-item-card {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.4, 1);
        }
      `}</style>

      {FLOATING_OBJECTS.map((obj) => {
        const parallaxX = mousePos.x * 20 * obj.depth;
        const parallaxY = mousePos.y * 15 * obj.depth;

        return (
          <div
            key={obj.id}
            className="absolute floating-3d-scene hidden sm:block"
            style={{
              top: obj.top,
              left: obj.left,
              transform: `translate3d(${parallaxX}px, ${parallaxY}px, ${obj.depth * 25}px)`,
              transition: 'transform 0.4s cubic-bezier(0.1, 0.6, 0.3, 1)',
            }}
          >
            {/* 3D Floating Body */}
            <div
              className="floating-item-card"
              style={{
                width: `${obj.size}px`,
                height: `${obj.size}px`,
                animation: `float3D ${obj.duration}s ease-in-out infinite`,
                animationDelay: `${obj.delay}s`,
              }}
            >
              {/* Actual 3D Object Illustration */}
              <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md border border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transform hover:scale-105 transition-transform">
                {/* Gloss bevel sheen highlight */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/50 to-white/90 pointer-events-none" />

                {obj.renderType === 'key' && (
                  <svg className="w-8 h-8 text-slate-800 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="7.5" cy="15.5" r="4.5" />
                    <path d="m11 12 8-8" strokeLinecap="round" />
                    <path d="m15 8 2 2" strokeLinecap="round" />
                    <path d="m18 5 2 2" strokeLinecap="round" />
                  </svg>
                )}

                {obj.renderType === 'phone' && (
                  <svg className="w-9 h-9 text-slate-800 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect width="14" height="20" x="5" y="2" rx="3" ry="3" />
                    <path d="M12 18h.01" strokeLinecap="round" />
                    <line x1="9" x2="15" y1="5" y2="5" strokeLinecap="round" />
                  </svg>
                )}

                {obj.renderType === 'badge' && (
                  <svg className="w-8 h-8 text-sky-700 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect width="18" height="14" x="3" y="6" rx="2" />
                    <circle cx="8" cy="13" r="2" />
                    <path d="M13 11h5" strokeLinecap="round" />
                    <path d="M13 15h3" strokeLinecap="round" />
                    <path d="M10 2v4" strokeLinecap="round" />
                    <path d="M14 2v4" strokeLinecap="round" />
                  </svg>
                )}

                {obj.renderType === 'glasses' && (
                  <svg className="w-9 h-9 text-slate-800 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="6" cy="14" r="4" />
                    <circle cx="18" cy="14" r="4" />
                    <path d="M10 14h4" />
                    <path d="m2 14 3-6" strokeLinecap="round" />
                    <path d="m22 14-3-6" strokeLinecap="round" />
                  </svg>
                )}

                {obj.renderType === 'watch' && (
                  <svg className="w-8 h-8 text-slate-800 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="6" />
                    <polyline points="12 10 12 12 13.5 13.5" />
                    <path d="M9 3h6" strokeLinecap="round" />
                    <path d="M9 21h6" strokeLinecap="round" />
                    <path d="M10 3v3" />
                    <path d="M14 3v3" />
                    <path d="M10 18v3" />
                    <path d="M14 18v3" />
                  </svg>
                )}

                {obj.renderType === 'compass' && (
                  <svg className="w-8 h-8 text-indigo-700 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
                  </svg>
                )}

                {obj.renderType === 'earbuds' && (
                  <svg className="w-8 h-8 text-slate-800 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect width="16" height="12" x="4" y="8" rx="4" />
                    <path d="M4 12h16" />
                    <circle cx="9" cy="5" r="2" />
                    <circle cx="15" cy="5" r="2" />
                    <path d="M9 7v1" />
                    <path d="M15 7v1" />
                  </svg>
                )}

                {obj.renderType === 'wallet' && (
                  <svg className="w-8 h-8 text-amber-900 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect width="18" height="14" x="3" y="5" rx="2" />
                    <path d="M3 10h18" />
                    <circle cx="17" cy="15" r="1" fill="currentColor" />
                  </svg>
                )}
              </div>

              {/* 3D Dynamic Ambient Shadow */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-3 rounded-full bg-black pointer-events-none"
                style={{
                  animation: `shadowPulse ${obj.duration}s ease-in-out infinite`,
                  animationDelay: `${obj.delay}s`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
