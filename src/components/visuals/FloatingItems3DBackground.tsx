'use client';

import React, { useEffect, useRef } from 'react';

interface FloatingObject {
  id: string;
  name: string;
  top: string;
  left: string;
  depth: number;
  size: number;
  duration: number;
  delay: number;
  renderType: 'key' | 'phone' | 'badge' | 'glasses' | 'watch' | 'radar' | 'polyhedron' | 'earbuds' | 'wallet';
}

const FLOATING_OBJECTS: FloatingObject[] = [
  {
    id: 'key-1',
    name: 'Car Key & Fob',
    top: '12%',
    left: '6%',
    depth: 1.2,
    size: 64,
    duration: 7.5,
    delay: 0,
    renderType: 'key',
  },
  {
    id: 'poly-1',
    name: 'AI Vector Polyhedron',
    top: '18%',
    left: '90%',
    depth: 1.8,
    size: 68,
    duration: 9,
    delay: 1.2,
    renderType: 'polyhedron',
  },
  {
    id: 'badge-1',
    name: 'Campus ID Card',
    top: '52%',
    left: '4%',
    depth: 1,
    size: 70,
    duration: 8,
    delay: 2,
    renderType: 'badge',
  },
  {
    id: 'glasses-1',
    name: 'Spectacles',
    top: '44%',
    left: '92%',
    depth: 1.6,
    size: 76,
    duration: 10,
    delay: 0.5,
    renderType: 'glasses',
  },
  {
    id: 'watch-1',
    name: 'Smart Watch',
    top: '78%',
    left: '12%',
    depth: 2.2,
    size: 66,
    duration: 8.5,
    delay: 1.6,
    renderType: 'watch',
  },
  {
    id: 'radar-1',
    name: 'AI Scanner Radar',
    top: '80%',
    left: '86%',
    depth: 1.4,
    size: 68,
    duration: 9.5,
    delay: 2.3,
    renderType: 'radar',
  },
  {
    id: 'earbuds-1',
    name: 'Earbuds Case',
    top: '32%',
    left: '16%',
    depth: 2.5,
    size: 58,
    duration: 7.8,
    delay: 2.8,
    renderType: 'earbuds',
  },
  {
    id: 'phone-1',
    name: 'Smartphone',
    top: '26%',
    left: '84%',
    depth: 1.5,
    size: 72,
    duration: 9.2,
    delay: 0.9,
    renderType: 'phone',
  },
  {
    id: 'wallet-1',
    name: 'Cardholder Wallet',
    top: '64%',
    left: '79%',
    depth: 1.1,
    size: 72,
    duration: 8.6,
    delay: 1.4,
    renderType: 'wallet',
  },
];

// 3D Polyhedron geometry definition (Octahedron vertices and edges)
const OCTAHEDRON_VERTICES = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const OCTAHEDRON_EDGES = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [4, 3], [3, 5], [5, 2],
];

