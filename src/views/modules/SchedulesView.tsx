import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { CalendarDays, Plus, Clock, Trash2, Coffee } from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { ScheduleModal } from '../../components/modals/ScheduleModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Schedule } from '../../types';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export function SchedulesView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);

  // Fetch doctors to allow doctor selection
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.doctors.list(),
  });
  const doctors = doctorsData?.items || [];

  // Default to user doctor if logged in as doctor
  React.useEffect(() => {
    if (user?.role === 'doctor') {
      const myDoc = doctors.find(
        (d: any) => d.user_id === user.uid || d.user_uid === user.uid || d.id === user.doctor_id
      );
      if (myDoc) setSelectedDoctorId(myDoc.id);
      else if (doctors.length > 0 && !selectedDoctorId) setSelectedDoctorId(doctors[0].id);
    } else if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, user, selectedDoctorId]);

  // Fetch schedules for the doctor
  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules', selectedDoctorId],
    queryFn: () => api.schedules.list(selectedDoctorId),
    enabled: !!selectedDoctorId,
  });

  const schedules: Schedule[] = schedulesData?.items || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.schedules.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setDeletingSchedule(null);
    },
  });

  const columns = [
    {
      header: 'Day of Week',
      accessorKey: 'day_of_week',
      cell: (s: Schedule) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-teal-600" />
          {s.day_of_week}
        </span>
      ),
    },
    {
      header: 'Working Hours',
      cell: (s: Schedule) => (
        <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>
            {formatTime(s.start_time)} — {formatTime(s.end_time)}
          </span>
        </div>
      ),
    },
    {
      header: 'Slot Duration',
      accessorKey: 'slot_duration_minutes',
      cell: (s: Schedule) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
          {s.slot_duration_minutes} min slots
        </span>
      ),
    },
    {
      header: 'Break Intervals',
      cell: (s: Schedule) => (
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          {s.breaks && s.breaks.length > 0 ? (
            s.breaks.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-500" />
                {formatTime(b.start_time)} - {formatTime(b.end_time)}
              </span>
            ))
          ) : (
            <span className="text-zinc-400">Continuous Shift</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (s: Schedule) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setDeletingSchedule(s)}
            className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Remove Shift"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary fallbackTitle="Error loading Schedules">
      <div className="space-y-6">
        <PageHeader
        title="Physician Working Schedules"
        description="Weekly recurring practice shifts, consultation windows, and break periods."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedDoctorId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Working Shift
          </button>
        }
      />

      {/* Doctor selector */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs max-w-md">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
          Doctor:
        </label>
        <select
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
        >
          {doctors.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.specialization_name})
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={schedules}
        isLoading={isLoading}
        emptyMessage="No weekly working shifts configured for this doctor."
      />

      {selectedDoctorId && (
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          doctorId={selectedDoctorId}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={() => deletingSchedule && deleteMutation.mutate(deletingSchedule.id)}
        title="Remove Working Shift"
        message={`Are you sure you want to remove the ${deletingSchedule?.day_of_week} working shift?`}
        confirmText="Remove"
        isLoading={deleteMutation.isPending}
      />
    </div>
    </ErrorBoundary>
  );
}
