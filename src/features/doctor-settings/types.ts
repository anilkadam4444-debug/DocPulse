import { PracticeLocation, ConsultationSettings, BookingPreferences } from '../../types/auth';

export type SettingsTabId =
  | 'profile'
  | 'locations'
  | 'consultation'
  | 'schedule'
  | 'preferences'
  | 'review';

export interface DoctorSettingsFormState {
  // 1. Professional Profile
  fullName: string;
  email: string;
  mobile: string;
  qualifications: string;
  specialization: string;
  customSpecialization?: string;
  registrationCouncil: string;
  registrationNumber: string;
  experienceYears?: string;
  languages: string[];
  bio?: string;

  // 2. Locations
  locations: PracticeLocation[];

  // 3. Consultation
  consultation: ConsultationSettings;

  // 4. Working Hours / Schedule
  schedule: {
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

  // 5. Booking Preferences
  preferences: BookingPreferences;
}
