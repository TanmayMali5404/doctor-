import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Stethoscope, AlertCircle } from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
}

export function DoctorModal({ isOpen, onClose, doctor }: DoctorModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!doctor;

  const [name, setName] = useState('');
  const [specializationId, setSpecializationId] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [consultationFee, setConsultationFee] = useState(120);
  const [clinicId, setClinicId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Specializations
  const { data: specData } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => api.specializations.list(),
  });
  const specs = specData?.items || [];

  // Fetch Clinics
  const { data: clinicData } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => api.clinics.list(),
  });
  const clinics = clinicData?.items || [];

  useEffect(() => {
    if (specs.length > 0 && !specializationId) {
      setSpecializationId(specs[0].id);
    }
    if (clinics.length > 0 && !clinicId) {
      setClinicId(clinics[0].id);
    }
  }, [specs, clinics, specializationId, clinicId]);

  useEffect(() => {
    if (doctor) {
      setName(doctor.name || '');
      setSpecializationId(doctor.specialization_id || '');
      setQualification(doctor.qualification || '');
      setExperienceYears(doctor.experience_years || 0);
      setConsultationFee(doctor.consultation_fee || 0);
      setClinicId(doctor.clinic_ids?.[0] || '');
      setEmail(doctor.email || '');
      setPhone(doctor.phone || '');
      setBio(doctor.bio || '');
    } else {
      setName('');
      setQualification('MD, Board Certified');
      setExperienceYears(5);
      setConsultationFee(120);
      setEmail('');
      setPhone('');
      setBio('');
    }
    setErrorMsg('');
  }, [doctor, isOpen]);

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      isEditing ? api.doctors.update(doctor!.id, data) : api.doctors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to save doctor.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specializationId) {
      setErrorMsg('Doctor full name and specialization are required.');
      return;
    }

    saveMutation.mutate({
      name,
      specialization_id: specializationId,
      qualification,
      experience_years: Number(experienceYears),
      consultation_fee: Number(consultationFee),
      clinic_id: clinicId,
      email,
      phone,
      bio,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Doctor Profile' : 'Onboard New Physician'}
      description="Manage credentials, clinical specialty, and consultation fee structure."
      maxWidth="lg"
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
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            Physician Full Name & Honorific
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Robert Patel, MD"
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Specialization
            </label>
            <select
              value={specializationId}
              onChange={(e) => setSpecializationId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            >
              {specs.map((sp: any) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Primary Clinic Affiliation
            </label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            >
              {clinics.map((cl: any) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Consultation Fee ($)
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 012-9900"
              className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Medical Qualifications & Degrees
          </label>
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            placeholder="MD, FACC - Harvard Medical School"
            className="w-full text-sm px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Professional Biography & Focus Areas
          </label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Clinical background, patient care philosophy, procedural specialties..."
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
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Doctor' : 'Save Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
