import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Appointment,
  QueueStatus,
  DailyQueue,
  SessionOperationalStatus,
} from '../booking/types';

/**
 * Real-time subscription to a doctor's authoritative queue for a given location and date.
 * Returns an unsubscribe callback for automatic cleanup.
 */
export function subscribeToDailyQueue(
  doctorUid: string,
  locationId: string,
  dateStr: string,
  onAppointments: (appointments: Appointment[]) => void,
  onDailyQueue?: (queueData: DailyQueue | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!doctorUid || !locationId || !dateStr) {
    onAppointments([]);
    return () => {};
  }

  // 1. Listen to appointments subcollection
  const appointmentsRef = collection(db, 'doctors', doctorUid, 'appointments');
  const q = query(
    appointmentsRef,
    where('locationId', '==', locationId),
    where('appointmentDate', '==', dateStr)
  );

  const unsubAppointments = onSnapshot(
    q,
    (snapshot) => {
      const aptList: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        aptList.push(docSnap.data() as Appointment);
      });
      onAppointments(aptList);
    },
    (err) => {
      console.error('Real-time queue subscription error:', err);
      if (onError) onError(err);
    }
  );

  // 2. Listen to daily queue metadata doc (if callback provided)
  let unsubQueueDoc: Unsubscribe | null = null;
  if (onDailyQueue) {
    const queueDocId = `${locationId}_${dateStr}`;
    const queueDocRef = doc(db, 'doctors', doctorUid, 'dailyQueues', queueDocId);
    unsubQueueDoc = onSnapshot(
      queueDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onDailyQueue(docSnap.data() as DailyQueue);
        } else {
          onDailyQueue(null);
        }
      },
      (err) => {
        console.warn('Real-time daily queue metadata listen warning:', err);
      }
    );
  }

  // Combined unsubscriber
  return () => {
    unsubAppointments();
    if (unsubQueueDoc) unsubQueueDoc();
  };
}

/**
 * Transitions an appointment through the queue lifecycle:
 * - 'waiting': Patient arrived at clinic (check-in)
 * - 'called': Doctor called patient token to OPD room
 * - 'in_consultation': Doctor initiated active consultation
 * - 'completed': Doctor finished consultation
 * - 'no_show': Patient failed to arrive
 * - 'cancelled': Appointment cancelled
 */
export async function updateQueueEntryStatus(
  doctorUid: string,
  appointmentId: string,
  newStatus: QueueStatus,
  currentApt?: Appointment,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!doctorUid || !appointmentId) {
    return { success: false, error: 'Doctor UID and Appointment ID are required.' };
  }

  try {
    const aptRef = doc(db, 'doctors', doctorUid, 'appointments', appointmentId);
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      queueStatus: newStatus,
      updatedAt: serverTimestamp(),
    };

    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    if (newStatus === 'waiting') {
      updatePayload.checkInTime = nowIso;
    } else if (newStatus === 'called') {
      updatePayload.calledTime = nowIso;
    } else if (newStatus === 'in_consultation') {
      updatePayload.consultationStartTime = nowIso;
    } else if (newStatus === 'completed') {
      updatePayload.consultationEndTime = nowIso;
    }

    await updateDoc(aptRef, updatePayload);

    // Sync daily queue currentServingToken if applicable
    if (currentApt && (newStatus === 'called' || newStatus === 'in_consultation')) {
      const queueDocId = `${currentApt.locationId}_${currentApt.appointmentDate}`;
      const queueDocRef = doc(db, 'doctors', doctorUid, 'dailyQueues', queueDocId);
      await setDoc(
        queueDocRef,
        {
          currentServingToken: currentApt.tokenNumber || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else if (currentApt && newStatus === 'cancelled') {
      // Free slot if cancelled
      if (currentApt.slotId) {
        try {
          const slotRef = doc(db, 'doctors', doctorUid, 'bookedSlots', currentApt.slotId);
          await updateDoc(slotRef, { status: 'cancelled' });
        } catch {
          // Ignored
        }
      }
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating queue status:', err);
    try {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `doctors/${doctorUid}/appointments/${appointmentId}`
      );
    } catch {
      // Swallowed for clean UI response
    }
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: rawMsg };
  }
}

/**
 * Automatically selects and calls the next eligible patient in the queue.
 * Priority order:
 * 1. Waiting patients who have checked in (status: 'waiting').
 * 2. Scheduled patients whose start time has arrived (status: 'scheduled').
 */
export async function callNextPatientInQueue(
  doctorUid: string,
  locationId: string,
  dateStr: string,
  appointments: Appointment[]
): Promise<{ success: boolean; calledAppointment?: Appointment; error?: string }> {
  // Sort candidates by queueOrder then tokenNumber
  const activeCandidates = appointments
    .filter((a) => {
      const s = a.queueStatus || a.status;
      return s === 'waiting' || s === 'scheduled';
    })
    .sort((a, b) => {
      // Waiting patients take priority over scheduled un-arrived patients
      const statusA = a.queueStatus || a.status;
      const statusB = b.queueStatus || b.status;
      if (statusA === 'waiting' && statusB !== 'waiting') return -1;
      if (statusB === 'waiting' && statusA !== 'waiting') return 1;

      if (a.queueOrder !== undefined && b.queueOrder !== undefined) {
        return a.queueOrder - b.queueOrder;
      }
      return (a.tokenNumber || 0) - (b.tokenNumber || 0);
    });

  if (activeCandidates.length === 0) {
    return {
      success: false,
      error: 'No waiting or scheduled patients remaining in the queue for this session.',
    };
  }

  const nextApt = activeCandidates[0];
  const updateRes = await updateQueueEntryStatus(doctorUid, nextApt.appointmentId, 'called', nextApt);

  if (!updateRes.success) {
    return { success: false, error: updateRes.error };
  }

  return { success: true, calledAppointment: nextApt };
}

/**
 * Updates the doctor's consultation session operational status (active / paused / ended).
 */
export async function updateSessionOperationalStatus(
  doctorUid: string,
  locationId: string,
  dateStr: string,
  newSessionStatus: SessionOperationalStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const queueDocId = `${locationId}_${dateStr}`;
    const queueDocRef = doc(db, 'doctors', doctorUid, 'dailyQueues', queueDocId);

    await setDoc(
      queueDocRef,
      {
        doctorUid,
        locationId,
        date: dateStr,
        sessionStatus: newSessionStatus,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating session operational status:', err);
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: rawMsg };
  }
}
