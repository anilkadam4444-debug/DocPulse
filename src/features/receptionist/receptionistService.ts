import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ReceptionistAccount, ReceptionistSession, WalkInRegistrationData } from './types';
import { Appointment, QueueStatus } from '../booking/types';
import {
  registerAuthoritativeWalkInAppointment,
  updateAppointmentStatus,
  getNowInKolkata,
} from '../booking/bookingService';
import { updateQueueEntryStatus } from '../queue/queueService';
import { DoctorTenantProfile } from '../../types/auth';

const RECEPTIONIST_SESSION_KEY = 'docpulse_receptionist_session';

/**
 * Creates or updates a receptionist account under a doctor's tenant.
 */
export async function saveReceptionistAccount(
  doctorProfile: DoctorTenantProfile,
  data: {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
    assignedLocationIds: string[];
    passcode: string;
    status?: 'active' | 'suspended';
  }
): Promise<{ success: boolean; account?: ReceptionistAccount; error?: string }> {
  try {
    const receptionistId = data.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const assignedNames = (doctorProfile.locations || [])
      .filter((loc) => data.assignedLocationIds.includes(loc.id))
      .map((loc) => loc.name || loc.clinicName || loc.locality);

    const account: ReceptionistAccount = {
      id: receptionistId,
      doctorUid: doctorProfile.uid,
      doctorName: doctorProfile.fullName,
      clinicName: doctorProfile.clinicName,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      assignedLocationIds: data.assignedLocationIds,
      assignedLocationNames: assignedNames.length > 0 ? assignedNames : ['Primary Clinic'],
      passcode: data.passcode.trim(),
      status: data.status || 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Write to doctor subcollection: doctors/{doctorId}/receptionists/{receptionistId}
    const docRef = doc(db, 'doctors', doctorProfile.uid, 'receptionists', receptionistId);
    await setDoc(docRef, {
      ...account,
      updatedAt: serverTimestamp(),
    });

    // 2. Also write to central lookup for fast login: receptionists/{email}
    const lookupRef = doc(db, 'receptionists', account.email);
    await setDoc(lookupRef, {
      ...account,
      doctorProfileSnapshot: {
        uid: doctorProfile.uid,
        fullName: doctorProfile.fullName,
        specialization: doctorProfile.specialization,
        qualifications: doctorProfile.qualifications,
        registrationNumber: doctorProfile.registrationNumber,
        clinicName: doctorProfile.clinicName,
        consultationFee: doctorProfile.consultationFee,
        avgDurationMinutes: doctorProfile.avgDurationMinutes || 15,
        locations: doctorProfile.locations || [],
      },
      updatedAt: serverTimestamp(),
    });

    return { success: true, account };
  } catch (err: unknown) {
    console.error('Error saving receptionist account:', err);
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: rawMsg };
  }
}

/**
 * Retrieves all receptionists configured by a doctor.
 */
export async function getDoctorReceptionists(doctorUid: string): Promise<ReceptionistAccount[]> {
  if (!doctorUid) return [];
  try {
    const colRef = collection(db, 'doctors', doctorUid, 'receptionists');
    const snapshot = await getDocs(colRef);
    const list: ReceptionistAccount[] = [];
    snapshot.forEach((snap) => {
      if (snap.exists()) {
        list.push(snap.data() as ReceptionistAccount);
      }
    });

    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return list;
  } catch (err) {
    console.error('Error fetching doctor receptionists:', err);
    return [];
  }
}

/**
 * Deletes a receptionist account.
 */
export async function deleteReceptionistAccount(
  doctorUid: string,
  receptionistId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'doctors', doctorUid, 'receptionists', receptionistId);
    await deleteDoc(docRef);

    if (email) {
      const lookupRef = doc(db, 'receptionists', email.toLowerCase().trim());
      await deleteDoc(lookupRef).catch((e) => console.warn('Could not delete lookup doc:', e));
    }

    return { success: true };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: rawMsg };
  }
}

/**
 * Logs in a receptionist with email and passcode.
 */
