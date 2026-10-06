import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  clinicId?: string;
}

export function ScheduleModal({ isOpen, onClose, doctorId, clinicId }: ScheduleModalProps) {
  const queryClient = useQueryClient();
  const [dayOfWeek, setDayOfWeek] = useState('monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [hasLunchBreak, setHasLunchBreak] = useState(true);
  const [breakStart, setBreakStart] = useState('12:30');
  const [breakEnd, setBreakEnd] = useState('13:30');
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.schedules.create(doctorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to save doctor schedule.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const breaks = hasLunchBreak
      ? [{ start_time: breakStart, end_time: breakEnd }]
      : [];

    createMutation.mutate({
      clinic_id: clinicId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: Number(slotDuration),
      breaks,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Doctor Weekly Hours"
      description="Define recurring consultation windows and break times."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
            Day of Week
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 capitalize"
          >
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
              (day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              )
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Shift Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Shift End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Slot Duration (Minutes)
          </label>
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
          >
            <option value={15}>15 minutes (Quick consult / Follow-up)</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes (Standard consultation)</option>
            <option value={45}>45 minutes (Detailed evaluation)</option>
            <option value={60}>60 minutes (Comprehensive exam / Procedure)</option>
          </select>
        </div>

        {/* Lunch / Break Interval */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLunchBreak}
              onChange={(e) => setHasLunchBreak(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            Include Break / Lunch Window
          </label>

          {hasLunchBreak && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-zinc-500">Break Start</span>
                <input
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">Break End</span>
                <input
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>
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
            type="submit"
            disabled={createMutation.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
