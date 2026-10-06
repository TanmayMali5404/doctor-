import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Tags, AlertCircle } from 'lucide-react';
import { Specialization } from '../../types';

interface SpecializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialization?: Specialization | null;
}

export function SpecializationModal({
  isOpen,
  onClose,
  specialization,
}: SpecializationModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!specialization;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (specialization) {
      setName(specialization.name || '');
      setDescription(specialization.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrorMsg('');
  }, [specialization, isOpen]);

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      isEditing
        ? api.specializations.update(specialization!.id, data)
        : api.specializations.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to save specialization.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg('Specialization title is required.');
      return;
    }
    saveMutation.mutate({ name, description });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Medical Specialization' : 'Add Clinical Specialization'}
      description="Define specialty categories for doctor profiles and patient search."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Tags className="w-3.5 h-3.5 text-teal-600" />
            Specialization Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ophthalmology, Oncology, Psychiatry"
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Clinical scope, organs, pathologies treated..."
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 resize-none"
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
            disabled={saveMutation.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create Specialization'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
