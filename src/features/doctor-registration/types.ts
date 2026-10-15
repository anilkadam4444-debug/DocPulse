export type RegistrationStep = 1 | 2 | 3 | 4 | 5;

export interface DoctorAccountData {
  fullName: string;
  email: string;
  countryCode: string; // "+91"
  mobile: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface ProfessionalDetailsData {
  qualifications: string; // e.g. "MBBS, MD (Medicine)"
  specialization: string;
  customSpecialization?: string;
  registrationCouncil: string;
  registrationNumber: string;
  experienceYears?: string;
  languages: string[];
  bio?: string;
}

export type PracticeType =
  | 'independent_clinic'
  | 'polyclinic'
  | 'hospital_opd'
  | 'nursing_home';

export interface ClinicLocationData {
  clinicName: string;
  practiceType: PracticeType;
  city: string;
  state: string;
  addressLine: string;
  locality: string;
  landmark?: string;
  pincode: string;
  consultationFee: string;
  followUpDays: number; // e.g. 7 days
  followUpFee: string; // e.g. "0" for free
  clinicPhone?: string;
}

export interface SessionTiming {
  openTime: string; // "09:00"
  closeTime: string; // "13:00"
  hasBreak: boolean;
  breakStart?: string; // "11:00"
  breakEnd?: string; // "11:30"
}

export interface ConsultationScheduleData {
  avgDurationMinutes: number; // 5, 10, 15, 20, 30 or custom
  isCustomDuration: boolean;
  customDurationMinutes?: string;
  workingDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  session1: SessionTiming;
  hasSession2: boolean;
  session2?: SessionTiming;
  acceptsWalkIns: boolean;
}

export interface RegistrationFormState {
  account: DoctorAccountData;
  professional: ProfessionalDetailsData;
  clinic: ClinicLocationData;
  schedule: ConsultationScheduleData;
  currentStep: RegistrationStep;
  isCompleted: boolean;
}

export interface CapacityCalculationResult {
  availableMinutes: number;
  theoreticalCapacity: number;
  session1Minutes: number;
  session2Minutes: number;
}

export interface SlotPreviewItem {
  tokenNumber: number;
  formattedToken: string;
  startTime: string;
  endTime: string;
  arrivalWindow: string;
}
