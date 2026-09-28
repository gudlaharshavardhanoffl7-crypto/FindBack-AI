'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Search,
  Shield,
  Navigation,
  Footprints,
  Car,
  Bus,
  ExternalLink,
  X,
  ArrowRight,
} from 'lucide-react';
import { Item, ItemType } from '@/types';
import GoogleMapViewer from '@/components/maps/GoogleMapViewer';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

function calculateTravelTimes(km: number) {
  // Average speeds: walking ~4.8 km/h, driving ~35 km/h, transit ~22 km/h
  const walkingMinutes = Math.max(1, Math.round((km / 4.8) * 60));
  const drivingMinutes = Math.max(1, Math.round((km / 35) * 60));
  const transitMinutes = Math.max(1, Math.round((km / 22) * 60));

  const formatMin = (m: number) => {
    if (m >= 60) {
      const hrs = Math.floor(m / 60);
      const mins = m % 60;
      return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
    }
    return `${m} min`;
  };

  return {
    walking: formatMin(walkingMinutes),
    driving: formatMin(drivingMinutes),
    transit: formatMin(transitMinutes),
  };
}

export default function DedicatedMapsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // User GPS Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [travelMode, setTravelMode] = useState<'walking' | 'driving' | 'transit'>('walking');

  // Request browser GPS position
  const requestLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation access issue:', err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-attempt geolocation on load
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Graceful fallback if prompt dismissed
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    }
  }, []);

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

  // Calculate distance & travel times for the selected item
  const selectedItemDistanceKm =
    userLocation && selectedItem?.latitude && selectedItem?.longitude
      ? calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          selectedItem.latitude,
          selectedItem.longitude
        )
      : null;

  const travelEstimates =
    selectedItemDistanceKm !== null ? calculateTravelTimes(selectedItemDistanceKm) : null;

  const navigationUrl =
    userLocation && selectedItem?.latitude && selectedItem?.longitude
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedItem.latitude},${selectedItem.longitude}&travelmode=${travelMode}`
      : selectedItem?.latitude && selectedItem?.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${selectedItem.latitude},${selectedItem.longitude}`
      : '#';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6 text-[#0d0c0b]">
      {/* Header and GPS Controls */}
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
            Real-time geospatial radar showing active lost and found items. Access your device GPS to get instant distance calculations and step-by-step travel routes directly to recovered objects.
          </p>
        </div>

        {/* GPS Status & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* GPS Detector Button */}
          {userLocation ? (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-mono font-medium">
                GPS Active ({userLocation.lat.toFixed(3)}°, {userLocation.lng.toFixed(3)}°)
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={requestLocation}
              disabled={isLocating}
              className="flex items-center space-x-2 px-4 py-1.5 bg-[#0d0c0b] hover:bg-[#242220] text-white rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span>{isLocating ? 'Connecting GPS...' : 'Enable My GPS'}</span>
            </button>
          )}

          {/* Filter Switcher */}
          <div className="flex items-center p-1 bg-white rounded-full border border-black/10 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#0d0c0b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              All ({itemsWithCoords.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
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
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                selectedType === 'found'
                  ? 'bg-[#0d0c0b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Found Pins
            </button>
          </div>
        </div>
      </div>

      {/* Live Route & Travel Mode Direction Card when an item is selected */}
      {selectedItem && (
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div className="flex items-center space-x-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase font-semibold ${
                  selectedItem.type === 'found'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {selectedItem.type === 'found' ? 'Found Item Destination' : 'Lost Item Area'}
              </span>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                {selectedItem.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-black self-end sm:self-auto p-1 text-xs flex items-center gap-1 font-medium cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Deselect Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* From & To Route Details */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">From:</span>
                <span className="truncate">
                  {userLocation ? 'Your Current GPS Location' : 'Location Not Connected'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    selectedItem.type === 'found' ? 'bg-emerald-600' : 'bg-slate-900'
                  }`}
                />
                <span className="font-semibold text-slate-800">To:</span>
                <span className="truncate">{selectedItem.location_name || 'Designated Campus Area'}</span>
              </div>
              {selectedItemDistanceKm !== null && (
                <div className="text-xs font-mono text-slate-700 bg-[#f4f2ee] px-3 py-1.5 rounded-lg inline-block">
                  Distance: <span className="font-bold text-[#0d0c0b]">{formatDistance(selectedItemDistanceKm)}</span>
                </div>
              )}
            </div>

            {/* Travel Mode Options */}
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 mb-1.5">Travel Mode & Estimate</div>
              {travelEstimates ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTravelMode('walking')}
                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      travelMode === 'walking'
                        ? 'bg-[#0d0c0b] text-white border-black shadow-xs font-semibold'
                        : 'bg-[#faf9f6] text-slate-700 border-black/10 hover:border-black/30'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[10px]">Walk</span>
                    <span className="text-[11px] font-bold">{travelEstimates.walking}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelMode('driving')}
                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      travelMode === 'driving'
                        ? 'bg-[#0d0c0b] text-white border-black shadow-xs font-semibold'
                        : 'bg-[#faf9f6] text-slate-700 border-black/10 hover:border-black/30'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[10px]">Drive</span>
                    <span className="text-[11px] font-bold">{travelEstimates.driving}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelMode('transit')}
                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      travelMode === 'transit'
                        ? 'bg-[#0d0c0b] text-white border-black shadow-xs font-semibold'
                        : 'bg-[#faf9f6] text-slate-700 border-black/10 hover:border-black/30'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[10px]">Transit</span>
                    <span className="text-[11px] font-bold">{travelEstimates.transit}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="w-full py-2.5 px-3 bg-[#faf9f6] border border-dashed border-black/20 hover:border-black/40 rounded-xl text-xs text-slate-700 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  <span>Click to enable GPS & calculate travel time</span>
                </button>
              )}
            </div>

            {/* Launch Turn-by-Turn Navigation */}
            <div className="flex flex-col items-stretch sm:items-end justify-center">
              <a
                href={navigationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium rounded-full text-xs shadow-md transition-all cursor-pointer active:scale-95 text-center"
              >
                <span>Start Google Maps Navigation</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
              <span className="text-[10px] text-slate-500 mt-1.5 text-center sm:text-right">
                Opens official turn-by-turn directions in Google Maps app
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map + Item Directory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Column: The Map Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <GoogleMapViewer
            items={filteredItems}
            userLocation={userLocation}
            destinationLocation={
              selectedItem && selectedItem.latitude && selectedItem.longitude
                ? { lat: selectedItem.latitude, lng: selectedItem.longitude }
                : null
            }
            travelMode={travelMode}
            activeItem={selectedItem}
            onSelectItem={(item) => setSelectedItem(item)}
            height="580px"
            zoom={13}
          />
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1 font-mono gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Discovered Pin
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block ml-3" /> Lost Report Pin
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block ml-3" /> Your GPS Location
            </span>
            <span>Spatial Engine: Google Maps Live WGS 84 &middot; No Extra Setup Required</span>
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
                const distanceKm =
                  userLocation && item.latitude && item.longitude
                    ? calculateDistanceKm(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
                    : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-black shadow-xs ring-1 ring-black'
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
                      {distanceKm !== null ? (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {formatDistance(distanceKm)} away
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.latitude?.toFixed(3)}, {item.longitude?.toFixed(3)}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 tracking-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 truncate max-w-[170px]">
                        <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
                        <span className="truncate">{item.location_name || 'Campus Hub'}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-900 flex items-center gap-1 group-hover:underline">
                        <span>Route</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
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
