'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  'INITIALIZING ZERO-GRAVITY 3D ENVIRONMENT',
  'LOADING MULTIMODAL PGVECTOR INDEX',
  'SYNCING REVERSE VISION EXTRACTION CORE',
  'SYSTEM ONLINE',
];

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    // Simulated diagnostic sequence for high-tech entrance
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 18) + 10;
        return Math.min(100, prev + delta);
      });
    }, 180);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.04,
              filter: 'blur(10px)',
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            }}
            className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-[#050811] text-slate-100 select-none"
          >
            {/* Ambient background grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
              {/* Central Geometric Radar Node */}
              <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border border-sky-500/20 rounded-lg animate-spin" style={{ animationDuration: '8s' }} />
                <div className="absolute inset-2 border border-sky-400/40 rounded-lg -rotate-45" />
                <motion.div
                  className="w-4 h-4 bg-sky-400 rounded-sm shadow-[0_0_15px_#38bdf8]"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Title & Badge */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-[11px] font-mono tracking-[0.25em] text-sky-400 uppercase font-semibold">
                  Find Back AI Platform
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white mb-6">
                Multimodal Recovery Grid
              </h2>

              {/* Progress bar container */}
              <div className="w-full bg-slate-900 border border-white/10 rounded-md p-1 mb-3">
                <motion.div
                  className="h-1.5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-sm"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              {/* Status and percentage metrics */}
              <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400">
                <span className="text-[10px] tracking-wide text-slate-300 truncate max-w-[200px]">
                  {LOADING_STEPS[stepIndex]}
                </span>
                <span className="text-sky-400 font-semibold">{progress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Entrance Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: loading ? 0 : 1,
          y: loading ? 14 : 0,
        }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen flex flex-col relative"
      >
        {children}
      </motion.div>
    </>
  );
}
