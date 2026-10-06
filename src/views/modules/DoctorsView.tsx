import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import {
  Stethoscope,
  Plus,
  Search,
  Star,
  Briefcase,
  Edit2,
  CalendarCheck,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { DoctorModal } from '../../components/modals/DoctorModal';
import { AppointmentFormModal } from '../../components/modals/AppointmentFormModal';
import { Doctor } from '../../types';

export function DoctorsView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  const { data: docData, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.doctors.list(),
  });

  const { data: specData } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => api.specializations.list(),
  });

  const doctors: Doctor[] = docData?.items || [];
  const specs = specData?.items || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      api.doctors.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });

  const canManage = ['admin', 'clinic'].includes(user?.role || '');

  const filteredDoctors = doctors.filter((doc) => {
    if (!doc) return false;
    const nameMatch = (doc.name || '').toLowerCase().includes(search.toLowerCase());
    const specMatch = (doc.specialization_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search.trim() || nameMatch || specMatch;
    const matchesSpec =
      selectedSpec === 'all' || doc.specialization_id === selectedSpec;
    return matchesSearch && matchesSpec;
  });

  const columns = [
    {
      header: 'Physician Name & Specialty',
      accessorKey: 'name',
      cell: (d: Doctor) => (
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 font-bold text-sm shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{d.name || 'Doctor'}</p>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              {d.specialization_name || 'General Practitioner'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{d.qualification || 'MD, Board Certified'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Experience & Practice',
      cell: (d: Doctor) => (
        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            {d.experience_years ?? 0} years clinical practice
          </p>
          <p className="text-zinc-500">
            {d.clinic_names && d.clinic_names.length > 0
              ? d.clinic_names.join(', ')
              : 'Metro Health Specialty Center'}
          </p>
        </div>
      ),
    },
    {
      header: 'Consultation Fee',
      accessorKey: 'consultation_fee',
      cell: (d: Doctor) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
          {formatCurrency(d.consultation_fee ?? 0)}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (d: Doctor) => {
        const ratingVal = Number(d.rating ?? d.rating_avg ?? 5.0);
        const count = d.review_count ?? d.rating_count ?? 0;
        return (
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{isNaN(ratingVal) ? '5.0' : ratingVal.toFixed(1)}</span>
            <span className="text-zinc-400 font-normal">({count})</span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (d: Doctor) => <StatusBadge status={d.status || 'active'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (d: Doctor) => (
        <div className="flex items-center justify-end gap-2">
          {/* Quick Book button */}
          <button
            onClick={() => setBookingDoctorId(d.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Book
          </button>

          {canManage && (
            <>
              <button
                onClick={() => {
                  setEditingDoctor(d);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Edit Doctor"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  statusMutation.mutate({
                    id: d.id,
                    status: d.status === 'active' ? 'inactive' : 'active',
                  })
                }
                className="px-2 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {d.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary fallbackTitle="Error loading Doctors directory">
      <div className="space-y-6">
        <PageHeader
          title="Physicians & Specialists"
          description="Credentials, clinical specialties, consultation rates, and patient review ratings."
          actions={
            canManage ? (
              <button
                onClick={() => {
                  setEditingDoctor(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Onboard Doctor
              </button>
            ) : undefined
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search by physician name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 font-medium">Specialty:</span>
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Specialties</option>
              {specs.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredDoctors}
          isLoading={isLoading}
          emptyMessage="No doctors found matching filters."
        />

        <DoctorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDoctor(null);
          }}
          doctor={editingDoctor}
        />

        {bookingDoctorId && (
          <AppointmentFormModal
            isOpen={!!bookingDoctorId}
            onClose={() => setBookingDoctorId(null)}
            preselectedDoctorId={bookingDoctorId}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
