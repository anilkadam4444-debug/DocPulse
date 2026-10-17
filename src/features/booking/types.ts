export type QueueStatus =
  | 'scheduled'
  | 'waiting'
  | 'called'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentStatus =
  | 'scheduled'
  | 'waiting'
  | 'called'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'confirmed'
  | 'pending';

export type BookingSource = 'online' | 'walk_in_qr' | 'receptionist' | 'qr' | 'walk_in';

export interface Appointment {
  appointmentId: string;
  bookingReference: string;
  doctorUid: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  city: string;
  patientName: string;
  patientMobile: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  visitReason?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timeZone: string; // e.g. Asia/Kolkata
  consultationDurationMinutes: number;
  consultationFee: string;
  status: AppointmentStatus;
  queueStatus?: QueueStatus;
  tokenNumber?: number;
  formattedToken?: string;
  sessionType?: 'session1' | 'session2';
  checkInTime?: string;
  calledTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  estimatedVisitTime?: string;
  delayMinutes?: number;
  patientsAhead?: number;
  queueOrder?: number;
  bookingSource: BookingSource;
  slotId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type SessionOperationalStatus = 'not_started' | 'active' | 'paused' | 'ended';

export interface DailyQueue {
  doctorUid: string;
  locationId: string;
  date: string;
  lastTokenNumber: number;
  currentServingToken?: number | null;
  sessionStatus: SessionOperationalStatus;
  sessionStartTime?: string;
  updatedAt?: unknown;
}

export interface BookedSlot {
  slotId: string;
  doctorUid: string;
  locationId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointmentId?: string;
  status: 'booked' | 'cancelled';
  createdAt?: string;
}

export interface CandidateTimeSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  sessionType: 'session1' | 'session2';
  sessionLabel: string;
  isAvailable: boolean;
  unavailableReason?: string;
  slotId: string;
}

export interface BookingFormData {
  doctorUid: string;
  locationId: string;
  appointmentDate: string;
  selectedSlot: CandidateTimeSlot | null;
  patientName: string;
  patientMobile: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  visitReason?: string;
  bookingSource?: BookingSource;
}

export interface BookingSubmissionResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
  errorCode?: 'SLOT_TAKEN' | 'DOCTOR_UNAVAILABLE' | 'INVALID_DATA' | 'NETWORK_ERROR';
}
