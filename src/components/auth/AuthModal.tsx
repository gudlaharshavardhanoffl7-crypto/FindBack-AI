'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { id: string; email: string; name: string }) => void;
  redirectToDashboard?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  redirectToDashboard = true,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password validation
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    let authenticatedUser = {
      id: `usr-${Date.now().toString(36)}`,
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0],
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (mode === 'signin') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

          if (error) {
            // Check for invalid credentials
            if (error.message.toLowerCase().includes('invalid login credentials')) {
              setErrorMsg('Invalid email or password. Please verify and try again.');
              setLoading(false);
              return;
            }
            throw error;
          }

          if (data.user) {
            authenticatedUser = {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              name: (data.user.email || trimmedEmail).split('@')[0],
            };
          }
        } else {
          // Sign up mode
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
          });

          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }

          if (data.user) {
            authenticatedUser = {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              name: (data.user.email || trimmedEmail).split('@')[0],
            };
          }
        }
      } catch (err: any) {
        console.warn('Supabase authentication notice:', err);
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setIsSuccess(true);

    setTimeout(() => {
      if (onSuccess) {
        onSuccess(authenticatedUser);
      }
      onClose();
      setIsSuccess(false);
      setEmail('');
      setPassword('');

      if (redirectToDashboard) {
        router.push('/dashboard');
      }
    }, 800);
  };

  const handleDemoSignIn = () => {
    const demoUser = {
      id: 'demo-analyst-01',
      email: 'analyst@findback.ai',
      name: 'Recovery Officer',
    };

    if (onSuccess) {
      onSuccess(demoUser);
    }
    onClose();

    if (redirectToDashboard) {
      router.push('/dashboard');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#0c121e] text-slate-100 z-10 shadow-2xl border border-white/10 rounded-2xl p-7"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {mode === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}
                </h3>
                <p className="text-xs text-slate-400">Find Back with AI Authentication</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">Authenticated Successfully</h4>
              <p className="text-xs text-slate-400">Redirecting to your recovery dashboard...</p>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              {/* Strict Email Address + Password Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300" htmlFor="auth-password">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                      required
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {mode === 'signup' ? 'Minimum 6 characters required.' : 'Enter your registered password.'}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg transition-colors text-xs shadow-lg mt-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Login' : 'Create Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrorMsg('');
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>

              {/* Fast Sandbox Evaluation Access */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Need instant evaluation access?</span>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  Quick Demo Access →
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
