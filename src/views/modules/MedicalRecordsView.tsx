import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { FileText, Plus, Calendar, User, Stethoscope } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { MedicalRecordModal } from '../../components/modals/MedicalRecordModal';
import { Modal } from '../../components/common/Modal';
import { MedicalRecord } from '../../types';

export function MedicalRecordsView() {
  const { user } = useAuthStore();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch records
  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', user?.role, user?.uid],
    queryFn: () => {
      if (user?.role === 'patient') {
        return api.medicalRecords.listForPatient(user.patient_id || user.uid);
      }
      return api.medicalRecords.listForPatient('all');
    },
  });

  const records: MedicalRecord[] = data?.items || [];
  const isDoctor = user?.role === 'doctor';

  const columns = [
    {
      header: 'Diagnosis',
      accessorKey: 'diagnosis',
      cell: (r: MedicalRecord) => (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{r.diagnosis}</p>
            <p className="text-xs text-zinc-500">
              Recorded: {formatDate(r.created_at)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Patient & Doctor',
      cell: (r: MedicalRecord) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
            <User className="w-3 h-3 text-zinc-400" />
            {r.patient_name || 'Patient'}
          </p>
          <p className="text-zinc-500 flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-zinc-400" />
            {r.doctor_name || 'Physician'}
          </p>
        </div>
      ),
    },
    {
      header: 'Symptoms',
      accessorKey: 'symptoms',
      cell: (r: MedicalRecord) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {r.symptoms?.map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Follow-up Date',
      accessorKey: 'follow_up_date',
      cell: (r: MedicalRecord) => (
        <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          {r.follow_up_date ? formatDate(r.follow_up_date) : 'As needed'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r: MedicalRecord) => (
        <button
          onClick={() => setSelectedRecord(r)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Medical Records"
        description="Patient clinical evaluations, confirmed diagnoses, symptom history, and physician notes."
        actions={
          isDoctor ? (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Clinical Record
            </button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        emptyMessage="No medical records found."
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Clinical Consultation Record"
        description={`Record #${selectedRecord?.id}`}
        maxWidth="lg"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Primary Diagnosis
              </span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {selectedRecord.diagnosis}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <div>
                <span className="text-zinc-400">Patient:</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedRecord.patient_name || 'Patient'}
                </p>
              </div>
              <div>
                <span className="text-zinc-400">Consulting Physician:</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedRecord.doctor_name || 'Physician'}
                </p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Reported Symptoms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRecord.symptoms?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Clinical Examination Notes:
              </span>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {selectedRecord.notes || 'No detailed clinical notes attached.'}
              </div>
            </div>

            {selectedRecord.follow_up_date && (
              <div className="pt-2 text-zinc-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Follow-up Recommended: {formatDate(selectedRecord.follow_up_date)}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {isCreateOpen && (
        <MedicalRecordModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          patientId="patient-001"
          patientName="Eleanor Vance"
        />
      )}
    </div>
  );
}
