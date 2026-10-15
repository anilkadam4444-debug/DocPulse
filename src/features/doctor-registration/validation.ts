import type {
  DoctorAccountData,
  ProfessionalDetailsData,
  ClinicLocationData,
  ConsultationScheduleData,
  CapacityCalculationResult,
  SessionTiming,
  SlotPreviewItem,
} from './types.ts';

/**
 * Converts "HH:MM" (24-hour) string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into "HH:MM AM/PM"
 */
export function minutesToDisplayTime(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

export function validateAccountStep(data: DoctorAccountData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Doctor full name is required';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Name must be at least 3 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'Professional email address is required';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  const cleanMobile = data.mobile.replace(/\D/g, '');
  if (!cleanMobile) {
    errors.mobile = 'Mobile number is required';
  } else if (cleanMobile.length !== 10) {
    errors.mobile = 'Indian mobile number must be exactly 10 digits';
  } else if (!/^[6-9]/.test(cleanMobile)) {
    errors.mobile = 'Mobile number must start with 6, 7, 8, or 9';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
    errors.password = 'Password must contain at least one letter and one number';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!data.agreeTerms) {
    errors.agreeTerms = 'You must accept the Terms of Practice and Privacy Policy';
  }

  return errors;
}

export function validateProfessionalStep(data: ProfessionalDetailsData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.qualifications?.trim()) {
    errors.qualifications = 'Medical qualifications/degrees are required (e.g. MBBS, MD)';
  } else if (data.qualifications.trim().length < 2) {
    errors.qualifications = 'Please specify valid medical degree(s)';
  }

  if (!data.specialization) {
    errors.specialization = 'Medical specialization is required';
  } else if (data.specialization === 'Other' && !data.customSpecialization?.trim()) {
    errors.customSpecialization = 'Please specify your specialization';
  }

  if (!data.registrationCouncil?.trim()) {
    errors.registrationCouncil = 'Medical registration authority/council is required';
  }

  if (!data.registrationNumber?.trim()) {
    errors.registrationNumber = 'Medical registration number is mandatory';
  } else if (data.registrationNumber.trim().length < 3) {
    errors.registrationNumber = 'Please enter a valid registration number';
  }

  if (data.experienceYears && data.experienceYears.trim() !== '') {
    const exp = Number(data.experienceYears);
    if (isNaN(exp) || exp < 0 || exp > 70) {
      errors.experienceYears = 'Experience must be a realistic number between 0 and 70';
    }
  }

  return errors;
}

export function validateClinicLocationStep(data: ClinicLocationData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.clinicName.trim()) {
    errors.clinicName = 'Clinic or practice location name is required';
  }

  if (!data.city?.trim()) {
    errors.city = 'City is mandatory for patient discovery';
  }

  if (!data.state?.trim()) {
    errors.state = 'State is required';
  }

  if (!data.locality?.trim()) {
    errors.locality = 'Area / Locality is required (e.g. Bandra West, Indiranagar)';
  }

  if (!data.addressLine?.trim()) {
    errors.addressLine = 'Full clinic address is required';
  }

  const cleanPin = data.pincode.replace(/\D/g, '');
  if (!cleanPin) {
    errors.pincode = 'PIN code is required';
  } else if (cleanPin.length !== 6) {
    errors.pincode = 'Indian postal PIN code must be exactly 6 digits';
  }

  const fee = Number(data.consultationFee);
  if (!data.consultationFee || isNaN(fee) || fee <= 0) {
    errors.consultationFee = 'Consultation fee must be a valid amount greater than ₹0';
  }

  const followUp = Number(data.followUpFee);
  if (data.followUpFee && (isNaN(followUp) || followUp < 0)) {
    errors.followUpFee = 'Follow-up fee must be 0 (Free) or a positive amount';
  }

  return errors;
}

function validateSingleSession(
  session: SessionTiming,
  sessionName: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  const openM = timeStringToMinutes(session.openTime);
  const closeM = timeStringToMinutes(session.closeTime);

  if (!session.openTime) {
    errors[`${sessionName}_openTime`] = 'Opening time is required';
  }
  if (!session.closeTime) {
    errors[`${sessionName}_closeTime`] = 'Closing time is required';
  }

  if (session.openTime && session.closeTime && closeM <= openM) {
    errors[`${sessionName}_closeTime`] = 'Closing time must be later than opening time';
  }

  if (session.hasBreak) {
    if (!session.breakStart) {
      errors[`${sessionName}_breakStart`] = 'Break start time is required';
    }
    if (!session.breakEnd) {
      errors[`${sessionName}_breakEnd`] = 'Break end time is required';
    }

    if (session.breakStart && session.breakEnd) {
      const bStartM = timeStringToMinutes(session.breakStart);
      const bEndM = timeStringToMinutes(session.breakEnd);

      if (bEndM <= bStartM) {
        errors[`${sessionName}_breakEnd`] = 'Break end time must be after break start time';
      }
      if (bStartM < openM || bEndM > closeM) {
        errors[`${sessionName}_breakStart`] = 'Break period must fall within session hours';
      }
    }
  }

  return errors;
}

