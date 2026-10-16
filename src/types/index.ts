/**
 * Core domain types for DocPulse India SaaS
 */

export * from './doctor';
export * from './appointment';
export * from './queue';
export * from './auth';
export * from './public-doctor';

export type IndianCity =
  | 'Mumbai'
  | 'Delhi-NCR'
  | 'Bengaluru'
  | 'Hyderabad'
  | 'Chennai'
  | 'Kolkata'
  | 'Pune'
  | 'Ahmedabad'
  | 'Jaipur'
  | 'Chandigarh'
  | 'Lucknow'
  | 'Kochi'
  | 'Indore'
  | 'Nagpur';

export type MedicalSpecialization =
  | 'General Medicine'
  | 'Pediatrics'
  | 'Cardiology'
  | 'Dermatology'
  | 'Orthopedics'
  | 'Obstetrics & Gynecology'
  | 'ENT (Otolaryngology)'
  | 'Ophthalmology'
  | 'Dentistry'
  | 'Neurology'
  | 'Psychiatry'
  | 'Pulmonology';
