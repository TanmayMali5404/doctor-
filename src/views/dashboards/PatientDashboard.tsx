import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Pill,
  FileText,
  Star,
} from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import { AppointmentFormModal } from '../../components/modals/AppointmentFormModal';
import { RescheduleModal } from '../../components/modals/RescheduleModal';
import { CancelModal } from '../../components/modals/CancelModal';
import { ReviewModal } from '../../components/modals/ReviewModal';
import { Appointment } from '../../types';

export function PatientDashboard({ onNavigate }: { onNavigate: (viewId: string) => void }) {
  const { user } = useAuthStore();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { data: patientData, isLoading } = useQuery({
    queryKey: ['dashboard', 'patient', user?.uid],
    queryFn: () => api.dashboards.getPatient(),
  });

  const { data: rxData } = useQuery({
    queryKey: ['prescriptions', user?.uid],
    queryFn: () => api.prescriptions.listForPatient(user?.patient_id || user?.uid || ''),
    enabled: !!user?.uid,
  });

  const { data: recordData } = useQuery({
    queryKey: ['medical-records', user?.uid],
    queryFn: () => api.medicalRecords.listForPatient(user?.patient_id || user?.uid || ''),
    enabled: !!user?.uid,
  });

  const stats = patientData || {
    upcoming_appointments: [],
    total_upcoming: 0,
    total_completed: 0,
    total_cancelled: 0,
  };

  const upcomingAppts = stats.upcoming_appointments || [];
  const prescriptions = rxData?.items || [];
  const medicalRecords = recordData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.full_name || 'Patient'}`}
        description="View your upcoming healthcare visits, review doctor prescriptions, and manage medical appointments."
        actions={
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Book New Appointment
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Upcoming Appointments"
          value={isLoading ? '—' : stats.total_upcoming}
          subtitle="Scheduled doctor consultations"
          icon={CalendarCheck}
          color="teal"
        />
        <StatCard
          title="Completed Visits"
          value={isLoading ? '—' : stats.total_completed}
          subtitle="Consultations attended"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancelled Visits"
          value={isLoading ? '—' : stats.total_cancelled}
          subtitle="Prior cancelled bookings"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Upcoming Appointments Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Your Upcoming Health Appointments
            </h3>
            <p className="text-xs text-zinc-500">Scheduled in-person and telehealth consultations</p>
          </div>
          {upcomingAppts.length > 0 && (
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              {upcomingAppts.length} Scheduled
            </span>
          )}
        </div>

        {upcomingAppts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
            <CalendarCheck className="w-10 h-10 text-teal-500 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                You have no upcoming appointments.
              </p>
              <p className="text-xs text-zinc-500">
                Need to see a cardiologist, pediatrician, or general physician?
              </p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Book Appointment Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppts.map((appt: any) => (
              <div
                key={appt.id}
                className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {appt.doctor_name}
                      </h4>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {appt.clinic_name}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{formatDate(appt.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{formatTime(appt.start_time)}</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Reason:</span>{' '}
                  {appt.reason}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setIsRescheduleOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setIsCancelOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Records Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Prescriptions */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              Active Prescriptions ({prescriptions.length})
            </h4>
            <button
              onClick={() => onNavigate('prescriptions')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No active prescriptions.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {prescriptions.slice(0, 3).map((rx: any) => (
                <div key={rx.id} className="py-2.5">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {rx.medicines?.map((m: any) => m.name).join(', ')}
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    Issued: {formatDate(rx.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical History */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Recent Consultations & Diagnosis ({medicalRecords.length})
            </h4>
            <button
              onClick={() => onNavigate('medical-records')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              View Records
            </button>
          </div>

          {medicalRecords.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No medical records on file.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {medicalRecords.slice(0, 3).map((rec: any) => (
                <div key={rec.id} className="py-2.5">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{rec.diagnosis}</p>
                  <p className="text-zinc-500 mt-0.5">
                    Visit date: {formatDate(rec.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppointmentFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
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
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
}
