import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { formatTime, formatCurrency } from '../../lib/utils';
import { Calendar, Clock, Stethoscope, Building2, AlertCircle, Check } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string;
  preselectedClinicId?: string;
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  preselectedDoctorId,
  preselectedClinicId,
}: AppointmentFormModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [doctorId, setDoctorId] = useState(preselectedDoctorId || '');
  const [clinicId, setClinicId] = useState(preselectedClinicId || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState('in_person');
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Doctors
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.doctors.list({ status: 'active' }),
  });
  const doctors = doctorsData?.items || [];

  // Fetch Clinics
  const { data: clinicsData } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => api.clinics.list({ status: 'active' }),
  });
  const clinics = clinicsData?.items || [];

  // Auto-select doctor/clinic if available
  useEffect(() => {
    if (!doctorId && doctors.length > 0) {
      setDoctorId(preselectedDoctorId || doctors[0].id);
    }
  }, [doctors, doctorId, preselectedDoctorId]);

  useEffect(() => {
    if (doctorId) {
      const selectedDoc = doctors.find((d: any) => d.id === doctorId);
      if (selectedDoc && selectedDoc.clinic_ids?.length > 0) {
        if (!clinicId || !selectedDoc.clinic_ids.includes(clinicId)) {
          setClinicId(selectedDoc.clinic_ids[0]);
        }
      }
    }
  }, [doctorId, doctors, clinicId]);

  // Reset selected slot when doctor, clinic or date changes
  useEffect(() => {
    setSelectedSlot('');
    setErrorMsg('');
  }, [doctorId, clinicId, date]);

  // Fetch Available Slots dynamically
  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', doctorId, date, clinicId],
    queryFn: () => api.availability.get(doctorId, date, clinicId),
    enabled: !!doctorId && !!date && isOpen,
  });

  const availableSlots = availabilityData?.slots || [];
  const selectedDoctor = doctors.find((d: any) => d.id === doctorId);

  // Mutation to book
  const bookMutation = useMutation({
    mutationFn: (data: any) => api.appointments.create(data, `idem-${Date.now()}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to book appointment.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !clinicId || !date || !selectedSlot) {
      setErrorMsg('Please select a doctor, clinic, date, and an available time slot.');
      return;
    }

    bookMutation.mutate({
      doctor_id: doctorId,
      clinic_id: clinicId,
      date,
      start_time: selectedSlot,
      appointment_type: appointmentType,
      reason,
      notes,
      patient_id: user?.patient_id || user?.uid,
      patient_name: user?.full_name || 'Patient',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Consultation Appointment"
      description="Select medical provider, clinic branch, and an available schedule slot."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doctor select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Doctor / Physician
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {doctors.map((doc: any) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialization_name})
                </option>
              ))}
            </select>
          </div>

          {/* Clinic select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              Clinic Branch
            </label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {clinics.map((cl: any) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name} - {cl.city}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Appointment Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Appointment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Consultation Mode
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="in_person">In-Person Consultation</option>
              <option value="video">Telehealth Video Call</option>
              <option value="phone">Telephone Consultation</option>
            </select>
          </div>
        </div>

        {/* Dynamic Slots Section */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Available Time Slots ({date})
            </label>
            {selectedDoctor && (
              <span className="text-xs text-zinc-500">
                Fee: <strong className="text-teal-600">{formatCurrency(selectedDoctor.consultation_fee)}</strong>
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="p-4 text-center text-xs text-zinc-400">Loading bookable slots...</div>
          ) : availableSlots.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-center text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700">
              No slots available for this doctor on {date}. (Doctor may not have working hours or slots are booked).
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {availableSlots.map((slot: any) => {
                const isSelected = selectedSlot === slot.start_time;
                return (
                  <button
                    key={slot.start_time}
                    type="button"
                    onClick={() => setSelectedSlot(slot.start_time)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-medium border transition-all text-center flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-teal-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {formatTime(slot.start_time)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Reason for Visit / Chief Complaint
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Annual Checkup, Follow-up, Chest Discomfort"
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Additional Patient Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific symptoms or health updates to note..."
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={bookMutation.isPending || !selectedSlot}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
          >
            {bookMutation.isPending ? 'Confirming...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
