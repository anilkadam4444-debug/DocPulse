export type PublicationStatus = 'draft' | 'pending_review' | 'published' | 'suspended';

export interface PublicPracticeLocation {
  id: string;
  name: string;
  practiceType?: string;
  addressLine: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  consultationFee?: string;
  facilities: string[];
  isPrimary: boolean;
  isActive: boolean;
}

export interface PublicDoctorProfile {
  doctorUid: string;
  fullName: string;
  specialization: string;
  customSpecialization?: string;
  qualifications: string;
  experienceYears?: string;
  languages: string[];
  bio?: string;
  registrationCouncil: string;
  registrationNumber: string;
  credentialsVerified: boolean; // Always false unless verified by admin authority registry
  status: PublicationStatus;
  city: string;
  cities: string[]; // List of cities where doctor has active clinics for discovery filtering
  primaryClinicName: string;
  primaryAddress: string;
  primaryLocality: string;
  primaryPincode: string;
  consultationFee: string;
  followUpFee?: string;
  followUpDays?: number;
  avgDurationMinutes: number;
  locations: PublicPracticeLocation[];
  schedule: {
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
  bookingPreferences: {
    walkInQREnabled: boolean;
    advanceBookingDays: number;
    onlineBookingEnabled: boolean;
  };
  searchKeywords?: string[];
  publishedAt?: string;
  updatedAt?: string;
}

export interface DoctorSearchFilters {
  city: string;
  specialization?: string;
  query?: string;
}
