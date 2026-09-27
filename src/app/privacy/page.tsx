import React from 'react';
import { Shield, Lock, EyeOff, MapPin, Database } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Find Back with AI',
  description: 'Data protection standards, vector privacy, coordinate masking, and identity protection protocols.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-white/10 space-y-8 shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>Compliance & Data Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Effective Date: September 27, 2026. Last audited for pgvector and multimodal standards.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>1. Core Architectural Privacy Commitments</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Find Back with AI is engineered with dual-blind zero-exposure principles.
            Our indexing algorithms compare physical object attributes mathematically without exposing
            the personal identities, phone numbers, or residential addresses of users to public queries.
          </p>
        </section>

        {/* Section 2: Multimodal Vectors */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>2. Vector Embeddings and Image Data</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you submit a lost or found report with an accompanying photograph, our vision subsystem
            processes the image to extract non-sensitive physical traits (material composition, color values,
            distinctive wear, model numbers). These traits are compiled into a 768-dimensional mathematical vector
            stored in our pgvector database.
          </p>
          <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside pl-2">
            <li>EXIF geographical metadata from uploaded images is automatically sanitized prior to processing.</li>
            <li>Raw uploaded imagery is stored in encrypted object storage accessible strictly through signed tokens.</li>
            <li>Embeddings are strictly one-way mathematical projections used solely for cosine similarity ranking.</li>
          </ul>
        </section>

        {/* Section 3: Geolocation */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>3. Geospatial Pin Accuracy and Masking</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Latitude and longitude coordinates submitted during a found report denote the public site of item discovery.
            Coordinates do not track real-time user device locations. Location points displayed on the maps interface
            reflect static discovery points (such as transit hubs, public benches, or facility desks).
          </p>
        </section>

        {/* Section 4: Dual Blind Handshake */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-sky-400" />
            <span>4. Mutual Consent Handshake Protocol</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            When the matching engine flags a potential match between a lost report and a found report:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-xs font-semibold text-white block mb-1">Anonymized Stage</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Both individuals see only visual descriptions, confidence scores, and discovery map pins.
                Direct phone numbers and email contacts remain hidden.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-xs font-semibold text-white block mb-1">Mutual Consent Stage</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct communication channels are revealed only after both parties explicitly approve
                the cryptographic connection handshake in the platform.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Data Retention */}
        <section className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-base font-semibold text-white">5. Data Retention and Erasure</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Users may mark any report as resolved or delete the listing entirely at any moment.
            Upon deletion, the database record, associated spatial coordinates, and vector embedding
            are purged from active index tables within 24 hours.
          </p>
        </section>
      </div>
    </div>
  );
}
