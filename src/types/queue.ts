export interface QueueSlot {
  tokenNumber: number;
  tentativeStartTime: string; // e.g. "10:30 AM"
  estimatedWindow: string; // e.g. "10:20 AM - 10:40 AM"
  status: 'serving' | 'next' | 'waiting' | 'completed' | 'cancelled';
  patientInitials: string;
  channel: 'online_web' | 'clinic_qr_walkin';
}

export interface QueueSessionConfig {
  sessionStartTime: string; // "09:00"
  sessionEndTime: string; // "13:00"
  averageConsultationMinutes: number; // e.g. 15
  bufferMinutes: number; // e.g. 3
  maxTokensPerSession: number;
}

export interface QueueEstimateCalculation {
  tokenNumber: number;
  tentativeTime: string;
  windowStart: string;
  windowEnd: string;
  minutesFromSessionStart: number;
  tokensAhead: number;
}
