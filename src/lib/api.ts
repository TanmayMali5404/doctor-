import { ApiResponse } from '../types';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code = 'API_ERROR', status = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Global listener for auth expired or forbidden
type AuthErrorCallback = (type: 'unauthorized' | 'forbidden') => void;
let authErrorListener: AuthErrorCallback | null = null;

export function registerAuthErrorListener(listener: AuthErrorCallback) {
  authErrorListener = listener;
}

const getApiBaseUrl = () => {
  // Check browser envs or fallback to /api/v1
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL);
  return envUrl || '/api/v1';
};

export const DEFAULT_API_KEY = 'chedotech-dev-key-2026';

export function getStoredAuth(): { apiKey: string; userId: string } {
  try {
    const raw = localStorage.getItem('chedocare_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey || DEFAULT_API_KEY,
        userId: parsed.userId || '',
      };
    }
  } catch (err) {
    // ignore
  }
  return { apiKey: DEFAULT_API_KEY, userId: '' };
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const { apiKey, userId } = getStoredAuth();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey || DEFAULT_API_KEY,
  };

  if (userId) {
    headers['X-User-ID'] = userId;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  // Merge custom headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    throw new ApiError(
      networkError?.message || 'Network connection failed. Please check your network and API server.',
      'NETWORK_ERROR',
      0
    );
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch (e) {
    throw new ApiError(`Server returned status ${response.status}`, 'HTTP_ERROR', response.status);
  }

  if (!response.ok || !json.success) {
    if (response.status === 401 && authErrorListener) {
      authErrorListener('unauthorized');
    } else if (response.status === 403 && authErrorListener) {
      authErrorListener('forbidden');
    }

    const code = json.error?.code || (response.status === 409 ? 'CONFLICT' : 'REQUEST_FAILED');
    const msg = json.message || 'Request failed';
    throw new ApiError(msg, code, response.status, json.error?.details);
  }

  return json.data;
}

