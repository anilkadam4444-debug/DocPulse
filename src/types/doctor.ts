import { IndianCity, MedicalSpecialization } from './index';
import { PracticeLocation } from './auth';

/**
 * Doctor tenant model.
 * Each doctor is an independent account holder & tenant in the multi-tenant architecture.
 * Clinic or hospital names are practice locations associated with the doctor's account.
 */

export interface DoctorProfile {
  id: string;
  tenantId: string;
  fullName: string;
  registrationNumber: string; // Indian Medical Council / State Council Registration No.
  stateCouncil: string;
  specialization: MedicalSpecialization;
  subSpecialties?: string[];
  qualifications: string; // e.g. "MBBS, MD (Medicine)"
  experienceYears: number;
  consultationFeeInr: number;
  averageConsultationMinutes: number; // e.g. 10, 15, 20 minutes (used for queue timing engine)
  phone: string;
  whatsappNumber: string;
  email: string;
  practiceLocations: PracticeLocation[];
  bio?: string;
  activeSessionToday?: {
    locationId: string;
    startTime: string; // e.g. "09:30"
    endTime: string; // e.g. "13:30"
    currentServingToken: number;
    totalIssuedTokens: number;
    isOpenForBooking: boolean;
  };
}
