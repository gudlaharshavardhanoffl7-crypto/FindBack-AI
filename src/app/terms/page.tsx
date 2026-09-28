import React from 'react';
import { Scale, CheckCircle2, ShieldAlert, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions | Find Back with AI',
  description: 'Terms of service, user obligations, property restitution guidelines, and platform liability terms.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-[#0d0c0b]">
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-black/10 space-y-8 shadow-sm">
        {/* Header */}
        <div className="border-b border-black/10 pb-6">
          <div className="flex items-center space-x-2 text-slate-600 font-mono text-xs uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4 text-slate-800" />
            <span>Legal Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Terms and Conditions of Service
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last Updated: September 2026. Standard governing physical property recovery network operations.
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-800" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            By accessing or reporting items via Find Back with AI, you agree to comply with and be bound by
            these Terms and Conditions. If you do not accept these terms in their entirety, you must refrain
            from submitting recovery reports or initiating connection requests.
          </p>
        </section>

        {/* Section 2: Truthfulness */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>2. Truthful and Accurate Item Reporting</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Users must submit truthful, verified physical characteristics when reporting lost or discovered items.
            The submission of fraudulent claims, spoofed GPS coordinates, non-existent objects, or counterfeit serial
            numbers is strictly prohibited and constitutes an immediate violation of platform integrity.
          </p>
        </section>

        {/* Section 3: Physical Safety */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>3. Physical Exchange and Safe Handover Rules</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Find Back with AI provides vector matching intelligence and does not directly store physical property.
            When coordinating the return of identified items, users must adhere to strict safety practices:
          </p>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside pl-2">
            <li>Conduct physical handovers only in well-lit, public facilities (campus security desks, library reception, verified lockers).</li>
            <li>Do not agree to meet in isolated locations or private residential addresses.</li>
            <li>Verify item ownership through proof of purchase, serial validation, or device unlock passwords before surrender.</li>
          </ul>
        </section>

        {/* Section 4: Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-800" />
            <span>4. Limitation of Liability</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Find Back with AI serves as an algorithmic facilitator. The platform does not guarantee the recovery,
            custody, physical condition, or legitimate title of any reported property. Under no circumstances
            shall the operators be liable for lost property value, damaged goods, or disputes between parties.
          </p>
        </section>

        {/* Section 5: Modification */}
        <section className="space-y-3 border-t border-black/10 pt-6">
          <h2 className="text-base font-semibold text-slate-900">5. Revisions and Inquiries</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We reserve the right to amend these guidelines to maintain compliance with jurisdictional lost property
            ordinances and vector database privacy protocols. Notice of significant revisions will be indicated
            by updating the date at the top of this document.
          </p>
        </section>
      </div>
    </div>
  );
}
