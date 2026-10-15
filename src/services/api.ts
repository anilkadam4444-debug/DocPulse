/**
 * Architectural Service Boundaries for DocPulse India.
 * 
 * Provides decoupled interface contracts for Phase 2 implementation of:
 * - Cloud Firestore for persistence
 * - Firebase Auth for doctor & assistant identity
 * - Cloud Functions & WhatsApp Cloud API for notifications
 */

import {
  DoctorProfile,
  Appointment,
  IndianCity,
  MedicalSpecialization,
  QueueSlot,
  DoctorTenantAccount,
} from '../types';

export interface IDoctorService {
  getDoctorByTenantId(tenantId: string): Promise<DoctorProfile | null>;
  searchDoctors(params: {
    city: IndianCity;
    specialization?: MedicalSpecialization | string;
    query?: string;
  }): Promise<DoctorProfile[]>;
  updateDoctorScheduleSettings(
    tenantId: string,
    settings: { averageConsultationMinutes: number; sessionStartTime: string; sessionEndTime: string }
  ): Promise<void>;
}

export interface IAppointmentService {
  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  getAppointmentsForSession(tenantId: string, locationId: string, date: string): Promise<Appointment[]>;
  updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<void>;
}

export interface IWhatsAppNotificationService {
  sendTokenConfirmation(params: {
    recipientWhatsappNumber: string;
    doctorName: string;
    clinicName: string;
    tokenNumber: string;
    tentativeTime: string;
    arrivalWindow: string;
  }): Promise<{ success: boolean; messageId?: string }>;
  
  sendImminentTurnReminder(params: {
    recipientWhatsappNumber: string;
    tokenNumber: string;
    tokensAhead: number;
  }): Promise<{ success: boolean; messageId?: string }>;
}

export interface IAuthService {
  getCurrentTenant(): Promise<DoctorTenantAccount | null>;
  signOut(): Promise<void>;
}

/**
 * Architectural stub boundary for development environment.
 * Replaced by real Firestore/Firebase implementations in Phase 2.
 */
export const isMockService = true;
