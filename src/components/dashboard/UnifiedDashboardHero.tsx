import React, { useState } from 'react';
import { useAuthStore, DEMO_ACCOUNTS_LIST } from '../../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building2,
  Stethoscope,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Activity,
  CalendarCheck,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Role } from '../../types';

const ROLE_ICONS: Record<Role, React.ElementType> = {
  admin: Shield,
  clinic: Building2,
  doctor: Stethoscope,
  patient: User,
  staff: Users,
};

const ROLE_BADGE_COLORS: Record<
  Role,
  { bg: string; text: string; border: string; activeBorder: string }
> = {
  doctor: {
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800/70',
    activeBorder: 'border-teal-500 ring-2 ring-teal-500/20',
  },
  admin: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/70',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/20',
  },
  clinic: {
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/70',
    activeBorder: 'border-sky-500 ring-2 ring-sky-500/20',
  },
  patient: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/70',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
  },
  staff: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/70',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
  },
};

export function UnifiedDashboardHero() {
  const { user, loginWithUnified, isLoading } = useAuthStore();
  const queryClient = useQueryClient();

  // Single unified login form states
  const defaultAccount = DEMO_ACCOUNTS_LIST.find((a) => a.role === user?.role) || DEMO_ACCOUNTS_LIST[0];
  const [identifier, setIdentifier] = useState(defaultAccount.email);
  const [password, setPassword] = useState(defaultAccount.password);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [activeFilledRole, setActiveFilledRole] = useState<Role | null>(defaultAccount.role);
  const [activeFilledName, setActiveFilledName] = useState<string>(defaultAccount.personName);
  const [isExpanded, setIsExpanded] = useState(true);

  // Quick fill handler
  const handleQuickFill = (acc: typeof DEMO_ACCOUNTS_LIST[0]) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setActiveFilledRole(acc.role);
    setActiveFilledName(acc.personName);
    setLocalError('');
  };

  // Quick switch & sign in directly
  const handleDirectSwitch = async (acc: typeof DEMO_ACCOUNTS_LIST[0]) => {
    handleQuickFill(acc);
    try {
      await loginWithUnified({
        identifier: acc.email,
        password: acc.password,
      });
      queryClient.invalidateQueries();
    } catch (err: any) {
      setLocalError(err?.message || 'Login switch failed.');
    }
  };

  // Submit single login form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!identifier.trim()) {
      setLocalError('Please enter your account email or User ID.');
      return;
    }

    try {
      await loginWithUnified({
        identifier: identifier.trim(),
        password,
      });
      queryClient.invalidateQueries();
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl transition-all">
      {/* Top Banner Control Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white shadow-xs">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            ChedoCare Health · Clinic Management System (CMS)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Unified Single Gateway
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Active Session:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {user?.full_name} ({user?.role?.toUpperCase()})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse Gateway' : 'Show Single Login'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          {/* =========================================================================
              LEFT SIDE: User-Uploaded Image (clinic11) & Clinic Management Topic
             ========================================================================= */}
          <div className="lg:col-span-6 relative flex flex-col justify-between p-6 sm:p-8 bg-radial from-blue-700 via-blue-800 to-indigo-950 text-white select-none border-b lg:border-b-0 lg:border-r border-blue-900/40">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/30 via-transparent to-black/40 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Text & Context */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Topic Blueprint
                </span>
                <span className="text-xs font-medium text-blue-100">
                  Clinic Management System
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                What is a Clinic Management System?
              </h2>
              <p className="text-xs text-blue-100/90 leading-relaxed max-w-md">
                A unified healthcare platform that coordinates outpatient bookings, electronic medical
                records (EMR), live doctor consultation queues, digital prescriptions, and cross-clinic facilities.
              </p>
            </div>

            {/* The Image on the Left Side */}
            <div className="relative z-10 my-4 rounded-2xl overflow-hidden border border-white/20 bg-blue-700 p-2 shadow-2xl group flex items-center justify-center">
              <img
                src="/clinic11.svg"
                alt="Clinic Management System - Doctors, Laptop EHR, Stethoscope, Clipboard & X-Ray"
                className="w-full h-auto max-h-56 sm:max-h-64 object-contain object-center transform transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            {/* Bottom 3 Highlights */}
            <div className="relative z-10 grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex flex-col gap-0.5">
                <CalendarCheck className="w-3.5 h-3.5 text-cyan-300" />
                <span className="font-bold text-white text-[10px]">Smart Queue</span>
                <span className="text-[9px] text-blue-100">Live slot engine</span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex flex-col gap-0.5">
                <FileText className="w-3.5 h-3.5 text-cyan-300" />
                <span className="font-bold text-white text-[10px]">EHR & Records</span>
                <span className="text-[9px] text-blue-100">Digital Rx vault</span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex flex-col gap-0.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-300" />
                <span className="font-bold text-white text-[10px]">Multi-Clinic</span>
                <span className="text-[9px] text-blue-100">Cross-facility rosters</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT SIDE: Combine All Account Types into One Same Login
             ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-zinc-900">
            <div className="space-y-4">
              {/* Header Title */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 mb-1.5">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Combined Access Gateway
                </div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Single Login For All Account Types
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Sign in or switch between any account type (Doctor, Clinic, Admin, Patient, Staff) using this unified login form.
                </p>
              </div>

              {/* Supported Account Badges Strip */}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                  Supported:
                </span>
                {DEMO_ACCOUNTS_LIST.map((acc) => {
                  const Icon = ROLE_ICONS[acc.role];
                  const badgeColor = ROLE_BADGE_COLORS[acc.role];
                  const isCurrent = user?.role === acc.role;

                  return (
                    <span
                      key={acc.role}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        isCurrent
                          ? `${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} ring-1 ring-blue-500/30`
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      <span>{acc.name}</span>
                      {isCurrent && <span className="text-[9px] text-blue-600 font-bold">●</span>}
                    </span>
                  );
                })}
              </div>

              {/* Active Detection Banner */}
              {activeFilledRole && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    ROLE_BADGE_COLORS[activeFilledRole].bg
                  } ${ROLE_BADGE_COLORS[activeFilledRole].border} ${
                    ROLE_BADGE_COLORS[activeFilledRole].text
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Selected: <strong>{activeFilledName}</strong> ({activeFilledRole.toUpperCase()})
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white/80 dark:bg-zinc-900/60">
                    Ready
                  </span>
                </div>
              )}

              {/* Error Message */}
              {localError && (
                <div className="flex items-start gap-2 p-2.5 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{localError}</p>
                </div>
              )}

              {/* The Same Single Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Account Email or User ID
                    </span>
                    <span className="text-[10px] text-zinc-400">All account types</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      const matched = DEMO_ACCOUNTS_LIST.find(
                        (a) => a.email.toLowerCase() === e.target.value.trim().toLowerCase()
                      );
                      if (matched) {
                        setActiveFilledRole(matched.role);
                        setActiveFilledName(matched.personName);
                      }
                    }}
                    placeholder="Enter email or ID (e.g. sarah.jenkins@metrohealth.com)"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Password
                    </span>
                    <span className="text-[10px] text-zinc-400">Encrypted</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full text-xs sm:text-sm pl-3 pr-9 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In as {activeFilledRole ? activeFilledRole.toUpperCase() : 'Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 1-Click Quick Fill Cards for All 5 Account Types */}
            <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  1-Click Test Any Account Type:
                </span>
                <span className="text-zinc-400 text-[10px]">Click to sign in instantly</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {DEMO_ACCOUNTS_LIST.map((acc) => {
                  const Icon = ROLE_ICONS[acc.role];
                  const badgeColor = ROLE_BADGE_COLORS[acc.role];
                  const isCurrent = user?.role === acc.role;

                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleDirectSwitch(acc)}
                      title={`Sign in as ${acc.personName} (${acc.roleLabel})`}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? `bg-blue-50 dark:bg-blue-950/50 ${badgeColor.activeBorder}`
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1 ${badgeColor.bg} ${badgeColor.text}`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-bold truncate w-full text-zinc-800 dark:text-zinc-200">
                        {acc.name}
                      </span>
                      <span className="text-[9px] text-zinc-400 truncate w-full">
                        {acc.personName.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
