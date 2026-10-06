import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, Plus, Phone, Mail, Trash2 } from 'lucide-react';
import { StaffModal } from '../../components/modals/StaffModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Staff } from '../../types';

export function StaffView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);

  const clinicId = user?.role === 'clinic' ? user?.clinic_id : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['staff', clinicId],
    queryFn: () => api.staff.list(clinicId),
  });

  const staffMembers: Staff[] = data?.items || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.staff.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setDeletingStaff(null);
    },
  });

  const columns = [
    {
      header: 'Staff Member Name',
      accessorKey: 'full_name',
      cell: (s: Staff) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 font-bold text-xs uppercase">
            {s.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{s.full_name}</p>
            <p className="text-xs text-zinc-400 capitalize">{s.role}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      cell: (s: Staff) => (
        <div className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            {s.email}
          </p>
          {s.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              {s.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Clinic',
      accessorKey: 'clinic_name',
      cell: (s: Staff) => (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {s.clinic_name || 'Main Facility'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (s: Staff) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (s: Staff) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setDeletingStaff(s)}
            className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Remove Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinic Staff Personnel"
        description="Administrative staff, front-desk receptionists, and patient care coordinators."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Staff Member
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={staffMembers}
        isLoading={isLoading}
        emptyMessage="No staff members registered for this clinic."
      />

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clinicId={clinicId}
      />

      <ConfirmDialog
        isOpen={!!deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onConfirm={() => deletingStaff && deleteMutation.mutate(deletingStaff.id)}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${deletingStaff?.full_name}?`}
        confirmText="Remove"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
