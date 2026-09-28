'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle, MessageSquare } from 'lucide-react';
import { Item } from '@/types';
import ItemCard from '@/components/items/ItemCard';
import ItemReportModal from '@/components/items/ItemReportModal';
import SendMessageModal from '@/components/items/SendMessageModal';
import GoogleMapViewer from '@/components/maps/GoogleMapViewer';

export default function LostLogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<Item | null>(null);
  const [messagingItem, setMessagingItem] = useState<Item | null>(null);

  const fetchLostItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/items?type=lost');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load lost items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location_name && item.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8 text-[#0d0c0b]">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <div className="flex items-center space-x-2 text-slate-600 font-mono text-xs uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>Active Lost Property Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0d0c0b] tracking-tight">
            Lost Item Registry
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Reported missing physical assets currently indexed in the pgvector database.
            The system continuously compares each item against newly discovered objects in seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium rounded-full text-xs transition-colors shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Lost Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by keyword, tag number, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full pl-10 pr-4 py-2.5 text-xs bg-white border border-black/10 text-[#0d0c0b] placeholder:text-slate-400 focus:outline-none focus:border-black shadow-xs"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-full px-4 py-2.5 text-xs bg-white border border-black/10 text-slate-800 shadow-xs focus:outline-none focus:border-black"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500">Loading lost property vectors...</span>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onInspect={(it) => setInspectedItem(it)}
              onMessage={(it) => setMessagingItem(it)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white text-center space-y-3 border border-black/10 shadow-xs">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No lost items match your current filter parameters. Try clearing the search query or report a new missing item.
          </p>
        </div>
      )}

      {/* Item Inspector Modal */}
      {inspectedItem && (
        <div className="fixed inset-0 z-[9994] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setInspectedItem(null)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 z-10 border border-black/10 space-y-4 shadow-2xl text-[#0d0c0b]">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                  Lost Item Dossier
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-1">{inspectedItem.title}</h3>
              </div>
              <button
                onClick={() => setInspectedItem(null)}
                className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-slate-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{inspectedItem.description}</p>

            {inspectedItem.latitude && inspectedItem.longitude && (
              <div className="space-y-1.5 pt-2 border-t border-black/10">
                <span className="text-[11px] font-mono text-slate-500">Last Reported Location (Google Maps):</span>
                <GoogleMapViewer
                  height="180px"
                  focusedCoordinates={{
                    lat: inspectedItem.latitude,
                    lng: inspectedItem.longitude,
                  }}
                  zoom={14}
                />
              </div>
            )}

            <div className="pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const target = inspectedItem;
                  setInspectedItem(null);
                  setMessagingItem(target);
                }}
                className="px-4 py-2 rounded-full bg-[#0d0c0b] hover:bg-[#242220] text-xs text-white font-medium flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Found this item? Send message to owner</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="px-4 py-2 rounded-full border border-black/10 hover:bg-slate-50 text-xs text-slate-700 font-medium cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message to Person Who Lost Item Modal */}
      <SendMessageModal
        isOpen={Boolean(messagingItem)}
        onClose={() => setMessagingItem(null)}
        item={messagingItem}
        role="found_others_lost"
      />

      {/* Report Modal */}
      <ItemReportModal
        isOpen={isReportOpen}
        initialType="lost"
        onClose={() => setIsReportOpen(false)}
        onItemCreated={() => {
          fetchLostItems();
        }}
      />
    </div>
  );
}
