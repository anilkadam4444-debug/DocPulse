import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { PublicDoctorProfile, PublicPracticeLocation } from '../../types/public-doctor';
import {
  Appointment,
  BookedSlot,
  CandidateTimeSlot,
  BookingFormData,
  BookingSubmissionResult,
} from './types';

/**
 * Returns the current date and time string in Asia/Kolkata timezone.
 */
export function getNowInKolkata(): { dateStr: string; timeStr: string; dayName: string } {
  const now = new Date();
  const kolkataFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = kolkataFormatter.formatToParts(now);
  let year = '';
  let month = '';
  let day = '';
  let hour = '';
  let minute = '';
  let weekday = '';

  for (const p of parts) {
    if (p.type === 'year') year = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'hour') hour = p.value;
    if (p.type === 'minute') minute = p.value;
    if (p.type === 'weekday') weekday = p.value;
  }

  // Handle midnight 24 hour conversion
  if (hour === '24') hour = '00';

  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hour}:${minute}`,
    dayName: weekday, // e.g. "Mon"
  };
}

/**
 * Converts a 24hr HH:mm string to a 12hr AM/PM formatted string.
 */
export function formatTime12Hr(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minStr} ${ampm}`;
}

/**
 * Adds minutes to an HH:mm 24-hr time string.
 */
function addMinutesToTime(time24: string, minutesToAdd: number): string {
  const [h, m] = time24.split(':').map((s) => parseInt(s, 10));
  const totalMinutes = h * 60 + m + minutesToAdd;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

/**
 * Compares two HH:mm 24-hr times. Returns negative if a < b, positive if a > b, 0 if equal.
 */
function compareTimes(timeA: string, timeB: string): number {
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  return hA * 60 + mA - (hB * 60 + mB);
}

/**
 * Checks whether an interval [startA, endA] overlaps with [startB, endB].
 */
function timesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return compareTimes(startA, endB) < 0 && compareTimes(endA, startB) > 0;
}

/**
 * Generates eligible booking dates starting from today up to advanceBookingDays.
 * Strictly respects the doctor's working days.
 */
