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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4" />
            <span>Geospatial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Spatial Recovery Radar
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Exploration of active lost and discovered items plotted by spatial coordinates.
            Click any pin to inspect verified location records with privacy shielding.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center p-1 bg-slate-900/80 rounded-lg border border-white/10 self-start md:self-auto text-xs">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Coordinates ({itemsWithCoords.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('lost')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedType === 'lost'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lost Pins
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('found')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedType === 'found'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
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
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Discovered Pin
              <span className="w-2 h-2 rounded-full bg-sky-400 ml-2" /> Lost Report Pin
            </span>
            <span>Spatial Projection: WGS 84</span>
          </div>
        </div>

        {/* Right Column: Search & Pinned Locations Sidebar */}
        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4 flex flex-col h-[610px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
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
                className="w-full glass-input rounded-lg pl-9 pr-3 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Scrollable Items List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
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
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400/50'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                          isFound
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.latitude?.toFixed(3)}, {item.longitude?.toFixed(3)}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white tracking-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                    <div className="mt-2 flex items-center text-[10px] text-slate-500 gap-1">
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{item.location_name || 'San Francisco Hub'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No location pins match search filters.
              </div>
            )}
          </div>

          {/* Privacy Notice in Sidebar */}
          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-start space-x-2">
            <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Coordinate pins indicate public discovery areas. Private contact channels require bilateral connection consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
