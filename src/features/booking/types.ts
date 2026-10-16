export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type BookingSource = 'online' | 'walk_in_qr' | 'receptionist';

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
  visitReason?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timeZone: string; // e.g. Asia/Kolkata
  consultationDurationMinutes: number;
  consultationFee: string;
  status: AppointmentStatus;
  bookingSource: BookingSource;
  slotId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
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
  patientEmail: string;
  visitReason: string;
}

export interface BookingSubmissionResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
  errorCode?: 'SLOT_TAKEN' | 'DOCTOR_UNAVAILABLE' | 'INVALID_DATA' | 'NETWORK_ERROR';
}
