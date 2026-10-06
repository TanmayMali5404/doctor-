import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';
import { SpecializationModal } from '../../components/modals/SpecializationModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Specialization } from '../../types';

export function SpecializationsView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specialization | null>(null);
  const [deletingSpec, setDeletingSpec] = useState<Specialization | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => api.specializations.list(),
  });

  const specs: Specialization[] = data?.items || [];
  const isAdmin = user?.role === 'admin';

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.specializations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      setDeletingSpec(null);
    },
  });

  const columns = [
    {
      header: 'Specialization Name',
      accessorKey: 'name',
      cell: (s: Specialization) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
            <Tags className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{s.name}</p>
            <p className="text-xs text-zinc-500 font-mono">ID: {s.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Scope & Clinical Description',
      accessorKey: 'description',
      cell: (s: Specialization) => (
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {s.description || 'Specialized clinical branch'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (s: Specialization) => <StatusBadge status={s.status || 'active'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (s: Specialization) => (
        <div className="flex items-center justify-end gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setEditingSpec(s);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-teal-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingSpec(s)}
                className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Specializations"
        description="Master taxonomies of medical specialties used across physician profiles and patient booking."
        actions={
          isAdmin ? (
            <button
              onClick={() => {
                setEditingSpec(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Specialization
            </button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={specs}
        isLoading={isLoading}
        emptyMessage="No specializations defined."
      />

      <SpecializationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSpec(null);
        }}
        specialization={editingSpec}
      />

      <ConfirmDialog
        isOpen={!!deletingSpec}
        onClose={() => setDeletingSpec(null)}
        onConfirm={() => deletingSpec && deleteMutation.mutate(deletingSpec.id)}
        title="Deactivate Specialization"
        message={`Are you sure you want to deactivate ${deletingSpec?.name}? Doctors currently linked will remain intact.`}
        confirmText="Deactivate"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
