import React, { useState } from 'react';
import { useAuthStore, DEMO_ACCOUNTS_LIST } from '../lib/auth';
import { DEFAULT_API_KEY } from '../lib/api';
import { useTheme } from '../providers/theme-provider';
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
  Sun,
  Moon,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  KeyRound,
  CalendarCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Role } from '../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

const ROLE_ICONS: Record<Role, React.ElementType> = {
  admin: Shield,
  clinic: Building2,
  doctor: Stethoscope,
  patient: User,
  staff: Users,
};

const ROLE_BADGE_COLORS: Record<
  Role,
  { bg: string; text: string; border: string; activeBorder: string; dot: string }
> = {
  doctor: {
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800/70',
    activeBorder: 'border-teal-500 ring-2 ring-teal-500/20',
    dot: 'bg-teal-500',
  },
  admin: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/70',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/20',
    dot: 'bg-purple-500',
  },
  clinic: {
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/70',
    activeBorder: 'border-sky-500 ring-2 ring-sky-500/20',
    dot: 'bg-sky-500',
  },
  patient: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/70',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
    dot: 'bg-blue-500',
  },
  staff: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/70',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    dot: 'bg-amber-500',
  },
};

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const { loginWithUnified, isLoading, authError } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  // Single unified login form states (SAME login for all account types)
  const defaultAccount = DEMO_ACCOUNTS_LIST.find((a) => a.role === 'doctor') || DEMO_ACCOUNTS_LIST[0];
  const [identifier, setIdentifier] = useState(defaultAccount.email);
  const [password, setPassword] = useState(defaultAccount.password);
  const [activeFilledRole, setActiveFilledRole] = useState<Role | null>(defaultAccount.role);
  const [activeFilledName, setActiveFilledName] = useState<string>(defaultAccount.personName);

  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [localError, setLocalError] = useState('');

  // Autofill helper for quick testing of any account type in the single login form
  const handleQuickFillAccount = (acc: typeof DEMO_ACCOUNTS_LIST[0]) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setActiveFilledRole(acc.role);
    setActiveFilledName(acc.personName);
    setLocalError('');
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setLocalError('');
    // Check if entered email matches any known account
    const matched = DEMO_ACCOUNTS_LIST.find(
      (a) => a.email.toLowerCase() === value.trim().toLowerCase()
    );
    if (matched) {
      setActiveFilledRole(matched.role);
      setActiveFilledName(matched.personName);
    } else {
      setActiveFilledRole(null);
      setActiveFilledName('');
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
        apiKey: apiKey.trim(),
      });
      onLoginSuccess();
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-white dark:bg-zinc-950 transition-colors">
      {/* =========================================================================
          LEFT SIDE: Clinic Management System Topic & User-Uploaded Image (clinic11)
         ========================================================================= */}
      <section className="relative hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col justify-between p-8 xl:p-12 overflow-hidden bg-radial from-blue-700 via-blue-800 to-indigo-950 text-white select-none border-r border-blue-900/40">
        {/* Ambient Subtle Gradients */}
        <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-600/30 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Section */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white text-blue-700 shadow-xl shadow-blue-900/30 ring-2 ring-white/30">
              <HeartPulse className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                  ChedoCare Health
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  CMS Edition
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-100 tracking-wide">
                Clinic Management System
              </p>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-300" />
              What is a Clinic Management System?
            </h2>
            <p className="text-xs text-blue-100/90 max-w-lg leading-relaxed">
              An intelligent clinical software platform that coordinates outpatient consultations,
              electronic medical records (EMR), diagnostic imaging, digital prescriptions, and
              multi-facility duty schedules into one centralized healthcare workspace.
            </p>
          </div>
        </div>

        {/* Centerpiece: User-Uploaded Image (clinic11.svg / clinic11.jpg) */}
        <div className="relative z-10 my-auto py-4 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl p-3 sm:p-4 group">
            {/* Header banner over image */}
            <div className="flex items-center justify-between pb-2.5 text-xs">
              <span className="font-bold text-cyan-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Clinic Management System Architecture
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white font-medium">
                Integrated Workflow
              </span>
            </div>

            {/* The Image on the Left Side */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-blue-700 flex items-center justify-center border border-white/20">
              <img
                src="/clinic11.svg"
                alt="Clinic Management System - Doctors, Laptop EHR, Stethoscope, Clipboard & X-Ray"
                className="w-full h-auto max-h-72 object-contain object-center transform transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            {/* Caption below image */}
            <div className="pt-2.5 flex items-center justify-between text-[11px] text-blue-100">
              <p className="truncate font-medium">
                Unified Ecosystem: Doctors, Patients, EMR/EHR, Prescriptions & Scheduling
              </p>
              <span className="text-cyan-200 shrink-0 font-semibold text-[10px] bg-white/15 px-2 py-0.5 rounded-full">
                Real-Time Sync
              </span>
            </div>
          </div>

          {/* 3 Core Highlights of Clinic Management System */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col gap-1">
              <CalendarCheck className="w-4 h-4 text-cyan-300" />
              <p className="font-bold text-white text-[11px]">Scheduling</p>
              <p className="text-[10px] text-blue-100 leading-tight">Live slot engine & queue</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col gap-1">
              <FileText className="w-4 h-4 text-cyan-300" />
              <p className="font-bold text-white text-[11px]">EHR & Records</p>
              <p className="text-[10px] text-blue-100 leading-tight">Digital prescriptions & Rx</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col gap-1">
              <Building2 className="w-4 h-4 text-cyan-300" />
              <p className="font-bold text-white text-[11px]">Multi-Clinic</p>
              <p className="text-[10px] text-blue-100 leading-tight">Cross-facility rosters</p>
            </div>
          </div>
        </div>

        {/* Bottom Clinical Trust & Security Indicator */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-300" />
            <span>HIPAA Compliant · 256-Bit SSL · Role-Based Access Control</span>
          </div>
          <span className="font-mono text-[11px] text-blue-300">v2.4 Production</span>
        </div>
      </section>

      {/* =========================================================================
          RIGHT SIDE: Single Combined Login for All Account Types
         ========================================================================= */}
      <main className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-14 min-h-screen overflow-y-auto">
        {/* Top Header with Brand and Theme Switcher */}
        <header className="flex items-center justify-between w-full max-w-xl mx-auto pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
                ChedoCare Health
              </span>
              <p className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400">
                Clinic Management Portal
              </p>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </header>

        {/* Center Container: Single Combined Login Form */}
        <div className="w-full max-w-xl mx-auto my-auto py-4 sm:py-6 space-y-6">
          {/* Mobile Preview Banner of the Clinic Management System Image */}
          <div className="lg:hidden rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                Clinic Management System
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold">
                Unified Portal
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-blue-700 p-1.5 flex items-center justify-center border border-blue-300 dark:border-blue-800">
              <img
                src="/clinic11.svg"
                alt="Clinic Management System"
                className="w-full h-auto max-h-40 object-contain"
              />
            </div>
          </div>

          {/* Header Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Unified Access Gateway
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sign In to Your Account
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              One single login for all account types. Enter your email or user ID below — the system automatically identifies your role and directs you to your dedicated workspace.
            </p>
          </div>

          {/* Combined Account Types Banner showing supported roles */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              Combined Access Supported For All Account Types:
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {DEMO_ACCOUNTS_LIST.map((acc) => {
                const Icon = ROLE_ICONS[acc.role];
                const badgeColor = ROLE_BADGE_COLORS[acc.role];
                const isCurrentActive = activeFilledRole === acc.role;

                return (
                  <span
                    key={acc.role}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isCurrentActive
                        ? `${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} font-bold ring-1 ring-blue-500/30`
                        : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{acc.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Active Auto-Detection / Autofill Notice */}
          {activeFilledRole && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                ROLE_BADGE_COLORS[activeFilledRole].bg
              } ${ROLE_BADGE_COLORS[activeFilledRole].border} ${
                ROLE_BADGE_COLORS[activeFilledRole].text
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Detected account:{' '}
                  <strong>{activeFilledName}</strong> ({activeFilledRole.toUpperCase()} account)
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-zinc-900/60">
                Ready to Sign In
              </span>
            </div>
          )}

          {/* =====================================================================
              THE SAME SINGLE LOGIN FORM FOR ALL ACCOUNT TYPES
             ===================================================================== */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {(localError || authError) && (
              <div className="flex items-start gap-2.5 p-3.5 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Authentication Error</p>
                  <p>{localError || authError}</p>
                </div>
              </div>
            )}

            {/* Single Email / Account ID Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Account Email or User ID
                </span>
                <span className="text-[11px] text-zinc-400">Works for any account type</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                placeholder="Enter email or ID (e.g. sarah.jenkins@metrohealth.com)"
                className="w-full text-sm px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Single Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Password
                </span>
                <span className="text-[11px] text-zinc-400">Encrypted</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full text-sm pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Advanced Settings Drawer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Single sign-in gateway for all portals
              </span>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Cluster Key</span>
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showAdvanced && (
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                  Platform Cluster Secret (X-API-Key)
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="chedotech-dev-key-2026"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <p className="text-[10px] text-zinc-400">
                  Default preconfigured for production testing.
                </p>
              </div>
            )}

            {/* Single Combined Submit Button for ALL Account Types */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all disabled:opacity-50 cursor-pointer mt-3"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to ChedoCare</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* =====================================================================
              QUICK AUTOFILL FOR TESTING EVERY ACCOUNT TYPE
              Users can 1-click test Doctor, Admin, Clinic, Patient, or Staff
             ===================================================================== */}
          <div className="pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Test Any Account Type (1-Click Fill):
              </label>
              <span className="text-[10px] text-zinc-400">
                Click any role to populate login
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS_LIST.map((acc) => {
                const Icon = ROLE_ICONS[acc.role];
                const badgeColor = ROLE_BADGE_COLORS[acc.role];
                const isSelected = activeFilledRole === acc.role;

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFillAccount(acc)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `bg-white dark:bg-zinc-900 shadow-sm ${badgeColor.activeBorder}`
                        : 'bg-zinc-50/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${badgeColor.bg} ${badgeColor.text}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">
                          {acc.personName}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${badgeColor.bg} ${badgeColor.text}`}
                        >
                          {acc.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {acc.email}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {acc.roleLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="w-full max-w-xl mx-auto pt-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-900">
          <p>
            ChedoCare Health Platform · Role-Based Access Control (RBAC) · HIPAA Compliant
          </p>
        </footer>
      </main>
    </div>
  );
}
