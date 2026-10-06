import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Bell, CheckCheck, Clock, Check } from 'lucide-react';
import { formatTime, formatDate } from '../../lib/utils';
import { Notification } from '../../types';

export function NotificationsView() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
  });

  const notifications: Notification[] = data?.items || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllMutation = useMutation({
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
    <div className="space-y-6">
      <PageHeader
        title="System & Clinical Notifications"
        description="Appointment reminders, schedule confirmations, prescription issues, and system alerts."
        actions={
          unreadCount > 0 ? (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 rounded-xl hover:bg-teal-100 transition-colors shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          ) : undefined
        }
      />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
            <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                n.is_read
                  ? 'opacity-70 bg-white dark:bg-zinc-900'
                  : 'bg-teal-50/30 dark:bg-teal-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    n.is_read
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      : 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {n.title}
                    </h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">{n.message}</p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono pt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(n.created_at)} at {formatTime(n.created_at)}
                  </p>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 shrink-0 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
