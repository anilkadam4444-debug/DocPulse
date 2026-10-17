import { DoctorTenantProfile } from '../../types/auth';
import { Appointment } from '../booking/types';

export interface ReceptionistAccount {
  id: string; // e.g. "rec_1729158392_abc"
  doctorUid: string;
  doctorName: string;
  clinicName: string;
  fullName: string;
  email: string;
  phone: string;
  assignedLocationIds: string[];
  assignedLocationNames: string[];
  passcode: string; // 6-digit access code or PIN
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface WalkInRegistrationData {
  patientName: string;
  patientMobile: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  chiefComplaint?: string;
  locationId: string;
}

export interface ReceptionistSession {
  receptionist: ReceptionistAccount;
  doctorProfile: {
    uid: string;
    fullName: string;
    specialization: string;
    qualifications: string;
    registrationNumber: string;
    clinicName: string;
    consultationFee: string;
    avgDurationMinutes?: number;
    locations: Array<{
      id: string;
      name?: string;
      clinicName?: string;
      locality: string;
      city: string;
      addressLine: string;
      pincode: string;
      consultationFee?: string;
      isActive?: boolean;
    }>;
  };
  token: string;
  loggedInAt: string;
}