export default function FloatingItems3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates and smooth lerp
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const isMobile = width < 768;
    const particleCount = isMobile ? 16 : 38;

    // AI Node particles
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.25 + 0.12,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    // 3D Geometric Polyhedrons floating in Canvas
    const polyhedrons = [
      {
        cx: width * 0.88,
        cy: height * 0.22,
        scale: isMobile ? 24 : 36,
        rx: 0.3,
        ry: 0.5,
        rz: 0.2,
        speedX: 0.005,
        speedY: 0.007,
        speedZ: 0.003,
      },
      {
        cx: width * 0.12,
        cy: height * 0.76,
        scale: isMobile ? 20 : 30,
        rx: 0.8,
        ry: 0.2,
        rz: 0.4,
        speedX: 0.006,
        speedY: 0.004,
        speedZ: 0.005,
      },
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      polyhedrons[0].cx = width * 0.88;
      polyhedrons[0].cy = height * 0.22;
      polyhedrons[1].cx = width * 0.12;
      polyhedrons[1].cy = height * 0.76;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width - 0.5) * 2;
      targetMouseY = (e.clientY / height - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // 3D Rotation helper
    function rotate3D(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
      // Rotate around X
      const y1 = y * Math.cos(rx) - z * Math.sin(rx);
      const z1 = y * Math.sin(rx) + z * Math.cos(rx);
      // Rotate around Y
      const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      // Rotate around Z
      const x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      const y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return [x3, y3, z2];
    }

    // 60fps render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse smoothly
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      const parallaxOffsetX = currentMouseX * 18;
      const parallaxOffsetY = currentMouseY * 14;

      // Draw subtle ambient glow gradients in background
      const grad1 = ctx.createRadialGradient(
        width * 0.15 + parallaxOffsetX * 0.5,
        height * 0.25 + parallaxOffsetY * 0.5,
        10,
        width * 0.15 + parallaxOffsetX * 0.5,
        height * 0.25 + parallaxOffsetY * 0.5,
        320
      );
      grad1.addColorStop(0, 'rgba(217, 119, 6, 0.045)');
      grad1.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.85 - parallaxOffsetX * 0.5,
        height * 0.7 - parallaxOffsetY * 0.5,
        10,
        width * 0.85 - parallaxOffsetX * 0.5,
        height * 0.7 - parallaxOffsetY * 0.5,
        360
      );
      grad2.addColorStop(0, 'rgba(14, 165, 233, 0.04)');
      grad2.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Update and draw AI Node particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.phase) * 0.06;
        const px = p.x + parallaxOffsetX * 0.4;
        const py = p.y + parallaxOffsetY * 0.4;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13, 12, 11, ${Math.max(0.04, currentAlpha).toFixed(3)})`;
        ctx.fill();

        // Connect nearby particles with subtle AI network lines
        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
              const lineAlpha = (1 - dist / 110) * 0.06;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(p2.x + parallaxOffsetX * 0.4, p2.y + parallaxOffsetY * 0.4);
              ctx.strokeStyle = `rgba(13, 12, 11, ${lineAlpha.toFixed(3)})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // Draw 3D Rotating Geometric Polyhedrons
      for (let k = 0; k < polyhedrons.length; k++) {
        const poly = polyhedrons[k];
        poly.rx += poly.speedX;
        poly.ry += poly.speedY;
        poly.rz += poly.speedZ;

        const projectedVertices: [number, number][] = [];
        const posX = poly.cx + (k === 0 ? parallaxOffsetX * 0.7 : -parallaxOffsetX * 0.7);
        const posY = poly.cy + (k === 0 ? parallaxOffsetY * 0.7 : -parallaxOffsetY * 0.7);

        for (let v = 0; v < OCTAHEDRON_VERTICES.length; v++) {
          const vert = OCTAHEDRON_VERTICES[v];
          const [rx, ry] = rotate3D(vert[0], vert[1], vert[2], poly.rx, poly.ry, poly.rz);
          projectedVertices.push([posX + rx * poly.scale, posY + ry * poly.scale]);
        }

        // Draw wireframe edges
        ctx.strokeStyle = 'rgba(13, 12, 11, 0.12)';
        ctx.lineWidth = 1;
        for (let e = 0; e < OCTAHEDRON_EDGES.length; e++) {
          const edge = OCTAHEDRON_EDGES[e];
          const p1 = projectedVertices[edge[0]];
          const p2 = projectedVertices[edge[1]];
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }

        // Draw vertex nodes
        ctx.fillStyle = 'rgba(13, 12, 11, 0.22)';
        for (let v = 0; v < projectedVertices.length; v++) {
          const p = projectedVertices[v];
          ctx.beginPath();
          ctx.arc(p[0], p[1], 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
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
            opacity: 0.14;
            filter: blur(8px);
          }
          50% {
            transform: scale(0.76) translateZ(0);
            opacity: 0.07;
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
        }
      `}</style>

      {/* Interactive 60fps Canvas (AI Node Constellations, Ambient Particle Dust & Wireframe Polyhedrons) */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />

      {/* Stylized Lost & Found 3D Silhouettes */}
      {FLOATING_OBJECTS.map((obj) => (
        <div
          key={obj.id}
          className="absolute floating-3d-scene hidden md:block"
          style={{
            top: obj.top,
            left: obj.left,
            transform: `translate3d(0, 0, ${obj.depth * 20}px)`,
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
            {/* Frosted Glass Silhouette Housing */}
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-[6px] border border-black/[0.08] shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
              {/* Gloss Bevel Sheen */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-white/80 pointer-events-none" />

              {obj.renderType === 'key' && (
                <svg className="w-8 h-8 text-neutral-800 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="7.5" cy="15.5" r="4.5" />
                  <path d="m11 12 8-8" strokeLinecap="round" />
                  <path d="m15 8 2 2" strokeLinecap="round" />
                  <path d="m18 5 2 2" strokeLinecap="round" />
                </svg>
              )}

              {obj.renderType === 'polyhedron' && (
                <svg className="w-8 h-8 text-amber-600 drop-shadow-sm opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {obj.renderType === 'badge' && (
                <svg className="w-8 h-8 text-sky-700 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect width="18" height="14" x="3" y="6" rx="2" />
                  <circle cx="8" cy="13" r="2" />
                  <path d="M13 11h5" strokeLinecap="round" />
                  <path d="M13 15h3" strokeLinecap="round" />
                  <path d="M10 2v4" strokeLinecap="round" />
                  <path d="M14 2v4" strokeLinecap="round" />
                </svg>
              )}

              {obj.renderType === 'glasses' && (
                <svg className="w-9 h-9 text-neutral-800 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="6" cy="14" r="4" />
                  <circle cx="18" cy="14" r="4" />
                  <path d="M10 14h4" />
                  <path d="m2 14 3-6" strokeLinecap="round" />
                  <path d="m22 14-3-6" strokeLinecap="round" />
                </svg>
              )}

              {obj.renderType === 'watch' && (
                <svg className="w-8 h-8 text-neutral-800 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

              {obj.renderType === 'radar' && (
                <svg className="w-8 h-8 text-indigo-700 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                  <circle cx="11" cy="11" r="3" strokeDasharray="2 2" />
                </svg>
              )}

              {obj.renderType === 'earbuds' && (
                <svg className="w-8 h-8 text-neutral-800 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect width="16" height="12" x="4" y="8" rx="4" />
                  <path d="M4 12h16" />
                  <circle cx="9" cy="5" r="2" />
                  <circle cx="15" cy="5" r="2" />
                  <path d="M9 7v1" />
                  <path d="M15 7v1" />
                </svg>
              )}

              {obj.renderType === 'phone' && (
                <svg className="w-8 h-8 text-neutral-800 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect width="14" height="20" x="5" y="2" rx="3" ry="3" />
                  <path d="M12 18h.01" strokeLinecap="round" />
                  <line x1="9" x2="15" y1="5" y2="5" strokeLinecap="round" />
                </svg>
              )}

              {obj.renderType === 'wallet' && (
                <svg className="w-8 h-8 text-amber-900 drop-shadow-sm opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect width="18" height="14" x="3" y="5" rx="2" />
                  <path d="M3 10h18" />
                  <circle cx="17" cy="15" r="1" fill="currentColor" />
                </svg>
              )}
            </div>

            {/* 3D Dynamic Ambient Shadow */}
            <div
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4/5 h-2.5 rounded-full bg-black pointer-events-none"
              style={{
                animation: `shadowPulse ${obj.duration}s ease-in-out infinite`,
                animationDelay: `${obj.delay}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
