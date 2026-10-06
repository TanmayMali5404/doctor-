import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import {
  CalendarCheck,
  CheckCircle2,
  Users,
  Clock,
  FileText,
  Pill,
  UserCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { MedicalRecordModal } from '../../components/modals/MedicalRecordModal';
import { PrescriptionModal } from '../../components/modals/PrescriptionModal';
import { Appointment } from '../../types';

export function DoctorDashboard({ onNavigate }: { onNavigate: (viewId: string) => void }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);

  const {
    data: doctorStats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'doctor', user?.uid],
    queryFn: () => api.dashboards.getDoctor(),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.appointments.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => api.appointments.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const stats = doctorStats || {
    today_appointments: [],
    today_count: 0,
    upcoming_count: 0,
    completed_count: 0,
    unique_patients: 0,
  };

  const todayAppointments = Array.isArray(stats.today_appointments) ? stats.today_appointments : [];

  return (
    <ErrorBoundary fallbackTitle="Error loading Physician Dashboard">
      <div className="space-y-6">
        <PageHeader
          title="Physician Clinical Dashboard"
          description={`Welcome back, ${user?.full_name || 'Doctor'}. Here is your patient queue and daily consultation schedule.`}
          actions={
            <button
              onClick={() => onNavigate('schedules')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/40 shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Manage My Working Hours
            </button>
          }
        />

        {isError && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {(error as any)?.message || 'Could not refresh clinical metrics. Showing cached data.'}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-800/60 hover:bg-amber-300 font-semibold text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Consultations"
            value={isLoading ? '—' : stats.today_count ?? 0}
            subtitle="Scheduled for today"
            icon={CalendarCheck}
            color="teal"
          />
          <StatCard
            title="Upcoming Queue"
            value={isLoading ? '—' : stats.upcoming_count ?? 0}
            subtitle="Future patient bookings"
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Completed Consultations"
            value={isLoading ? '—' : stats.completed_count ?? 0}
            subtitle="All-time finalized"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Unique Patients"
            value={isLoading ? '—' : stats.unique_patients ?? 0}
            subtitle="Treated patient cohort"
            icon={Users}
            color="purple"
          />
        </div>

        {/* Today's Queue */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Today's Consultation Schedule
              </h3>
              <p className="text-xs text-zinc-500">Live clinical patient queue for today</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {todayAppointments.length} Patients Scheduled
            </span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              You have no patient consultations scheduled for today. Enjoy your day or review upcoming appointments!
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {todayAppointments.map((appt: any) => (
                <div
                  key={appt.id || Math.random()}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold shrink-0">
                      {formatTime(appt.start_time)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {appt.patient_name || 'Anonymous Patient'}
                        </span>
                        <StatusBadge status={appt.status || 'pending'} />
                        <span className="text-xs text-zinc-400 font-mono">
                          ({(appt.appointment_type || 'consultation').replace(/_/g, ' ')})
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Chief Complaint / Reason:{' '}
                        <span className="font-semibold">{appt.reason || 'General Consultation'}</span>
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/40 p-1.5 rounded-md">
                          Notes: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Doctor Clinical Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                    {appt.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => completeMutation.mutate(appt.id)}
                          disabled={completeMutation.isPending}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Complete Visit
                        </button>
                        <button
                          onClick={() => noShowMutation.mutate(appt.id)}
                          disabled={noShowMutation.isPending}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          No-Show
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setActiveAppointment(appt);
                        setIsRecordModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Medical Record
                    </button>

                    <button
                      onClick={() => {
                        setActiveAppointment(appt);
                        setIsRxModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors cursor-pointer"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      Prescription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeAppointment && (
          <>
            <MedicalRecordModal
              isOpen={isRecordModalOpen}
              onClose={() => {
                setIsRecordModalOpen(false);
                setActiveAppointment(null);
              }}
              patientId={activeAppointment.patient_id}
              patientName={activeAppointment.patient_name}
              appointmentId={activeAppointment.id}
            />
            <PrescriptionModal
              isOpen={isRxModalOpen}
              onClose={() => {
                setIsRxModalOpen(false);
                setActiveAppointment(null);
              }}
              patientId={activeAppointment.patient_id}
              patientName={activeAppointment.patient_name}
              appointmentId={activeAppointment.id}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
