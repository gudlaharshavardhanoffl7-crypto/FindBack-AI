'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onInspect?: (item: Item) => void;
}

export default function ItemCard({ item, onInspect }: ItemCardProps) {
  const isFound = item.type === 'found';
  const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl p-4 sm:p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
      onClick={() => onInspect && onInspect(item)}
    >
      {/* Top Tag Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                isFound
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isFound ? 'Discovered Item' : 'Lost Item'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
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
          <div className="w-full h-36 mb-3 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-black transition-colors mb-1.5">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {item.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-slate-500 truncate max-w-[190px]">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">
            {item.location_name || 'Campus Grounds'}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onInspect) onInspect(item);
          }}
          className="flex items-center space-x-1 text-[11px] font-semibold text-black hover:underline"
        >
          <span>Inspect</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
