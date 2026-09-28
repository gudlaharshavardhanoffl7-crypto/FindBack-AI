'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  X,
  User,
  Mail,
  ShieldCheck,
  CheckCircle,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { Item } from '@/types';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  role: 'found_others_lost' | 'found_my_item';
  onMessageSent?: () => void;
}

export default function SendMessageModal({
  isOpen,
  onClose,
  item,
  role,
  onMessageSent,
}: SendMessageModalProps) {
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !item) return null;

  const isLostItem = role === 'found_others_lost';
  const modalTitle = isLostItem
    ? 'Send Message to Person Who Lost This'
    : 'Send Message to Person Who Found This';

  const modalSubtitle = isLostItem
    ? 'Let the owner know you discovered their missing item and coordinate safe handover.'
    : 'Provide proof of ownership or identifying details to verify and arrange retrieval.';

  const messagePlaceholder = isLostItem
    ? 'Hi, I found your item near [Location]. It is safely stored and intact. Please reply with details so we can arrange a return...'
    : 'Hi, this item belongs to me. It has [identifying marks / serial code / unique feature] that confirms my ownership. How can we meet?';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!senderName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!senderContact.trim()) {
      setErrorMsg('Please enter your contact email or phone number.');
      return;
    }

    if (!message.trim() || message.trim().length < 8) {
      setErrorMsg('Please write a detailed message (at least 8 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          item_title: item.title,
          item_type: item.type,
          sender_name: senderName.trim(),
          sender_contact: senderContact.trim(),
          recipient_contact: item.contact_email || item.contact_phone,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch message.');
      }

      setIsSuccess(true);
      if (onMessageSent) onMessageSent();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while delivering message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setSenderName('');
    setSenderContact('');
    setMessage('');
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleResetAndClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 z-10 border border-black/10 shadow-2xl text-[#0d0c0b] max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-black/5">
            <div className="space-y-1 pr-6">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                    isLostItem
                      ? 'bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isLostItem ? 'Lost Item Contact' : 'Found Item Claim'}
                </span>
                <span className="text-xs text-slate-500 font-mono">Bilateral Chat</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{modalTitle}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{modalSubtitle}</p>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Target Item Reference Card */}
          <div className="mt-4 p-3 rounded-2xl bg-[#faf9f6] border border-black/5 flex items-center space-x-3.5">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-12 h-12 rounded-xl object-cover border border-black/10 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-slate-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
              <div className="flex items-center text-[10px] text-slate-500 gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="truncate">{item.location_name || 'Designated Campus Hub'}</span>
              </div>
            </div>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Message Dispatched!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your message was securely sent. The recipient has received your contact
                  details (<span className="font-semibold text-black">{senderContact}</span>)
                  and can contact you directly to complete the item handover.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-full bg-[#0d0c0b] hover:bg-[#242220] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            /* Message Form */
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sender Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f4f2ee] border border-black/10 rounded-full text-xs text-[#0d0c0b] placeholder:text-slate-400 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Sender Contact */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Contact Email or Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex.morgan@example.com or +1 555-0192"
                    value={senderContact}
                    onChange={(e) => setSenderContact(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f4f2ee] border border-black/10 rounded-full text-xs text-[#0d0c0b] placeholder:text-slate-400 focus:outline-none focus:border-black"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The person receiving your message will use this to contact you directly.
                </span>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={messagePlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 bg-[#f4f2ee] border border-black/10 rounded-2xl text-xs leading-relaxed text-[#0d0c0b] placeholder:text-slate-400 focus:outline-none focus:border-black resize-none"
                />
              </div>

              {/* Notice */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>End-to-end verified communication for safe recovery.</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-black/5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-full border border-black/10 text-xs font-medium text-slate-700 hover:text-black hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-[#0d0c0b] hover:bg-[#242220] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