export async function loginReceptionist(
  email: string,
  passcode: string
): Promise<{ success: boolean; session?: ReceptionistSession; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPasscode = passcode.trim();

  if (!cleanEmail || !cleanPasscode) {
    return { success: false, error: 'Please enter both your email address and passcode.' };
  }

  try {
    const lookupRef = doc(db, 'receptionists', cleanEmail);
    const snap = await getDoc(lookupRef);

    if (!snap.exists()) {
      return {
        success: false,
        error: 'No active receptionist account found for this email. Please check with your clinic doctor.',
      };
    }

    const data = snap.data();
    if (data.status !== 'active') {
      return {
        success: false,
        error: 'Your receptionist account has been temporarily suspended by the clinic administrator.',
      };
    }

    if (data.passcode !== cleanPasscode) {
      return {
        success: false,
        error: 'Invalid passcode. Please re-enter your clinic access passcode.',
      };
    }

    // Load fresh doctor profile if available
    let doctorProfile = data.doctorProfileSnapshot;
    if (data.doctorUid) {
      try {
        const docDocRef = doc(db, 'doctors', data.doctorUid);
        const docSnap = await getDoc(docDocRef);
        if (docSnap.exists()) {
          const freshData = docSnap.data();
          doctorProfile = {
            uid: data.doctorUid,
            fullName: freshData.fullName,
            specialization: freshData.specialization,
            qualifications: freshData.qualifications,
            registrationNumber: freshData.registrationNumber,
            clinicName: freshData.clinicName,
            consultationFee: freshData.consultationFee,
            avgDurationMinutes: freshData.avgDurationMinutes || 15,
            locations: freshData.locations || [],
          };
        }
      } catch (e) {
        console.warn('Silent doc profile fresh fetch fallback:', e);
      }
    }

    const session: ReceptionistSession = {
      receptionist: {
        id: data.id,
        doctorUid: data.doctorUid,
        doctorName: data.doctorName,
        clinicName: data.clinicName,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        assignedLocationIds: data.assignedLocationIds || [],
        assignedLocationNames: data.assignedLocationNames || [],
        passcode: '', // Sanitize in session
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastLoginAt: new Date().toISOString(),
      },
      doctorProfile,
      token: `rec_tok_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      loggedInAt: new Date().toISOString(),
    };

    saveReceptionistSession(session);
    return { success: true, session };
  } catch (err: unknown) {
    console.error('Error logging in receptionist:', err);
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Login error: ${rawMsg}` };
  }
}

/**
 * Saves receptionist session to browser localStorage.
 */
export function saveReceptionistSession(session: ReceptionistSession): void {
  try {
    localStorage.setItem(RECEPTIONIST_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Could not save receptionist session to localStorage:', err);
  }
}

/**
 * Gets stored receptionist session.
 */
export function getStoredReceptionistSession(): ReceptionistSession | null {
  try {
    const raw = localStorage.getItem(RECEPTIONIST_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReceptionistSession;
  } catch {
    return null;
  }
}

/**
 * Logs out receptionist and clears session.
 */
export function logoutReceptionist(): void {
  try {
    localStorage.removeItem(RECEPTIONIST_SESSION_KEY);
  } catch (err) {
    console.warn('Could not remove receptionist session:', err);
  }
}

/**
 * Checks in an arriving patient at the reception desk.
 * Moves their status from 'scheduled' / 'confirmed' to 'waiting' in the clinic waiting room.
 */
export async function checkInPatientAtDesk(
  doctorUid: string,
  appointment: Appointment
): Promise<{ success: boolean; error?: string }> {
  return updateQueueEntryStatus(
    doctorUid,
    appointment.appointmentId,
    'waiting',
    appointment,
    'Checked in at clinic reception desk'
  );
}

/**
 * Registers a walk-in patient from the reception desk into the unified queue.
 */
export async function registerWalkInAtDesk(
  session: ReceptionistSession,
  data: WalkInRegistrationData
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const { doctorProfile, receptionist } = session;

  const targetLocation = doctorProfile.locations.find((l) => l.id === data.locationId) || doctorProfile.locations[0];
  if (!targetLocation) {
    return { success: false, error: 'Selected clinic location is invalid.' };
  }

  const fee = targetLocation.consultationFee || doctorProfile.consultationFee || '500';
  const duration = doctorProfile.avgDurationMinutes || 15;

  return registerAuthoritativeWalkInAppointment({
    doctorUid: doctorProfile.uid,
    locationId: targetLocation.id,
    locationName: targetLocation.name || targetLocation.clinicName || doctorProfile.clinicName,
    locationAddress: `${targetLocation.addressLine}, ${targetLocation.locality}`,
    city: targetLocation.city,
    consultationFee: fee,
    durationMinutes: duration,
    patientName: data.patientName,
    patientMobile: data.patientMobile,
    patientAge: data.patientAge,
    patientGender: data.patientGender,
    visitReason: data.chiefComplaint,
    registeredBy: `Receptionist ${receptionist.fullName}`,
  });
}
