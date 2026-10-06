import React from 'react';
import {
  APPOINTMENT_STATUS_CONFIG,
  CLINIC_STATUS_CONFIG,
  DOCTOR_STATUS_CONFIG,
  ROLE_CONFIG,
  cn,
} from '../../lib/utils';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  UserX,
  Shield,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'appointment' | 'clinic' | 'doctor' | 'role';
  className?: string;
}

export function StatusBadge({ status, type = 'appointment', className }: StatusBadgeProps) {
  let config: { label: string; bg?: string; text?: string; border?: string; badge?: string } | undefined;
  let Icon: React.ElementType | null = null;

  if (type === 'appointment') {
    config = APPOINTMENT_STATUS_CONFIG[status.toLowerCase()] || {
      label: status,
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-700',
    };
    if (status === 'confirmed') Icon = CheckCircle2;
    else if (status === 'completed') Icon = CheckCircle2;
    else if (status === 'pending') Icon = Clock;
    else if (status === 'rescheduled') Icon = RotateCcw;
    else if (status === 'cancelled' || status === 'rejected') Icon = XCircle;
    else if (status === 'no_show') Icon = UserX;
  } else if (type === 'clinic') {
    config = CLINIC_STATUS_CONFIG[status.toLowerCase()] || {
      label: status,
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-700',
    };
    if (status === 'active') Icon = CheckCircle2;
    else if (status === 'pending') Icon = Clock;
    else Icon = AlertCircle;
  } else if (type === 'doctor') {
    config = DOCTOR_STATUS_CONFIG[status.toLowerCase()] || {
      label: status,
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-700',
    };
    if (status === 'active') Icon = CheckCircle2;
    else Icon = AlertCircle;
  } else if (type === 'role') {
    config = ROLE_CONFIG[status.toLowerCase()] || {
      label: status.toUpperCase(),
      badge: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    };
    Icon = Shield;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
          config.badge,
          className
        )}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        config?.bg,
        config?.text,
        config?.border,
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {config?.label || status}
    </span>
  );
}
