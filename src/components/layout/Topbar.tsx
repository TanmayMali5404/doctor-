import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
  CheckCheck,
  User,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../lib/auth';
import { useTheme } from '../../providers/theme-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatTime } from '../../lib/utils';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  currentTitle: string;
}

export function Topbar({ onToggleMobileMenu, currentTitle }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications', user?.uid],
    queryFn: () => api.notifications.list(),
    enabled: !!user?.uid,
    refetchInterval: 15000,
  });

  const notifications = notifData?.items || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      {/* Left section: Hamburger and Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Portal Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs">
          <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
            {user?.role === 'admin'
              ? 'Admin Portal'
              : user?.role === 'clinic'
              ? 'Clinic Portal'
              : user?.role === 'doctor'
              ? 'Doctor Portal'
              : user?.role === 'patient'
              ? 'Patient Portal'
              : 'Staff Portal'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-600" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                      className={`p-3.5 transition-colors cursor-pointer ${
                        n.is_read
                          ? 'opacity-65 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                          : 'bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 dark:hover:bg-teal-950/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {n.message}
                      </p>
                      {n.created_at && (
                        <p className="mt-1 text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(n.created_at)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-tr from-teal-500 to-sky-500 text-white font-bold text-xs uppercase shadow-xs">
              {user?.full_name ? user.full_name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user?.full_name || 'My Account'}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {user?.full_name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-teal-500" />
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                    Role: {user?.role}
                  </span>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
