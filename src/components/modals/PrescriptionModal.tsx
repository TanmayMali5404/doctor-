import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Plus, Trash2, Pill, AlertCircle } from 'lucide-react';
import { MedicineItem } from '../../types';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
  appointmentId?: string;
}

export function PrescriptionModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  appointmentId,
}: PrescriptionModalProps) {
  const queryClient = useQueryClient();
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      name: '',
      dosage: '',
      frequency: 'Once daily',
      duration: '7 days',
      instructions: 'After food with water',
    },
  ]);
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.prescriptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to issue prescription.');
    },
  });

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '',
        frequency: 'Twice daily',
        duration: '7 days',
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index: number, field: keyof MedicineItem, val: string) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMeds = medicines.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0) {
      setErrorMsg('Please specify at least one medication name.');
      return;
    }

    createMutation.mutate({
      patient_id: patientId,
      appointment_id: appointmentId,
      medicines: validMeds,
      instructions: generalInstructions,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Digital Prescription"
      description={`Prescription order for ${patientName || patientId}.`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Prescribed Medications
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medication
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                    #{idx + 1} Medication
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Medication Name (e.g. Amoxicillin)"
                      value={med.name}
                      onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 3x/day)"
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 7 days)"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Specific Instructions (e.g. After food with plenty of water)"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Dietary & Lifestyle Instructions
          </label>
          <textarea
            rows={2}
            value={generalInstructions}
            onChange={(e) => setGeneralInstructions(e.target.value)}
            placeholder="e.g. Drink 2.5L water daily, avoid strenuous activity for 48 hours..."
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
            type="submit"
            disabled={createMutation.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50"
          >
            {createMutation.isPending ? 'Generating...' : 'Issue Prescription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
