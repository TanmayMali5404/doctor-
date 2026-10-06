/**
 * ChedoCare Health Types & Data Contracts
 */

export type Role = 'admin' | 'clinic' | 'doctor' | 'patient' | 'staff';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

export type AppointmentType = 'in_person' | 'video' | 'phone';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  role: Role;
  clinic_id?: string;
  doctor_id?: string;
  patient_id?: string;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  phone?: string;
}

export type User = UserProfile;

export interface ApiResponse<T = any> {
  success?: boolean;
  data: T;
  message?: string;
  error?: {
    code?: string;
    details?: any;
  };
  items?: T extends Array<any> ? T : any[];
}

export interface Clinic {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  timezone?: string;
  website?: string;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id?: string;
  user_uid?: string;
  name: string;
  email?: string;
  phone?: string;
  specialization_id: string;
  specialization_name: string;
  clinic_ids: string[];
  clinic_names?: string[];
  qualification?: string;
  experience_years?: number;
  consultation_fee: number;
  bio?: string;
  rating?: number;
  rating_avg?: number;
  review_count?: number;
  rating_count?: number;
  status: 'active' | 'inactive';
  created_at?: string;
  profile_image?: string;
  appointment_duration_minutes?: number;
  languages?: string[];
}

export interface BreakInterval {
  start_time: string;
  end_time: string;
}

export interface Schedule {
  id: string;
  doctor_id: string;
  clinic_id?: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  breaks: BreakInterval[];
  created_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityBlock {
  id: string;
  doctor_id: string;
  clinic_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  clinic_id: string;
  clinic_name: string;
  date: string;
  start_time: string;
  end_time: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  cancellation_reason?: string;
  rescheduled_from_id?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  appointment_id?: string;
  diagnosis: string;
  symptoms: string[];
  notes?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  appointment_id?: string;
  medicines: MedicineItem[];
  instructions?: string;
  notes?: string;
  created_at: string;
}

export interface Review {
  id: string;
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name?: string;
  clinic_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  clinic_id: string;
  clinic_name?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'receptionist' | 'manager' | 'coordinator';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'system' | 'reminder' | 'review' | 'prescription';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export type Notification = NotificationItem;

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminDashboardData {
  total_clinics: number;
  active_clinics: number;
  total_doctors: number;
  total_users: number;
  total_appointments: number;
  appointments_today: number;
  appointments_completed: number;
}

export interface ClinicDashboardData {
  total_doctors: number;
  today_appointments_count: number;
  upcoming_appointments_count: number;
  completed_appointments_count: number;
  cancelled_appointments_count: number;
  estimated_revenue: number;
}

export interface DoctorDashboardData {
  today_appointments: Appointment[];
  today_count: number;
  upcoming_count: number;
  completed_count: number;
  unique_patients: number;
}

export interface PatientDashboardData {
  upcoming_appointments: Appointment[];
  total_upcoming: number;
  total_completed: number;
  total_cancelled: number;
}
