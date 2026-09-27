'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  MapPin,
  Sparkles,
  Camera,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Item, ItemType, ItemMatch } from '@/types';
import GoogleMapViewer from '@/components/maps/GoogleMapViewer';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ItemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ItemType;
  onItemCreated?: (item: Item, matches?: ItemMatch[]) => void;
}

const CATEGORIES = [
  'Keys',
  'Eyewear',
  'Wallets',
  'Electronics',
  'Smartwatches',
  'Bags & Backpacks',
  'Jewelry',
  'Documents & IDs',
  'Other',
];

export default function ItemReportModal({
  isOpen,
  onClose,
  initialType = 'lost',
  onItemCreated,
}: ItemReportModalProps) {
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [resultItem, setResultItem] = useState<Item | null>(null);
  const [detectedMatches, setDetectedMatches] = useState<ItemMatch[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please specify both an item title and an identification description.');
      return;
    }

    setIsSubmitting(true);
    setAiStatus('Extracting visual features with Gemini Vision AI...');

    try {
      let currentUserId: string | undefined = undefined;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            currentUserId = user.id;
          }
        } catch {
          // ignore auth check error
        }
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: itemType,
          title,
          category,
          description,
          imageBase64,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          location_name: locationName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          user_id: currentUserId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setResultItem(data.item);
      setDetectedMatches(data.immediateMatches || []);
      if (onItemCreated) {
        onItemCreated(data.item, data.immediateMatches);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving item.');
    } finally {
      setIsSubmitting(false);
      setAiStatus('');
    }
  };

  const handleResetAndClose = () => {
    setResultItem(null);
    setDetectedMatches([]);
    setTitle('');
    setDescription('');
    setImageBase64(null);
    setImagePreview(null);
    setCoordinates(null);
    setLocationName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9992] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl glass-panel rounded-xl p-6 sm:p-8 text-slate-100 z-10 my-auto shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {resultItem
                  ? 'Item Indexed in Vector Database'
                  : itemType === 'lost'
                  ? 'Report a Lost Physical Item'
                  : 'Log a Discovered / Found Item'}
              </h3>
              <p className="text-xs text-slate-400">
                Indexed with 768-D Gemini multimodal embeddings and geospatial coordinates
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Item is successfully submitted, show summary & immediate matches */}
        {resultItem ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Item successfully indexed</p>
                <p className="text-xs text-slate-300">
                  Vector representation calculated and stored in Supabase pgvector catalog.
                </p>
              </div>
            </div>

            {/* Immediate Vector Matches Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Immediate Vector Matches ({detectedMatches.length})
                </h4>
              </div>

              {detectedMatches.length > 0 ? (
                <div className="space-y-3">
                  {detectedMatches.slice(0, 3).map((match) => (
                    <div
                      key={match.id}
                      className="p-3.5 rounded-lg glass-card border border-white/10 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white">
                            {match.found_item.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {match.similarity_score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {match.found_item.description}
                        </p>
                        {match.geo_distance_km !== undefined && (
                          <span className="text-[11px] text-slate-500">
                            Distance: {match.geo_distance_km.toFixed(1)} km away
                          </span>
                        )}
                      </div>

                      <a
                        href="/matches"
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors shrink-0"
                      >
                        Inspect Match
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400">
                  No immediate high-confidence matches found yet. Our background agent monitors all incoming items 24/7.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Report Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setItemType('lost')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all ${
                  itemType === 'lost'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                I Lost This Item
              </button>
              <button
                type="button"
                onClick={() => setItemType('found')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all ${
                  itemType === 'found'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                I Discovered / Found This Item
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brass Ring with 3 Keys and Blue Tag"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input rounded-lg px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs bg-slate-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Identification Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Visual Identification Details (Engravings, serial codes, marks, materials)
              </label>
              <textarea
                rows={3}
                placeholder="Include colors, distinct scratches, tags, room numbers, brand names, or attachments..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input rounded-lg px-3.5 py-2 text-xs leading-relaxed"
                required
              />
            </div>

            {/* Photo / Image Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Item Photo (Processed by Gemini Multimodal Vision)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <Camera className="w-5 h-5 text-sky-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Upload photo or snapshot</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageBase64(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-white hover:bg-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Geographic Coordinates & Location Pin (Especially for Found Items) */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {itemType === 'found'
                      ? 'Drop Pin Where Item Was Found'
                      : 'Approximate Lost Location'}
                  </span>
                </label>
                {coordinates && (
                  <span className="text-[11px] font-mono text-sky-400">
                    {coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Station name, park intersection, or room (e.g. Market St Station)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full glass-input rounded-lg px-3.5 py-1.5 text-xs mb-2"
              />

              {/* Interactive Mini Map */}
              <GoogleMapViewer
                selectable={true}
                height="180px"
                focusedCoordinates={coordinates}
                onSelectCoordinates={(coords) => {
                  setCoordinates({ lat: coords.lat, lng: coords.lng });
                  if (coords.locationName) setLocationName(coords.locationName);
                }}
              />
              <p className="text-[11px] text-slate-500">
                Click on the map surface or tap Use Device GPS above to pinpoint exact coordinates.
              </p>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold py-2.5 px-4 rounded-lg transition-colors text-xs"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>{aiStatus || 'Indexing with AI...'}</span>
                  </div>
                ) : (
                  <>
                    <span>Submit & Run AI Similarity Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
