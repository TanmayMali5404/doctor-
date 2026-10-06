import { create } from 'zustand';
import { User, Role } from '../types';
import { api, DEFAULT_API_KEY, registerAuthErrorListener } from './api';

export interface PortalAccountConfig {
  role: Role;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  defaultEmail: string;
  defaultUid: string;
  defaultPassword: string;
  userName: string;
  userRoleDesc: string;
  keyFeatures: string[];
}

export const DEMO_ACCOUNTS_LIST = [
  {
    role: 'admin' as Role,
    name: 'Admin',
    personName: 'Dr. Arthur Mitchell',
    email: 'admin@chedocare.health',
    password: 'AdminSecurePassword2026!',
    badge: 'Platform Director',
    roleLabel: 'System Administrator',
  },
  {
    role: 'clinic' as Role,
    name: 'Clinic',
    personName: 'Metro Health Admin',
    email: 'admin@metrohealth.com',
    password: 'ClinicManager2026!',
    badge: 'Facility Ops',
    roleLabel: 'Clinic Manager',
  },
  {
    role: 'doctor' as Role,
    name: 'Doctor',
    personName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@metrohealth.com',
    password: 'DoctorPassword2026!',
    badge: 'Cardiologist',
    roleLabel: 'Specialist Physician',
  },
  {
    role: 'patient' as Role,
    name: 'Patient',
    personName: 'John Doe',
    email: 'john.doe@gmail.com',
    password: 'PatientUserPass2026!',
    badge: 'Patient Access',
    roleLabel: 'Registered Patient',
  },
  {
    role: 'staff' as Role,
    name: 'Staff',
    personName: 'Emily Clark',
    email: 'emily.clark@metrohealth.com',
    password: 'StaffReception2026!',
    badge: 'Front Desk',
    roleLabel: 'Clinical Receptionist',
  },
];

export const ACCOUNT_PORTALS: Record<Role, PortalAccountConfig> = {
  admin: {
    role: 'admin',
    title: 'System Administration Portal',
    shortTitle: 'Admin Portal',
    subtitle: 'Platform telemetry, cross-clinic oversight, and clinical service registries.',
    badge: 'Restricted Access · Level 5 Security',
    defaultEmail: 'admin@chedocare.health',
    defaultUid: 'admin-001',
    defaultPassword: 'AdminSecurePassword2026!',
    userName: 'Dr. Arthur Mitchell',
    userRoleDesc: 'Chief Medical & Platform Director',
    keyFeatures: ['Full Platform Audit', 'Clinics Verification', 'Specialization Directory', 'Global Metrics'],
  },
  clinic: {
    role: 'clinic',
    title: 'Clinic Operations & Management Portal',
    shortTitle: 'Clinic Portal',
    subtitle: 'Facility schedules, affiliated physicians, and daily patient queues.',
    badge: 'Authorized Facility Admin',
    defaultEmail: 'admin@metrohealth.com',
    defaultUid: 'clinic-user-1',
    defaultPassword: 'ClinicManager2026!',
    userName: 'Metro Health Admin',
    userRoleDesc: 'Clinic Operations Director',
    keyFeatures: ['Physician Duty Scheduling', 'Facility Bookings Queue', 'Staff Management', 'Daily Revenue'],
  },
  doctor: {
    role: 'doctor',
    title: 'Physician & Specialist Clinical Portal',
    shortTitle: 'Doctor Portal',
    subtitle: 'Daily patient appointments, consultation records, and digital prescriptions.',
    badge: 'Certified Medical Practitioner',
    defaultEmail: 'sarah.jenkins@metrohealth.com',
    defaultUid: 'doctor-user-1',
    defaultPassword: 'DoctorPassword2026!',
    userName: 'Dr. Sarah Jenkins',
    userRoleDesc: 'Consultant Cardiologist',
    keyFeatures: ['Patient Consultation Queue', 'Electronic Health Records', 'Rx Digital Prescriptions', 'Slot Availability'],
  },
  patient: {
    role: 'patient',
    title: 'Patient Care & Appointments Portal',
    shortTitle: 'Patient Portal',
    subtitle: 'Book specialist appointments, view prescriptions, and rate consultations.',
    badge: 'Patient Self-Service Access',
    defaultEmail: 'john.doe@gmail.com',
    defaultUid: 'patient-user-1',
    defaultPassword: 'PatientUserPass2026!',
    userName: 'John Doe',
    userRoleDesc: 'Registered Healthcare Patient',
    keyFeatures: ['Instant Slot Booking', 'Personal Health Records', 'Prescription Vault', 'Doctor Reviews'],
  },
  staff: {
    role: 'staff',
    title: 'Clinic Front Desk & Reception Portal',
    shortTitle: 'Staff Portal',
    subtitle: 'Patient arrivals triage, check-in registration, and scheduling desk.',
    badge: 'Front Desk Operations',
    defaultEmail: 'emily.clark@metrohealth.com',
    defaultUid: 'staff-user-1',
    defaultPassword: 'StaffReception2026!',
    userName: 'Emily Clark',
    userRoleDesc: 'Clinical Receptionist',
    keyFeatures: ['Patient Intake & Check-in', 'Real-time Arrival Queue', 'Reschedule & Cancellations', 'Doctor Calendar'],
  },
};

