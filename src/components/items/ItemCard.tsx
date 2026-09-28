'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onInspect?: (item: Item) => void;
  onMessage?: (item: Item) => void;
}

export default function ItemCard({ item, onInspect, onMessage }: ItemCardProps) {
  const isFound = item.type === 'found';
  const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-black/10 shadow-xs hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden text-[#0d0c0b]"
      onClick={() => onInspect && onInspect(item)}
    >
      {/* Top Tag Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                isFound
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              {isFound ? 'Discovered Item' : 'Lost Item'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-600 bg-slate-50 border border-black/5">
              {item.category}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Thumbnail preview if available */}
        {item.image_url && (
          <div className="w-full h-40 mb-3 rounded-xl overflow-hidden border border-black/10 relative bg-slate-100">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-black transition-colors mb-1.5 line-clamp-1">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {item.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1 text-slate-500 truncate max-w-[130px] sm:max-w-[150px]">
          <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
          <span className="truncate text-[11px]">
            {item.location_name || 'Campus Zone'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {onMessage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMessage(item);
              }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#0d0c0b] hover:bg-[#27272a] text-white text-[11px] font-medium shadow-xs transition-transform active:scale-95 cursor-pointer"
              title={isFound ? 'Send message to finder' : 'Found this item? Send message to owner'}
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>{isFound ? 'Claim' : 'I Found This'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onInspect) onInspect(item);
            }}
            className="p-1 text-slate-500 hover:text-black hover:bg-black/5 rounded-full transition-colors"
            title="Inspect full dossier"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
