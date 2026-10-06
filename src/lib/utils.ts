import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const parsed = typeof dateStr === 'string' && dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return format(parsed, 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '';
  // Check if it's already HH:MM
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }
  try {
    const parsed = parseISO(timeStr);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, 'hh:mm a');
    }
  } catch {
    // fallback
  }
  return timeStr;
}

export function formatDateTime(dateTimeStr?: string | null): string {
  if (!dateTimeStr) return 'N/A';
  try {
    const parsed = parseISO(dateTimeStr);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, 'MMM dd, yyyy · hh:mm a');
    }
  } catch {
    // fallback
  }
  return dateTimeStr;
}

export function formatCurrency(amount: number | string | undefined | null): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export const APPOINTMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/40',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/40',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/40',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/40',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/40',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  no_show: {
    label: 'No Show',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800/40',
  },
};

export const CLINIC_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/40',
  },
  pending: {
    label: 'Pending Approval',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/40',
  },
  suspended: {
    label: 'Suspended',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/40',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
};

export const DOCTOR_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/40',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  suspended: {
    label: 'Suspended',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/40',
  },
};

export const ROLE_CONFIG: Record<
  string,
  { label: string; badge: string; color: string }
> = {
  admin: {
    label: 'System Admin',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    color: 'purple',
  },
  clinic: {
    label: 'Clinic Admin',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50',
    color: 'sky',
  },
  doctor: {
    label: 'Doctor / Physician',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50',
    color: 'teal',
  },
  patient: {
    label: 'Patient',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    color: 'blue',
  },
  staff: {
    label: 'Clinic Staff',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    color: 'amber',
  },
};
