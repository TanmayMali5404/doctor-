import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-API-Key, X-User-ID, X-Setup-Secret');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const API_SECRET_KEY = 'chedotech-dev-key-2026';

// -----------------------------------------------------------------------------
// In-Memory Database (Seeded with realistic production data)
// -----------------------------------------------------------------------------
interface DbSchema {
  users: Record<string, any>;
  clinics: Record<string, any>;
  doctors: Record<string, any>;
  specializations: Record<string, any>;
  patients: Record<string, any>;
  staff: Record<string, any>;
  schedules: Record<string, any>;
  availability: Record<string, any>;
  clinic_holidays: Record<string, any>;
  doctor_leaves: Record<string, any>;
  appointments: Record<string, any>;
  appointment_history: Record<string, any>;
  medical_records: Record<string, any>;
  prescriptions: Record<string, any>;
  reviews: Record<string, any>;
  notifications: Record<string, any>;
  audit_logs: Record<string, any>;
  idempotency_keys: Record<string, any>;
}

const _now = new Date();
const _todayDate = _now.toISOString().split('T')[0];
const _yesterdayDate = new Date(_now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const _tomorrowDate = new Date(_now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const _dayAfterDate = new Date(_now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const _nextWeekDate = new Date(_now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const db: DbSchema = {
  users: {
    'admin-001': {
      uid: 'admin-001',
      email: 'admin@chedocare.health',
      full_name: 'Dr. Arthur Mitchell',
      role: 'admin',
      is_active: true,
      created_at: new Date('2025-01-01').toISOString(),
    },
    'clinic-user-1': {
      uid: 'clinic-user-1',
      email: 'admin@metrohealth.com',
      full_name: 'Metro Health Admin',
      role: 'clinic',
      clinic_id: 'clinic-1',
      is_active: true,
      created_at: new Date('2025-01-10').toISOString(),
    },
    'doctor-user-1': {
      uid: 'doctor-user-1',
      email: 'sarah.jenkins@metrohealth.com',
      full_name: 'Dr. Sarah Jenkins',
      role: 'doctor',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      is_active: true,
      created_at: new Date('2025-01-15').toISOString(),
    },
    'patient-user-1': {
      uid: 'patient-user-1',
      email: 'john.doe@gmail.com',
      full_name: 'John Doe',
      role: 'patient',
      patient_id: 'patient-user-1',
      is_active: true,
      created_at: new Date('2025-02-01').toISOString(),
    },
    'staff-user-1': {
      uid: 'staff-user-1',
      email: 'emily.clark@metrohealth.com',
      full_name: 'Emily Clark',
      role: 'staff',
      clinic_id: 'clinic-1',
      staff_id: 'staff-1',
      is_active: true,
      created_at: new Date('2025-02-05').toISOString(),
    },
    'patient-user-2': {
      uid: 'patient-user-2',
      email: 'sophia.w@example.com',
      full_name: 'Sophia Williams',
      role: 'patient',
      patient_id: 'patient-user-2',
      is_active: true,
      created_at: new Date('2025-02-10').toISOString(),
    },
    'patient-user-3': {
      uid: 'patient-user-3',
      email: 'marcus.vance@example.com',
      full_name: 'Marcus Vance',
      role: 'patient',
      patient_id: 'patient-user-3',
      is_active: true,
      created_at: new Date('2025-02-15').toISOString(),
    },
    'patient-user-4': {
      uid: 'patient-user-4',
      email: 'elena.rostova@example.com',
      full_name: 'Elena Rostova',
      role: 'patient',
      patient_id: 'patient-user-4',
      is_active: true,
      created_at: new Date('2025-02-20').toISOString(),
    },
    'patient-user-5': {
      uid: 'patient-user-5',
      email: 'david.kim@example.com',
      full_name: 'David Kim',
      role: 'patient',
      patient_id: 'patient-user-5',
      is_active: true,
      created_at: new Date('2025-02-22').toISOString(),
    },
    'patient-user-6': {
      uid: 'patient-user-6',
      email: 'priya.patel@example.com',
      full_name: 'Priya Patel',
      role: 'patient',
      patient_id: 'patient-user-6',
      is_active: true,
      created_at: new Date('2025-02-25').toISOString(),
    },
  },
  clinics: {
    'clinic-1': {
      id: 'clinic-1',
      name: 'Metro Health Specialty Center',
      description: 'Comprehensive multi-specialty outpatient and diagnostic care center with modern equipment and compassionate doctors.',
      phone: '+1 (415) 555-0199',
      email: 'contact@metrohealth.com',
      address: '742 Evergreen Medical Blvd, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      pincode: '94107',
      website: 'https://metrohealth.example.com',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&q=80',
      status: 'active',
      timezone: 'America/Los_Angeles',
      owner_uid: 'clinic-user-1',
      created_at: '2025-01-10T08:00:00.000Z',
    },
    'clinic-2': {
      id: 'clinic-2',
      name: 'Apex Care Cardiology & Wellness',
      description: 'Pioneering cardiovascular and preventive healthcare facility with advanced diagnostics.',
      phone: '+1 (408) 555-0288',
      email: 'care@apexcare.org',
      address: '1088 Silicon Health Park',
      city: 'San Jose',
      state: 'CA',
      country: 'USA',
      pincode: '95128',
      website: 'https://apexcare.example.com',
      logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300&q=80',
      status: 'active',
      timezone: 'America/Los_Angeles',
      owner_uid: 'admin-001',
      created_at: '2025-01-15T09:30:00.000Z',
    },
    'clinic-3': {
      id: 'clinic-3',
      name: 'Bay Area Children & Family Clinic',
      description: 'Dedicated pediatric medicine, childhood immunization, and adolescent developmental support.',
      phone: '+1 (510) 555-0377',
      email: 'info@baychildrens.org',
      address: '2200 Broadway Ave, Pavilion B',
      city: 'Oakland',
      state: 'CA',
      country: 'USA',
      pincode: '94612',
      website: 'https://baychildrens.example.com',
      logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&q=80',
      status: 'active',
      timezone: 'America/Los_Angeles',
      owner_uid: 'admin-001',
      created_at: '2025-01-18T10:00:00.000Z',
    },
    'clinic-4': {
      id: 'clinic-4',
      name: 'Pacific Neuro & Orthopedic Institute',
      description: 'Specialized surgical and conservative spine, joint replacement, and neuro-restorative center.',
      phone: '+1 (650) 555-0455',
      email: 'appointments@pacificneuro.health',
      address: '350 Sand Hill Medical Road',
      city: 'Palo Alto',
      state: 'CA',
      country: 'USA',
      pincode: '94304',
      website: 'https://pacificneuro.example.com',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&q=80',
      status: 'active',
      timezone: 'America/Los_Angeles',
      owner_uid: 'admin-001',
      created_at: '2025-01-22T11:00:00.000Z',
    },
    'clinic-5': {
      id: 'clinic-5',
      name: 'Golden Gate Family Health Center',
      description: 'Community-based comprehensive primary healthcare, preventive medicine, and routine wellness checkups.',
      phone: '+1 (510) 555-0822',
      email: 'support@goldengatehealth.org',
      address: '1800 Shattuck Avenue',
      city: 'Berkeley',
      state: 'CA',
      country: 'USA',
      pincode: '94709',
      website: 'https://goldengatehealth.example.com',
      logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&q=80',
      status: 'active',
      timezone: 'America/Los_Angeles',
      owner_uid: 'admin-001',
      created_at: '2025-01-25T14:00:00.000Z',
    },
  },
  specializations: {
    cardiology: {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular system care, arrhythmias, hypertension, and preventive cardiac wellness.',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
    },
    dermatology: {
      id: 'dermatology',
      name: 'Dermatology',
      description: 'Skin, hair, nail disorders, cosmetic dermatology, and clinical diagnostics.',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
    },
    pediatrics: {
      id: 'pediatrics',
      name: 'Pediatrics',
      description: 'Infant, child, and adolescent healthcare, immunizations, and developmental monitoring.',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
    },
    orthopedics: {
      id: 'orthopedics',
      name: 'Orthopedics',
      description: 'Musculoskeletal medicine, bone fractures, joint replacements, and sports medicine.',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
    },
    neurology: {
      id: 'neurology',
      name: 'Neurology',
      description: 'Brain, spine, peripheral nerves, and neuro-rehabilitation therapy.',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
    },
    general_medicine: {
      id: 'general_medicine',
      name: 'General Medicine',
      description: 'Primary care, diagnostic screenings, and chronic illness maintenance.',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
    },
    oncology: {
      id: 'oncology',
      name: 'Medical Oncology',
      description: 'Comprehensive cancer diagnostic evaluation, chemotherapy planning, and immuno-oncology therapies.',
      is_active: true,
      created_at: '2025-01-05T00:00:00.000Z',
    },
    gastroenterology: {
      id: 'gastroenterology',
      name: 'Gastroenterology',
      description: 'Digestive tract disorders, liver medicine, endoscopy, and inflammatory bowel disease.',
      is_active: true,
      created_at: '2025-01-05T00:00:00.000Z',
    },
    psychiatry: {
      id: 'psychiatry',
      name: 'Psychiatry & Behavioral Health',
      description: 'Adult clinical psychiatry, anxiety disorders, depression therapy, and psychopharmacology.',
      is_active: true,
      created_at: '2025-01-05T00:00:00.000Z',
    },
    endocrinology: {
      id: 'endocrinology',
      name: 'Endocrinology & Metabolism',
      description: 'Type 1 and Type 2 diabetes, thyroid conditions, metabolic syndrome, and pituitary disorders.',
      is_active: true,
      created_at: '2025-01-05T00:00:00.000Z',
    },
  },
  doctors: {
    'doc-1': {
      id: 'doc-1',
      user_uid: 'doctor-user-1',
      name: 'Dr. Sarah Jenkins, MD, FACC',
      specialization_id: 'cardiology',
      specialization_name: 'Cardiology',
      qualification: 'MD - Harvard Medical School, Cardiology Fellowship - Stanford',
      experience_years: 12,
      bio: 'Board-certified cardiologist specializing in preventive cardiology, echocardiography, and hypertension management.',
      profile_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80',
      consultation_fee: 150.0,
      appointment_duration_minutes: 30,
      languages: ['English', 'Spanish'],
      status: 'active',
      clinic_ids: ['clinic-1', 'clinic-2'],
      rating_avg: 4.9,
      rating_count: 28,
      license_number: 'MD-CA-928410',
      verification_status: 'verified',
      email: 'sarah.jenkins@metrohealth.com',
      phone: '+1 (415) 555-0144',
      created_at: '2025-01-15T10:00:00.000Z',
    },
    'doc-2': {
      id: 'doc-2',
      name: 'Dr. Robert Patel, MD',
      specialization_id: 'dermatology',
      specialization_name: 'Dermatology',
      qualification: 'MD - Johns Hopkins, Board Certified Dermatologist',
      experience_years: 9,
      bio: 'Dedicated to clinical and aesthetic dermatology, treating eczema, psoriasis, acne, and advanced skin screenings.',
      profile_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80',
      consultation_fee: 130.0,
      appointment_duration_minutes: 30,
      languages: ['English', 'Hindi', 'Gujarati'],
      status: 'active',
      clinic_ids: ['clinic-1', 'clinic-5'],
      rating_avg: 4.8,
      rating_count: 21,
      license_number: 'MD-CA-837429',
      verification_status: 'verified',
      email: 'robert.patel@metrohealth.com',
      phone: '+1 (415) 555-0182',
      created_at: '2025-01-18T11:00:00.000Z',
    },
    'doc-3': {
      id: 'doc-3',
      name: 'Dr. Amanda Chen, MD',
      specialization_id: 'pediatrics',
      specialization_name: 'Pediatrics',
      qualification: 'MD - UCSF School of Medicine, American Board of Pediatrics',
      experience_years: 15,
      bio: 'Gentle, attentive pediatrician committed to holistic newborn, child, and teen healthcare.',
      profile_image: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=300&q=80',
      consultation_fee: 140.0,
      appointment_duration_minutes: 30,
      languages: ['English', 'Mandarin'],
      status: 'active',
      clinic_ids: ['clinic-2', 'clinic-3'],
      rating_avg: 5.0,
      rating_count: 35,
      license_number: 'MD-CA-718294',
      verification_status: 'verified',
      email: 'amanda.chen@apexcare.org',
      phone: '+1 (408) 555-0199',
      created_at: '2025-01-20T14:00:00.000Z',
    },
    'doc-4': {
      id: 'doc-4',
      name: 'Dr. Marcus Brody, MD, FAAOS',
      specialization_id: 'orthopedics',
      specialization_name: 'Orthopedics',
      qualification: 'MD - Columbia University Vagelos College of Physicians and Surgeons',
      experience_years: 14,
      bio: 'Specialist in arthroscopic surgery, sports injuries, knee and hip reconstruction, and joint preservation.',
      profile_image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=80',
      consultation_fee: 175.0,
      appointment_duration_minutes: 30,
      languages: ['English'],
      status: 'active',
      clinic_ids: ['clinic-1', 'clinic-4'],
      rating_avg: 4.9,
      rating_count: 18,
      license_number: 'MD-CA-654921',
      verification_status: 'verified',
      email: 'marcus.brody@metrohealth.com',
      phone: '+1 (415) 555-0277',
      created_at: '2025-01-21T09:00:00.000Z',
    },
    'doc-5': {
      id: 'doc-5',
      name: 'Dr. Evelyn Vance, MD, PhD',
      specialization_id: 'neurology',
      specialization_name: 'Neurology',
      qualification: 'MD, PhD - Yale School of Medicine, Neurology Residency - Mass General',
      experience_years: 11,
      bio: 'Consultant neurologist with clinical focus on migraines, neuropathy, vestibular syndromes, and cognitive neurology.',
      profile_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&q=80',
      consultation_fee: 190.0,
      appointment_duration_minutes: 30,
      languages: ['English', 'French'],
      status: 'active',
      clinic_ids: ['clinic-4'],
      rating_avg: 4.9,
      rating_count: 22,
      license_number: 'MD-CA-543187',
      verification_status: 'verified',
      email: 'evelyn.vance@pacificneuro.health',
      phone: '+1 (650) 555-0391',
      created_at: '2025-01-23T11:30:00.000Z',
    },
    'doc-6': {
      id: 'doc-6',
      name: 'Dr. Kenneth Brooks, MD',
      specialization_id: 'general_medicine',
      specialization_name: 'General Medicine',
      qualification: 'MD - Northwestern University Feinberg School of Medicine',
      experience_years: 16,
      bio: 'Compassionate primary care physician focused on evidence-based chronic condition management, preventive health, and wellness.',
      profile_image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80',
      consultation_fee: 120.0,
      appointment_duration_minutes: 30,
      languages: ['English'],
      status: 'active',
      clinic_ids: ['clinic-1', 'clinic-5'],
      rating_avg: 4.8,
      rating_count: 29,
      license_number: 'MD-CA-432890',
      verification_status: 'verified',
      email: 'kenneth.brooks@metrohealth.com',
      phone: '+1 (415) 555-0322',
      created_at: '2025-01-24T12:00:00.000Z',
    },
  },
  patients: {
    'patient-user-1': {
      id: 'patient-user-1',
      user_uid: 'patient-user-1',
      full_name: 'John Doe',
      gender: 'Male',
      blood_group: 'O+',
      date_of_birth: '1988-06-14',
      phone: '+1 (555) 345-6789',
      email: 'john.doe@gmail.com',
      address: '450 Mission Street, Apt 12B, San Francisco, CA',
      emergency_contact: {
        name: 'Jane Doe',
        relation: 'Spouse',
        phone: '+1 (555) 345-6790',
      },
      created_at: '2025-02-01T12:00:00.000Z',
    },
    'patient-user-2': {
      id: 'patient-user-2',
      user_uid: 'patient-user-2',
      full_name: 'Sophia Williams',
      gender: 'Female',
      blood_group: 'A+',
      date_of_birth: '1995-03-22',
      phone: '+1 (555) 888-2345',
      email: 'sophia.w@example.com',
      address: '120 Market Street, San Francisco, CA',
      emergency_contact: {
        name: 'David Williams',
        relation: 'Brother',
        phone: '+1 (555) 888-9999',
      },
      created_at: '2025-02-10T14:30:00.000Z',
    },
    'patient-user-3': {
      id: 'patient-user-3',
      user_uid: 'patient-user-3',
      full_name: 'Marcus Vance',
      gender: 'Male',
      blood_group: 'B+',
      date_of_birth: '1974-11-08',
      phone: '+1 (555) 412-9901',
      email: 'marcus.vance@example.com',
      address: '880 Santana Row, San Jose, CA',
      emergency_contact: {
        name: 'Karen Vance',
        relation: 'Spouse',
        phone: '+1 (555) 412-9902',
      },
      created_at: '2025-02-15T09:00:00.000Z',
    },
    'patient-user-4': {
      id: 'patient-user-4',
      user_uid: 'patient-user-4',
      full_name: 'Elena Rostova',
      gender: 'Female',
      blood_group: 'AB+',
      date_of_birth: '1982-04-19',
      phone: '+1 (555) 723-4567',
      email: 'elena.rostova@example.com',
      address: '300 Lakeside Drive, Oakland, CA',
      emergency_contact: {
        name: 'Mikhail Rostov',
        relation: 'Father',
        phone: '+1 (555) 723-4568',
      },
      created_at: '2025-02-20T10:00:00.000Z',
    },
    'patient-user-5': {
      id: 'patient-user-5',
      user_uid: 'patient-user-5',
      full_name: 'David Kim',
      gender: 'Male',
      blood_group: 'O-',
      date_of_birth: '1990-09-30',
      phone: '+1 (555) 901-2345',
      email: 'david.kim@example.com',
      address: '525 University Ave, Palo Alto, CA',
      emergency_contact: {
        name: 'Grace Kim',
        relation: 'Sister',
        phone: '+1 (555) 901-2346',
      },
      created_at: '2025-02-22T11:00:00.000Z',
    },
    'patient-user-6': {
      id: 'patient-user-6',
      user_uid: 'patient-user-6',
      full_name: 'Priya Patel',
      gender: 'Female',
      blood_group: 'A-',
      date_of_birth: '1993-12-05',
      phone: '+1 (555) 654-3210',
      email: 'priya.patel@example.com',
      address: '2100 Telegraph Ave, Berkeley, CA',
      emergency_contact: {
        name: 'Suresh Patel',
        relation: 'Parent',
        phone: '+1 (555) 654-3211',
      },
      created_at: '2025-02-25T15:00:00.000Z',
    },
  },
  staff: {
    'staff-1': {
      id: 'staff-1',
      clinic_id: 'clinic-1',
      user_uid: 'staff-user-1',
      full_name: 'Emily Clark',
      email: 'emily.clark@metrohealth.com',
      phone: '+1 (415) 555-9012',
      role: 'receptionist',
      is_active: true,
      created_at: '2025-02-05T09:00:00.000Z',
    },
    'staff-2': {
      id: 'staff-2',
      clinic_id: 'clinic-1',
      user_uid: 'staff-user-2',
      full_name: 'Mark Reynolds, RN',
      email: 'mark.reynolds@metrohealth.com',
      phone: '+1 (415) 555-9015',
      role: 'triage_nurse',
      is_active: true,
      created_at: '2025-02-06T10:00:00.000Z',
    },
    'staff-3': {
      id: 'staff-3',
      clinic_id: 'clinic-2',
      user_uid: 'staff-user-3',
      full_name: 'Lisa Wong',
      email: 'lisa.wong@apexcare.org',
      phone: '+1 (408) 555-9044',
      role: 'receptionist',
      is_active: true,
      created_at: '2025-02-08T08:30:00.000Z',
    },
    'staff-4': {
      id: 'staff-4',
      clinic_id: 'clinic-3',
      user_uid: 'staff-user-4',
      full_name: 'Carlos Mendez',
      email: 'carlos.mendez@baychildrens.org',
      phone: '+1 (510) 555-9088',
      role: 'coordinator',
      is_active: true,
      created_at: '2025-02-12T09:30:00.000Z',
    },
  },
  schedules: {
    'sch-1': {
      id: 'sch-1',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-2': {
      id: 'sch-2',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      day_of_week: 'tuesday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-3': {
      id: 'sch-3',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      day_of_week: 'wednesday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-4': {
      id: 'sch-4',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      day_of_week: 'thursday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-5': {
      id: 'sch-5',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      day_of_week: 'friday',
      start_time: '09:00',
      end_time: '16:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-6': {
      id: 'sch-6',
      doctor_id: 'doc-2',
      clinic_id: 'clinic-1',
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '16:30',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:00', end_time: '13:00' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-7': {
      id: 'sch-7',
      doctor_id: 'doc-2',
      clinic_id: 'clinic-1',
      day_of_week: 'wednesday',
      start_time: '09:00',
      end_time: '16:30',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:00', end_time: '13:00' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-8': {
      id: 'sch-8',
      doctor_id: 'doc-2',
      clinic_id: 'clinic-1',
      day_of_week: 'friday',
      start_time: '09:00',
      end_time: '15:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:00', end_time: '13:00' }],
      is_active: true,
      created_at: '2025-01-20T00:00:00.000Z',
    },
    'sch-9': {
      id: 'sch-9',
      doctor_id: 'doc-4',
      clinic_id: 'clinic-1',
      day_of_week: 'tuesday',
      start_time: '08:30',
      end_time: '17:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-22T00:00:00.000Z',
    },
    'sch-10': {
      id: 'sch-10',
      doctor_id: 'doc-4',
      clinic_id: 'clinic-1',
      day_of_week: 'thursday',
      start_time: '08:30',
      end_time: '17:00',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:30', end_time: '13:30' }],
      is_active: true,
      created_at: '2025-01-22T00:00:00.000Z',
    },
    'sch-11': {
      id: 'sch-11',
      doctor_id: 'doc-6',
      clinic_id: 'clinic-1',
      day_of_week: 'monday',
      start_time: '08:30',
      end_time: '16:30',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:00', end_time: '13:00' }],
      is_active: true,
      created_at: '2025-01-25T00:00:00.000Z',
    },
    'sch-12': {
      id: 'sch-12',
      doctor_id: 'doc-6',
      clinic_id: 'clinic-1',
      day_of_week: 'wednesday',
      start_time: '08:30',
      end_time: '16:30',
      slot_duration_minutes: 30,
      breaks: [{ start_time: '12:00', end_time: '13:00' }],
      is_active: true,
      created_at: '2025-01-25T00:00:00.000Z',
    },
  },
  availability: {
    'blk-1': {
      id: 'blk-1',
      doctor_id: 'doc-1',
      clinic_id: 'clinic-1',
      date: _nextWeekDate,
      start_time: '14:00',
      end_time: '16:00',
      reason: 'Cardiology Department Grand Rounds & Academic Seminar',
      is_blocked: true,
      created_by: 'doctor-user-1',
      created_at: new Date().toISOString(),
    },
    'blk-2': {
      id: 'blk-2',
      doctor_id: 'doc-2',
      clinic_id: 'clinic-1',
      date: _tomorrowDate,
      start_time: '12:00',
      end_time: '13:30',
      reason: 'Dermatopathology Biopsy Case Conference',
      is_blocked: true,
      created_by: 'doc-2',
      created_at: new Date().toISOString(),
    },
  },
  clinic_holidays: {},
  doctor_leaves: {},
  appointments: {
    'appt-001': {
      id: 'appt-001',
      patient_id: 'patient-user-1',
      patient_uid: 'patient-user-1',
      patient_name: 'John Doe',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: _todayDate,
      start_time: '10:00',
      end_time: '10:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Routine Annual Cardiac Assessment',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 150.0,
      notes: 'Patient reports mild palpitations after exercise. 12-lead ECG scheduled.',
      created_by: 'patient-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-002': {
      id: 'appt-002',
      patient_id: 'patient-user-2',
      patient_uid: 'patient-user-2',
      patient_name: 'Sophia Williams',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: _todayDate,
      start_time: '11:30',
      end_time: '12:00',
      duration_minutes: 30,
      appointment_type: 'video',
      reason: 'ECG Follow-up Consultation',
      status: 'pending',
      payment_status: 'pending',
      consultation_fee: 150.0,
      notes: 'Reviewing recent 24hr Holter monitor findings.',
      created_by: 'patient-user-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-003': {
      id: 'appt-003',
      patient_id: 'patient-user-3',
      patient_uid: 'patient-user-3',
      patient_name: 'Marcus Vance',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: _todayDate,
      start_time: '14:00',
      end_time: '14:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Post-Holter Monitor Arrhythmia Evaluation',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 150.0,
      notes: 'Treated with beta-blockers, tracking exercise tolerance.',
      created_by: 'patient-user-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-004': {
      id: 'appt-004',
      patient_id: 'patient-user-4',
      patient_uid: 'patient-user-4',
      patient_name: 'Elena Rostova',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      date: _todayDate,
      start_time: '09:30',
      end_time: '10:00',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Atypical Mole Skin Screening',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 130.0,
      notes: 'Total body dermoscopic exam requested.',
      created_by: 'patient-user-4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-005': {
      id: 'appt-005',
      patient_id: 'patient-user-5',
      patient_uid: 'patient-user-5',
      patient_name: 'David Kim',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-6',
      doctor_name: 'Dr. Kenneth Brooks, MD',
      date: _todayDate,
      start_time: '15:00',
      end_time: '15:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Annual Preventive Executive Health Exam',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 120.0,
      notes: 'Fasting lipid panel and comprehensive metabolic panel drawn.',
      created_by: 'patient-user-5',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-006': {
      id: 'appt-006',
      patient_id: 'patient-user-4',
      patient_uid: 'patient-user-4',
      patient_name: 'Elena Rostova',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: _tomorrowDate,
      start_time: '10:30',
      end_time: '11:00',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Pre-operative Cardiac Clearance',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 150.0,
      notes: 'Surgical clearance required for upcoming orthopedic procedure.',
      created_by: 'patient-user-4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-007': {
      id: 'appt-007',
      patient_id: 'patient-user-1',
      patient_uid: 'patient-user-1',
      patient_name: 'John Doe',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      date: _tomorrowDate,
      start_time: '14:00',
      end_time: '14:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Contact Dermatitis Follow-up Evaluation',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 130.0,
      notes: 'Checking healing of forearm rash following topical treatment.',
      created_by: 'patient-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-008': {
      id: 'appt-008',
      patient_id: 'patient-user-6',
      patient_uid: 'patient-user-6',
      patient_name: 'Priya Patel',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-4',
      doctor_name: 'Dr. Marcus Brody, MD, FAAOS',
      date: _dayAfterDate,
      start_time: '11:00',
      end_time: '11:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'ACL Reconstruction Knee Post-Op Assessment',
      status: 'pending',
      payment_status: 'pending',
      consultation_fee: 175.0,
      notes: 'Range of motion check at 6 weeks post-surgery.',
      created_by: 'patient-user-6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-009': {
      id: 'appt-009',
      patient_id: 'patient-user-5',
      patient_uid: 'patient-user-5',
      patient_name: 'David Kim',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: _nextWeekDate,
      start_time: '09:00',
      end_time: '09:30',
      duration_minutes: 30,
      appointment_type: 'video',
      reason: 'Stage 1 Hypertension Medication Review',
      status: 'confirmed',
      payment_status: 'paid',
      consultation_fee: 150.0,
      notes: 'Reviewing 14-day home blood pressure log.',
      created_by: 'patient-user-5',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'appt-010': {
      id: 'appt-010',
      patient_id: 'patient-user-1',
      patient_uid: 'patient-user-1',
      patient_name: 'John Doe',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      date: _yesterdayDate,
      start_time: '14:00',
      end_time: '14:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Contact Dermatitis Examination',
      status: 'completed',
      payment_status: 'paid',
      consultation_fee: 130.0,
      notes: 'Rash examined, skin barrier cream and antihistamine prescribed.',
      created_by: 'patient-user-1',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    'appt-011': {
      id: 'appt-011',
      patient_id: 'patient-user-3',
      patient_uid: 'patient-user-3',
      patient_name: 'Marcus Vance',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: '2025-02-18',
      start_time: '10:00',
      end_time: '10:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Cardiac Palpitations & Exercise Stress Test',
      status: 'completed',
      payment_status: 'paid',
      consultation_fee: 150.0,
      notes: 'Echocardiogram and treadmill stress test completed successfully.',
      created_by: 'patient-user-3',
      created_at: '2025-02-15T09:00:00.000Z',
      updated_at: '2025-02-18T10:30:00.000Z',
    },
    'appt-012': {
      id: 'appt-012',
      patient_id: 'patient-user-2',
      patient_uid: 'patient-user-2',
      patient_name: 'Sophia Williams',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: '2025-02-22',
      start_time: '11:30',
      end_time: '12:00',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Echocardiogram Baseline Scan',
      status: 'completed',
      payment_status: 'paid',
      consultation_fee: 150.0,
      notes: 'Normal ejection fraction confirmed (65%).',
      created_by: 'patient-user-2',
      created_at: '2025-02-18T11:00:00.000Z',
      updated_at: '2025-02-22T12:00:00.000Z',
    },
    'appt-013': {
      id: 'appt-013',
      patient_id: 'patient-user-6',
      patient_uid: 'patient-user-6',
      patient_name: 'Priya Patel',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      date: '2025-02-26',
      start_time: '15:00',
      end_time: '15:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Eczema Flares & Allergy Patch Testing',
      status: 'completed',
      payment_status: 'paid',
      consultation_fee: 130.0,
      notes: 'Prescribed topical tacrolimus ointment.',
      created_by: 'patient-user-6',
      created_at: '2025-02-20T14:00:00.000Z',
      updated_at: '2025-02-26T15:30:00.000Z',
    },
    'appt-014': {
      id: 'appt-014',
      patient_id: 'patient-user-4',
      patient_uid: 'patient-user-4',
      patient_name: 'Elena Rostova',
      clinic_id: 'clinic-2',
      clinic_name: 'Apex Care Cardiology & Wellness',
      doctor_id: 'doc-3',
      doctor_name: 'Dr. Amanda Chen, MD',
      date: '2025-03-01',
      start_time: '09:00',
      end_time: '09:30',
      duration_minutes: 30,
      appointment_type: 'in_person',
      reason: 'Family Pediatric Wellness & Consultation',
      status: 'completed',
      payment_status: 'paid',
      consultation_fee: 140.0,
      notes: 'Immunizations up to date.',
      created_by: 'patient-user-4',
      created_at: '2025-02-24T10:00:00.000Z',
      updated_at: '2025-03-01T09:30:00.000Z',
    },
    'appt-015': {
      id: 'appt-015',
      patient_id: 'patient-user-5',
      patient_uid: 'patient-user-5',
      patient_name: 'David Kim',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      date: '2025-02-28',
      start_time: '16:00',
      end_time: '16:30',
      duration_minutes: 30,
      appointment_type: 'video',
      reason: 'Schedule Conflict - Travel',
      status: 'cancelled',
      payment_status: 'refunded',
      consultation_fee: 150.0,
      notes: 'Patient cancelled due to urgent business trip.',
      created_by: 'patient-user-5',
      created_at: '2025-02-20T10:00:00.000Z',
      updated_at: '2025-02-27T12:00:00.000Z',
    },
  },
  appointment_history: {},
  medical_records: {
    'rec-1': {
      id: 'rec-1',
      patient_id: 'patient-user-1',
      patient_name: 'John Doe',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-010',
      diagnosis: 'Localized Contact Allergic Dermatitis',
      symptoms: ['Skin redness', 'Mild pruritus', 'Dry patches on forearm'],
      notes: 'Advised avoiding scented detergents. Prescribed topical corticosteroid and antihistamine.',
      follow_up_date: _tomorrowDate,
      created_at: new Date(Date.now() - 86000000).toISOString(),
      updated_at: new Date(Date.now() - 86000000).toISOString(),
    },
    'rec-2': {
      id: 'rec-2',
      patient_id: 'patient-user-1',
      patient_name: 'John Doe',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-001',
      diagnosis: 'Essential Hypertension - Controlled & Normal Sinus Rhythm',
      symptoms: ['Mild exertion fatigue', 'Occasional benign palpitations'],
      notes: '12-lead ECG confirmed normal sinus rhythm with PR interval 160ms. BP 124/82 mmHg. Initiated low-dose beta-blocker and statin therapy.',
      follow_up_date: _nextWeekDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'rec-3': {
      id: 'rec-3',
      patient_id: 'patient-user-3',
      patient_name: 'Marcus Vance',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-011',
      diagnosis: 'Paroxysmal Supraventricular Tachycardia (PSVT) - Clinically Stable',
      symptoms: ['Episodic rapid heart rate', 'Lightheadedness during strenuous workouts'],
      notes: 'Stress echocardiogram revealed normal ejection fraction (62%). 48-hour Holter showed isolated PACs. Continue lifestyle moderation and Diltiazem.',
      follow_up_date: _nextWeekDate,
      created_at: '2025-02-18T10:35:00.000Z',
      updated_at: '2025-02-18T10:35:00.000Z',
    },
    'rec-4': {
      id: 'rec-4',
      patient_id: 'patient-user-2',
      patient_name: 'Sophia Williams',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-012',
      diagnosis: 'Mild Mitral Valve Prolapse - Hemodynamically Insignificant',
      symptoms: ['Intermittent chest tightness', 'Anxiety-related hyperventilation'],
      notes: 'Normal left ventricular size and function. Trace mitral regurgitation. Reassurance provided; no physical activity restrictions required.',
      follow_up_date: '2025-08-20',
      created_at: '2025-02-22T12:05:00.000Z',
      updated_at: '2025-02-22T12:05:00.000Z',
    },
    'rec-5': {
      id: 'rec-5',
      patient_id: 'patient-user-4',
      patient_name: 'Elena Rostova',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-004',
      diagnosis: 'Benign Dysplastic Nevus - Left Scapula Region',
      symptoms: ['Pigmented macule with regular borders'],
      notes: 'Dermoscopy demonstrates symmetrical pigment network. No signs of malignancy. Follow-up digital photography recommended in 6 months.',
      follow_up_date: '2025-08-15',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'rec-6': {
      id: 'rec-6',
      patient_id: 'patient-user-6',
      patient_name: 'Priya Patel',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-013',
      diagnosis: 'Atopic Eczema with Secondary Xerosis',
      symptoms: ['Erythematous pruritic plaques on flexural surfaces'],
      notes: 'Started on non-steroidal topical immunomodulator therapy and barrier repair cream.',
      follow_up_date: '2025-04-10',
      created_at: '2025-02-26T15:35:00.000Z',
      updated_at: '2025-02-26T15:35:00.000Z',
    },
  },
  prescriptions: {
    'rx-1': {
      id: 'rx-1',
      patient_id: 'patient-user-1',
      patient_name: 'John Doe',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-010',
      medicines: [
        {
          name: 'Hydrocortisone Valerate Cream 0.2%',
          dosage: 'Apply thin layer',
          frequency: 'Twice daily',
          duration: '10 days',
          instructions: 'Apply sparingly to affected areas after showering.',
        },
        {
          name: 'Cetirizine HCl 10mg Tablets',
          dosage: '1 tablet (10mg)',
          frequency: 'Once daily at bedtime',
          duration: '14 days',
          instructions: 'For nighttime pruritus and allergy relief.',
        },
      ],
      instructions: 'Keep skin hydrated with fragrance-free ceramide moisturizer.',
      notes: 'Discontinue if stinging occurs. Return if rash spreads.',
      created_at: new Date(Date.now() - 86000000).toISOString(),
    },
    'rx-2': {
      id: 'rx-2',
      patient_id: 'patient-user-1',
      patient_name: 'John Doe',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-001',
      medicines: [
        {
          name: 'Atorvastatin Calcium 20mg Tablets',
          dosage: '1 tablet (20mg)',
          frequency: 'Once daily in the evening',
          duration: '90 days',
          instructions: 'Take with or without dinner. Avoid grapefruit juice.',
        },
        {
          name: 'Metoprolol Tartrate 25mg Tablets',
          dosage: '1 tablet (25mg)',
          frequency: 'Twice daily with meals',
          duration: '60 days',
          instructions: 'Do not discontinue abruptly. Monitor resting heart rate.',
        },
      ],
      instructions: 'Maintain low-sodium Mediterranean diet and 30-minute daily moderate walking.',
      notes: 'Repeat fasting lipid profile and liver enzymes in 12 weeks.',
      created_at: new Date().toISOString(),
    },
    'rx-3': {
      id: 'rx-3',
      patient_id: 'patient-user-3',
      patient_name: 'Marcus Vance',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-011',
      medicines: [
        {
          name: 'Diltiazem HCl Extended-Release 120mg',
          dosage: '1 capsule (120mg)',
          frequency: 'Once daily in the morning',
          duration: '30 days',
          instructions: 'Swallow whole with a full glass of water.',
        },
        {
          name: 'Aspirin 81mg Enteric Coated',
          dosage: '1 tablet (81mg)',
          frequency: 'Once daily with breakfast',
          duration: '90 days',
          instructions: 'Cardioprotective low-dose formulation.',
        },
      ],
      instructions: 'Avoid energy drinks, excessive caffeine, and unprescribed decongestants.',
      notes: 'Check blood pressure twice weekly at home.',
      created_at: '2025-02-18T10:40:00.000Z',
    },
    'rx-4': {
      id: 'rx-4',
      patient_id: 'patient-user-2',
      patient_name: 'Sophia Williams',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-012',
      medicines: [
        {
          name: 'Propranolol HCl 10mg Tablets',
          dosage: '1 tablet (10mg)',
          frequency: 'As needed for palpitation flare-ups (Max 2 daily)',
          duration: '30 days',
          instructions: 'Take 30 minutes before high-stress triggers.',
        },
      ],
      instructions: 'Practice diaphragmatic breathing and stay well hydrated.',
      notes: 'Routine follow-up in 6 months.',
      created_at: '2025-02-22T12:10:00.000Z',
    },
    'rx-5': {
      id: 'rx-5',
      patient_id: 'patient-user-6',
      patient_name: 'Priya Patel',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-013',
      medicines: [
        {
          name: 'Tacrolimus Ointment 0.1%',
          dosage: 'Apply thin layer',
          frequency: 'Twice daily',
          duration: '21 days',
          instructions: 'Non-steroidal topical immunomodulator for sensitive areas.',
        },
      ],
      instructions: 'Use gentle soap-free cleanser. Avoid sun exposure on treated areas.',
      notes: 'Re-evaluate in 3 weeks.',
      created_at: '2025-02-26T15:40:00.000Z',
    },
  },
  reviews: {
    'rev-1': {
      id: 'rev-1',
      patient_id: 'patient-user-1',
      patient_name: 'John Doe',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-001',
      rating: 5,
      comment: 'Dr. Jenkins was extremely thorough and explained my cardiac tests in clear terms. Outstanding bedside manner!',
      status: 'approved',
      created_at: '2025-02-15T09:00:00.000Z',
    },
    'rev-2': {
      id: 'rev-2',
      patient_id: 'patient-user-1',
      patient_name: 'John Doe',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-010',
      rating: 5,
      comment: 'Dr. Patel resolved my contact dermatitis within a week. Highly skilled and very attentive dermatologist!',
      status: 'approved',
      created_at: new Date(Date.now() - 85000000).toISOString(),
    },
    'rev-3': {
      id: 'rev-3',
      patient_id: 'patient-user-3',
      patient_name: 'Marcus Vance',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-011',
      rating: 5,
      comment: 'World-class cardiologist. The diagnostic tests were fast, and she put my mind completely at ease regarding my heart rhythm.',
      status: 'approved',
      created_at: '2025-02-19T11:00:00.000Z',
    },
    'rev-4': {
      id: 'rev-4',
      patient_id: 'patient-user-2',
      patient_name: 'Sophia Williams',
      doctor_id: 'doc-1',
      doctor_name: 'Dr. Sarah Jenkins, MD, FACC',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-012',
      rating: 5,
      comment: 'Compassionate and patient. She answered every single question I had about my echocardiogram without rushing me.',
      status: 'approved',
      created_at: '2025-02-23T14:30:00.000Z',
    },
    'rev-5': {
      id: 'rev-5',
      patient_id: 'patient-user-4',
      patient_name: 'Elena Rostova',
      doctor_id: 'doc-2',
      doctor_name: 'Dr. Robert Patel, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-004',
      rating: 5,
      comment: 'State-of-the-art dermoscopy equipment and clear diagnosis. Very professional facility at Metro Health.',
      status: 'approved',
      created_at: new Date().toISOString(),
    },
    'rev-6': {
      id: 'rev-6',
      patient_id: 'patient-user-5',
      patient_name: 'David Kim',
      doctor_id: 'doc-6',
      doctor_name: 'Dr. Kenneth Brooks, MD',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-005',
      rating: 5,
      comment: 'Dr. Brooks is the best primary care physician I have visited in the Bay Area. Thorough physical exam and great advice.',
      status: 'approved',
      created_at: new Date().toISOString(),
    },
    'rev-7': {
      id: 'rev-7',
      patient_id: 'patient-user-6',
      patient_name: 'Priya Patel',
      doctor_id: 'doc-4',
      doctor_name: 'Dr. Marcus Brody, MD, FAAOS',
      clinic_id: 'clinic-1',
      clinic_name: 'Metro Health Specialty Center',
      appointment_id: 'appt-008',
      rating: 5,
      comment: 'Dr. Brody is an incredible orthopedic specialist. Explains recovery exercises clearly and inspires confidence.',
      status: 'approved',
      created_at: '2025-02-27T16:00:00.000Z',
    },
  },
  notifications: {
    'notif-p1': {
      id: 'notif-p1',
      user_uid: 'patient-user-1',
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed Today',
      message: 'Your consultation with Dr. Sarah Jenkins today at 10:00 AM at Metro Health Specialty Center is confirmed.',
      reference_id: 'appt-001',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-p2': {
      id: 'notif-p2',
      user_uid: 'patient-user-1',
      type: 'prescription_ready',
      title: 'Digital Prescription Issued',
      message: 'Dr. Sarah Jenkins has issued a new digital prescription for Atorvastatin & Metoprolol.',
      reference_id: 'rx-2',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-p3': {
      id: 'notif-p3',
      user_uid: 'patient-user-1',
      type: 'appointment_reminder',
      title: 'Upcoming Visit Reminder',
      message: `You have an upcoming consultation with Dr. Robert Patel scheduled for tomorrow at 14:00.`,
      reference_id: 'appt-007',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    'notif-d1': {
      id: 'notif-d1',
      user_uid: 'doctor-user-1',
      type: 'new_booking',
      title: 'Patient Queue Active Today',
      message: '3 patients are scheduled on your consultation queue for today (John Doe, Sophia Williams, Marcus Vance).',
      reference_id: 'appt-001',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-d2': {
      id: 'notif-d2',
      user_uid: 'doctor-user-1',
      type: 'lab_result',
      title: 'Pre-Op Clearance Scheduled',
      message: 'Elena Rostova has booked a pre-operative cardiac clearance consultation for tomorrow at 10:30 AM.',
      reference_id: 'appt-006',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-d3': {
      id: 'notif-d3',
      user_uid: 'doctor-user-1',
      type: 'telemetry',
      title: 'Holter Report Uploaded',
      message: '24-hour ambulatory cardiac rhythm telemetry for Sophia Williams is ready for review.',
      reference_id: 'appt-002',
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    'notif-c1': {
      id: 'notif-c1',
      user_uid: 'clinic-user-1',
      type: 'daily_operations',
      title: 'Daily Outpatient Queue Live',
      message: '5 patient appointments scheduled across Cardiology, Dermatology, and General Practice today.',
      reference_id: 'clinic-1',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-c2': {
      id: 'notif-c2',
      user_uid: 'clinic-user-1',
      type: 'compliance',
      title: 'Quality Compliance Rating: Grade A+',
      message: 'Annual state health facility accreditation and provider credentialing review successfully completed.',
      reference_id: 'clinic-1',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    'notif-c3': {
      id: 'notif-c3',
      user_uid: 'clinic-user-1',
      type: 'roster',
      title: 'Front Desk Triage Active',
      message: 'Emily Clark and Mark Reynolds confirmed on duty for front desk reception & triage.',
      reference_id: 'clinic-1',
      is_read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    'notif-s1': {
      id: 'notif-s1',
      user_uid: 'staff-user-1',
      type: 'patient_checkin',
      title: 'Patient Arrival Alert',
      message: 'John Doe has arrived at the reception desk for his 10:00 AM Cardiology consultation.',
      reference_id: 'appt-001',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-s2': {
      id: 'notif-s2',
      user_uid: 'staff-user-1',
      type: 'doctor_schedule',
      title: 'Physician Availability Update',
      message: 'Dr. Sarah Jenkins has blocked 14:00-16:00 on Friday for Grand Rounds seminar.',
      reference_id: 'blk-1',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-s3': {
      id: 'notif-s3',
      user_uid: 'staff-user-1',
      type: 'front_desk_memo',
      title: 'Front Desk Daily Protocol',
      message: 'Verify patient contact numbers, insurance copays, and update emergency contact info upon check-in.',
      reference_id: 'staff-1',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    'notif-a1': {
      id: 'notif-a1',
      user_uid: 'admin-001',
      type: 'platform_telemetry',
      title: 'Platform System Status Operational',
      message: 'All 5 clinic locations, 6 physician schedules, and real-time slot engines are operating with 100% health.',
      reference_id: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    'notif-a2': {
      id: 'notif-a2',
      user_uid: 'admin-001',
      type: 'provider_audit',
      title: 'Physician Credentials Verified',
      message: 'Dr. Evelyn Vance and Dr. Marcus Brody state medical licenses confirmed with CA Medical Board.',
      reference_id: 'doc-5',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  audit_logs: {
    'log-1': {
      id: 'log-1',
      action: 'SYSTEM_BOOTSTRAP',
      details: 'Production cluster initialized with 5 specialized clinical centers and multi-role RBAC.',
      ip_address: '127.0.0.1',
      user_uid: 'admin-001',
      timestamp: new Date('2025-01-01').toISOString(),
    },
    'log-2': {
      id: 'log-2',
      action: 'CLINIC_REGISTERED',
      details: 'Metro Health Specialty Center (clinic-1) registered with active outpatient licenses.',
      ip_address: '127.0.0.1',
      user_uid: 'admin-001',
      timestamp: new Date('2025-01-10').toISOString(),
    },
    'log-3': {
      id: 'log-3',
      action: 'PHYSICIAN_CREDENTIALED',
      details: 'Dr. Sarah Jenkins verified with CA Board License MD-CA-928410.',
      ip_address: '127.0.0.1',
      user_uid: 'admin-001',
      timestamp: new Date('2025-01-15').toISOString(),
    },
    'log-4': {
      id: 'log-4',
      action: 'SECURITY_AUDIT_PASSED',
      details: 'Zero vulnerabilities detected across authentication and role-scoping endpoints.',
      ip_address: '127.0.0.1',
      user_uid: 'admin-001',
      timestamp: new Date().toISOString(),
    },
  },
  idempotency_keys: {},
};

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------
function sendJson(res: Response, data: any = null, message = 'Success', status = 200, error: any = null) {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
    error,
  });
}

function sendError(res: Response, message: string, code = 'BAD_REQUEST', status = 400, details: any = null) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  });
}

// Auth Middleware matching main.py
interface AuthRequest extends Request {
  authUser?: any;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  if (apiKey !== API_SECRET_KEY) {
    return sendError(res, 'Invalid API Key. Send X-API-Key with chedotech-dev-key-2026', 'AUTH_REQUIRED', 401);
  }

  const uid = (req.headers['x-user-id'] || req.headers['X-User-ID']) as string;
  if (!uid) {
    return sendError(res, 'User ID is required. Send X-User-ID header.', 'AUTH_REQUIRED', 401);
  }

  let user = db.users[uid];
  if (!user) {
    user = Object.values(db.users).find(
      (u) => u.email && u.email.toLowerCase() === uid.toLowerCase()
    );
  }
  if (!user) {
    // Auto-create user doc if logging in with new UID
    user = {
      uid,
      email: `${uid}@example.com`,
      full_name: uid.replace('-', ' '),
      role: 'patient',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users[uid] = user;
  }

  req.authUser = user;
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user) return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
    if (user.role === 'admin' || allowedRoles.includes(user.role)) {
      return next();
    }
    return sendError(res, `Forbidden. Requires one of: ${allowedRoles.join(', ')}`, 'FORBIDDEN', 403);
  };
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function generateSlots(doctorId: string, clinicId: string, dateStr: string) {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayName = DAY_NAMES[dateObj.getDay()];

  // Check schedules
  const activeSchedules = Object.values(db.schedules).filter(
    (s: any) =>
      s.doctor_id === doctorId &&
      s.clinic_id === clinicId &&
      s.day_of_week === dayName &&
      s.is_active
  );

  if (!activeSchedules.length) {
    return [];
  }

  // Get booked appointments for doctor on that date
  const booked = Object.values(db.appointments).filter(
    (a: any) =>
      a.doctor_id === doctorId &&
      a.date === dateStr &&
      ['pending', 'confirmed', 'rescheduled'].includes(a.status)
  );

  const bookedRanges = booked.map((a: any) => ({
    start: timeToMin(a.start_time),
    end: timeToMin(a.end_time),
  }));

  // Blocked availability
  const blocked = Object.values(db.availability).filter(
    (b: any) => b.doctor_id === doctorId && b.date === dateStr && b.is_blocked
  );
  const blockedRanges = blocked.map((b: any) => ({
    start: timeToMin(b.start_time),
    end: timeToMin(b.end_time),
  }));

  const slots: any[] = [];

  for (const sch of activeSchedules) {
    const startMin = timeToMin(sch.start_time);
    const endMin = timeToMin(sch.end_time);
    const duration = sch.slot_duration_minutes || 30;
    const breakRanges = (sch.breaks || []).map((brk: any) => ({
      start: timeToMin(brk.start_time),
      end: timeToMin(brk.end_time),
    }));

    let curr = startMin;
    while (curr + duration <= endMin) {
      const sStart = curr;
      const sEnd = curr + duration;
      curr += duration;

      // Overlap with breaks
      const isBreak = breakRanges.some((br: any) => !(sEnd <= br.start || sStart >= br.end));
      if (isBreak) continue;

      // Overlap with blocks
      const isBlocked = blockedRanges.some((bl: any) => !(sEnd <= bl.start || sStart >= bl.end));
      if (isBlocked) continue;

      // Overlap with booked
      const isBooked = bookedRanges.some((bk: any) => !(sEnd <= bk.start || sStart >= bk.end));
      if (isBooked) continue;

      slots.push({
        date: dateStr,
        start_time: minToTime(sStart),
        end_time: minToTime(sEnd),
        duration_minutes: duration,
        is_available: true,
      });
    }
  }

  return slots;
}

// -----------------------------------------------------------------------------
// 1. System & Health Endpoints
// -----------------------------------------------------------------------------
app.get('/api/v1/health', (req, res) => {
  sendJson(res, {
    service: 'doctor-appointment-api',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
  }, 'API is healthy');
});

app.post('/api/v1/seed', authMiddleware, requireRole(['admin']), (req, res) => {
  sendJson(res, { specializations_seeded: Object.keys(db.specializations).length }, 'Specializations seeded successfully', 201);
});

app.post('/api/v1/admin/setup', (req, res) => {
  const secret = req.headers['x-setup-secret'];
  if (secret !== 'super-secret-admin-setup') {
    return sendError(res, 'Invalid setup secret', 'FORBIDDEN', 403);
  }
  const { uid, email, full_name } = req.body;
  if (!uid) return sendError(res, 'uid is required', 'VALIDATION_ERROR', 422);

  db.users[uid] = {
    uid,
    email: email || 'admin@example.com',
    full_name: full_name || 'Admin User',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  sendJson(res, { uid, role: 'admin' }, 'Admin user created successfully', 201);
});

// -----------------------------------------------------------------------------
// 2. Auth & User Profile Endpoints
// -----------------------------------------------------------------------------
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role, api_key } = req.body || {};
  const apiKey = api_key || req.headers['x-api-key'] || API_SECRET_KEY;
  if (apiKey !== API_SECRET_KEY) {
    return sendError(res, 'Invalid API Key. Platform credentials incorrect.', 'AUTH_REQUIRED', 401);
  }

  if (!identifier) {
    return sendError(res, 'Username, Email, or User ID is required.', 'VALIDATION_ERROR', 422);
  }

  const idStr = String(identifier).trim();
  let user = db.users[idStr];
  if (!user) {
    user = Object.values(db.users).find(
      (u) => u.email && u.email.toLowerCase() === idStr.toLowerCase()
    );
  }

  if (!user) {
    return sendError(
      res,
      `No ${role ? role.toUpperCase() : ''} account found matching "${idStr}". Please verify your credentials or choose the correct portal.`,
      'NOT_FOUND',
      404
    );
  }

  if (role && user.role !== role) {
    return sendError(
      res,
      `Access Denied: This portal is strictly for ${role.toUpperCase()} accounts. The entered account belongs to the ${user.role.toUpperCase()} portal.`,
      'FORBIDDEN',
      403
    );
  }

  if (!user.is_active) {
    return sendError(res, 'This account has been deactivated. Please contact support.', 'FORBIDDEN', 403);
  }

  sendJson(
    res,
    {
      user,
      apiKey: API_SECRET_KEY,
      token: `auth-${user.uid}-${Date.now()}`,
    },
    'Authentication successful'
  );
});

app.get('/api/v1/me', authMiddleware, (req: AuthRequest, res) => {
  sendJson(res, req.authUser, 'Current user profile retrieved');
});

app.route('/api/v1/users/profile')
  .post(authMiddleware, updateUserProfile)
  .put(authMiddleware, updateUserProfile);

function updateUserProfile(req: AuthRequest, res: Response) {
  const user = req.authUser;
  const { full_name, phone, photo_url } = req.body;
  if (full_name) user.full_name = full_name;
  if (phone) user.phone = phone;
  if (photo_url) user.photo_url = photo_url;
  user.updated_at = new Date().toISOString();

  if (db.patients[user.uid]) {
    db.patients[user.uid] = { ...db.patients[user.uid], full_name, phone, photo_url };
  }

  sendJson(res, user, 'Profile updated successfully');
}

// -----------------------------------------------------------------------------
// 3. Clinics Endpoints
// -----------------------------------------------------------------------------
app.get('/api/v1/clinics', (req, res) => {
  const { city, status, search } = req.query;
  let items = Object.values(db.clinics);

  if (status && status !== 'all') {
    items = items.filter((c: any) => c.status === status);
  }
  if (city) {
    items = items.filter((c: any) => c.city?.toLowerCase() === String(city).toLowerCase());
  }
  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter((c: any) => c.name?.toLowerCase().includes(s) || c.city?.toLowerCase().includes(s));
  }

  sendJson(res, { items, count: items.length }, 'Clinics retrieved successfully');
});

app.get('/api/v1/clinics/:clinic_id', (req, res) => {
  const clinic = db.clinics[req.params.clinic_id];
  if (!clinic) return sendError(res, 'Clinic not found', 'NOT_FOUND', 404);
  sendJson(res, clinic, 'Clinic details retrieved');
});

app.post('/api/v1/clinics', authMiddleware, requireRole(['admin', 'clinic']), (req: AuthRequest, res) => {
  const { name, phone, email, address, city, state, country, pincode, website, logo } = req.body;
  if (!name || !phone || !email) {
    return sendError(res, "Clinic 'name', 'phone', and 'email' are required.", 'VALIDATION_ERROR', 422);
  }

  const id = `clinic-${Date.now()}`;
  const clinic = {
    id,
    name,
    phone,
    email,
    address: address || '',
    city: city || '',
    state: state || '',
    country: country || 'USA',
    pincode: pincode || '',
    website: website || '',
    logo: logo || '',
    status: req.authUser.role === 'admin' ? 'active' : 'pending',
    timezone: 'America/Los_Angeles',
    owner_uid: req.authUser.uid,
    created_at: new Date().toISOString(),
  };

  db.clinics[id] = clinic;
  sendJson(res, clinic, 'Clinic registered successfully', 201);
});

app.put('/api/v1/clinics/:clinic_id', authMiddleware, (req: AuthRequest, res) => {
  const id = req.params.clinic_id;
  const clinic = db.clinics[id];
  if (!clinic) return sendError(res, 'Clinic not found', 'NOT_FOUND', 404);

  if (req.authUser.role !== 'admin' && req.authUser.clinic_id !== id && clinic.owner_uid !== req.authUser.uid) {
    return sendError(res, 'Unauthorized to update this clinic', 'FORBIDDEN', 403);
  }

  Object.assign(clinic, req.body, { updated_at: new Date().toISOString() });
  sendJson(res, clinic, 'Clinic updated successfully');
});

app.patch('/api/v1/clinics/:clinic_id/status', authMiddleware, requireRole(['admin']), (req, res) => {
  const { status } = req.body;
  const clinic = db.clinics[req.params.clinic_id];
  if (!clinic) return sendError(res, 'Clinic not found', 'NOT_FOUND', 404);

  if (!['active', 'pending', 'suspended', 'rejected'].includes(status)) {
    return sendError(res, 'Invalid clinic status', 'VALIDATION_ERROR', 422);
  }

  clinic.status = status;
  clinic.updated_at = new Date().toISOString();
  sendJson(res, { clinic_id: clinic.id, status }, `Clinic status updated to ${status}`);
});

// -----------------------------------------------------------------------------
// 4. Doctors Endpoints
// -----------------------------------------------------------------------------
function normalizeDoctor(d: any) {
  if (!d) return d;
  const rating = typeof d.rating === 'number' ? d.rating : (typeof d.rating_avg === 'number' ? d.rating_avg : 5.0);
  const count = typeof d.review_count === 'number' ? d.review_count : (typeof d.rating_count === 'number' ? d.rating_count : 0);
  const clinicNames = (d.clinic_names && d.clinic_names.length > 0)
    ? d.clinic_names
    : (d.clinic_ids || []).map((cid: string) => db.clinics[cid]?.name).filter(Boolean);

  return {
    ...d,
    rating,
    rating_avg: rating,
    review_count: count,
    rating_count: count,
    clinic_names: clinicNames.length > 0 ? clinicNames : ['Metro Health Specialty Center'],
  };
}

app.get('/api/v1/doctors', (req, res) => {
  const { specialization_id, clinic_id, status, search } = req.query;
  let items = Object.values(db.doctors);

  if (status && status !== 'all') {
    items = items.filter((d: any) => d.status === status);
  }
  if (specialization_id) {
    items = items.filter((d: any) => d.specialization_id === specialization_id);
  }
  if (clinic_id) {
    items = items.filter((d: any) => d.clinic_ids?.includes(clinic_id));
  }
  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter(
      (d: any) => d.name?.toLowerCase().includes(s) || d.specialization_name?.toLowerCase().includes(s)
    );
  }

  sendJson(res, { items: items.map(normalizeDoctor), count: items.length }, 'Doctors retrieved successfully');
});

app.get('/api/v1/doctors/:doctor_id', (req, res) => {
  const doctor = db.doctors[req.params.doctor_id];
  if (!doctor) return sendError(res, 'Doctor not found', 'NOT_FOUND', 404);
  sendJson(res, normalizeDoctor(doctor), 'Doctor profile retrieved');
});

app.post('/api/v1/doctors', authMiddleware, requireRole(['admin', 'clinic']), (req: AuthRequest, res) => {
  const { name, specialization_id, qualification, experience_years, consultation_fee, clinic_id, email, phone, bio, profile_image } = req.body;
  if (!name || !specialization_id) {
    return sendError(res, "'name' and 'specialization_id' are required.", 'VALIDATION_ERROR', 422);
  }

  const spec = db.specializations[specialization_id];
  const specName = spec ? spec.name : specialization_id;

  const id = `doc-${Date.now()}`;
  const assignedClinic = clinic_id || req.authUser.clinic_id || 'clinic-1';

  const doctor = {
    id,
    name,
    specialization_id,
    specialization_name: specName,
    qualification: qualification || 'MD',
    experience_years: Number(experience_years) || 1,
    bio: bio || '',
    profile_image: profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80',
    consultation_fee: Number(consultation_fee) || 100,
    appointment_duration_minutes: 30,
    languages: ['English'],
    status: 'active',
    clinic_ids: assignedClinic ? [assignedClinic] : [],
    rating_avg: 5.0,
    rating: 5.0,
    rating_count: 1,
    review_count: 1,
    license_number: `MD-${Math.floor(100000 + Math.random() * 900000)}`,
    verification_status: 'verified',
    email: email || '',
    phone: phone || '',
    created_at: new Date().toISOString(),
  };

  db.doctors[id] = doctor;
  sendJson(res, doctor, 'Doctor profile created successfully', 201);
});

app.put('/api/v1/doctors/:doctor_id', authMiddleware, (req: AuthRequest, res) => {
  const id = req.params.doctor_id;
  const doctor = db.doctors[id];
  if (!doctor) return sendError(res, 'Doctor not found', 'NOT_FOUND', 404);

  Object.assign(doctor, req.body, { updated_at: new Date().toISOString() });
  sendJson(res, doctor, 'Doctor updated successfully');
});

app.patch('/api/v1/doctors/:doctor_id/status', authMiddleware, requireRole(['admin', 'clinic']), (req, res) => {
  const { status } = req.body;
  const doctor = db.doctors[req.params.doctor_id];
  if (!doctor) return sendError(res, 'Doctor not found', 'NOT_FOUND', 404);

  doctor.status = status;
  doctor.updated_at = new Date().toISOString();
  sendJson(res, { doctor_id: doctor.id, status }, 'Doctor status updated');
});

// -----------------------------------------------------------------------------
// 5. Specializations Endpoints
// -----------------------------------------------------------------------------
app.get('/api/v1/specializations', (req, res) => {
  const items = Object.values(db.specializations).filter((s: any) => s.is_active);
  sendJson(res, { items }, 'Specializations retrieved');
});

app.post('/api/v1/specializations', authMiddleware, requireRole(['admin']), (req, res) => {
  const { name, description } = req.body;
  if (!name) return sendError(res, "'name' is required.", 'VALIDATION_ERROR', 422);

  const id = name.toLowerCase().replace(/\s+/g, '_');
  const spec = {
    id,
    name,
    description: description || '',
    is_active: true,
    created_at: new Date().toISOString(),
  };
  db.specializations[id] = spec;
  sendJson(res, spec, 'Specialization created', 201);
});

app.put('/api/v1/specializations/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const spec = db.specializations[req.params.id];
  if (!spec) return sendError(res, 'Specialization not found', 'NOT_FOUND', 404);

  Object.assign(spec, req.body);
  sendJson(res, spec, 'Specialization updated');
});

app.delete('/api/v1/specializations/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const spec = db.specializations[req.params.id];
  if (!spec) return sendError(res, 'Specialization not found', 'NOT_FOUND', 404);
  spec.is_active = false;
  sendJson(res, null, 'Specialization deactivated successfully');
});

// -----------------------------------------------------------------------------
// 6. Patients & Staff
// -----------------------------------------------------------------------------
app.get('/api/v1/patients', authMiddleware, (req, res) => {
  const items = Object.values(db.patients);
  sendJson(res, { items, count: items.length }, 'Patients retrieved');
});

app.get('/api/v1/patients/:patient_id', authMiddleware, (req, res) => {
  const patient = db.patients[req.params.patient_id];
  if (!patient) return sendError(res, 'Patient profile not found', 'NOT_FOUND', 404);
  sendJson(res, patient, 'Patient profile retrieved');
});

app.put('/api/v1/patients/:patient_id', authMiddleware, (req, res) => {
  const id = req.params.patient_id;
  let patient = db.patients[id];
  if (!patient) {
    patient = { id, user_uid: id, created_at: new Date().toISOString() };
    db.patients[id] = patient;
  }
  Object.assign(patient, req.body, { updated_at: new Date().toISOString() });
  sendJson(res, patient, 'Patient updated');
});

app.get('/api/v1/staff', authMiddleware, requireRole(['admin', 'clinic', 'staff']), (req: AuthRequest, res) => {
  const clinicId = req.query.clinic_id || req.authUser.clinic_id;
  let items = Object.values(db.staff);
  if (clinicId) {
    items = items.filter((s: any) => s.clinic_id === clinicId);
  }
  sendJson(res, { items }, 'Staff list retrieved');
});

app.post('/api/v1/staff', authMiddleware, requireRole(['admin', 'clinic']), (req: AuthRequest, res) => {
  const { full_name, email, phone, role, clinic_id } = req.body;
  const targetClinic = clinic_id || req.authUser.clinic_id || 'clinic-1';

  if (!full_name || !email) {
    return sendError(res, "'full_name' and 'email' are required.", 'VALIDATION_ERROR', 422);
  }

  const id = `staff-${Date.now()}`;
  const staff = {
    id,
    clinic_id: targetClinic,
    full_name,
    email,
    phone: phone || '',
    role: role || 'receptionist',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.staff[id] = staff;
  sendJson(res, staff, 'Staff member registered', 201);
});

// -----------------------------------------------------------------------------
// 7. Schedules & Availability
// -----------------------------------------------------------------------------
app.get('/api/v1/doctors/:doctor_id/schedules', (req, res) => {
  const { doctor_id } = req.params;
  const { clinic_id } = req.query;

  let items = Object.values(db.schedules).filter((s: any) => s.doctor_id === doctor_id);
  if (clinic_id) {
    items = items.filter((s: any) => s.clinic_id === clinic_id);
  }
  sendJson(res, { items }, 'Schedules retrieved');
});

app.post('/api/v1/doctors/:doctor_id/schedules', authMiddleware, requireRole(['admin', 'clinic', 'doctor']), (req: AuthRequest, res) => {
  const { doctor_id } = req.params;
  const { clinic_id, day_of_week, start_time, end_time, slot_duration_minutes, breaks } = req.body;
  const targetClinic = clinic_id || req.authUser.clinic_id || 'clinic-1';

  if (!day_of_week || !start_time || !end_time) {
    return sendError(res, "'day_of_week', 'start_time', and 'end_time' are required.", 'VALIDATION_ERROR', 422);
  }

  const id = `sch-${Date.now()}`;
  const schedule = {
    id,
    doctor_id,
    clinic_id: targetClinic,
    day_of_week: day_of_week.toLowerCase(),
    start_time,
    end_time,
    slot_duration_minutes: Number(slot_duration_minutes) || 30,
    breaks: breaks || [],
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.schedules[id] = schedule;
  sendJson(res, schedule, 'Schedule configured successfully', 201);
});

app.get('/api/v1/doctors/:doctor_id/availability', (req, res) => {
  const { doctor_id } = req.params;
  const dateStr = req.query.date as string;
  let clinicId = req.query.clinic_id as string;

  if (!dateStr) {
    return sendError(res, "Query parameter 'date' (YYYY-MM-DD) is required.", 'VALIDATION_ERROR', 422);
  }

  const doc = db.doctors[doctor_id];
  if (!doc) return sendError(res, 'Doctor not found', 'NOT_FOUND', 404);

  if (!clinicId) {
    clinicId = doc.clinic_ids?.[0] || 'clinic-1';
  }

  const slots = generateSlots(doctor_id, clinicId, dateStr);
  sendJson(res, { doctor_id, clinic_id: clinicId, date: dateStr, slots }, `Generated ${slots.length} available slots`);
});

app.post('/api/v1/doctors/:doctor_id/availability/block', authMiddleware, requireRole(['admin', 'clinic', 'doctor']), (req: AuthRequest, res) => {
  const { doctor_id } = req.params;
  const { date, start_time, end_time, reason, clinic_id } = req.body;
  const targetClinic = clinic_id || req.authUser.clinic_id || 'clinic-1';

  const id = `avail-${Date.now()}`;
  const block = {
    id,
    doctor_id,
    clinic_id: targetClinic,
    date,
    start_time,
    end_time,
    reason: reason || 'Blocked time',
    is_blocked: true,
    created_by: req.authUser.uid,
    created_at: new Date().toISOString(),
  };

  db.availability[id] = block;
  sendJson(res, block, 'Time slot successfully blocked', 201);
});

// -----------------------------------------------------------------------------
// 8. Appointments
// -----------------------------------------------------------------------------
app.get('/api/v1/appointments', authMiddleware, (req: AuthRequest, res) => {
  const user = req.authUser;
  const { status, date } = req.query;

  let items = Object.values(db.appointments);

  // Scoping according to user role
  if (user.role === 'patient') {
    items = items.filter((a: any) => a.patient_uid === user.uid || a.patient_id === user.uid);
  } else if (user.role === 'doctor') {
    items = items.filter((a: any) => a.doctor_id === (user.doctor_id || user.uid));
  } else if (user.role === 'clinic' || user.role === 'staff') {
    items = items.filter((a: any) => a.clinic_id === user.clinic_id);
  }

  if (status) {
    items = items.filter((a: any) => a.status === status);
  }
  if (date) {
    items = items.filter((a: any) => a.date === date);
  }

  // Sort by date descending
  items.sort((a: any, b: any) => (b.date + b.start_time).localeCompare(a.date + a.start_time));

  sendJson(res, { items, count: items.length }, 'Appointments retrieved');
});

app.get('/api/v1/appointments/:appointment_id', authMiddleware, (req, res) => {
  const appt = db.appointments[req.params.appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);
  sendJson(res, appt, 'Appointment retrieved');
});

app.post('/api/v1/appointments', authMiddleware, (req: AuthRequest, res) => {
  const user = req.authUser;
  const { doctor_id, clinic_id, date, start_time, duration_minutes, appointment_type, reason, notes, patient_name, patient_id } = req.body;

  if (!doctor_id || !clinic_id || !date || !start_time) {
    return sendError(res, "'doctor_id', 'clinic_id', 'date', and 'start_time' are required.", 'VALIDATION_ERROR', 422);
  }

  const doctor = db.doctors[doctor_id];
  if (!doctor || doctor.status !== 'active') {
    return sendError(res, 'Doctor is currently inactive or not found', 'CONFLICT', 409);
  }

  const clinic = db.clinics[clinic_id];
  if (!clinic || clinic.status !== 'active') {
    return sendError(res, 'Clinic is currently not accepting appointments', 'CONFLICT', 409);
  }

  const duration = Number(duration_minutes) || doctor.appointment_duration_minutes || 30;
  const startMin = timeToMin(start_time);
  const endMin = startMin + duration;
  const endTime = minToTime(endMin);

  // Check double-booking conflicts
  const conflicts = Object.values(db.appointments).filter(
    (a: any) =>
      a.doctor_id === doctor_id &&
      a.date === date &&
      ['pending', 'confirmed', 'rescheduled'].includes(a.status) &&
      !(endMin <= timeToMin(a.start_time) || startMin >= timeToMin(a.end_time))
  );

  if (conflicts.length > 0) {
    return sendError(res, `The selected time slot ${start_time} is already booked`, 'SLOT_UNAVAILABLE', 409);
  }

  const id = `appt-${Date.now()}`;
  const initialStatus = ['admin', 'clinic', 'staff'].includes(user.role) ? 'confirmed' : 'pending';

  const appointment = {
    id,
    patient_id: patient_id || user.patient_id || user.uid,
    patient_uid: user.uid,
    patient_name: patient_name || user.full_name || 'Patient',
    clinic_id,
    clinic_name: clinic.name,
    doctor_id,
    doctor_name: doctor.name,
    date,
    start_time,
    end_time: endTime,
    duration_minutes: duration,
    appointment_type: appointment_type || 'in_person',
    reason: reason || 'General Consultation',
    status: initialStatus,
    payment_status: 'unpaid',
    consultation_fee: doctor.consultation_fee || 100.0,
    notes: notes || '',
    created_by: user.uid,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.appointments[id] = appointment;

  // Add notification
  const notifId = `notif-${Date.now()}`;
  db.notifications[notifId] = {
    id: notifId,
    user_uid: user.uid,
    type: 'appointment_booked',
    title: 'Appointment Booked',
    message: `Appointment with ${doctor.name} on ${date} at ${start_time} is ${initialStatus}.`,
    reference_id: id,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  sendJson(res, appointment, 'Appointment booked successfully', 201);
});

app.post('/api/v1/appointments/:appointment_id/confirm', authMiddleware, requireRole(['admin', 'clinic', 'doctor', 'staff']), (req, res) => {
  const appt = db.appointments[req.params.appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);
  appt.status = 'confirmed';
  appt.updated_at = new Date().toISOString();
  sendJson(res, appt, 'Appointment confirmed successfully');
});

app.post('/api/v1/appointments/:appointment_id/cancel', authMiddleware, (req: AuthRequest, res) => {
  const appt = db.appointments[req.params.appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);
  appt.status = 'cancelled';
  appt.cancelled_at = new Date().toISOString();
  appt.cancelled_by = req.authUser.uid;
  appt.cancellation_reason = req.body.reason || 'Cancelled by user';
  appt.updated_at = new Date().toISOString();
  sendJson(res, appt, 'Appointment cancelled successfully');
});

app.post('/api/v1/appointments/:appointment_id/reschedule', authMiddleware, (req, res) => {
  const appt = db.appointments[req.params.appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);

  const { new_date, new_start_time } = req.body;
  if (!new_date || !new_start_time) {
    return sendError(res, "'new_date' and 'new_start_time' are required.", 'VALIDATION_ERROR', 422);
  }

  const duration = appt.duration_minutes || 30;
  const startMin = timeToMin(new_start_time);
  const endTime = minToTime(startMin + duration);

  appt.date = new_date;
  appt.start_time = new_start_time;
  appt.end_time = endTime;
  appt.status = 'rescheduled';
  appt.updated_at = new Date().toISOString();

  sendJson(res, appt, 'Appointment rescheduled successfully');
});

app.post('/api/v1/appointments/:appointment_id/complete', authMiddleware, requireRole(['admin', 'clinic', 'doctor', 'staff']), (req, res) => {
  const appt = db.appointments[req.params.appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);
  appt.status = 'completed';
  appt.payment_status = 'paid';
  appt.updated_at = new Date().toISOString();
  sendJson(res, appt, 'Appointment marked as completed');
});

app.post('/api/v1/appointments/:appointment_id/no-show', authMiddleware, requireRole(['admin', 'clinic', 'doctor', 'staff']), (req, res) => {
  const appt = db.appointments[req.params.appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);
  appt.status = 'no_show';
  appt.updated_at = new Date().toISOString();
  sendJson(res, appt, 'Appointment marked as no-show');
});

// -----------------------------------------------------------------------------
// 9. Medical Records & Prescriptions
// -----------------------------------------------------------------------------
app.get('/api/v1/patients/:patient_id/medical-records', authMiddleware, (req: AuthRequest, res) => {
  const patientId = req.params.patient_id;
  const user = req.authUser;
  let items = Object.values(db.medical_records);

  if (patientId && patientId !== 'all') {
    items = items.filter((r: any) => r.patient_id === patientId || r.patient_uid === patientId);
  } else if (user) {
    if (user.role === 'patient') {
      items = items.filter((r: any) => r.patient_id === (user.patient_id || user.uid));
    } else if (user.role === 'doctor') {
      items = items.filter((r: any) => r.doctor_id === (user.doctor_id || user.uid));
    } else if (user.role === 'clinic' || user.role === 'staff') {
      items = items.filter((r: any) => r.clinic_id === user.clinic_id);
    }
  }

  // Enrich with names
  const enriched = items.map((r: any) => {
    const patient = db.patients[r.patient_id];
    const doc = db.doctors[r.doctor_id];
    const clinic = db.clinics[r.clinic_id];
    return {
      ...r,
      patient_name: r.patient_name || patient?.full_name || 'Patient',
      doctor_name: r.doctor_name || doc?.name || 'Physician',
      clinic_name: r.clinic_name || clinic?.name || 'Clinic',
    };
  });

  enriched.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
  sendJson(res, { items: enriched }, 'Medical records retrieved');
});

app.post('/api/v1/medical-records', authMiddleware, requireRole(['admin', 'doctor']), (req: AuthRequest, res) => {
  const { patient_id, appointment_id, diagnosis, symptoms, notes, follow_up_date, clinic_id } = req.body;
  if (!patient_id || !diagnosis) {
    return sendError(res, "'patient_id' and 'diagnosis' are required.", 'VALIDATION_ERROR', 422);
  }

  const id = `rec-${Date.now()}`;
  const record = {
    id,
    patient_id,
    doctor_id: req.authUser.doctor_id || req.authUser.uid,
    clinic_id: clinic_id || req.authUser.clinic_id || 'clinic-1',
    appointment_id: appointment_id || '',
    diagnosis,
    symptoms: symptoms || [],
    notes: notes || '',
    follow_up_date: follow_up_date || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.medical_records[id] = record;
  sendJson(res, record, 'Medical record created', 201);
});

app.get('/api/v1/patients/:patient_id/prescriptions', authMiddleware, (req: AuthRequest, res) => {
  const patientId = req.params.patient_id;
  const user = req.authUser;
  let items = Object.values(db.prescriptions);

  if (patientId && patientId !== 'all') {
    items = items.filter((p: any) => p.patient_id === patientId || p.patient_uid === patientId);
  } else if (user) {
    if (user.role === 'patient') {
      items = items.filter((p: any) => p.patient_id === (user.patient_id || user.uid));
    } else if (user.role === 'doctor') {
      items = items.filter((p: any) => p.doctor_id === (user.doctor_id || user.uid));
    } else if (user.role === 'clinic' || user.role === 'staff') {
      items = items.filter((p: any) => p.clinic_id === user.clinic_id);
    }
  }

  // Enrich with names
  const enriched = items.map((p: any) => {
    const patient = db.patients[p.patient_id];
    const doc = db.doctors[p.doctor_id];
    const clinic = db.clinics[p.clinic_id];
    return {
      ...p,
      patient_name: p.patient_name || patient?.full_name || 'Patient',
      doctor_name: p.doctor_name || doc?.name || 'Physician',
      clinic_name: p.clinic_name || clinic?.name || 'Clinic',
    };
  });

  enriched.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
  sendJson(res, { items: enriched }, 'Prescriptions retrieved');
});

app.post('/api/v1/prescriptions', authMiddleware, requireRole(['admin', 'doctor']), (req: AuthRequest, res) => {
  const { patient_id, appointment_id, medicines, instructions, notes, clinic_id } = req.body;
  if (!patient_id || !medicines?.length) {
    return sendError(res, "'patient_id' and medicines list are required.", 'VALIDATION_ERROR', 422);
  }

  const id = `rx-${Date.now()}`;
  const prescription = {
    id,
    patient_id,
    doctor_id: req.authUser.doctor_id || req.authUser.uid,
    clinic_id: clinic_id || req.authUser.clinic_id || 'clinic-1',
    appointment_id: appointment_id || '',
    medicines,
    instructions: instructions || '',
    notes: notes || '',
    created_at: new Date().toISOString(),
  };

  db.prescriptions[id] = prescription;
  sendJson(res, prescription, 'Prescription created', 201);
});

// -----------------------------------------------------------------------------
// 10. Reviews & Notifications
// -----------------------------------------------------------------------------
app.get('/api/v1/reviews', (req, res) => {
  const { doctor_id, clinic_id } = req.query;
  let items = Object.values(db.reviews).filter((r: any) => r.status === 'approved');
  if (doctor_id) {
    items = items.filter((r: any) => r.doctor_id === doctor_id);
  }
  if (clinic_id) {
    items = items.filter((r: any) => r.clinic_id === clinic_id);
  }

  const enriched = items.map((r: any) => {
    const doc = db.doctors[r.doctor_id];
    const clinic = db.clinics[r.clinic_id];
    return {
      ...r,
      doctor_name: r.doctor_name || doc?.name || 'Physician',
      clinic_name: r.clinic_name || clinic?.name || 'Clinic',
    };
  });

  enriched.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
  sendJson(res, { items: enriched, count: enriched.length }, 'Reviews retrieved');
});

app.get('/api/v1/doctors/:doctor_id/reviews', (req, res) => {
  const items = Object.values(db.reviews).filter((r: any) => r.doctor_id === req.params.doctor_id && r.status === 'approved');
  const enriched = items.map((r: any) => {
    const doc = db.doctors[r.doctor_id];
    const clinic = db.clinics[r.clinic_id];
    return {
      ...r,
      doctor_name: r.doctor_name || doc?.name || 'Physician',
      clinic_name: r.clinic_name || clinic?.name || 'Clinic',
    };
  });
  sendJson(res, { items: enriched }, 'Reviews retrieved');
});

app.get('/api/v1/clinics/:clinic_id/reviews', (req, res) => {
  const items = Object.values(db.reviews).filter((r: any) => r.clinic_id === req.params.clinic_id && r.status === 'approved');
  const enriched = items.map((r: any) => {
    const doc = db.doctors[r.doctor_id];
    const clinic = db.clinics[r.clinic_id];
    return {
      ...r,
      doctor_name: r.doctor_name || doc?.name || 'Physician',
      clinic_name: r.clinic_name || clinic?.name || 'Clinic',
    };
  });
  sendJson(res, { items: enriched }, 'Reviews retrieved');
});

app.post('/api/v1/reviews', authMiddleware, (req: AuthRequest, res) => {
  const { appointment_id, rating, comment } = req.body;
  if (!appointment_id) return sendError(res, "'appointment_id' is required", 'VALIDATION_ERROR', 422);

  const appt = db.appointments[appointment_id];
  if (!appt) return sendError(res, 'Appointment not found', 'NOT_FOUND', 404);

  const id = `rev-${Date.now()}`;
  const rev = {
    id,
    patient_id: req.authUser.patient_id || req.authUser.uid,
    patient_name: req.authUser.full_name || 'Patient',
    doctor_id: appt.doctor_id,
    clinic_id: appt.clinic_id,
    appointment_id,
    rating: Number(rating) || 5,
    comment: comment || '',
    status: 'approved',
    created_at: new Date().toISOString(),
  };

  db.reviews[id] = rev;

  // Update doctor rating
  const doc = db.doctors[appt.doctor_id];
  if (doc) {
    const oldCnt = doc.rating_count || 0;
    const oldAvg = doc.rating_avg || 5.0;
    const newCnt = oldCnt + 1;
    doc.rating_avg = Math.round(((oldAvg * oldCnt + Number(rating)) / newCnt) * 10) / 10;
    doc.rating_count = newCnt;
  }

  sendJson(res, rev, 'Review submitted successfully', 201);
});

app.get('/api/v1/notifications', authMiddleware, (req: AuthRequest, res) => {
  const items = Object.values(db.notifications).filter((n: any) => n.user_uid === req.authUser.uid);
  items.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
  sendJson(res, { items }, 'Notifications retrieved');
});

app.post('/api/v1/notifications/:id/read', authMiddleware, (req, res) => {
  const notif = db.notifications[req.params.id];
  if (notif) notif.is_read = true;
  sendJson(res, null, 'Notification marked as read');
});

app.post('/api/v1/notifications/read-all', authMiddleware, (req: AuthRequest, res) => {
  Object.values(db.notifications)
    .filter((n: any) => n.user_uid === req.authUser.uid)
    .forEach((n: any) => (n.is_read = true));
  sendJson(res, null, 'All notifications marked as read');
});

// -----------------------------------------------------------------------------
// 11. Dashboards
// -----------------------------------------------------------------------------
app.get('/api/v1/dashboard/patient', authMiddleware, (req: AuthRequest, res) => {
  const today = new Date().toISOString().split('T')[0];
  const appts = Object.values(db.appointments).filter((a: any) => a.patient_uid === req.authUser.uid || a.patient_id === req.authUser.uid);

  const upcoming = appts.filter(
    (a: any) => ['pending', 'confirmed', 'rescheduled'].includes(a.status) && a.date >= today
  );
  const completed = appts.filter((a: any) => a.status === 'completed').length;
  const cancelled = appts.filter((a: any) => a.status === 'cancelled').length;

  sendJson(res, {
    upcoming_appointments: upcoming,
    total_upcoming: upcoming.length,
    total_completed: completed,
    total_cancelled: cancelled,
  }, 'Patient dashboard summary');
});

app.get('/api/v1/dashboard/doctor', authMiddleware, (req: AuthRequest, res) => {
  const docId = req.authUser.doctor_id || req.authUser.uid;
  const today = new Date().toISOString().split('T')[0];
  const appts = Object.values(db.appointments).filter((a: any) => a.doctor_id === docId);

  const todayAppts = appts.filter(
    (a: any) => a.date === today && ['pending', 'confirmed', 'rescheduled'].includes(a.status)
  );
  const upcomingCount = appts.filter(
    (a: any) => a.date > today && ['pending', 'confirmed', 'rescheduled'].includes(a.status)
  ).length;
  const completedCount = appts.filter((a: any) => a.status === 'completed').length;
  const uniquePatients = new Set(appts.map((a: any) => a.patient_id)).size;

  sendJson(res, {
    today_appointments: todayAppts,
    today_count: todayAppts.length,
    upcoming_count: upcomingCount,
    completed_count: completedCount,
    unique_patients: uniquePatients,
  }, 'Doctor dashboard summary');
});

app.get('/api/v1/dashboard/clinic', authMiddleware, (req: AuthRequest, res) => {
  const clinicId = (req.query.clinic_id as string) || req.authUser.clinic_id || 'clinic-1';
  const today = new Date().toISOString().split('T')[0];

  const appts = Object.values(db.appointments).filter((a: any) => a.clinic_id === clinicId);
  const docs = Object.values(db.doctors).filter((d: any) => d.clinic_ids?.includes(clinicId));

  const todayCount = appts.filter((a: any) => a.date === today && ['pending', 'confirmed', 'rescheduled'].includes(a.status)).length;
  const upcomingCount = appts.filter((a: any) => a.date > today && ['pending', 'confirmed', 'rescheduled'].includes(a.status)).length;
  const completedCount = appts.filter((a: any) => a.status === 'completed').length;
  const cancelledCount = appts.filter((a: any) => a.status === 'cancelled').length;

  const estimatedRevenue = appts
    .filter((a: any) => a.status === 'completed' && a.payment_status === 'paid')
    .reduce((acc: number, curr: any) => acc + (Number(curr.consultation_fee) || 0), 0);

  sendJson(res, {
    total_doctors: docs.length,
    today_appointments_count: todayCount,
    upcoming_appointments_count: upcomingCount,
    completed_appointments_count: completedCount,
    cancelled_appointments_count: cancelledCount,
    estimated_revenue: estimatedRevenue,
  }, 'Clinic dashboard summary');
});

app.get('/api/v1/dashboard/admin', authMiddleware, requireRole(['admin']), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const clinics = Object.values(db.clinics);
  const activeClinics = clinics.filter((c: any) => c.status === 'active').length;
  const doctors = Object.values(db.doctors);
  const users = Object.values(db.users);
  const appts = Object.values(db.appointments);

  sendJson(res, {
    total_clinics: clinics.length,
    active_clinics: activeClinics,
    total_doctors: doctors.length,
    total_users: users.length,
    total_appointments: appts.length,
    appointments_today: appts.filter((a: any) => a.date === today).length,
    appointments_completed: appts.filter((a: any) => a.status === 'completed').length,
  }, 'Platform admin overview');
});

// -----------------------------------------------------------------------------
// Vite Server mounting
// -----------------------------------------------------------------------------
async function bootstrap() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Serve public static assets
  app.use(express.static(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChedoCare API & Web Server] running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
});