export function validateScheduleStep(data: ConsultationScheduleData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.workingDays || data.workingDays.length === 0) {
    errors.workingDays = 'Please select at least one working day for your clinic';
  }

  const duration = data.isCustomDuration
    ? parseInt(data.customDurationMinutes || '0', 10)
    : data.avgDurationMinutes;

  if (data.isCustomDuration) {
    if (!data.customDurationMinutes || isNaN(duration) || duration < 3 || duration > 120) {
      errors.customDurationMinutes = 'Custom duration must be between 3 and 120 minutes';
    }
  } else if (!duration || duration <= 0) {
    errors.avgDurationMinutes = 'Please select a valid consultation duration';
  }

  // Validate session 1
  const s1Errors = validateSingleSession(data.session1, 'session1');
  Object.assign(errors, s1Errors);

  // Validate session 2 if enabled
  if (data.hasSession2 && data.session2) {
    const s2Errors = validateSingleSession(data.session2, 'session2');
    Object.assign(errors, s2Errors);

    // Overlap check
    const s1CloseM = timeStringToMinutes(data.session1.closeTime);
    const s2OpenM = timeStringToMinutes(data.session2.openTime);

    if (s2OpenM < s1CloseM) {
      errors.session2_openTime = 'Second session cannot overlap with first session';
    }
  }

  return errors;
}

/**
 * Calculates theoretical patient appointment capacity per day based on configured sessions,
 * breaks, and average consultation duration.
 */
export function calculateDailyCapacity(
  data: ConsultationScheduleData
): CapacityCalculationResult {
  const getSessionAvailableMinutes = (session: SessionTiming): number => {
    const openM = timeStringToMinutes(session.openTime);
    const closeM = timeStringToMinutes(session.closeTime);
    if (closeM <= openM) return 0;

    let totalMinutes = closeM - openM;
    if (session.hasBreak && session.breakStart && session.breakEnd) {
      const bStartM = timeStringToMinutes(session.breakStart);
      const bEndM = timeStringToMinutes(session.breakEnd);
      if (bEndM > bStartM && bStartM >= openM && bEndM <= closeM) {
        totalMinutes -= bEndM - bStartM;
      }
    }
    return Math.max(0, totalMinutes);
  };

  const session1Minutes = getSessionAvailableMinutes(data.session1);
  const session2Minutes =
    data.hasSession2 && data.session2 ? getSessionAvailableMinutes(data.session2) : 0;

  const availableMinutes = session1Minutes + session2Minutes;

  const duration = data.isCustomDuration
    ? parseInt(data.customDurationMinutes || '15', 10) || 15
    : data.avgDurationMinutes || 15;

  const validDuration = Math.max(3, duration);
  const theoreticalCapacity = Math.floor(availableMinutes / validDuration);

  return {
    availableMinutes,
    theoreticalCapacity,
    session1Minutes,
    session2Minutes,
  };
}

/**
 * Generates tentative appointment slot previews and token numbers for doctor inspection.
 */
export function generateTentativeSlotPreview(
  openTime: string,
  closeTime: string,
  durationMins: number,
  breakStart?: string,
  breakEnd?: string,
  maxSlots: number = 6
): SlotPreviewItem[] {
  const openM = timeStringToMinutes(openTime);
  const closeM = timeStringToMinutes(closeTime);
  const duration = Math.max(3, durationMins || 15);
  const slots: SlotPreviewItem[] = [];

  const bStart = breakStart ? timeStringToMinutes(breakStart) : -1;
  const bEnd = breakEnd ? timeStringToMinutes(breakEnd) : -1;

  let currentStart = openM;
  let token = 1;

  while (currentStart + duration <= closeM && slots.length < maxSlots) {
    const currentEnd = currentStart + duration;

    // Check if slot overlaps with break
    if (bStart !== -1 && bEnd !== -1 && bEnd > bStart) {
      if (currentStart < bEnd && currentEnd > bStart) {
        currentStart = bEnd;
        continue;
      }
    }

    const arrivalStart = Math.max(openM, currentStart - 10);
    const arrivalWindow = `${minutesToDisplayTime(arrivalStart)} – ${minutesToDisplayTime(currentStart)}`;

    slots.push({
      tokenNumber: token,
      formattedToken: `T-${token < 10 ? '0' : ''}${token}`,
      startTime: minutesToDisplayTime(currentStart),
      endTime: minutesToDisplayTime(currentEnd),
      arrivalWindow,
    });

    token++;
    currentStart = currentEnd;
  }

  return slots;
}
