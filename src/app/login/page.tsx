'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle2, Radar } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        if (mode === 'signin') {
          const { error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

          if (error) {
            if (error.message.toLowerCase().includes('invalid login credentials')) {
              setErrorMsg('Invalid email or password. Please verify and try again.');
              setLoading(false);
              return;
            }
            throw error;
          }
        } else {
          const { error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
          });

          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
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
      router.push('/dashboard');
    }, 800);
  };

  const handleDemoSignIn = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-900/5">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
              <Radar className="w-5 h-5 text-slate-900 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-950 flex items-center gap-1.5">
              FIND BACK <span className="bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Multimodal physical property recovery platform
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 mb-1">Authenticated Successfully</h4>
            <p className="text-xs text-slate-500">Opening your property recovery dashboard...</p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Email Address + Password Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {mode === 'signup' ? 'Minimum 6 characters required.' : 'Enter your registered password.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-xs shadow-md mt-2 cursor-pointer disabled:opacity-50"
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

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMsg('');
                }}
                className="text-xs text-slate-600 hover:text-slate-950 font-medium transition-colors"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Need instant evaluation access?</span>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="text-xs text-slate-900 hover:underline font-semibold transition-colors"
              >
                Quick Demo Access →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
