'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, ArrowRight, Check, X, MapPin } from 'lucide-react';
import { ItemMatch } from '@/types';
import MatchCard from '@/components/matches/MatchCard';
import GoogleMapViewer from '@/components/maps/GoogleMapViewer';

export default function MatchesPage() {
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalMatch, setActiveModalMatch] = useState<ItemMatch | null>(null);
  const [handshakeSent, setHandshakeSent] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8 text-[#0d0c0b]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <div className="flex items-center space-x-2 text-slate-600 font-mono text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Autonomous Similarity Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0d0c0b] tracking-tight">
            Vector Similarity Matches
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Correlated pairings produced by vector cosine distance operations and reverse visual analysis.
            Review matches below and inspect verified discovery locations on Google Maps.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-700 bg-white border border-black/10 px-3.5 py-2 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Matches: {matches.length}</span>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500">Executing cosine distance operations...</span>
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onOpenMap={(m) => {
                setActiveModalMatch(m);
                setHandshakeSent(false);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white text-center space-y-3 border border-black/10 shadow-xs">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No active matches found yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When newly reported items pass cosine similarity thresholds against opposing records,
            they will automatically be ranked and presented here.
          </p>
        </div>
      )}

      {/* Dedicated Map & Handshake Modal */}
      {activeModalMatch && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setActiveModalMatch(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl bg-white rounded-2xl p-6 sm:p-7 z-10 border border-black/10 space-y-5 shadow-2xl my-auto text-[#0d0c0b]">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-black/10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Found Item Coordinates
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-200">
                    {activeModalMatch.similarity_score}% Confidence
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-1">
                  Location Verification: {activeModalMatch.found_item.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalMatch(null)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-slate-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Google Map Component */}
            <div className="space-y-2">
              <GoogleMapViewer
                selectedMatch={activeModalMatch}
                height="320px"
                zoom={14}
              />
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Centered on discovery site:{' '}
                  {activeModalMatch.found_item.location_name ||
                    `${activeModalMatch.found_item.latitude?.toFixed(4)}, ${activeModalMatch.found_item.longitude?.toFixed(4)}`}
                </span>
              </p>
            </div>

            {/* Privacy Protection Callout */}
            <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Dual-Blind Privacy Protection Active</span>
                </div>
                <p className="text-[11px] text-slate-600 max-w-md leading-relaxed">
                  The finder identity is kept private to prevent unsolicited contact or scams.
                  Transmitting a connection handshake requests the finder to approve contact sharing.
                </p>
              </div>

              {handshakeSent ? (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shrink-0">
                  <Check className="w-4 h-4" />
                  <span>Connection Request Sent</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setHandshakeSent(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-[#0d0c0b] hover:bg-[#242220] text-white font-medium rounded-full text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  <span>Request Connection Handshake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setActiveModalMatch(null)}
                className="px-5 py-2 rounded-full bg-white hover:bg-slate-100 text-xs text-slate-800 border border-black/10 font-medium transition-colors cursor-pointer"
              >
                Close Map View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
