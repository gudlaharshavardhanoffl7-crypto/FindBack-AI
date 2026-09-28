'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radar,
  Sparkles,
  Bell,
  User,
  LogOut,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import AIAssistantModal from '@/components/assistant/AIAssistantModal';

interface UserState {
  id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserState | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Operational status notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Multimodal Vector Index Active',
      message: 'Google Gemini embedding pipeline is connected and generating 768-D vectors.',
      time: 'Operational',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Database Synchronized',
      message: 'Supabase PostgreSQL and pgvector similarity index are running with Row Level Security.',
      time: 'Active',
      read: false,
    },
  ]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Lost Log', href: '/lost' },
    { label: 'Found Log', href: '/found' },
    { label: 'Matches', href: '/matches' },
    { label: 'Maps', href: '/maps' },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfileDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#0d0c0b] border border-black/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Radar className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#0d0c0b] flex items-center gap-1.5">
                FIND BACK <span className="text-sky-600 font-mono text-xs">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                MULTIMODAL RECOVERY
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-black/5 text-[#0d0c0b] border border-black/15 font-semibold'
                      : 'text-slate-600 hover:text-[#0d0c0b] hover:bg-black/5 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Hub: AI Assistant Button, Notifications, then Profile/Login Icon */}
          <div className="flex items-center space-x-3">
            {/* AI Assistant Button (Replaces Report Item) */}
            <button
              type="button"
              onClick={() => {
                setAiAssistantOpen(true);
                setNotificationsOpen(false);
                setProfileDropdownOpen(false);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#0d0c0b] hover:bg-[#242220] text-white transition-all shadow-xs cursor-pointer group"
              aria-label="Open AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>AI Assistant</span>
            </button>

            {/* Notification Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative w-9 h-9 rounded-lg border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center text-slate-600 hover:text-black transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_#0284c7]" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 z-50 border border-black/10 shadow-2xl text-[#0d0c0b]">
                  <div className="flex items-center justify-between pb-3 border-b border-black/10">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-semibold text-[#0d0c0b]">Match Radar Alerts</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-sky-600 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-black/5 max-h-72 overflow-y-auto mt-2">
                    {notifications.map((item) => (
                      <div key={item.id} className="py-2.5 px-1 hover:bg-black/5 rounded-md transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-900">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-black/10 text-center">
                    <Link
                      href="/matches"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-sky-700 hover:text-sky-900 font-medium"
                    >
                      View All Ranked Matches →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Login Icon at ABSOLUTE RIGHT */}
            <div className="relative">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="w-9 h-9 rounded-lg bg-black text-white font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="User profile"
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-9 px-3 rounded-lg border border-black/10 bg-white hover:bg-black/5 flex items-center space-x-1.5 text-slate-700 hover:text-black transition-colors cursor-pointer text-xs font-medium"
                  aria-label="Sign in"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-4 z-50 border border-black/10 shadow-2xl text-[#0d0c0b]">
                  <div className="pb-3 border-b border-black/10 mb-3">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      Active Member
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-black/5 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-600" />
                      <span>Recovery Dashboard</span>
                    </Link>
                    <Link
                      href="/lost"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-black/5 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-600" />
                      <span>My Reported Items</span>
                    </Link>
                    <Link
                      href="/matches"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-black/5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Active Matches</span>
                    </Link>
                  </div>

                  <div className="mt-3 pt-3 border-t border-black/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNotificationsOpen(false);
                setProfileDropdownOpen(false);
              }}
              className="md:hidden w-9 h-9 rounded-lg border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center text-slate-700 hover:text-black transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/10 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-black/5 text-[#0d0c0b] border border-black/15 font-semibold'
                        : 'text-slate-700 hover:text-black hover:bg-black/5 border border-transparent'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="text-[10px] text-[#0d0c0b] font-mono tracking-wide px-1.5 py-0.5 rounded bg-black/10">
                        Current
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-black/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAiAssistantOpen(true);
                }}
                className="flex items-center justify-center space-x-2 px-3 py-2 rounded-full text-xs font-medium text-white bg-[#0d0c0b] hover:bg-[#242220] transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Open AI Assistant</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* AI Assistant Modal Dialog */}
      <AIAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      {/* Authentication Modal (Email + Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
        redirectToDashboard={false}
      />
    </>
  );
}
