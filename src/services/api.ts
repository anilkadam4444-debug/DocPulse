/**
 * Architectural Service Boundaries for DocPulse India.
 * 
 * Provides decoupled interface contracts and live Firebase implementations for:
 * - Cloud Firestore for persistence
 * - Firebase Auth for doctor identity
 * - WhatsApp notification contracts
 */

import {
  DoctorProfile,
  Appointment,
  IndianCity,
  MedicalSpecialization,
  DoctorTenantAccount,
} from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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

export const authService: IAuthService = {
  async getCurrentTenant(): Promise<DoctorTenantAccount | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const snap = await getDoc(doc(db, 'doctors', currentUser.uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        tenantId: data.tenantId || currentUser.uid,
        doctorUid: currentUser.uid,
        email: data.email || currentUser.email || '',
        phone: data.mobile || '',
        plan: 'free_trial',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionStatus: 'trial_active',
        role: 'doctor_owner',
      };
    } catch {
      return null;
    }
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },
};

export const isMockService = false;
