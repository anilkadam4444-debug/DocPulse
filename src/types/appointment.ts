import { IndianCity } from './index';

export type BookingChannel = 'online_web' | 'clinic_qr_walkin';

export type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'in_waiting_room'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface PatientDetails {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  whatsappNumber: string;
  city: IndianCity;
}

export interface Appointment {
  id: string;
  tenantId: string; // Doctor tenant ID
  doctorId: string;
  locationId: string;
  channel: BookingChannel;
  patient: PatientDetails;
  status: AppointmentStatus;
  date: string; // YYYY-MM-DD
  queueTokenNumber: number;
  tentativeConsultationTime: string; // e.g. "10:45 AM"
  estimatedWaitWindow: string; // e.g. "10:35 AM - 10:55 AM"
  whatsappNotificationSent: boolean;
  whatsappMessageId?: string;
  chiefComplaint?: string;
  createdAt: string;
  updatedAt: string;
}
