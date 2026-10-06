import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Pill, Plus, Calendar, User, Stethoscope, Printer } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { PrescriptionModal } from '../../components/modals/PrescriptionModal';
import { Prescription } from '../../types';

export function PrescriptionsView() {
  const { user } = useAuthStore();
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', user?.role, user?.uid],
    queryFn: () => {
      if (user?.role === 'patient') {
        return api.prescriptions.listForPatient(user.patient_id || user.uid);
      }
      return api.prescriptions.listForPatient('all');
    },
  });

  const prescriptions: Prescription[] = data?.items || [];
  const isDoctor = user?.role === 'doctor';

  const columns = [
    {
      header: 'Prescription Order',
      accessorKey: 'id',
      cell: (rx: Prescription) => (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">
              {rx.medicines?.map((m) => m.name).join(', ') || 'Medication list'}
            </p>
            <p className="text-xs text-zinc-400 font-mono">
              Issued: {formatDate(rx.created_at)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Patient & Doctor',
      cell: (rx: Prescription) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
            <User className="w-3 h-3 text-zinc-400" />
            {rx.patient_name || 'Patient'}
          </p>
          <p className="text-zinc-500 flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-zinc-400" />
            {rx.doctor_name || 'Physician'}
          </p>
        </div>
      ),
    },
    {
      header: 'Medications Count',
      cell: (rx: Prescription) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
          {rx.medicines?.length || 0} Meds
        </span>
      ),
    },
    {
      header: 'Instructions',
      accessorKey: 'instructions',
      cell: (rx: Prescription) => (
        <span className="text-xs text-zinc-500 max-w-xs truncate block">
          {rx.instructions || 'Standard administration'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (rx: Prescription) => (
        <button
          onClick={() => setSelectedRx(rx)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
        >
          View Prescription
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Prescriptions"
        description="Official prescription orders with pharmaceutical dosages, regimens, and clinician directions."
        actions={
          isDoctor ? (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue Prescription
            </button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={prescriptions}
        isLoading={isLoading}
        emptyMessage="No prescriptions on file."
      />

      {/* Prescription Detail Modal / Slip */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Electronic Prescription Slip"
        description={`Rx Number: ${selectedRx?.id}`}
        maxWidth="lg"
      >
        {selectedRx && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-teal-800 dark:text-teal-200">
                  ChedoCare Health Network
                </p>
                <p className="text-[11px] text-zinc-500">
                  Physician: {selectedRx.doctor_name || 'Dr. Robert Patel, MD'}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Patient: {selectedRx.patient_name || 'Patient'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-mono">Date Issued</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatDate(selectedRx.created_at)}
                </p>
              </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                Prescribed Drug Regimens
              </h4>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                {selectedRx.medicines?.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {m.name}{' '}
                        {m.dosage && (
                          <span className="text-teal-600 dark:text-teal-400 font-normal">
                            ({m.dosage})
                          </span>
                        )}
                      </p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Frequency: <strong>{m.frequency}</strong> · Duration:{' '}
                        <strong>{m.duration}</strong>
                      </p>
                    </div>
                    {m.instructions && (
                      <p className="text-zinc-600 dark:text-zinc-400 italic text-[11px] bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded">
                        {m.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedRx.instructions && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                  General Patient Instructions:
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">{selectedRx.instructions}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Rx Slip
              </button>
            </div>
          </div>
        )}
      </Modal>

      {isCreateOpen && (
        <PrescriptionModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          patientId="patient-001"
          patientName="Eleanor Vance"
        />
      )}
    </div>
  );
}
