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
    setAiStatus('Synthesizing Gemini vision features & 768-D vector...');

    try {
      let finalImageUrl = imagePreview || null;
      if (imageBase64 && isSupabaseConfigured && supabase) {
        try {
          const fileName = `item-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('item-images')
            .upload(fileName, blob, { contentType: 'image/jpeg' });

          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('item-images')
              .getPublicUrl(fileName);
            if (publicUrlData?.publicUrl) {
              finalImageUrl = publicUrlData.publicUrl;
            }
          }
        } catch (imgErr) {
          console.warn('Storage upload fallback:', imgErr);
        }
      }

      setAiStatus('Calculating pgvector cosine similarity...');

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type: itemType,
        category,
        image_url: finalImageUrl,
        location_name: locationName.trim() || 'Campus Center',
        latitude: coordinates?.lat || 37.7749,
        longitude: coordinates?.lng || -122.4194,
        reporter_email: contactEmail.trim() || null,
        reporter_phone: contactPhone.trim() || null,
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register item record.');
      }

      setResultItem(data.item);
      setDetectedMatches(data.matches || []);

      if (onItemCreated) {
        onItemCreated(data.item, data.matches || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing item submission.');
    } finally {
      setIsSubmitting(false);
      setAiStatus('');
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setDescription('');
    setLocationName('');
    setCoordinates(null);
    setImageBase64(null);
    setImagePreview(null);
    setResultItem(null);
    setDetectedMatches([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleResetAndClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-2xl bg-white text-[#0d0c0b] z-10 shadow-2xl border border-black/10 rounded-2xl p-6 sm:p-8 my-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-black/10 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                {itemType === 'lost' ? 'Report a Lost Item' : 'Register a Found Item'}
              </h3>
              <p className="text-xs text-slate-500">
                Indexed with 768-D Gemini multimodal embeddings and Google Maps coordinates
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-slate-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Item is successfully submitted, show summary & immediate matches */}
        {resultItem ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Item successfully indexed</p>
                <p className="text-xs text-slate-600">
                  Vector representation calculated and stored in Supabase pgvector catalog.
                </p>
              </div>
            </div>

            {/* Immediate Vector Matches Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                  Immediate Vector Matches ({detectedMatches.length})
                </h4>
              </div>

              {detectedMatches.length > 0 ? (
                <div className="space-y-3">
                  {detectedMatches.slice(0, 3).map((match) => (
                    <div
                      key={match.id}
                      className="p-3.5 rounded-xl bg-[#faf9f6] border border-black/10 flex items-center justify-between shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {match.found_item.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 text-slate-800">
                            {match.similarity_score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
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
                        className="px-3.5 py-1.5 rounded-full bg-[#0d0c0b] hover:bg-[#242220] text-white text-xs font-medium transition-colors shrink-0"
                      >
                        Inspect Match
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-black/5 text-center text-xs text-slate-500">
                  No immediate high-confidence matches found yet. Our background agent monitors all incoming items 24/7.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-full bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Report Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f4f2ee] rounded-full border border-black/10">
              <button
                type="button"
                onClick={() => setItemType('lost')}
                className={`py-2 px-3 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  itemType === 'lost'
                    ? 'bg-[#0d0c0b] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                I Lost This Item
              </button>
              <button
                type="button"
                onClick={() => setItemType('found')}
                className={`py-2 px-3 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  itemType === 'found'
                    ? 'bg-[#0d0c0b] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                I Discovered / Found This Item
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brass Ring with 3 Keys and Blue Tag"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f4f2ee] border border-black/10 rounded-full px-4 py-2.5 text-xs text-[#0d0c0b] placeholder-slate-400 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f4f2ee] border border-black/10 rounded-full px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-black"
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
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Visual Identification Details (Engravings, serial codes, marks, materials)
              </label>
              <textarea
                rows={3}
                placeholder="Include colors, distinct scratches, tags, room numbers, brand names, or attachments..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#f4f2ee] border border-black/10 rounded-2xl px-4 py-2.5 text-xs leading-relaxed text-[#0d0c0b] placeholder-slate-400 focus:outline-none focus:border-black"
                required
              />
            </div>

            {/* Photo / Image Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Item Photo (Processed by Gemini Multimodal Vision)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-black/20 rounded-2xl bg-[#faf9f6] hover:bg-slate-100 cursor-pointer transition-colors">
                  <Camera className="w-5 h-5 text-slate-700 mb-1" />
                  <span className="text-xs text-slate-800 font-medium">Upload photo or snapshot</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 shadow-xs">
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
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Geographic Coordinates & Location Pin with Google Maps */}
            <div className="space-y-2 pt-2 border-t border-black/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-800" />
                  <span>
                    {itemType === 'found'
                      ? 'Drop Pin Where Item Was Found'
                      : 'Approximate Lost Location'}
                  </span>
                </label>
                {coordinates && (
                  <span className="text-[11px] font-mono text-slate-600">
                    {coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Station name, campus intersection, or room (e.g. Science Library 2F)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-[#f4f2ee] border border-black/10 rounded-full px-4 py-2 text-xs mb-2 text-[#0d0c0b] placeholder-slate-400 focus:outline-none focus:border-black"
              />

              {/* Interactive Google Map */}
              <GoogleMapViewer
                selectable={true}
                height="190px"
                focusedCoordinates={coordinates}
                onSelectCoordinates={(coords) => {
                  setCoordinates({ lat: coords.lat, lng: coords.lng });
                  if (coords.locationName) setLocationName(coords.locationName);
                }}
              />
              <p className="text-[11px] text-slate-500">
                Click on the map surface or tap Use My GPS above to pinpoint exact Google Maps coordinates.
              </p>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#f4f2ee] border border-black/10 rounded-full px-4 py-2 text-xs text-[#0d0c0b] placeholder-slate-400 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#f4f2ee] border border-black/10 rounded-full px-4 py-2 text-xs text-[#0d0c0b] placeholder-slate-400 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium py-3 px-4 rounded-full transition-colors text-xs cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
