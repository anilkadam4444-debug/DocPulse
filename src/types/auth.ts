export type UserRole = 'doctor_owner' | 'authorized_assistant' | 'patient_guest';

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

export interface AssistantUserAccount {
  assistantUid: string;
  tenantId: string; // bound to doctor tenant
  fullName: string;
  email: string;
  phone: string;
  role: 'authorized_assistant';
  assignedLocationId: string;
  permissions: {
    canConfirmAppointments: boolean;
    canIssueWalkInTokens: boolean;
    canMarkArrived: boolean;
    canViewPatientSummary: boolean;
    canEditPrescriptions: false; // only doctor
  };
}
