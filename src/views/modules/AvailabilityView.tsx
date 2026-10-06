import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { Clock, Ban, Calendar, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { BlockAvailabilityModal } from '../../components/modals/BlockAvailabilityModal';
import { AppointmentFormModal } from '../../components/modals/AppointmentFormModal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export function AvailabilityView() {
  const { user } = useAuthStore();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Fetch doctors
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.doctors.list({ status: 'active' }),
  });
  const doctors = doctorsData?.items || [];

  React.useEffect(() => {
    if (user?.role === 'doctor') {
      const myDoc = doctors.find(
        (d: any) => d.user_id === user.uid || d.user_uid === user.uid || d.id === user.doctor_id
      );
      if (myDoc && !selectedDoctorId) {
        setSelectedDoctorId(myDoc.id);
        return;
      }
    }
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId, user]);

  // Fetch live availability slots
  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', selectedDoctorId, selectedDate],
    queryFn: () => api.availability.get(selectedDoctorId, selectedDate),
    enabled: !!selectedDoctorId && !!selectedDate,
  });

  const slots = availabilityData?.slots || [];
  const selectedDoctor = doctors.find((d: any) => d.id === selectedDoctorId);

  const canBlock = ['admin', 'clinic', 'doctor'].includes(user?.role || '');

  return (
    <ErrorBoundary fallbackTitle="Error loading Availability Engine">
      <div className="space-y-6">
      <PageHeader
        title="Live Doctor Availability & Slot Engine"
        description="Inspect dynamic appointment slots generated in real-time from weekly schedules, breaks, and booked appointments."
        actions={
          canBlock ? (
            <button
              onClick={() => setIsBlockModalOpen(true)}
              disabled={!selectedDoctorId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              Block Time Window
            </button>
          ) : undefined
        }
      />

      {/* Control panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            Select Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
          >
            {doctors.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Inspection Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Live Available Slots Matrix */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Generated Open Slots ({selectedDate})
            </h3>
            <p className="text-xs text-zinc-500">
              Slots for {selectedDoctor?.name || 'Physician'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
            {slots.length} Slots Available
          </span>
        </div>

        {slotsLoading ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            Evaluating doctor schedules and existing bookings...
          </div>
        ) : slots.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No Slots Available on {selectedDate}
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              The doctor does not have working hours configured for this day of the week, or all intervals have been reserved or blocked.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {slots.map((s: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-teal-200/70 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 text-center space-y-1 hover:border-teal-500 transition-colors"
              >
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  {formatTime(s.start_time)}
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  to {formatTime(s.end_time)}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Open
                </span>
              </div>
            ))}
          </div>
        )}

        {slots.length > 0 && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              Book an Appointment on this Date
            </button>
          </div>
        )}
      </div>

      {selectedDoctorId && (
        <BlockAvailabilityModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          doctorId={selectedDoctorId}
        />
      )}

      {selectedDoctorId && (
        <AppointmentFormModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          preselectedDoctorId={selectedDoctorId}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}