export function generateEligibleDates(
  doctor: PublicDoctorProfile,
  maxAdvanceDays: number = 7
): {
  dateStr: string;
  dayName: string;
  formattedDate: string;
  isWorkingDay: boolean;
}[] {
  const { dateStr: todayStr } = getNowInKolkata();
  const eligibleDates: {
    dateStr: string;
    dayName: string;
    formattedDate: string;
    isWorkingDay: boolean;
  }[] = [];

  const workingDays = doctor.schedule?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayAbbrMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Parse today in UTC to iterate cleanly by day
  const baseDate = new Date(`${todayStr}T00:00:00Z`);

  for (let i = 0; i < maxAdvanceDays; i++) {
    const target = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const y = target.getUTCFullYear();
    const m = (target.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = target.getUTCDate().toString().padStart(2, '0');
    const currentDayStr = `${y}-${m}-${d}`;
    const dayName = dayAbbrMap[target.getUTCDay()];

    const isWorkingDay = workingDays.includes(dayName);

    const formattedDate = target.toLocaleDateString('en-IN', {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    eligibleDates.push({
      dateStr: currentDayStr,
      dayName,
      formattedDate,
      isWorkingDay,
    });
  }

  return eligibleDates;
}

/**
 * Generates all candidate time slots for a given date and location,
 * then queries Firestore to cross-reference already-booked slots and past times.
 */
export async function getAuthoritativeSlotsForDate(
  doctor: PublicDoctorProfile,
  locationId: string,
  dateStr: string
): Promise<{ slots: CandidateTimeSlot[]; error?: string }> {
  try {
    const duration = doctor.avgDurationMinutes || 15;
    const schedule = doctor.schedule;
    const { dateStr: todayStr, timeStr: currentTimeStr } = getNowInKolkata();

    const location = doctor.locations.find((l) => l.id === locationId) || doctor.locations[0];
    if (!location) {
      return { slots: [], error: 'Selected clinic location was not found.' };
    }

    const candidateSlots: CandidateTimeSlot[] = [];

    // Helper to generate slots for a session
    const buildSessionSlots = (
      session: {
        openTime: string;
        closeTime: string;
        hasBreak?: boolean;
        breakStart?: string;
        breakEnd?: string;
      },
      sessionType: 'session1' | 'session2',
      sessionLabel: string
    ) => {
      let currentStart = session.openTime;

      while (true) {
        const currentEnd = addMinutesToTime(currentStart, duration);
        // Exceeds session close time
        if (compareTimes(currentEnd, session.closeTime) > 0) {
          break;
        }

        // Check if overlaps with scheduled break buffer
        let overlapsBreak = false;
        if (session.hasBreak && session.breakStart && session.breakEnd) {
          if (timesOverlap(currentStart, currentEnd, session.breakStart, session.breakEnd)) {
            overlapsBreak = true;
          }
        }

        const slotId = `${location.id}_${dateStr}_${currentStart.replace(':', '')}`;

        candidateSlots.push({
          startTime: currentStart,
          endTime: currentEnd,
          displayTime: `${formatTime12Hr(currentStart)} – ${formatTime12Hr(currentEnd)}`,
          sessionType,
          sessionLabel,
          isAvailable: !overlapsBreak,
          unavailableReason: overlapsBreak ? 'Mid-shift break buffer' : undefined,
          slotId,
        });

        currentStart = currentEnd;
      }
    };

    // 1. Session 1 (Morning OPD)
    if (schedule?.session1) {
      buildSessionSlots(schedule.session1, 'session1', 'Morning OPD Shift');
    }

    // 2. Session 2 (Evening OPD)
    if (schedule?.hasSession2 && schedule?.session2) {
      buildSessionSlots(schedule.session2, 'session2', 'Evening OPD Shift');
    }

    // 3. Mark past slots for today
    const isToday = dateStr === todayStr;
    if (isToday) {
      // 15-minute preparation buffer from now
      const bufferedNow = addMinutesToTime(currentTimeStr, 15);
      for (const slot of candidateSlots) {
        if (compareTimes(slot.startTime, bufferedNow) <= 0) {
          slot.isAvailable = false;
          slot.unavailableReason = 'Slot has already passed today';
        }
      }
    }

    // 4. Query authoritative Firestore bookedSlots subcollection for conflicting reservations
    const bookedSlotsRef = collection(db, 'doctors', doctor.doctorUid, 'bookedSlots');
    const q = query(
      bookedSlotsRef,
      where('appointmentDate', '==', dateStr),
      where('locationId', '==', location.id),
      where('status', '==', 'booked')
    );

    const snapshot = await getDocs(q);
    const bookedSlotIds = new Set<string>();
    snapshot.forEach((snap) => {
      const data = snap.data() as BookedSlot;
      bookedSlotIds.add(data.slotId);
    });

    // Mark booked slots as unavailable
    for (const slot of candidateSlots) {
      if (bookedSlotIds.has(slot.slotId)) {
        slot.isAvailable = false;
        slot.unavailableReason = 'Already reserved by another patient';
      }
    }

    return { slots: candidateSlots };
  } catch (err: unknown) {
    console.error('Error fetching authoritative slots:', err);
    try {
      handleFirestoreError(
        err,
        OperationType.LIST,
        `doctors/${doctor.doctorUid}/bookedSlots`
      );
    } catch {
      // Logged and swallowed for clean user message
    }
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { slots: [], error: rawMsg };
  }
}

/**
 * Atomically commits a new patient appointment using Cloud Firestore Transactions (runTransaction)
 * to guarantee 100% double-booking prevention.
 */
export async function createAuthoritativeAppointment(
  bookingData: BookingFormData,
  doctor: PublicDoctorProfile
): Promise<BookingSubmissionResult> {
  const { doctorUid, locationId, appointmentDate, selectedSlot, patientName, patientMobile } =
    bookingData;

  if (!selectedSlot) {
    return {
      success: false,
      error: 'Please select a confirmed consultation time slot.',
      errorCode: 'INVALID_DATA',
    };
  }

  // 1. Authoritative practice location verification
  const location = doctor.locations.find((l) => l.id === locationId);
  if (!location || !location.isActive) {
    return {
      success: false,
      error: 'The selected practice location is currently not accepting online appointments.',
      errorCode: 'DOCTOR_UNAVAILABLE',
    };
  }

  // 2. Derive authoritative fee and duration from doctor/location configuration (never trust raw client value)
  const authoritativeFee = location.consultationFee || doctor.consultationFee || '500';
  const durationMinutes = doctor.avgDurationMinutes || 15;

  const slotId = selectedSlot.slotId;
  const appointmentId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const bookingReference = `DP-${appointmentDate.replace(/-/g, '').slice(2)}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  try {
    // Execute atomic transaction
    await runTransaction(db, async (transaction) => {
      // Step A: Check slot reservation document
      const slotDocRef = doc(db, 'doctors', doctorUid, 'bookedSlots', slotId);
      const slotSnap = await transaction.get(slotDocRef);

      if (slotSnap.exists()) {
        const slotData = slotSnap.data();
        if (slotData.status === 'booked') {
          throw new Error('SLOT_TAKEN');
        }
      }

      // Step B: Atomically write the slot lock
      transaction.set(slotDocRef, {
        slotId,
        doctorUid,
        locationId,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        appointmentId,
        status: 'booked',
        createdAt: serverTimestamp(),
      });

      // Step C: Atomically write the appointment record
      const appointmentDocRef = doc(db, 'doctors', doctorUid, 'appointments', appointmentId);
      const appointmentPayload = {
        appointmentId,
        bookingReference,
        doctorUid,
        locationId: location.id,
        locationName: location.name,
        locationAddress: `${location.addressLine}, ${location.locality}`,
        city: location.city,
        patientName: patientName.trim(),
        patientMobile: patientMobile.trim(),
        patientEmail: bookingData.patientEmail?.trim() || '',
        visitReason: bookingData.visitReason?.trim() || '',
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        timeZone: 'Asia/Kolkata',
        consultationDurationMinutes: durationMinutes,
        consultationFee: authoritativeFee,
        status: 'confirmed',
        bookingSource: 'online',
        slotId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      transaction.set(appointmentDocRef, appointmentPayload);
    });

    // Synthesize confirmed appointment object for UI display
    const confirmedAppointment: Appointment = {
      appointmentId,
      bookingReference,
      doctorUid,
      locationId: location.id,
      locationName: location.name,
      locationAddress: `${location.addressLine}, ${location.locality}`,
      city: location.city,
      patientName: patientName.trim(),
      patientMobile: patientMobile.trim(),
      patientEmail: bookingData.patientEmail?.trim() || '',
      visitReason: bookingData.visitReason?.trim() || '',
      appointmentDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      timeZone: 'Asia/Kolkata',
      consultationDurationMinutes: durationMinutes,
      consultationFee: authoritativeFee,
      status: 'confirmed',
      bookingSource: 'online',
      slotId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      appointment: confirmedAppointment,
    };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);

    if (rawMsg.includes('SLOT_TAKEN')) {
      return {
        success: false,
        error:
          'This consultation time slot was just reserved by another patient. Please choose another available time.',
        errorCode: 'SLOT_TAKEN',
      };
    }

    console.error('Firestore transaction booking error:', rawMsg);
    try {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `doctors/${doctorUid}/appointments/${appointmentId}`
      );
    } catch {
      // Handled for clean UI return
    }

    return {
      success: false,
      error: 'We were unable to confirm your booking. Please try again or select another time.',
      errorCode: 'NETWORK_ERROR',
    };
  }
}

/**
 * Fetches a confirmed appointment document by doctor UID and appointment ID.
 */
export async function getAppointmentById(
  doctorUid: string,
  appointmentId: string
): Promise<Appointment | null> {
  if (!doctorUid || !appointmentId) return null;
  try {
    const aptRef = doc(db, 'doctors', doctorUid, 'appointments', appointmentId);
    const snap = await getDoc(aptRef);
    if (!snap.exists()) return null;
    return snap.data() as Appointment;
  } catch (err) {
    console.error('Error fetching appointment:', err);
    return null;
  }
}

/**
 * Fetches all appointments for an authenticated doctor.
 */
export async function getDoctorAppointments(doctorUid: string): Promise<Appointment[]> {
  if (!doctorUid) return [];
  try {
    const aptRef = collection(db, 'doctors', doctorUid, 'appointments');
    const snapshot = await getDocs(aptRef);
    const appointments: Appointment[] = [];
    snapshot.forEach((snap) => {
      if (snap.exists()) {
        appointments.push(snap.data() as Appointment);
      }
    });

    // Sort by date and start time descending
    appointments.sort((a, b) => {
      const dateCmp = b.appointmentDate.localeCompare(a.appointmentDate);
      if (dateCmp !== 0) return dateCmp;
      return b.startTime.localeCompare(a.startTime);
    });

    return appointments;
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    return [];
  }
}

/**
 * Updates the status of an appointment (e.g. completed, cancelled, no_show).
 */
export async function updateAppointmentStatus(
  doctorUid: string,
  appointmentId: string,
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const aptRef = doc(db, 'doctors', doctorUid, 'appointments', appointmentId);
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updatedAt: serverTimestamp(),
    };
    if (notes !== undefined) {
      updatePayload.notes = notes;
    }
    await updateDoc(aptRef, updatePayload);
    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating appointment status:', err);
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: rawMsg };
  }
}
