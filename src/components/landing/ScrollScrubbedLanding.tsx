'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ItemReportModal from '@/components/items/ItemReportModal';
import { ItemType } from '@/types';

const VIDEO_URL =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/45567745-d826-44a2-a5ce-7ef670944e60.mp4';

const CUES = [
  [0.0, 0.0, 0.14, 0.22],
  [0.28, 0.36, 0.46, 0.54],
  [0.58, 0.66, 0.76, 0.84],
  [0.88, 0.94, 1.05, 1.15],
];

const DRIFT = 22; // px of counter-scroll travel per panel
const EASE = 0.08;

export default function ScrollScrubbedLanding() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bootBarRef = useRef<HTMLElement | null>(null);
  const meterRef = useRef<HTMLElement | null>(null);

  const [bootPctText, setBootPctText] = useState('LOADING 0%');
  const [bootDone, setBootDone] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType] = useState<ItemType>('lost');

  // Panel refs
  const panel0Ref = useRef<HTMLElement | null>(null);
  const panel1Ref = useRef<HTMLElement | null>(null);
  const panel2Ref = useRef<HTMLElement | null>(null);
  const panel3Ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let isReady = false;
    let rafId: number | null = null;
    let targetProgress = 0;
    let currentProgress = 0;
    let seekAt = 0;

    const clip = videoRef.current;
    const bootBar = bootBarRef.current;
    const meter = meterRef.current;
    const panels = [panel0Ref.current, panel1Ref.current, panel2Ref.current, panel3Ref.current];

    function setBootProgress(pct: number) {
      const p = Math.max(0, Math.min(1, pct));
      if (bootBar) {
        bootBar.style.transform = 'scaleX(' + p + ')';
      }
      setBootPctText('LOADING ' + Math.round(p * 100) + '%');
    }

    function start() {
      if (isReady) return;
      isReady = true;
      unlockVideo();
      setBootProgress(1);

      setTimeout(() => {
        setBootDone(true);
        setTimeout(() => {
          setRevealed(true);
        }, 300);
      }, 240);

      startLoop();
    }

    function unlockVideo() {
      if (!clip) return;
      if (clip.paused) {
        const playPromise = clip.play();
        if (playPromise !== undefined && typeof playPromise.then === 'function') {
          playPromise
            .then(() => {
              clip.pause();
            })
            .catch(() => {});
        } else {
          clip.pause();
        }
      }
    }

    function onFirstInteraction() {
      unlockVideo();
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('click', onFirstInteraction);
    }
    window.addEventListener('touchstart', onFirstInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', onFirstInteraction, { passive: true, once: true });
    window.addEventListener('click', onFirstInteraction, { passive: true, once: true });

    function bindClipEvents() {
      if (!clip) return;
      clip.addEventListener('loadedmetadata', () => {
        try {
          clip.currentTime = 0.001;
        } catch {}
      });
      clip.addEventListener('canplay', () => {
        start();
      });
      clip.addEventListener('canplaythrough', () => {
        start();
      });
      setTimeout(() => {
        start();
      }, 1200);
    }

    function fallbackDirect() {
      if (!clip) return;
      clip.src = VIDEO_URL;
      bindClipEvents();
    }

    function preloadBlob() {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', VIDEO_URL, true);
        xhr.responseType = 'blob';

        xhr.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            setBootProgress(e.loaded / e.total);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            try {
              const blobUrl = URL.createObjectURL(xhr.response);
              if (clip) {
                clip.src = blobUrl;
                bindClipEvents();
                return;
              }
              fallbackDirect();
            } catch {
              fallbackDirect();
            }
          } else {
            fallbackDirect();
          }
        };

        xhr.onerror = () => {
          fallbackDirect();
        };

        xhr.send();
      } catch {
        fallbackDirect();
      }
    }

    function calculateTargetProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      const st = window.pageYOffset || document.documentElement.scrollTop || 0;
      return Math.max(0, Math.min(1, st / maxScroll));
    }

    function onScroll() {
      targetProgress = calculateTargetProgress();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    function updatePanels(p: number) {
      for (let i = 0; i < panels.length; i++) {
        const cue = CUES[i];
        const panel = panels[i];
        if (!cue || !panel) continue;

        const a = cue[0];
        const b = cue[1];
        const c = cue[2];
        const d = cue[3];
        let opacity = 0;
        let y = 0;

        if (p < a) {
          opacity = 0;
          y = DRIFT;
        } else if (p > d) {
          opacity = 0;
          y = -DRIFT;
        } else {
          if (b === a) {
            if (p <= c) {
              opacity = 1;
            } else {
              opacity = d > c ? 1 - (p - c) / (d - c) : 0;
            }
          } else if (p < b) {
            opacity = (p - a) / (b - a);
          } else if (p <= c) {
            opacity = 1;
          } else {
            opacity = d > c ? 1 - (p - c) / (d - c) : 0;
          }

          const u = d > a ? (p - a) / (d - a) : 0;
          y = (0.5 - u) * (DRIFT * 2);
        }

        opacity = Math.max(0, Math.min(1, opacity));
        panel.style.opacity = opacity.toFixed(4);
        panel.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px, 0)';
        panel.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
        panel.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      }
    }

    function loop() {
      rafId = requestAnimationFrame(loop);

      currentProgress += (targetProgress - currentProgress) * EASE;
      if (Math.abs(targetProgress - currentProgress) < 0.0001) {
        currentProgress = targetProgress;
      }

      if (meter) {
        meter.style.transform = 'scaleX(' + currentProgress.toFixed(4) + ')';
      }

      if (clip && clip.duration) {
        const targetTime = currentProgress * clip.duration;
        const gap = targetTime - seekAt;
        if (Math.abs(gap) > 0.001) {
          seekAt += gap * 0.115;
          if (seekAt < 0) seekAt = 0;
          if (seekAt > clip.duration) seekAt = clip.duration;
          clip.currentTime = seekAt;
        }
      }

      updatePanels(currentProgress);
    }

    function startLoop() {
      if (!rafId) {
        targetProgress = calculateTargetProgress();
        currentProgress = targetProgress;
        updatePanels(currentProgress);
        loop();
      }
    }

    // Initialize
    targetProgress = calculateTargetProgress();
    currentProgress = targetProgress;
    updatePanels(currentProgress);
    preloadBlob();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="landing-root text-[#0d0c0b] bg-[#f2f0ec] font-['Inter_Tight',sans-serif] min-h-screen relative overflow-x-hidden selection:bg-[#0a0908]/15">
      <style jsx global>{`
        :root {
          --fg: #0d0c0b;
          --fg-soft: rgba(13, 12, 11, 0.64);
          --fg-faint: rgba(13, 12, 11, 0.42);
          --shade: #f2f0ec;
          --rule: rgba(13, 12, 11, 0.16);
          --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
          --pill-bg: #0a0908;
          --pill-fg: #ffffff;
        }

        .landing-root .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
        }

        .landing-root .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .landing-boot {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--shade);
          transition: opacity 0.6s var(--ease), visibility 0.6s var(--ease);
        }

        .landing-boot.done {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .landing-stage {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: var(--shade);
        }

        .landing-stage video {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%) scale(1.02);
          object-fit: cover;
          filter: contrast(1.02);
          will-change: transform;
        }

        .landing-veil {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              to bottom,
              rgba(242, 240, 236, 0.62) 0%,
              rgba(242, 240, 236, 0.12) 22%,
              rgba(242, 240, 236, 0.12) 78%,
              rgba(242, 240, 236, 0.66) 100%
            ),
            radial-gradient(
              100% 80% at 50% 48%,
              rgba(242, 240, 236, 0) 0%,
              rgba(242, 240, 236, 0.34) 100%
            ),
            rgba(242, 240, 236, 0.2);
        }

        .landing-grain {
          position: absolute;
          inset: -50%;
          opacity: 0.13;
          mix-blend-mode: multiply;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='.5'/></svg>");
        }

        .landing-meter {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          height: 2px;
          width: 100%;
          transform: scaleX(0);
          transform-origin: 0 50%;
          background: var(--fg);
          opacity: 0.55;
          will-change: transform;
        }

        .landing-chrome {
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: max(14px, calc(env(safe-area-inset-top, 0px) + 12px)) clamp(16px, 3.4vw, 44px) 14px;
          background: linear-gradient(
            to bottom,
            rgba(242, 240, 236, 0.94) 0%,
            rgba(242, 240, 236, 0.78) 72%,
            rgba(242, 240, 236, 0) 100%
          );
        }

        .landing-mark {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.012em;
          color: var(--fg);
          min-width: 0;
          flex-shrink: 1;
          text-decoration: none;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          gap: clamp(14px, 2.2vw, 24px);
          flex-shrink: 0;
        }

        .landing-nav a:not(.landing-pill) {
          color: var(--fg);
          text-decoration: none;
          font-size: 14.5px;
          letter-spacing: -0.008em;
          opacity: 0.6;
          position: relative;
          padding-bottom: 3px;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          transition: opacity 0.3s var(--ease);
          cursor: pointer;
        }

        .landing-nav a:not(.landing-pill)::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 1.5px;
          background-color: var(--fg);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s var(--ease);
        }

        .landing-nav a:not(.landing-pill):hover {
          opacity: 1;
        }

        .landing-nav a:not(.landing-pill):hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .landing-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          height: 46px;
          padding: 0 32px;
          border-radius: 9999px;
          background: #0d0c0b;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-decoration: none;
          white-space: nowrap;
          border: 1px solid #0d0c0b;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.2s var(--ease), background 0.2s var(--ease), box-shadow 0.2s var(--ease);
        }

        .landing-btn-primary:hover,
        .landing-btn-primary:focus-visible {
          transform: translateY(-1px);
          background: #242220;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
        }

        .landing-btn-primary:focus-visible {
          outline: 2px solid #0d0c0b;
          outline-offset: 2px;
        }

        .landing-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          height: 44px;
          padding: 0 20px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: #0d0c0b;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-decoration: none;
          white-space: nowrap;
          border: 1px solid var(--rule);
          box-shadow: 0 1px 3px rgba(13, 12, 11, 0.05);
          cursor: pointer;
          font-family: inherit;
          backdrop-filter: blur(8px);
          transition: background 0.2s var(--ease), border-color 0.2s var(--ease), transform 0.2s var(--ease);
        }

        .landing-btn-secondary:hover,
        .landing-btn-secondary:focus-visible {
          background: #ffffff;
          border-color: rgba(13, 12, 11, 0.3);
          transform: translateY(-1px);
        }

        .landing-panels {
          position: fixed;
          inset: 0;
          z-index: 20;
          pointer-events: none;
        }

        .landing-panel {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: max(104px, calc(env(safe-area-inset-top, 0px) + 88px)) clamp(20px, 5vw, 60px)
            max(96px, calc(env(safe-area-inset-bottom, 0px) + 80px));
          opacity: 0;
          will-change: opacity, transform;
        }

        .landing-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px 12px;
          font-size: 12.5px;
          letter-spacing: 0.045em;
          color: var(--fg-soft);
          margin-bottom: clamp(16px, 2vw, 22px);
          max-width: min(46ch, 100%);
          text-align: center;
        }

        .landing-h1 {
          font-weight: 400;
          font-size: clamp(34px, 7.1vw, 104px);
          line-height: 0.98;
          letter-spacing: -0.036em;
          max-width: 15ch;
          text-wrap: balance;
          color: var(--fg);
        }

        .landing-sub {
          margin-top: clamp(18px, 2.2vw, 28px);
          font-size: clamp(15px, 1.28vw, 19px);
          line-height: 1.5;
          letter-spacing: -0.008em;
          color: var(--fg-soft);
          max-width: min(46ch, 100%);
          text-wrap: pretty;
        }

        .landing-cta {
          margin-top: clamp(28px, 3.4vw, 44px);
          pointer-events: auto;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .landing-foot {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 40;
          display: flex;
          justify-content: center;
          padding: 14px clamp(16px, 4vw, 24px)
            max(16px, calc(env(safe-area-inset-bottom, 0px) + 12px));
          font-size: 12px;
          line-height: 1.45;
          letter-spacing: 0.02em;
          color: var(--fg-faint);
          text-align: center;
          pointer-events: none;
          background: linear-gradient(
            to top,
            rgba(242, 240, 236, 0.92) 0%,
            rgba(242, 240, 236, 0.72) 72%,
            rgba(242, 240, 236, 0) 100%
          );
        }

        .landing-track {
          position: relative;
          z-index: 1;
          height: 600vh;
          min-height: 3600px;
        }

        @media (max-width: 768px) {
          .landing-nav a:not(.landing-pill) {
            display: none;
          }
          .landing-chrome {
            padding: max(12px, calc(env(safe-area-inset-top, 0px) + 8px)) clamp(16px, 4vw, 24px) 12px;
          }
          .landing-panel {
            padding: max(88px, calc(env(safe-area-inset-top, 0px) + 72px)) clamp(16px, 4vw, 24px)
              max(84px, calc(env(safe-area-inset-bottom, 0px) + 68px));
          }
          .landing-h1 {
            font-size: clamp(32px, 8.2vw, 56px);
            line-height: 1.02;
          }
          .landing-sub {
            font-size: 15px;
            margin-top: 16px;
          }
          .landing-cta {
            margin-top: 24px;
          }
          .landing-cta .landing-pill {
            height: 44px;
            padding: 0 22px;
            font-size: 14.5px;
          }
        }

        @media (max-width: 480px) {
          .landing-mark {
            font-size: 14.5px;
          }
          .landing-pill {
            height: 36px;
            padding: 0 16px;
            font-size: 13.5px;
          }
          .landing-panel {
            padding: max(76px, calc(env(safe-area-inset-top, 0px) + 60px)) 16px
              max(74px, calc(env(safe-area-inset-bottom, 0px) + 56px));
          }
          .landing-h1 {
            font-size: clamp(28px, 8vw, 42px);
          }
          .landing-sub {
            font-size: 14px;
            line-height: 1.45;
          }
          .landing-foot {
            font-size: 11px;
            padding: 10px 14px max(12px, calc(env(safe-area-inset-bottom, 0px) + 8px));
          }
        }
      `}</style>

      {/* Preloader */}
      <div className={`landing-boot ${bootDone ? 'done' : ''}`} id="boot">
        <div className="w-[min(200px,50vw)] h-[2px] bg-[var(--rule)] rounded-full overflow-hidden relative">
          <i
            ref={bootBarRef}
            className="absolute inset-0 block bg-[var(--fg)] scale-x-0 origin-left transition-transform duration-100 ease-linear"
          />
        </div>
        <p className="text-[11px] tracking-[0.08em] text-[var(--fg-faint)] font-medium uppercase">
          {bootPctText}
        </p>
      </div>

      {/* Fixed Background Video Layer */}
      <div className="landing-stage">
        <video
          ref={videoRef}
          id="clip"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />
        <div className="landing-veil" />
        <div className="landing-grain" />
      </div>

      {/* Scroll Meter */}
      <i ref={meterRef} className="landing-meter" id="meter" />

      {/* Four Cross-Fading Text Panels */}
      <main className="landing-panels">
        {/* Panel 1 (1st text change) */}
        <section ref={panel0Ref} className="landing-panel" data-panel id="lost">
          <p className="landing-eyebrow">Smart Matching &middot; Zero Friction</p>
          <h1 className="landing-h1">
            Upload a photo,<br />We sync the rest.
          </h1>
          <p className="landing-sub">
            Don&apos;t rely on handwritten registers or scattered WhatsApp groups. Our AI compares your missing item against everything found on campus in seconds.
          </p>
          <div className="landing-cta">
            <Link href="/lost" className="landing-btn-primary">
              Report a Lost item
            </Link>
          </div>
        </section>

        {/* Panel 2 (2nd text change) */}
        <section ref={panel1Ref} className="landing-panel" data-panel id="found">
          <p className="landing-eyebrow">Smart Matching &middot; Zero Friction</p>
          <h1 className="landing-h1">
            Found by chance,<br />Returning by choice.
          </h1>
          <p className="landing-sub">
            Found an item by chance that belongs to someone else and looking to return it. If you lost something recently, please reach out with a description so it can safely make its way back home.
          </p>
          <div className="landing-cta">
            <Link href="/found" className="landing-btn-primary">
              Report a Found item
            </Link>
          </div>
        </section>

        {/* Panel 3 (3rd text change) */}
        <section ref={panel2Ref} className="landing-panel" data-panel id="matches">
          <p className="landing-eyebrow">Smart Matching &middot; Zero Friction</p>
          <h1 className="landing-h1">
            The ultimate matchmaker<br />for missing things.
          </h1>
          <p className="landing-sub">
            A smart platform designed to instantly bridge the gap between missing items and honest finders. Simply post what you lost or discovered, and our system will seamlessly match them to bring your belongings home.
          </p>
          <div className="landing-cta">
            <Link href="/matches" className="landing-btn-primary">
              Matched Items
            </Link>
          </div>
        </section>

        {/* Panel 4 (4th text change) */}
        <section ref={panel3Ref} className="landing-panel" data-panel id="dashboard">
          <p className="landing-eyebrow">Smart Matching &middot; Zero Friction</p>
          <h1 className="landing-h1">
            Hold tight,<br />loading your main dashboard.
          </h1>
          <p className="landing-sub">
            Taking you straight to your personal control center to manage your items. You will be automatically redirected to your dashboard to view your latest matches and active posts in just a moment.
          </p>
          <div className="landing-cta">
            <Link href="/dashboard" className="landing-btn-primary">
              Here you go
            </Link>
          </div>
        </section>
      </main>

      {/* Fixed Footer */}
      <footer className={`landing-foot reveal ${revealed ? 'active' : ''}`}>
        Secure Campus Item Recovery &middot; AI Matching
      </footer>

      {/* Scroll Height Track */}
      <div className="landing-track" />


      {/* Item Report Modal */}
      <ItemReportModal
        isOpen={isReportOpen}
        initialType={reportType}
        onClose={() => setIsReportOpen(false)}
        onItemCreated={() => {
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
