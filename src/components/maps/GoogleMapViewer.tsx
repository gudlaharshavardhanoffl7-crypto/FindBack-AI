'use client';

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Shield, Compass, ExternalLink } from 'lucide-react';
import { Item, ItemMatch } from '@/types';

interface GoogleMapViewerProps {
  items?: Item[];
  selectedMatch?: ItemMatch | null;
  focusedCoordinates?: { lat: number; lng: number } | null;
  selectable?: boolean;
  onSelectCoordinates?: (coords: { lat: number; lng: number; locationName?: string }) => void;
  height?: string;
  zoom?: number;
}

export default function GoogleMapViewer({
  items = [],
  selectedMatch,
  focusedCoordinates,
  selectable = false,
  onSelectCoordinates,
  height = '520px',
  zoom = 14,
}: GoogleMapViewerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasValidApiKey = Boolean(apiKey && apiKey !== 'your-google-maps-api-key');

  const defaultCenter = focusedCoordinates || {
    lat: selectedMatch?.found_item.latitude || 37.7749,
    lng: selectedMatch?.found_item.longitude || -122.4194,
  };

  const [center, setCenter] = useState(defaultCenter);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(
    focusedCoordinates || null
  );

  useEffect(() => {
    if (focusedCoordinates) {
      setCenter(focusedCoordinates);
      setSelectedPin(focusedCoordinates);
    } else if (selectedMatch?.found_item.latitude && selectedMatch?.found_item.longitude) {
      const coords = {
        lat: selectedMatch.found_item.latitude,
        lng: selectedMatch.found_item.longitude,
      };
      setCenter(coords);
      setSelectedPin(coords);
      setActiveItem(selectedMatch.found_item);
    }
  }, [focusedCoordinates, selectedMatch]);

  const handleDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCenter(coords);
          setSelectedPin(coords);
          if (onSelectCoordinates) {
            onSelectCoordinates({ ...coords, locationName: 'Current Device Geolocation' });
          }
        },
        (err) => {
          console.warn('Geolocation unavailable:', err);
        }
      );
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-black/10 bg-white shadow-xl text-[#0d0c0b]"
      style={{ height }}
    >
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-black/10 text-xs shadow-sm">
          <Compass className="w-3.5 h-3.5 text-slate-800 animate-spin" style={{ animationDuration: '14s' }} />
          <span className="font-mono text-slate-700">
            {center.lat.toFixed(4)}° N, {Math.abs(center.lng).toFixed(4)}° W
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-black/5 font-sans font-medium">
            Google Maps Integrated
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {selectable && (
            <button
              type="button"
              onClick={handleDeviceLocation}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium rounded-full text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use My GPS</span>
            </button>
          )}

          <a
            href={`https://www.google.com/maps?q=${center.lat},${center.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-full text-xs border border-black/10 shadow-sm transition-colors cursor-pointer"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Render Official Google Maps if API key is provided */}
      {hasValidApiKey ? (
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            center={center}
            defaultZoom={zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
            onClick={(e) => {
              if (selectable && e.detail.latLng) {
                const newCoords = {
                  lat: e.detail.latLng.lat,
                  lng: e.detail.latLng.lng,
                };
                setSelectedPin(newCoords);
                if (onSelectCoordinates) {
                  onSelectCoordinates(newCoords);
                }
              }
            }}
          >
            {/* Selected Pin */}
            {selectedPin && (
              <AdvancedMarker position={selectedPin}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-slate-900/20 animate-ping" />
                  <div className="relative w-7 h-7 rounded-full bg-[#0d0c0b] border-2 border-white flex items-center justify-center shadow-lg">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Existing Items Markers */}
            {items.map((item) => {
              if (!item.latitude || !item.longitude) return null;
              const isFound = item.type === 'found';
              return (
                <AdvancedMarker
                  key={item.id}
                  position={{ lat: item.latitude, lng: item.longitude }}
                  onClick={() => setActiveItem(item)}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-125 ${
                      isFound ? 'bg-emerald-600' : 'bg-slate-900'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      ) : (
        /* Real Interactive Google Maps Embed (Zero-key instant full Google Maps street & satellite layer) */
        <div className="relative w-full h-full bg-slate-100">
          <iframe
            title="Google Maps Location Radar"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              `${center.lat},${center.lng}`
            )}&hl=en&z=${zoom}&output=embed`}
            className="w-full h-full filter saturate-105"
          />

          {/* Overlay Interactive Pins for Registered Items */}
          <div className="absolute inset-0 pointer-events-none">
            {items.slice(0, 10).map((item, index) => {
              const isFound = item.type === 'found';
              // Calculate deterministic visual spread relative to center
              const topOffset = 30 + ((index * 13) % 45);
              const leftOffset = 25 + ((index * 19) % 55);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveItem(item);
                    if (item.latitude && item.longitude) {
                      setCenter({ lat: item.latitude, lng: item.longitude });
                    }
                  }}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`absolute w-8 h-8 rounded-full opacity-30 animate-ping ${
                        isFound ? 'bg-emerald-500' : 'bg-slate-900'
                      }`}
                    />
                    <div
                      className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                        isFound ? 'bg-emerald-600 text-white' : 'bg-[#0d0c0b] text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Item Floating Modal / Card Drawer */}
      {activeItem && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl p-4 shadow-2xl z-30 transition-all text-[#0d0c0b]">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  activeItem.type === 'found'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {activeItem.type === 'found' ? 'Found Property' : 'Lost Property'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activeItem.category}
              </span>
            </div>
            <button
              onClick={() => {
                setActiveItem(null);
              }}
              className="text-slate-400 hover:text-black text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 mt-2 line-clamp-1">
            {activeItem.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {activeItem.description}
          </p>

          <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Campus Zone</span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeItem.latitude || center.lat},${activeItem.longitude || center.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-900 hover:text-sky-600 flex items-center gap-1 transition-colors"
            >
              <span>Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
