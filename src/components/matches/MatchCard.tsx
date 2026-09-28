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
      className="bg-white rounded-2xl p-5 sm:p-6 border border-black/10 hover:border-black/20 transition-all space-y-5 shadow-xs hover:shadow-md text-[#0d0c0b]"
    >
      {/* Header Match Confidence Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0d0c0b] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Vector Similarity Match
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-900 border border-slate-200">
                {similarity_score}% AI Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Distance Indicator */}
        {geo_distance_km !== undefined && (
          <div className="flex items-center space-x-1 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            <MapPin className="w-3.5 h-3.5" />
            <span>Found {geo_distance_km.toFixed(1)} km from reported location</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Lost Item */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
              Lost Record
            </span>
            <span className="text-[10px] font-mono text-slate-500">{lost_item.category}</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{lost_item.title}</h4>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {lost_item.description}
          </p>

          <div className="pt-2 flex items-center text-[11px] text-slate-500 gap-1.5">
            <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
            <span className="truncate">{lost_item.location_name || 'Campus Zone'}</span>
          </div>
        </div>

        {/* Right: Found Item */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/10 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Discovered Match
            </span>
            <div className="flex items-center space-x-1 text-[10px] text-slate-500">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Finder #F-{found_item.id.slice(-4)}</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{found_item.title}</h4>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {found_item.description}
          </p>

          <div className="pt-2 flex items-center text-[11px] text-slate-500 gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{found_item.location_name || 'Campus Desk'}</span>
          </div>
        </div>
      </div>

      {/* AI Reasoning Anchors */}
      {match_reasons && match_reasons.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
          <div className="text-[11px] font-mono text-slate-800 font-semibold mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Multimodal Vector Correlation Anchors</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {match_reasons.map((reason, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[10px] bg-white text-slate-700 border border-black/10 shadow-xs"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Controls: Inspect on Custom Google Map */}
      <div className="pt-3 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Privacy active: Personal contact info revealed only upon mutual connection agreement</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenMap(match)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium rounded-full text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>View on Map & Initiate Connection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
