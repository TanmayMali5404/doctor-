import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import {
  Building2,
  Stethoscope,
  Users,
  CalendarCheck,
  CheckCircle2,
  Plus,
  Database,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { ClinicModal } from '../../components/modals/ClinicModal';
import { DoctorModal } from '../../components/modals/DoctorModal';
import { SpecializationModal } from '../../components/modals/SpecializationModal';

export function AdminDashboard({ onNavigate }: { onNavigate: (viewId: string) => void }) {
  const queryClient = useQueryClient();
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const { data: adminData, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => api.dashboards.getAdmin(),
  });

  const { data: healthData } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => api.health(),
  });

  const seedMutation = useMutation({
    mutationFn: () => api.seed(),
    onSuccess: (data) => {
      setSeedStatus(`Successfully verified/seeded ${data.specializations_seeded} specializations.`);
      queryClient.invalidateQueries();
      setTimeout(() => setSeedStatus(null), 4000);
    },
    onError: (err: any) => {
      setSeedStatus(`Seed error: ${err?.message}`);
      setTimeout(() => setSeedStatus(null), 4000);
    },
  });

  const stats = adminData || {
    total_clinics: 0,
    active_clinics: 0,
    total_doctors: 0,
    total_users: 0,
    total_appointments: 0,
    appointments_today: 0,
    appointments_completed: 0,
  };

  const chartData = [
    { name: 'Mon', bookings: 12 },
    { name: 'Tue', bookings: 19 },
    { name: 'Wed', bookings: 15 },
    { name: 'Thu', bookings: 22 },
    { name: 'Fri', bookings: 28 },
    { name: 'Sat', bookings: 14 },
    { name: 'Sun', bookings: 8 },
  ];

  const pieData = [
    { name: 'Active Clinics', value: stats.active_clinics || 1, color: '#0d9488' },
    { name: 'Pending Clinics', value: Math.max(0, stats.total_clinics - stats.active_clinics), color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration Overview"
        description="Global system telemetry, multi-clinic verification, and health services management."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            API Operational
          </span>
        }
        actions={
          <>
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 shadow-xs transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              {seedMutation.isPending ? 'Seeding...' : 'Seed Master Data'}
            </button>
            <button
              onClick={() => setIsClinicModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Clinic
            </button>
          </>
        }
      />

      {seedStatus && (
        <div className="p-3 text-xs rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
          <span>{seedStatus}</span>
          <button onClick={() => setSeedStatus(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clinics"
          value={isLoading ? '—' : stats.total_clinics}
          subtitle={`${stats.active_clinics} Verified Active`}
          icon={Building2}
          color="teal"
        />
        <StatCard
          title="Medical Doctors"
          value={isLoading ? '—' : stats.total_doctors}
          subtitle="Across all affiliated clinics"
          icon={Stethoscope}
          color="blue"
        />
        <StatCard
          title="Registered Users"
          value={isLoading ? '—' : stats.total_users}
          subtitle="Patients, doctors, staff & admins"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Appointments"
          value={isLoading ? '—' : stats.total_appointments}
          subtitle={`${stats.appointments_today} Booked for Today`}
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Analytics & System Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Volume Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Weekly Consultation Volume
              </h3>
              <p className="text-xs text-zinc-500">Platform-wide patient appointments</p>
            </div>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
              Live Trends
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="bookings" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinic Status Breakdown & System Health */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Clinic Verification Distribution
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Verified active vs pending clinics</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  Active Clinics
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.active_clinics}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Pending Review
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {Math.max(0, stats.total_clinics - stats.active_clinics)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs flex items-center justify-between text-zinc-500">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              API: {healthData?.status || 'Active'}
            </span>
            <span className="font-mono text-[10px]">Cloud Functions 2nd Gen</span>
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('clinics')}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 transition-colors">
                Manage Clinics
              </h4>
              <p className="text-[11px] text-zinc-500">Inspect licenses & approve registrations</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('doctors')}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                Doctor Registry
              </h4>
              <p className="text-[11px] text-zinc-500">Verify licenses, fees, and specialties</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('specializations')}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition-colors">
                Specializations Master
              </h4>
              <p className="text-[11px] text-zinc-500">Clinical taxonomies & departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClinicModal
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
      />
      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
      />
      <SpecializationModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
}
