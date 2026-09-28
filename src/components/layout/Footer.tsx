'use client';

import React from 'react';
import Link from 'next/link';
import { Radar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white/90 backdrop-blur-md mt-auto relative z-10 text-[#0d0c0b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0d0c0b] text-white flex items-center justify-center shadow-xs">
                <Radar className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#0d0c0b]">
                FIND BACK <span className="text-sky-600 font-mono text-xs">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Multimodal artificial intelligence system for physical property recovery.
              Indexing lost items with pgvector high-dimensional embeddings, reverse visual feature
              extraction, and spatial coordinate mapping.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Vector Engine Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-600 hover:text-black transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/lost" className="text-slate-600 hover:text-black transition-colors">
                  Lost Item Directory
                </Link>
              </li>
              <li>
                <Link href="/found" className="text-slate-600 hover:text-black transition-colors">
                  Found Item Registry
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-slate-600 hover:text-black transition-colors">
                  AI Similarity Matches
                </Link>
              </li>
              <li>
                <Link href="/maps" className="text-slate-600 hover:text-black transition-colors">
                  Geospatial Map View
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Governance & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-black transition-colors">
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
        <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Find Back with AI. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
