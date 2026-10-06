import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { UserCheck, Search, Phone, Mail, Heart, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Patient } from '../../types';

export function PatientsView() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.patients.list(),
  });

  const patients: Patient[] = data?.items || [];

  const filteredPatients = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Patient Profile',
      accessorKey: 'full_name',
      cell: (p: Patient) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase">
            {p.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{p.full_name}</p>
            <p className="text-xs text-zinc-400 capitalize">{p.gender || 'Not specified'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (p: Patient) => (
        <div className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            {p.email}
          </p>
          {p.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              {p.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessorKey: 'blood_group',
      cell: (p: Patient) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
          <Heart className="w-3 h-3 fill-rose-500" />
          {p.blood_group || 'O+'}
        </span>
      ),
    },
    {
      header: 'Date of Birth',
      accessorKey: 'date_of_birth',
      cell: (p: Patient) => (
        <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          {p.date_of_birth ? formatDate(p.date_of_birth) : '1992-06-15'}
        </span>
      ),
    },
    {
      header: 'Emergency Contact',
      cell: (p: Patient) => (
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            {p.emergency_contact_name || 'Spouse / Family'}
          </p>
          <p className="text-zinc-400">{p.emergency_contact_phone || '+1 (555) 019-9944'}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Patients Directory"
        description="Patient demographic records, emergency contacts, and vital medical history identifiers."
      />

      <div className="flex items-center gap-2 max-w-sm bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <Search className="w-4 h-4 text-zinc-400 ml-2" />
        <input
          type="text"
          placeholder="Search patients by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent border-none text-zinc-900 dark:text-zinc-100 focus:outline-none"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPatients}
        isLoading={isLoading}
        emptyMessage="No registered patients found."
      />
    </div>
  );
}
