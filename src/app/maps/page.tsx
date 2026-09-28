'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Search, Shield } from 'lucide-react';
import { Item, ItemType } from '@/types';
import GoogleMapViewer from '@/components/maps/GoogleMapViewer';

export default function DedicatedMapsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
        }
      } catch (err) {
        console.error('Failed to load map items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const itemsWithCoords = items.filter((item) => item.latitude && item.longitude);

  const filteredItems = itemsWithCoords.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location_name && item.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6 text-[#0d0c0b]">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <div className="flex items-center space-x-2 text-slate-600 font-mono text-xs uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-slate-800" />
            <span>Google Maps Integrated Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0d0c0b] tracking-tight">
            Spatial Recovery Radar
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Real-time geospatial exploration of active lost and discovered items plotted by Google Maps coordinates.
            Click any pin to inspect verified location records with privacy shielding.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center p-1 bg-white rounded-full border border-black/10 self-start md:self-auto text-xs shadow-xs">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-[#0d0c0b] text-white shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            All Coordinates ({itemsWithCoords.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('lost')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
              selectedType === 'lost'
                ? 'bg-[#0d0c0b] text-white shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Lost Pins
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('found')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
              selectedType === 'found'
                ? 'bg-[#0d0c0b] text-white shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            Found Pins
          </button>
        </div>
      </div>

      {/* Map + Item Directory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Column: The Map Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <GoogleMapViewer
            items={filteredItems}
            focusedCoordinates={
              selectedItem && selectedItem.latitude && selectedItem.longitude
                ? { lat: selectedItem.latitude, lng: selectedItem.longitude }
                : null
            }
            height="580px"
            zoom={13}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Discovered Pin
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block ml-3" /> Lost Report Pin
            </span>
            <span>Spatial Projection: WGS 84 &middot; Google Maps Engine</span>
          </div>
        </div>

        {/* Right Column: Search & Pinned Locations Sidebar */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-sm space-y-4 flex flex-col h-[610px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                Indexed Locations ({filteredItems.length})
              </h3>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title or transit hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl pl-9 pr-3 py-2 text-xs bg-[#f4f2ee] border border-black/10 text-[#0d0c0b] placeholder:text-slate-400 focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Scrollable Items List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Loading coordinates...</span>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isFound = item.type === 'found';
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-black shadow-xs'
                        : 'bg-[#faf9f6] border-black/5 hover:border-black/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-semibold ${
                          isFound
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.latitude?.toFixed(3)}, {item.longitude?.toFixed(3)}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 tracking-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{item.description}</p>
                    <div className="mt-2 flex items-center text-[10px] text-slate-500 gap-1">
                      <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
                      <span className="truncate">{item.location_name || 'Campus Hub'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No location pins match search filters.
              </div>
            )}
          </div>

          {/* Privacy Notice in Sidebar */}
          <div className="pt-3 border-t border-black/5 text-[11px] text-slate-500 flex items-start space-x-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Coordinate pins indicate public discovery areas. Private contact channels require bilateral connection consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
