'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radar,
  FileCheck2,
  Sparkles,
  Bell,
  User,
  LogOut,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

interface UserState {
  id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserState | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Operational status notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Multimodal Vector Index Active',
      message: 'Google Gemini 1.5 embedding pipeline is connected and generating 768-D vectors.',
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
              <Radar className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                FIND BACK <span className="text-black font-mono text-xs px-1 py-0.5 rounded bg-slate-100">AI</span>
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
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Hub: Notification Icon, then Profile/Login Icon */}
          <div className="flex items-center space-x-3">
            {/* Quick Action Button */}
            <Link
              href="/found"
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-black hover:bg-neutral-800 transition-all shadow-sm"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-white" />
              <span>Report Item</span>
            </Link>

            {/* Notification Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black shadow-sm" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white p-4 z-50 border border-slate-200 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-black" />
                      <span className="text-xs font-semibold text-slate-900">Match Radar Alerts</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-slate-600 hover:text-black hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.map((item) => (
                      <div key={item.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-md transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-800">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                    <Link
                      href="/matches"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-black hover:underline font-semibold"
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
                  className="w-9 h-9 rounded-lg bg-black text-white font-semibold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label="User profile"
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold"
                  aria-label="Sign in"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-4 z-50 border border-slate-200 shadow-xl">
                  <div className="pb-3 border-b border-slate-100 mb-3">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-mono">
                      Active Member
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-black" />
                      <span>Recovery Dashboard</span>
                    </Link>
                    <Link
                      href="/lost"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-black" />
                      <span>My Reported Items</span>
                    </Link>
                    <Link
                      href="/matches"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Active Matches</span>
                    </Link>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
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
              className="md:hidden w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-3 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-slate-700 hover:text-black hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="text-[10px] text-white/90 font-mono tracking-wide px-1.5 py-0.5 rounded bg-white/20">
                        Current
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/found"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-black hover:bg-neutral-800 transition-all shadow-sm"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-white" />
                <span>Report Item</span>
              </Link>
            </div>
          </div>
        )}
      </header>

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
