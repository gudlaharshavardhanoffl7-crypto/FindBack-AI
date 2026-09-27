'use client';

import React from 'react';
import Link from 'next/link';
import { Radar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 glass-panel mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                <Radar className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                FIND BACK <span className="text-sky-400 font-mono text-xs">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Multimodal artificial intelligence system for physical property recovery.
              Indexing lost items with pgvector high-dimensional embeddings, reverse visual feature
              extraction, and spatial coordinate mapping.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production Vector Engine Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/lost" className="text-slate-400 hover:text-white transition-colors">
                  Lost Item Directory
                </Link>
              </li>
              <li>
                <Link href="/found" className="text-slate-400 hover:text-white transition-colors">
                  Found Item Registry
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-slate-400 hover:text-white transition-colors">
                  AI Similarity Matches
                </Link>
              </li>
              <li>
                <Link href="/maps" className="text-slate-400 hover:text-white transition-colors">
                  Geospatial Map View
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Governance & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Dual-blind Contact Obfuscation</span>
              </li>
              <li>
                <span className="text-slate-500">PGVector Cosine Search</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Find Back with AI. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