export const api = {
  // System
  health: () => request<{ service: string; status: string }>('/health'),
  seed: () => request<{ specializations_seeded: number }>('/seed', { method: 'POST' }),

  // Auth & Profile
  auth: {
    login: (data: { identifier: string; password?: string; role?: string; api_key?: string }) =>
      request<{ user: any; apiKey: string; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  getMe: () => request<any>('/me'),
  updateProfile: (data: { full_name?: string; phone?: string; photo_url?: string }) =>
    request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Clinics
  clinics: {
    list: (params?: { city?: string; status?: string; search?: string; page_size?: number }) => {
      const q = new URLSearchParams();
      if (params?.city) q.set('city', params.city);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.page_size) q.set('page_size', String(params.page_size));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return request<{ items: any[]; count: number }>(`/clinics${queryString}`);
    },
    get: (clinicId: string) => request<any>(`/clinics/${clinicId}`),
    create: (data: any) =>
      request<any>('/clinics', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (clinicId: string, data: any) =>
      request<any>(`/clinics/${clinicId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    patchStatus: (clinicId: string, status: string) =>
      request<{ clinic_id: string; status: string }>(`/clinics/${clinicId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateStatus: (clinicId: string, status: string) =>
      request<{ clinic_id: string; status: string }>(`/clinics/${clinicId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Doctors
  doctors: {
    list: (params?: {
      specialization_id?: string;
      clinic_id?: string;
      status?: string;
      search?: string;
      page_size?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.specialization_id) q.set('specialization_id', params.specialization_id);
      if (params?.clinic_id) q.set('clinic_id', params.clinic_id);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.page_size) q.set('page_size', String(params.page_size));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return request<{ items: any[]; count: number }>(`/doctors${queryString}`);
    },
    get: (doctorId: string) => request<any>(`/doctors/${doctorId}`),
    create: (data: any) =>
      request<any>('/doctors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (doctorId: string, data: any) =>
      request<any>(`/doctors/${doctorId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    patchStatus: (doctorId: string, status: string) =>
      request<{ doctor_id: string; status: string }>(`/doctors/${doctorId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateStatus: (doctorId: string, status: string) =>
      request<{ doctor_id: string; status: string }>(`/doctors/${doctorId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Specializations
  specializations: {
    list: () => request<{ items: any[] }>('/specializations'),
    create: (data: { name: string; description?: string }) =>
      request<any>('/specializations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name: string; description?: string }) =>
      request<any>(`/specializations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/specializations/${id}`, {
        method: 'DELETE',
      }),
  },

  // Patients
  patients: {
    list: () => request<{ items: any[] }>('/patients'),
    get: (patientId: string) => request<any>(`/patients/${patientId}`),
    update: (patientId: string, data: any) =>
      request<any>(`/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Staff
  staff: {
    list: (clinicId?: string) => {
      const q = clinicId ? `?clinic_id=${clinicId}` : '';
      return request<{ items: any[] }>(`/staff${q}`);
    },
    create: (data: any) =>
      request<any>('/staff', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/staff/${id}`, {
        method: 'DELETE',
      }),
  },

  // Schedules
  schedules: {
    list: (doctorId: string, clinicId?: string) => {
      const q = clinicId ? `?clinic_id=${clinicId}` : '';
      return request<{ items: any[] }>(`/doctors/${doctorId}/schedules${q}`);
    },
    getForDoctor: (doctorId: string, clinicId?: string) => {
      const q = clinicId ? `?clinic_id=${clinicId}` : '';
      return request<{ items: any[] }>(`/doctors/${doctorId}/schedules${q}`);
    },
    create: (doctorId: string, data: any) =>
      request<any>(`/doctors/${doctorId}/schedules`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/schedules/${id}`, {
        method: 'DELETE',
      }),
  },

  // Availability
  availability: {
    get: (doctorId: string, date: string, clinicId?: string) => {
      const q = new URLSearchParams({ date });
      if (clinicId) q.set('clinic_id', clinicId);
      return request<{
        doctor_id: string;
        clinic_id: string;
        date: string;
        slots: Array<{
          date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          is_available: boolean;
        }>;
      }>(`/doctors/${doctorId}/availability?${q.toString()}`);
    },
    block: (doctorId: string, data: {
      date: string;
      start_time: string;
      end_time: string;
      clinic_id?: string;
      reason?: string;
    }) =>
      request<any>(`/doctors/${doctorId}/availability/block`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Appointments
  appointments: {
    create: (data: {
      doctor_id: string;
      clinic_id: string;
      date: string;
      start_time: string;
      duration_minutes?: number;
      appointment_type?: string;
      reason?: string;
      patient_id?: string;
      patient_name?: string;
      notes?: string;
    }, idempotencyKey?: string) =>
      request<any>('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
        idempotencyKey,
      }),
    list: (params?: { status?: string; date?: string; page?: number; limit?: number; page_size?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.date) q.set('date', params.date);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.page_size) q.set('page_size', String(params.page_size));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return request<{ items: any[]; count: number; pagination?: { total: number; page: number; limit: number; pages: number } }>(`/appointments${queryString}`);
    },
    get: (appointmentId: string) => request<any>(`/appointments/${appointmentId}`),
    confirm: (appointmentId: string) =>
      request<any>(`/appointments/${appointmentId}/confirm`, {
        method: 'POST',
      }),
    cancel: (appointmentId: string, reason?: string) =>
      request<any>(`/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    reschedule: (appointmentId: string, newDate: string, newStartTime: string) =>
      request<any>(`/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ new_date: newDate, new_start_time: newStartTime }),
      }),
    complete: (appointmentId: string) =>
      request<any>(`/appointments/${appointmentId}/complete`, {
        method: 'POST',
      }),
    noShow: (appointmentId: string) =>
      request<any>(`/appointments/${appointmentId}/no-show`, {
        method: 'POST',
      }),
  },

  // Medical Records
  medicalRecords: {
    create: (data: {
      patient_id: string;
      appointment_id?: string;
      diagnosis: string;
      symptoms?: string[];
      notes?: string;
      follow_up_date?: string;
      clinic_id?: string;
    }) =>
      request<any>('/medical-records', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listForPatient: (patientId: string) =>
      request<{ items: any[] }>(`/patients/${patientId}/medical-records`),
  },

  // Prescriptions
  prescriptions: {
    create: (data: {
      patient_id: string;
      appointment_id?: string;
      medicines: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
      }>;
      instructions?: string;
      notes?: string;
      clinic_id?: string;
    }) =>
      request<any>('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listForPatient: (patientId: string) =>
      request<{ items: any[] }>(`/patients/${patientId}/prescriptions`),
  },

  // Reviews
  reviews: {
    list: (doctorId?: string) => {
      const q = doctorId ? `?doctor_id=${doctorId}` : '';
      return request<{ items: any[] }>(`/reviews${q}`);
    },
    create: (data: {
      appointment_id: string;
      rating: number;
      comment?: string;
    }) =>
      request<any>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getForDoctor: (doctorId: string) =>
      request<{ items: any[] }>(`/doctors/${doctorId}/reviews`),
    getForClinic: (clinicId: string) =>
      request<{ items: any[] }>(`/clinics/${clinicId}/reviews`),
  },

  // Notifications
  notifications: {
    list: () => request<{ items: any[] }>('/notifications'),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
  },

  // Dashboards
  dashboards: {
    getPatient: () => request<any>('/dashboard/patient'),
    getDoctor: () => request<any>('/dashboard/doctor'),
    getClinic: (clinicId?: string) => {
      const q = clinicId ? `?clinic_id=${clinicId}` : '';
      return request<any>(`/dashboard/clinic${q}`);
    },
    getAdmin: () => request<any>('/dashboard/admin'),
  },
};
