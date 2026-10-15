import { RegistrationFormState } from './types';

export const SUGGESTED_DURATIONS = [5, 10, 15, 20, 30] as const;

export const DAYS_OF_WEEK = [
  { id: 'Mon', label: 'Mon' },
  { id: 'Tue', label: 'Tue' },
  { id: 'Wed', label: 'Wed' },
  { id: 'Thu', label: 'Thu' },
  { id: 'Fri', label: 'Fri' },
  { id: 'Sat', label: 'Sat' },
  { id: 'Sun', label: 'Sun' },
] as const;

export const COMMON_QUALIFICATIONS = [
  'MBBS',
  'MD',
  'MS',
  'DNB',
  'BDS',
  'MDS',
  'DM',
  'MCh',
  'BAMS',
  'BHMS',
  'FRCS',
  'MRCP',
] as const;

export const PRACTICE_TYPE_OPTIONS = [
  { id: 'independent_clinic', label: 'Private Solo Clinic', description: 'Your standalone clinic facility' },
  { id: 'polyclinic', label: 'Polyclinic / Group Practice', description: 'Shared facility with other practitioners' },
  { id: 'hospital_opd', label: 'Attached Hospital OPD Room', description: 'Visiting consultant chamber' },
  { id: 'nursing_home', label: 'Nursing Home / Day Care', description: 'In-patient daycare or nursing centre' },
] as const;

export const SPECIALIZATION_OPTIONS = [
  'General Physician',
  'Pediatrician',
  'Dentist',
  'Dermatologist',
  'Orthopedic',
  'Gynecologist',
  'Cardiologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Psychiatrist',
  'Neurologist',
  'Other',
] as const;

export const REGISTRATION_COUNCILS = [
  'National Medical Commission (NMC)',
  'Maharashtra Medical Council',
  'Karnataka Medical Council',
  'Delhi Medical Council',
  'Tamil Nadu Medical Council',
  'Telangana State Medical Council',
  'West Bengal Medical Council',
  'Gujarat Medical Council',
  'Uttar Pradesh Medical Council',
  'Dental Council of India (DCI)',
  'Other State Medical Council',
] as const;

export const COMMON_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Bengali',
  'Gujarati',
  'Malayalam',
  'Punjabi',
] as const;

export const INDIAN_STATES = [
  'Maharashtra',
  'Delhi-NCR',
  'Karnataka',
  'Telangana',
  'Tamil Nadu',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Punjab / Chandigarh',
  'Uttar Pradesh',
  'Kerala',
  'Madhya Pradesh',
  'Other State',
] as const;

export const INITIAL_REGISTRATION_STATE: RegistrationFormState = {
  account: {
    fullName: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  },
  professional: {
    qualifications: 'MBBS, MD',
    specialization: 'General Physician',
    customSpecialization: '',
    registrationCouncil: 'National Medical Commission (NMC)',
    registrationNumber: '',
    experienceYears: '',
    languages: ['English', 'Hindi'],
    bio: '',
  },
  clinic: {
    clinicName: '',
    practiceType: 'independent_clinic',
    city: 'Mumbai',
    state: 'Maharashtra',
    addressLine: '',
    locality: '',
    landmark: '',
    pincode: '',
    consultationFee: '500',
    followUpDays: 7,
    followUpFee: '0',
    clinicPhone: '',
  },
  schedule: {
    avgDurationMinutes: 15,
    isCustomDuration: false,
    customDurationMinutes: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    session1: {
      openTime: '09:00',
      closeTime: '13:00',
      hasBreak: false,
      breakStart: '11:00',
      breakEnd: '11:30',
    },
    hasSession2: true,
    session2: {
      openTime: '17:00',
      closeTime: '20:30',
      hasBreak: false,
      breakStart: '18:30',
      breakEnd: '19:00',
    },
    acceptsWalkIns: true,
  },
  currentStep: 1,
  isCompleted: false,
};
