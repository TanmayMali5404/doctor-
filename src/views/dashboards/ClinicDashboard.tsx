import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Stethoscope,
  CalendarCheck,
  CheckCircle,
  DollarSign,
  Plus,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatTime } from '../../lib/utils';
import { AppointmentFormModal } from '../../components/modals/AppointmentFormModal';
import { RescheduleModal } from '../../components/modals/RescheduleModal';
import { CancelModal } from '../../components/modals/CancelModal';
import { Appointment } from '../../types';

export function ClinicDashboard({ onNavigate }: { onNavigate: (viewId: string) => void }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data: clinicData, isLoading } = useQuery({
    queryKey: ['dashboard', 'clinic', user?.clinic_id],
    queryFn: () => api.dashboards.getClinic(user?.clinic_id),
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const { data: apptsData } = useQuery({
    queryKey: ['appointments', 'today', todayStr],
    queryFn: () => api.appointments.list({ date: todayStr }),
  });

  const todayAppointments = apptsData?.items || [];

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.appointments.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.appointments.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const stats = clinicData || {
    total_doctors: 0,
    today_appointments_count: 0,
    upcoming_appointments_count: 0,
    completed_appointments_count: 0,
    cancelled_appointments_count: 0,
    estimated_revenue: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinic Operations & Queue"
        description="Daily patient arrivals, consultation schedules, and department throughput."
        actions={
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Book Patient
          </button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Affiliated Doctors"
          value={isLoading ? '—' : stats.total_doctors}
          subtitle="On clinical duty"
          icon={Stethoscope}
          color="teal"
        />
        <StatCard
          title="Today's Bookings"
          value={isLoading ? '—' : stats.today_appointments_count}
          subtitle={`${stats.upcoming_appointments_count} upcoming in queue`}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={isLoading ? '—' : stats.completed_appointments_count}
          subtitle="Consultations finalized"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Estimated Revenue"
          value={isLoading ? '—' : formatCurrency(stats.estimated_revenue)}
          subtitle="Collected consultations"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Today's Queue */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Today's Patient Schedule Queue
            </h3>
            <p className="text-xs text-zinc-500">Live check-in and consultation statuses</p>
          </div>
          <button
            onClick={() => onNavigate('appointments')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            All Appointments
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
            No appointments scheduled for today yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {todayAppointments.map((appt: any) => (
              <div
                key={appt.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                    {formatTime(appt.start_time)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {appt.patient_name}
                      </span>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3 h-3 text-zinc-400" />
                      {appt.doctor_name} ·{' '}
                      <span className="capitalize">{appt.appointment_type.replace('_', ' ')}</span>
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Reason: <span className="font-medium">{appt.reason}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {appt.status === 'pending' && (
                    <button
                      onClick={() => confirmMutation.mutate(appt.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Confirm
                    </button>
                  )}
                  {['pending', 'confirmed', 'rescheduled'].includes(appt.status) && (
                    <>
                      <button
                        onClick={() => completeMutation.mutate(appt.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setIsRescheduleOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setIsCancelOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AppointmentFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        preselectedClinicId={user?.clinic_id}
      />
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
      <CancelModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
}
