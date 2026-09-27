'use client';

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Shield, Compass, Sparkles, Check } from 'lucide-react';
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
  height = '500px',
  zoom = 13,
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
  const [handshakeRequested, setHandshakeRequested] = useState(false);

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
          console.warn('Geolocation denied or unavailable:', err);
        }
      );
    }
  };

  // Modern dark mode map styles for Google Maps
  const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#38bdf8' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#94a3b8' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#0d1b2a' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#1e293b' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#0f172a' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#0284c7' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#030712' }],
    },
  ];

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 glass-panel shadow-2xl"
      style={{ height }}
    >
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
          <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span className="font-mono text-slate-300">
            {center.lat.toFixed(4)}° N, {Math.abs(center.lng).toFixed(4)}° W
          </span>
        </div>

        {selectable && (
          <button
            type="button"
            onClick={handleDeviceLocation}
            className="pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-lg"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Use Device GPS</span>
          </button>
        )}
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
            styles={darkMapStyles}
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
                  <div className="absolute w-8 h-8 rounded-full bg-sky-400/30 animate-ping" />
                  <div className="relative w-7 h-7 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center shadow-lg">
                    <MapPin className="w-4 h-4 text-slate-950" />
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
                      isFound ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      ) : (
        /* Interactive Built-in Dark Spatial Map (Ensures instant offline/zero-API-key functionality) */
        <div
          className="relative w-full h-full bg-[#070b14] overflow-hidden cursor-crosshair"
          onClick={(e) => {
            if (selectable) {
              const rect = e.currentTarget.getBoundingClientRect();
              const xPercent = (e.clientX - rect.left) / rect.width;
              const yPercent = (e.clientY - rect.top) / rect.height;
              // Map click coordinates relative to SF center
              const mappedLat = 37.7749 + (0.5 - yPercent) * 0.08;
              const mappedLng = -122.4194 + (xPercent - 0.5) * 0.08;
              const newCoords = { lat: mappedLat, lng: mappedLng };
              setSelectedPin(newCoords);
              if (onSelectCoordinates) {
                onSelectCoordinates(newCoords);
              }
            }
          }}
        >
          {/* Spatial Grid Lines and Topology contours */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* SVG Map Topology Simulation (San Francisco Bay contour) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 1000 600">
            <path
              d="M0,150 Q250,180 350,120 T600,200 T850,150 L1000,180 L1000,600 L0,600 Z"
              fill="#0d1829"
            />
            <path
              d="M200,50 L400,120 L350,300 L180,260 Z"
              fill="#0f1f38"
            />
            {/* Roads / transit corridors */}
            <path
              d="M100,500 L450,320 L750,220 L950,180"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M300,550 L520,280 L700,50"
              stroke="#38bdf8"
              strokeWidth="1.8"
              fill="none"
              opacity="0.4"
            />
          </svg>

          {/* API Key Guidance Ribbon if not entered */}
          <div className="absolute top-12 left-3 right-3 z-10 pointer-events-auto">
            <div className="glass-panel p-2.5 rounded-lg border border-sky-500/20 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-[11px]">
                  Interactive Spatial Vector Map active. To enable official Google Satellite layers, add{' '}
                  <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-sky-300">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  </code>{' '}
                  to your environment.
                </span>
              </div>
            </div>
          </div>

          {/* Render Items on simulated spatial plane */}
          {items.map((item) => {
            const isFound = item.type === 'found';
            // Project relative coordinates to map viewport
            const deltaLat = ((item.latitude || 37.7749) - 37.7749) * 12;
            const deltaLng = ((item.longitude || -122.4194) - -122.4194) * 12;
            const topPct = Math.max(15, Math.min(85, 50 - deltaLat * 100));
            const leftPct = Math.max(15, Math.min(85, 50 + deltaLng * 100));

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItem(item);
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
              >
                {/* Custom Animated Radar Marker */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`absolute w-9 h-9 rounded-full opacity-60 animate-ping ${
                      isFound ? 'bg-emerald-400/40' : 'bg-sky-400/40'
                    }`}
                  />
                  <div
                    className={`relative w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                      isFound ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-slate-950" />
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-950/90 border border-white/15 rounded-md text-[11px] whitespace-nowrap text-white pointer-events-none shadow-xl z-30">
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-slate-400 block text-[10px]">
                    {item.location_name || `${item.latitude?.toFixed(3)}, ${item.longitude?.toFixed(3)}`}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Selected Pin for Click Pin Drop */}
          {selectedPin && (
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                top: `${Math.max(15, Math.min(85, 50 - (selectedPin.lat - 37.7749) * 1200))}%`,
                left: `${Math.max(15, Math.min(85, 50 + (selectedPin.lng - -122.4194) * 1200))}%`,
              }}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full bg-cyan-400/30 animate-ping" />
                <div className="relative w-8 h-8 rounded-lg bg-cyan-400 border-2 border-white flex items-center justify-center shadow-2xl">
                  <MapPin className="w-4 h-4 text-slate-950" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Match or Active Item Privacy Protected Inspector Drawer */}
      {(selectedMatch || activeItem) && (
        <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-auto">
          <div className="glass-panel p-4 rounded-xl border border-white/15 shadow-2xl bg-slate-950/90 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Found Location Pin
                  </span>
                  {selectedMatch && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {selectedMatch.similarity_score}% Confidence Match
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white">
                  {selectedMatch?.found_item.title || activeItem?.title}
                </h4>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {selectedMatch?.found_item.location_name ||
                      activeItem?.location_name ||
                      'Market Street Subway Concourse, San Francisco'}
                  </span>
                </p>
              </div>

              {/* Privacy Shield & Safe Handshake Request */}
              <div className="flex flex-col sm:items-end space-y-1.5 w-full sm:w-auto">
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Finder Identity: Masked for Privacy</span>
                </div>

                {handshakeRequested ? (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Handshake Dispatched (Awaiting Confirmation)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHandshakeRequested(true)}
                    className="flex items-center justify-center space-x-2 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                  >
                    <span>Request Secure Connection</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
