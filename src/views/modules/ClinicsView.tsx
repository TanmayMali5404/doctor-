import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  CheckCircle,
  Ban,
} from 'lucide-react';
import { ClinicModal } from '../../components/modals/ClinicModal';
import { Clinic } from '../../types';

export function ClinicsView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => api.clinics.list(),
  });

  const clinics: Clinic[] = data?.items || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      api.clinics.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const isAdmin = user?.role === 'admin';

  const filteredClinics = clinics.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Clinic Name & Location',
      accessorKey: 'name',
      cell: (c: Clinic) => (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{c.name}</p>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-zinc-400" />
              {c.address ? `${c.address}, ` : ''}
              {c.city}, {c.state} {c.pincode}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Information',
      cell: (c: Clinic) => (
        <div className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-zinc-400" />
            {c.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-zinc-400" />
            {c.email}
          </p>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (c: Clinic) => (
        <span className="text-xs text-zinc-500 max-w-xs truncate block">
          {c.description || 'General & Multi-specialty medical facility.'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (c: Clinic) => <StatusBadge status={c.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (c: Clinic) => (
        <div className="flex items-center justify-end gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setEditingClinic(c);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Edit Clinic"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {c.status === 'active' ? (
                <button
                  onClick={() => statusMutation.mutate({ id: c.id, status: 'suspended' })}
                  disabled={statusMutation.isPending}
                  className="px-2 py-1 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  title="Suspend Clinic"
                >
                  <Ban className="w-3.5 h-3.5 inline mr-1" />
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => statusMutation.mutate({ id: c.id, status: 'active' })}
                  disabled={statusMutation.isPending}
                  className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  title="Reactivate Clinic"
                >
                  <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                  Activate
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Clinics Directory"
        description="Comprehensive directory of registered outpatient centers, multi-specialty clinics, and health facilities."
        actions={
          isAdmin ? (
            <button
              onClick={() => {
                setEditingClinic(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Register New Clinic
            </button>
          ) : undefined
        }
      />

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <Search className="w-4 h-4 text-zinc-400 ml-2" />
        <input
          type="text"
          placeholder="Search clinics by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent border-none text-zinc-900 dark:text-zinc-100 focus:outline-none"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredClinics}
        isLoading={isLoading}
        emptyMessage="No clinics found."
      />

      <ClinicModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClinic(null);
        }}
        clinic={editingClinic}
      />
    </div>
  );
}
