'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Shield,
  Cpu,
  FileCheck2,
  Database,
} from 'lucide-react';
import { Item, ItemMatch } from '@/types';
import ItemCard from '@/components/items/ItemCard';
import MatchCard from '@/components/matches/MatchCard';
import ItemReportModal from '@/components/items/ItemReportModal';
import GoogleMapViewer from '@/components/maps/GoogleMapViewer';

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [activeMapMatch, setActiveMapMatch] = useState<ItemMatch | null>(null);

  const fetchData = async () => {
    try {
      const [itemsRes, matchesRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/matches'),
      ]);
      const itemsData = await itemsRes.json();
      const matchesData = await matchesRes.json();

      if (itemsData.success) setItems(itemsData.items);
      if (matchesData.success) setMatches(matchesData.matches);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="relative z-10 space-y-16 pb-20 bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-6">
          {/* Engineering Architecture Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 font-mono">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>PGVECTOR & GEMINI MULTIMODAL RECOVERY NETWORK</span>
          </div>

          {/* Clean Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Multimodal Lost and Found <br />
            <span className="text-slate-900">
              Recovery Dashboard
            </span>
          </h1>

          {/* Concrete, High-Information Subheadline */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Index physical lost items with 768-dimensional vector embeddings, reverse-image vision,
            and precise coordinate mapping. Connect discoverers with owners through automated
            similarity matching and dual-blind privacy controls.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setReportType('lost');
                setIsReportOpen(true);
              }}
              className="flex items-center space-x-2 px-5 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Report a Lost Item</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setReportType('found');
                setIsReportOpen(true);
              }}
              className="flex items-center space-x-2 px-5 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-white" />
              <span>Log a Discovered Item</span>
            </button>

            <Link
              href="/matches"
              className="flex items-center space-x-1.5 px-4 py-3 text-xs font-semibold text-slate-700 hover:text-black transition-colors"
            >
              <span>Explore AI Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Unified Search & Spatial Quick Filter */}
        <div className="mt-12 bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across indexed keys, spectacles, wallets, smartwatches, and electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                All Records
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lost')}
                className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'lost'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                Lost Items
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('found')}
                className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'found'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                Found Items
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured High-Confidence Match Section */}
      {matches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-black" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-slate-900 font-bold">
                Latest Multimodal Vector Match
              </h2>
            </div>
            <Link
              href="/matches"
              className="text-xs text-black hover:underline font-semibold"
            >
              View All {matches.length} Matches →
            </Link>
          </div>

          <MatchCard match={matches[0]} onOpenMap={(m) => setActiveMapMatch(m)} />
        </section>
      )}

      {/* System Technical Architecture Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Multimodal Feature Decomposition
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Images and descriptive text are analyzed via Gemini Vision to break down physical
              attributes into materials, engraved tags, wear indicators, and serial tokens.
            </p>
            <div className="pt-2 text-[10px] font-mono text-slate-800 font-semibold">
              Dimension: 768-D Float Vectors
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              PGVector Cosine Distance Index
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PostgreSQL with pgvector executes similarity queries using cosine distance
              operations. High-scoring pairs trigger automated notification alerts.
            </p>
            <div className="pt-2 text-[10px] font-mono text-slate-800 font-semibold">
              Search Index: HNSW Cosine Distance
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Dual-Blind Privacy Handshake
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Found item discovery coordinates are plotted on satellite maps without exposing
              personal telephone numbers or names until both individuals consent.
            </p>
            <div className="pt-2 text-[10px] font-mono text-slate-800 font-semibold">
              Protocol: Bilateral Consent Token
            </div>
          </div>
        </div>
      </section>

      {/* Active Indexed Catalog Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Active Property Database ({filteredItems.length})
            </h2>
            <p className="text-xs text-slate-600">
              Recently registered physical items across metropolitan discovery zones.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/lost"
              className="text-xs text-slate-700 hover:text-black px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-semibold"
            >
              Lost Directory
            </Link>
            <Link
              href="/found"
              className="text-xs text-slate-700 hover:text-black px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-semibold"
            >
              Found Registry
            </Link>
            <Link
              href="/maps"
              className="text-xs text-white bg-black hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-sm"
            >
              Full Map View
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-500">Querying indexed items...</span>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.slice(0, 6).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-600 shadow-sm">
            No matching items registered. Click &quot;Report a Lost Item&quot; to index a new item.
          </div>
        )}
      </section>

      {/* Match Map Modal */}
      {activeMapMatch && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveMapMatch(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-xl p-6 z-10 border border-slate-200 space-y-4 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-700 font-semibold">
                  Discovery Location Coordinates
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {activeMapMatch.found_item.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveMapMatch(null)}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <GoogleMapViewer selectedMatch={activeMapMatch} height="320px" zoom={14} />

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveMapMatch(null)}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-xs text-white font-semibold rounded-lg cursor-pointer"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Report Modal */}
      <ItemReportModal
        isOpen={isReportOpen}
        initialType={reportType}
        onClose={() => setIsReportOpen(false)}
        onItemCreated={() => {
          fetchData();
        }}
      />
    </div>
  );
}
