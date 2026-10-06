import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Star, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function ReviewModal({ isOpen, onClose, appointment }: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      api.reviews.create({
        appointment_id: appointment!.id,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to submit review.');
    },
  });

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Doctor & Clinic Review"
      description={`Share your consultation experience with ${appointment.doctor_name}.`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 5-Star Rating Selector */}
        <div className="space-y-2 text-center py-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Overall Consultation Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-300 dark:text-zinc-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
            {rating === 5
              ? 'Excellent (5 / 5)'
              : rating === 4
              ? 'Very Good (4 / 5)'
              : rating === 3
              ? 'Average (3 / 5)'
              : rating === 2
              ? 'Needs Improvement (2 / 5)'
              : 'Poor (1 / 5)'}
          </p>
        </div>

        {/* Written Review */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Your Feedback & Comments
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the doctor's communication, punctuality, and treatment explanation?"
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
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
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
