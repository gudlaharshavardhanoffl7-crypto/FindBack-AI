'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Shield,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { ItemMatch } from '@/types';

interface MatchCardProps {
  match: ItemMatch;
  onOpenMap: (match: ItemMatch) => void;
}

export default function MatchCard({ match, onOpenMap }: MatchCardProps) {
  const { lost_item, found_item, similarity_score, match_reasons, geo_distance_km } = match;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-panel rounded-xl p-5 sm:p-6 border border-white/10 hover:border-sky-500/30 transition-all space-y-5 shadow-xl"
    >
      {/* Header Match Confidence Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Vector Similarity Match
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {similarity_score}% AI Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Distance Indicator */}
        {geo_distance_km !== undefined && (
          <div className="flex items-center space-x-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 self-start sm:self-auto">
            <MapPin className="w-3.5 h-3.5" />
            <span>Found {geo_distance_km.toFixed(1)} km from reported location</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Lost Item */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/15 text-rose-300 border border-rose-500/20 font-semibold">
              Lost Record
            </span>
            <span className="text-[10px] font-mono text-slate-400">{lost_item.category}</span>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-tight">{lost_item.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {lost_item.description}
          </p>

          <div className="pt-2 flex items-center text-[11px] text-slate-500 gap-1.5">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span className="truncate">{lost_item.location_name || 'San Francisco'}</span>
          </div>
        </div>

        {/* Right: Found Item */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-sky-500/20 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold">
              Discovered Match
            </span>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400">
              <Shield className="w-3 h-3 text-sky-400" />
              <span>Finder #F-{found_item.id.slice(-4)}</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-tight">{found_item.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {found_item.description}
          </p>

          <div className="pt-2 flex items-center text-[11px] text-slate-500 gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{found_item.location_name || 'Downtown SF Station'}</span>
          </div>
        </div>
      </div>

      {/* AI Reasoning Anchors */}
      {match_reasons && match_reasons.length > 0 && (
        <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/15">
          <div className="text-[11px] font-mono text-sky-400 font-semibold mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Multimodal Vector Correlation Anchors</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {match_reasons.map((reason, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-slate-300 border border-sky-500/20"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Controls: Inspect on Custom Google Map */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span>Privacy active: Personal contact info revealed only upon mutual connection agreement</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenMap(match)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-lg"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>View on Map & Initiate Connection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
