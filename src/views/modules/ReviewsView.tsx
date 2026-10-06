import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Star, MessageSquareQuote, Stethoscope, User, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Review } from '../../types';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export function ReviewsView() {
  const { user } = useAuthStore();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.doctors.list(),
  });
  const doctors = doctorsData?.items || [];

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', selectedDoctorId],
    queryFn: () =>
      api.reviews.list(selectedDoctorId === 'all' ? undefined : selectedDoctorId),
  });

  const reviews: Review[] = reviewsData?.items || [];

  const columns = [
    {
      header: 'Rating & Feedback',
      accessorKey: 'rating',
      cell: (r: Review) => {
        const rating = Number(r.rating || 5);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-300 dark:text-zinc-700'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 ml-1">
                {rating} / 5
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
              "{r.comment || 'Professional and attentive consultation.'}"
            </p>
          </div>
        );
      },
    },
    {
      header: 'Physician',
      accessorKey: 'doctor_name',
      cell: (r: Review) => (
        <div className="text-xs flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          {r.doctor_name || 'Physician'}
        </div>
      ),
    },
    {
      header: 'Patient Reviewer',
      accessorKey: 'patient_name',
      cell: (r: Review) => (
        <div className="text-xs flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
          <User className="w-3.5 h-3.5 text-zinc-400" />
          {r.patient_name || 'Verified Patient'}
        </div>
      ),
    },
    {
      header: 'Date Submitted',
      accessorKey: 'created_at',
      cell: (r: Review) => (
        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          {formatDate(r.created_at)}
        </span>
      ),
    },
  ];

  return (
    <ErrorBoundary fallbackTitle="Error loading Reviews">
      <div className="space-y-6">
        <PageHeader
          title="Patient Reviews & Ratings"
          description="Verified patient satisfaction feedback, doctor ratings, and consultation quality reviews."
        />

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs max-w-sm">
          <span className="text-xs font-semibold text-zinc-500">Filter Doctor:</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 flex-1"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={reviews}
          isLoading={isLoading}
          emptyMessage="No patient reviews submitted yet."
        />
      </div>
    </ErrorBoundary>
  );
}