interface AuthState {
  apiKey: string;
  userId: string;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  authError: string | null;

  // Actions
  login: (apiKey: string, userId: string, expectedRole?: Role) => Promise<User>;
  loginWithUnified: (params: {
    identifier: string;
    password?: string;
    apiKey?: string;
  }) => Promise<User>;
  loginWithPortal: (params: {
    identifier: string;
    password?: string;
    role?: Role;
    apiKey?: string;
  }) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initAuth: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  apiKey: DEFAULT_API_KEY,
  userId: '',
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'light',
  authError: null,

  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('chedocare_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  login: async (apiKey: string, userId: string, expectedRole?: Role) => {
    set({ isLoading: true, authError: null });
    try {
      localStorage.setItem(
        'chedocare_auth',
        JSON.stringify({
          apiKey: apiKey.trim(),
          userId: userId.trim(),
        })
      );
      set({ apiKey: apiKey.trim(), userId: userId.trim() });

      const profile = await api.getMe();
      if (expectedRole && profile.role !== expectedRole) {
        throw new Error(
          `Unauthorized: Account has role "${profile.role}", but this portal is reserved for "${expectedRole}".`
        );
      }

      set({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return profile;
    } catch (err: any) {
      localStorage.removeItem('chedocare_auth');
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        authError: err?.message || 'Login failed. Please check your credentials.',
      });
      throw err;
    }
  },

  loginWithUnified: async ({ identifier, password, apiKey = DEFAULT_API_KEY }) => {
    set({ isLoading: true, authError: null });
    try {
      const res = await api.auth.login({
        identifier: identifier.trim(),
        password,
        api_key: apiKey.trim(),
      });

      const user = res.user;

      localStorage.setItem(
        'chedocare_auth',
        JSON.stringify({
          apiKey: apiKey.trim(),
          userId: user.uid,
        })
      );

      set({
        apiKey: apiKey.trim(),
        userId: user.uid,
        user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return user;
    } catch (err: any) {
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        authError: err?.message || 'Login failed. Please verify credentials.',
      });
      throw err;
    }
  },

  loginWithPortal: async ({ identifier, password, role, apiKey = DEFAULT_API_KEY }) => {
    set({ isLoading: true, authError: null });
    try {
      const res = await api.auth.login({
        identifier: identifier.trim(),
        password,
        role,
        api_key: apiKey.trim(),
      });

      const user = res.user;
      if (role && user.role !== role) {
        throw new Error(`Unauthorized: Account belongs to "${user.role}" portal, not "${role}".`);
      }

      localStorage.setItem(
        'chedocare_auth',
        JSON.stringify({
          apiKey: apiKey.trim(),
          userId: user.uid,
        })
      );

      set({
        apiKey: apiKey.trim(),
        userId: user.uid,
        user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return user;
    } catch (err: any) {
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        authError: err?.message || 'Login failed. Please verify credentials.',
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('chedocare_auth');
    set({
      userId: '',
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
    });
  },

  initAuth: async () => {
    // Check theme
    const savedTheme = (localStorage.getItem('chedocare_theme') as 'light' | 'dark') || 'light';
    get().setTheme(savedTheme);

    // Read stored auth
    const stored = localStorage.getItem('chedocare_auth');
    if (!stored) {
      // Do not auto-login to any account; present explicit dedicated portal logins
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const { apiKey, userId } = JSON.parse(stored);
      if (apiKey && userId) {
        set({ apiKey, userId });
        const profile = await api.getMe();
        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (err) {
      console.warn('Failed to restore session:', err);
      localStorage.removeItem('chedocare_auth');
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  fetchCurrentUser: async () => {
    await get().initAuth();
  },
}));

// Register error listener
registerAuthErrorListener((type) => {
  if (type === 'unauthorized') {
    useAuthStore.getState().logout();
  }
});

// Role helper
export function canAccess(userRole?: Role, allowedRoles?: Role[]): boolean {
  if (!userRole) return false;
  if (userRole === 'admin') return true;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}
