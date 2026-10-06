import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Tags,
  CalendarCheck,
  Clock,
  UserCheck,
  FileText,
  Pill,
  Star,
  Bell,
  Users,
  CalendarDays,
  Shield,
  HeartPulse,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '../../lib/auth';
import { useTheme } from '../../providers/theme-provider';
import { cn } from '../../lib/utils';
import { Role } from '../../types';

export interface NavItem {
  label: string;
  id: string;
  icon: React.ElementType;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  // Dashboard routes
  { label: 'Overview', id: 'dashboard', icon: LayoutDashboard, roles: ['admin', 'clinic', 'doctor', 'patient', 'staff'] },

  // Management modules
  { label: 'Clinics', id: 'clinics', icon: Building2, roles: ['admin', 'patient'] },
  { label: 'Doctors', id: 'doctors', icon: Stethoscope, roles: ['admin', 'clinic', 'staff', 'patient'] },
  { label: 'Specializations', id: 'specializations', icon: Tags, roles: ['admin'] },
  { label: 'Staff Members', id: 'staff', icon: Users, roles: ['admin', 'clinic'] },
  { label: 'Patients Directory', id: 'patients', icon: UserCheck, roles: ['admin', 'doctor', 'clinic', 'staff'] },

  // Schedules & Scheduling
  { label: 'Doctor Schedules', id: 'schedules', icon: CalendarDays, roles: ['admin', 'clinic', 'doctor', 'staff'] },
  { label: 'Availability & Slots', id: 'availability', icon: Clock, roles: ['admin', 'clinic', 'doctor', 'staff', 'patient'] },
  { label: 'Appointments', id: 'appointments', icon: CalendarCheck, roles: ['admin', 'clinic', 'doctor', 'patient', 'staff'] },

  // Clinical records
  { label: 'Medical Records', id: 'medical-records', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
  { label: 'Prescriptions', id: 'prescriptions', icon: Pill, roles: ['admin', 'doctor', 'patient'] },

  // Patient feedback & engagement
  { label: 'Reviews & Ratings', id: 'reviews', icon: Star, roles: ['admin', 'clinic', 'doctor', 'patient'] },
  { label: 'Notifications', id: 'notifications', icon: Bell, roles: ['admin', 'clinic', 'doctor', 'patient', 'staff'] },
];

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentView, onNavigate, isOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const role = user?.role || 'patient';

  const accessibleItems = NAV_ITEMS.filter((item) =>
    role === 'admin' ? true : item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ChedoCare
            </h2>
            <p className="text-[10px] font-medium tracking-wide uppercase text-teal-600 dark:text-teal-400">
              Clinical Platform
            </p>
          </div>
        </div>

        {/* User Role Pill */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Role Scoped
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/50">
              <Shield className="w-2.5 h-2.5" />
              {role}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {accessibleItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Appearance</span>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-teal-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
            <span>API Engine v1.0</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </aside>
    </>
  );
}
