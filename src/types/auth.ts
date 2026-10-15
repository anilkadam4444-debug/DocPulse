import type { User } from 'firebase/auth';

export type UserRole = 'doctor_owner' | 'authorized_assistant' | 'patient_guest';

export interface PracticeLocation {
  id: string;
  name?: string;
  clinicName?: string;
  practiceType?: string;
  addressLine: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  consultationFee?: string;
  facilities?: string[];
  isPrimary: boolean;
  isActive?: boolean;
  qrCodeId?: string;
  createdAt?: string;
}

export interface ConsultationSettings {
  defaultFee: string;
  followUpFee: string;
  followUpDays: number;
  avgDurationMinutes: number;
  inPersonEnabled: boolean;
  videoConsultationEnabled: boolean;
  emergencyReserveSlots: number;
}

export interface BookingPreferences {
  dailyTokenLimit: number;
  walkInQREnabled: boolean;
  whatsAppAlertThreshold: number; // Notify when N patients are ahead
  advanceBookingDays: number;
  cancellationNoticeHours: number;
  autoConfirmOnline: boolean;
}

export interface DoctorTenantProfile {
  uid: string;
  tenantId: string;
  fullName: string;
  email: string;
  mobile: string;
  qualifications: string;
  specialization: string;
  customSpecialization?: string;
  registrationCouncil: string;
  registrationNumber: string;
  experienceYears?: string;
  languages?: string;
  bio?: string;
  clinicName: string;
  practiceType: string;
  city: string;
  state: string;
  locality: string;
  addressLine: string;
  landmark?: string;
  pincode: string;
  consultationFee: string;
  followUpFee?: string;
  followUpDays?: number;
  clinicPhone?: string;
  avgDurationMinutes?: number;
  schedule?: {
    avgDurationMinutes: number;
    workingDays: string[];
    session1: {
      openTime: string;
      closeTime: string;
      hasBreak: boolean;
      breakStart?: string;
      breakEnd?: string;
    };
    hasSession2: boolean;
    session2?: {
      openTime: string;
      closeTime: string;
      hasBreak: boolean;
      breakStart?: string;
      breakEnd?: string;
    };
    acceptsWalkIns: boolean;
  };
  locations?: PracticeLocation[];
  consultationSettings?: ConsultationSettings;
  bookingPreferences?: BookingPreferences;
  role: 'doctor_owner';
  credentialsVerified: boolean;
  emailVerified: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DoctorTenantAccount {
  tenantId: string;
  doctorUid: string;
  email: string;
  phone: string;
  plan: 'free_trial' | 'active_monthly' | 'active_annual' | 'expired';
  trialEndsAt: string; // ISO date (1 month free trial)
  subscriptionStatus: 'trial_active' | 'subscribed' | 'grace_period' | 'cancelled';
  role: 'doctor_owner';
}

export interface AuthContextType {
  user: User | null;
  doctorProfile: DoctorTenantProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerDoctorAccount: (
    accountData: { fullName: string; email: string; mobile: string; password: string },
    professionalData: {
      qualifications: string;
      specialization: string;
      customSpecialization?: string;
      registrationCouncil: string;
      registrationNumber: string;
      experienceYears?: string;
      languages: string[];
      bio?: string;
    },
    clinicData: {
      clinicName: string;
      practiceType: string;
      city: string;
      state: string;
      locality: string;
      addressLine: string;
      landmark?: string;
      pincode: string;
      consultationFee: string;
      followUpFee?: string;
      followUpDays?: number;
      clinicPhone?: string;
    },
    scheduleData: {
      avgDurationMinutes: number;
      isCustomDuration?: boolean;
      customDurationMinutes?: string;
      workingDays: string[];
      session1: {
        openTime: string;
        closeTime: string;
        hasBreak: boolean;
        breakStart?: string;
        breakEnd?: string;
      };
      hasSession2: boolean;
      session2?: {
        openTime: string;
        closeTime: string;
        hasBreak: boolean;
        breakStart?: string;
        breakEnd?: string;
      };
      acceptsWalkIns: boolean;
    }
  ) => Promise<{ success: boolean; error?: string; canRetryProfile?: boolean }>;
  retryCreateProfile: () => Promise<{ success: boolean; error?: string }>;
  updateDoctorProfile: (partial: Partial<DoctorTenantProfile>) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  reloadUserStatus: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
