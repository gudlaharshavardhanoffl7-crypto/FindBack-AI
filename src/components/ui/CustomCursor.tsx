'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth springs for cursor interpolation
  const cursorX = useSpring(0, { damping: 28, stiffness: 350 });
  const cursorY = useSpring(0, { damping: 28, stiffness: 350 });
  const dotX = useSpring(0, { damping: 45, stiffness: 700 });
  const dotY = useSpring(0, { damping: 45, stiffness: 700 });

  useEffect(() => {
    // Only activate for non-touch fine pointer devices
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    setMounted(true);
    document.body.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if target is an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive =
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('[role="button"]') ||
          target.closest('.interactive-target');

        setIsHovered(Boolean(interactive));
      }
    };

    const handleMouseDown = () => setIsPointer(true);
    const handleMouseUp = () => setIsPointer(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, dotX, dotY, isVisible]);

  if (!mounted || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer morphing ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          borderColor: isHovered ? 'rgba(56, 189, 248, 0.9)' : 'rgba(255, 255, 255, 0.35)',
          backgroundColor: isHovered ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
          boxShadow: isHovered ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none',
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      />

      {/* Center focus dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: isPointer ? 3 : isHovered ? 6 : 4,
          height: isPointer ? 3 : isHovered ? 6 : 4,
          backgroundColor: isHovered ? '#38bdf8' : '#ffffff',
          boxShadow: isHovered ? '0 0 8px #38bdf8' : '0 0 4px #ffffff',
        }}
      />
    </div>
  );
}
