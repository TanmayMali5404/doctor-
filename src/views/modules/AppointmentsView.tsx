import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import {
  CalendarCheck,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  FileText,
  Pill,
} from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import { AppointmentFormModal } from '../../components/modals/AppointmentFormModal';
import { RescheduleModal } from '../../components/modals/RescheduleModal';
import { CancelModal } from '../../components/modals/CancelModal';
import { ReviewModal } from '../../components/modals/ReviewModal';
import { MedicalRecordModal } from '../../components/modals/MedicalRecordModal';
import { PrescriptionModal } from '../../components/modals/PrescriptionModal';
import { Appointment, AppointmentStatus } from '../../types';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export function AppointmentsView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isRxOpen, setIsRxOpen] = useState(false);

  // Fetch appointments with query params
  const { data, isLoading } = useQuery({
    queryKey: ['appointments', { status: statusFilter, date: dateFilter, page, search }],
    queryFn: () =>
      api.appointments.list({
        status: statusFilter === 'all' ? undefined : (statusFilter as AppointmentStatus),
        date: dateFilter || undefined,
        page,
        limit: pageSize,
      }),
  });

  const appointments: Appointment[] = data?.items || [];
  const totalCount = data?.pagination?.total || appointments.length;

  // Filter in client by search keyword (doctor name, patient name, clinic name)
  const filteredAppointments = appointments.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.patient_name?.toLowerCase().includes(q) ||
      a.doctor_name?.toLowerCase().includes(q) ||
      a.clinic_name?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q)
    );
  });

  // Action mutations
  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.appointments.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.appointments.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => api.appointments.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const role = user?.role || 'patient';
  const canConfirm = ['admin', 'clinic', 'doctor', 'staff'].includes(role);
  const canComplete = ['admin', 'clinic', 'doctor', 'staff'].includes(role);

  const columns = [
    {
      header: 'Patient',
      accessorKey: 'patient_name',
      cell: (item: Appointment) => (
        <div>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">{item.patient_name || 'Patient'}</p>
          <p className="text-xs text-zinc-400 capitalize">
            {(item.appointment_type || 'consultation').replace(/_/g, ' ')}
          </p>
        </div>
      ),
    },
    {
      header: 'Doctor & Clinic',
      cell: (item: Appointment) => (
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.doctor_name || 'Doctor'}</p>
          <p className="text-xs text-zinc-400">{item.clinic_name || 'Clinic'}</p>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      cell: (item: Appointment) => (
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-200">{formatDate(item.date)}</p>
          <p className="text-xs text-zinc-400 font-mono">
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </p>
        </div>
      ),
    },
    {
      header: 'Reason / Chief Complaint',
      accessorKey: 'reason',
      cell: (item: Appointment) => (
        <span className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate block">
          {item.reason}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: Appointment) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: Appointment) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {/* Confirm Button */}
          {canConfirm && item.status === 'pending' && (
            <button
              onClick={() => confirmMutation.mutate(item.id)}
              disabled={confirmMutation.isPending}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              Confirm
            </button>
          )}

          {/* Complete Button */}
          {canComplete && ['confirmed', 'rescheduled', 'pending'].includes(item.status) && (
            <button
              onClick={() => completeMutation.mutate(item.id)}
              disabled={completeMutation.isPending}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
            >
              Complete
            </button>
          )}

          {/* Reschedule Button */}
          {['pending', 'confirmed', 'rescheduled'].includes(item.status) && (
            <button
              onClick={() => {
                setSelectedAppt(item);
                setIsRescheduleOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Reschedule
            </button>
          )}

          {/* Cancel Button */}
          {['pending', 'confirmed', 'rescheduled'].includes(item.status) && (
            <button
              onClick={() => {
                setSelectedAppt(item);
                setIsCancelOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Doctor clinical actions */}
          {role === 'doctor' && (
            <>
              <button
                onClick={() => {
                  setSelectedAppt(item);
                  setIsRecordOpen(true);
                }}
                title="Create Medical Record"
                className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedAppt(item);
                  setIsRxOpen(true);
                }}
                title="Issue Prescription"
                className="p-1.5 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
              >
                <Pill className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Patient review for completed visit */}
          {role === 'patient' && item.status === 'completed' && (
            <button
              onClick={() => {
                setSelectedAppt(item);
                setIsReviewOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
            >
              <Star className="w-3 h-3 fill-white" />
              Review
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary fallbackTitle="Error loading Appointments">
      <div className="space-y-6">
      <PageHeader
        title="Consultation Appointments"
        description="Comprehensive schedule of clinical visits, telehealth calls, and appointment statuses."
        actions={
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Book Appointment
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search patient, doctor, clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-rose-500 hover:underline font-semibold"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredAppointments}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: totalCount,
          onPageChange: (p) => setPage(p),
        }}
        emptyMessage="No consultation appointments found matching your search or filters."
      />

      {/* Modals */}
      <AppointmentFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedAppt(null);
        }}
        appointment={selectedAppt}
      />
      <CancelModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedAppt(null);
        }}
        appointment={selectedAppt}
      />
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setSelectedAppt(null);
        }}
        appointment={selectedAppt}
      />
      {selectedAppt && (
        <>
          <MedicalRecordModal
            isOpen={isRecordOpen}
            onClose={() => {
              setIsRecordOpen(false);
              setSelectedAppt(null);
            }}
            patientId={selectedAppt.patient_id}
            patientName={selectedAppt.patient_name}
            appointmentId={selectedAppt.id}
          />
          <PrescriptionModal
            isOpen={isRxOpen}
            onClose={() => {
              setIsRxOpen(false);
              setSelectedAppt(null);
            }}
            patientId={selectedAppt.patient_id}
            patientName={selectedAppt.patient_name}
            appointmentId={selectedAppt.id}
          />
        </>
      )}
    </div>
    </ErrorBoundary>
  );
}
