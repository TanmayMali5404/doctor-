import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatTime } from '../../lib/utils';
import { Calendar, Clock, AlertCircle, Check } from 'lucide-react';
import { Appointment } from '../../types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function RescheduleModal({ isOpen, onClose, appointment }: RescheduleModalProps) {
  const queryClient = useQueryClient();
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', appointment?.doctor_id, newDate, appointment?.clinic_id],
    queryFn: () =>
      api.availability.get(
        appointment!.doctor_id,
        newDate,
        appointment!.clinic_id
      ),
    enabled: !!appointment?.doctor_id && !!newDate && isOpen,
  });

  const slots = availabilityData?.slots || [];

  const rescheduleMutation = useMutation({
    mutationFn: () =>
      api.appointments.reschedule(appointment!.id, newDate, selectedSlot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to reschedule.');
    },
  });

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      description={`Rescheduling booking for ${appointment.patient_name} with ${appointment.doctor_name}.`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Choose New Date
          </label>
          <input
            type="date"
            value={newDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setNewDate(e.target.value);
              setSelectedSlot('');
            }}
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Select Available Slot
          </label>
          {slotsLoading ? (
            <div className="p-3 text-center text-xs text-zinc-400">Loading open slots...</div>
          ) : slots.length === 0 ? (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-500 text-center">
              No available slots on this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {slots.map((s: any) => {
                const isSelected = selectedSlot === s.start_time;
                return (
                  <button
                    key={s.start_time}
                    type="button"
                    onClick={() => setSelectedSlot(s.start_time)}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-teal-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {formatTime(s.start_time)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => rescheduleMutation.mutate()}
            disabled={rescheduleMutation.isPending || !selectedSlot}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50"
          >
            {rescheduleMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
