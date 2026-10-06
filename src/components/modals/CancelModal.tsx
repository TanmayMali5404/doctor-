import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AlertTriangle } from 'lucide-react';
import { Appointment } from '../../types';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function CancelModal({ isOpen, onClose, appointment }: CancelModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('Patient requested cancellation');
  const [errorMsg, setErrorMsg] = useState('');

  const cancelMutation = useMutation({
    mutationFn: () => api.appointments.cancel(appointment!.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to cancel appointment.');
    },
  });

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      description={`Are you sure you want to cancel the appointment with ${appointment.doctor_name}?`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Cancellation Policy Notice</p>
            <p className="text-zinc-600 dark:text-zinc-300">
              The reserved time slot ({appointment.start_time} - {appointment.end_time} on {appointment.date}) will be released for other patients.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Reason for Cancellation
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please specify a reason for canceling..."
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
          >
            {cancelMutation.isPending ? 'Canceling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
