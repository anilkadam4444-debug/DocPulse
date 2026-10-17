import { Appointment, QueueStatus } from '../booking/types';
import { DoctorTenantProfile } from '../../types/auth';
import { PublicDoctorProfile } from '../../types/public-doctor';

/**
 * Converts HH:mm (24-hour) string to minutes from start of day.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map((val) => parseInt(val, 10) || 0);
  return h * 60 + m;
}

/**
 * Converts minutes from start of day to HH:mm (24-hour) string.
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.floor(totalMinutes)) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Formats a 24-hr time string into 12-hour AM/PM format.
 */
export function formatTime12(time24: string): string {
  if (!time24) return '';
  if (!time24.includes(':')) return time24;
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minStr} ${ampm}`;
}

export interface BreakInterval {
  start: number; // minutes
  end: number; // minutes
  label: string;
}

export interface QueueEstimationResult {
  appointmentId: string;
  tokenNumber: number;
  formattedToken: string;
  plannedStartTime: string;
  estimatedStartTimeStr: string;
  estimatedStartTime12: string;
  delayMinutes: number;
  patientsAhead: number;
  isDelayed: boolean;
  statusLabel: string;
}

export interface GlobalOPDQueueMetrics {
  totalTokens: number;
  waitingCount: number;
  calledCount: number;
  inConsultationCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  scheduledCount: number;
  currentServingToken: number | null;
  currentServingPatientName: string | null;
  nextUpToken: number | null;
  nextUpPatientName: string | null;
  overallDelayMinutes: number;
  opdStatus: 'on_time' | 'delayed' | 'ahead' | 'session_paused' | 'not_started';
}

/**
 * Calculates dynamic, practical visit-time estimates for an authoritative queue.
 * Strictly respects:
 * 1. Current local time and in-consultation remaining time.
 * 2. Doctor's configured session timings and scheduled breaks.
 * 3. Individual patient queue status (skipping completed, cancelled, no-show).
 * 4. Planned appointment times (a patient is not assumed to start before their booked slot if OPD is running fast).
 */
export function calculateQueueEstimations(
  appointments: Appointment[],
  doctor: DoctorTenantProfile | PublicDoctorProfile,
  currentTime24: string,
  sessionOperationalStatus: 'not_started' | 'active' | 'paused' | 'ended' = 'active'
): {
  estimations: Map<string, QueueEstimationResult>;
  metrics: GlobalOPDQueueMetrics;
  sortedQueue: Appointment[];
} {
  const avgDuration = doctor.avgDurationMinutes || 15;
  const currentMinutes = timeToMinutes(currentTime24);

  // 1. Identify breaks and session boundaries
  const breaks: BreakInterval[] = [];
  const schedule = doctor.schedule;

  if (schedule?.session1) {
    if (schedule.session1.hasBreak && schedule.session1.breakStart && schedule.session1.breakEnd) {
      breaks.push({
        start: timeToMinutes(schedule.session1.breakStart),
        end: timeToMinutes(schedule.session1.breakEnd),
        label: 'Session 1 Scheduled Break',
      });
    }

    // Interval between Session 1 close and Session 2 open (afternoon clinic closure)
    if (schedule.hasSession2 && schedule.session2?.openTime && schedule.session1.closeTime) {
      const s1Close = timeToMinutes(schedule.session1.closeTime);
      const s2Open = timeToMinutes(schedule.session2.openTime);
      if (s2Open > s1Close) {
        breaks.push({
          start: s1Close,
          end: s2Open,
          label: 'Afternoon OPD Break',
        });
      }
    }
  }

  if (schedule?.hasSession2 && schedule.session2) {
    if (schedule.session2.hasBreak && schedule.session2.breakStart && schedule.session2.breakEnd) {
      breaks.push({
        start: timeToMinutes(schedule.session2.breakStart),
        end: timeToMinutes(schedule.session2.breakEnd),
        label: 'Session 2 Scheduled Break',
      });
    }
  }

  // 2. Sort appointments authoritatively by:
  // (a) queueOrder if explicitly reordered
  // (b) planned appointment startTime
  // (c) tokenNumber
  const sorted = [...appointments].sort((a, b) => {
    if (a.queueOrder !== undefined && b.queueOrder !== undefined && a.queueOrder !== b.queueOrder) {
      return a.queueOrder - b.queueOrder;
    }
    const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (timeDiff !== 0) return timeDiff;
    return (a.tokenNumber || 0) - (b.tokenNumber || 0);
  });

  // 3. Find patient currently in consultation (if any)
  const inConsultationPatient = sorted.find(
    (a) => (a.queueStatus || a.status) === 'in_consultation'
  );
  const calledPatient = sorted.find((a) => (a.queueStatus || a.status) === 'called');

  // Compute baseline cursor: when will the next consultation start?
  let projectedStartCursor = currentMinutes;

  if (inConsultationPatient) {
    // If consultation started, estimate how much time remains
    if (inConsultationPatient.consultationStartTime) {
      const elapsed = Math.max(
        0,
        currentMinutes - timeToMinutes(inConsultationPatient.consultationStartTime.slice(11, 16))
      );
      const remaining = Math.max(2, avgDuration - elapsed);
      projectedStartCursor = currentMinutes + remaining;
    } else {
      // Default: half duration remaining
      projectedStartCursor = currentMinutes + Math.max(3, Math.floor(avgDuration / 2));
    }
  }

  // Helper: advance cursor past scheduled breaks
  const adjustForBreaks = (cursor: number): number => {
    let adjusted = cursor;
    for (const b of breaks) {
      if (adjusted >= b.start && adjusted < b.end) {
        adjusted = b.end;
      }
    }
    return adjusted;
  };

  const estimations = new Map<string, QueueEstimationResult>();
  let activeWaitingAheadCount = inConsultationPatient ? 1 : 0;
  if (calledPatient && calledPatient.appointmentId !== inConsultationPatient?.appointmentId) {
    activeWaitingAheadCount += 1;
  }

  let cumulativeDelay = 0;
  let delaySampleCount = 0;

  for (const apt of sorted) {
    const rawStatus = (apt.queueStatus || apt.status) as QueueStatus;
    const token = apt.tokenNumber || 0;
    const formattedToken = apt.formattedToken || `T-${token.toString().padStart(2, '0')}`;
    const plannedMins = timeToMinutes(apt.startTime);

    if (rawStatus === 'in_consultation') {
      estimations.set(apt.appointmentId, {
        appointmentId: apt.appointmentId,
        tokenNumber: token,
        formattedToken,
        plannedStartTime: apt.startTime,
        estimatedStartTimeStr: currentTime24,
        estimatedStartTime12: 'Now Inside',
        delayMinutes: Math.max(0, currentMinutes - plannedMins),
        patientsAhead: 0,
        isDelayed: false,
        statusLabel: 'In Consultation',
      });
      continue;
    }

    if (rawStatus === 'called') {
      estimations.set(apt.appointmentId, {
        appointmentId: apt.appointmentId,
        tokenNumber: token,
        formattedToken,
        plannedStartTime: apt.startTime,
        estimatedStartTimeStr: currentTime24,
        estimatedStartTime12: 'Now (Called)',
        delayMinutes: Math.max(0, currentMinutes - plannedMins),
        patientsAhead: inConsultationPatient ? 1 : 0,
        isDelayed: false,
        statusLabel: 'Token Called',
      });
      continue;
    }

    if (rawStatus === 'completed' || rawStatus === 'cancelled' || rawStatus === 'no_show') {
      estimations.set(apt.appointmentId, {
        appointmentId: apt.appointmentId,
        tokenNumber: token,
        formattedToken,
        plannedStartTime: apt.startTime,
        estimatedStartTimeStr: apt.startTime,
        estimatedStartTime12: formatTime12(apt.startTime),
        delayMinutes: 0,
        patientsAhead: 0,
        isDelayed: false,
        statusLabel:
          rawStatus === 'completed'
            ? 'Completed'
            : rawStatus === 'cancelled'
            ? 'Cancelled'
            : 'No-Show',
      });
      continue;
    }

    // For active waiting or scheduled patients:
    // Estimate is: max(plannedStartTime, projectedStartCursor)
    projectedStartCursor = adjustForBreaks(projectedStartCursor);
    const estimatedMins = Math.max(plannedMins, projectedStartCursor);
    const delay = estimatedMins - plannedMins;

    if (delay > 0) {
      cumulativeDelay += delay;
      delaySampleCount++;
    }

    const estimatedTimeStr = minutesToTime(estimatedMins);

    estimations.set(apt.appointmentId, {
      appointmentId: apt.appointmentId,
      tokenNumber: token,
      formattedToken,
      plannedStartTime: apt.startTime,
      estimatedStartTimeStr: estimatedTimeStr,
      estimatedStartTime12: formatTime12(estimatedTimeStr),
      delayMinutes: delay,
      patientsAhead: activeWaitingAheadCount,
      isDelayed: delay > 5,
      statusLabel:
        rawStatus === 'waiting'
          ? 'Waiting in Clinic'
          : 'Scheduled (Not Arrived)',
    });

    // Advance projected cursor for next patient
    projectedStartCursor = estimatedMins + avgDuration;
    projectedStartCursor = adjustForBreaks(projectedStartCursor);
    activeWaitingAheadCount++;
  }

  // 4. Compute global metrics
  let waitingCount = 0;
  let calledCount = 0;
  let inConsultationCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;
  let scheduledCount = 0;

  for (const apt of sorted) {
    const s = (apt.queueStatus || apt.status) as QueueStatus;
    if (s === 'waiting') waitingCount++;
    else if (s === 'called') calledCount++;
    else if (s === 'in_consultation') inConsultationCount++;
    else if (s === 'completed') completedCount++;
    else if (s === 'cancelled') cancelledCount++;
    else if (s === 'no_show') noShowCount++;
    else scheduledCount++; // scheduled or confirmed
  }

  const avgDelay = delaySampleCount > 0 ? Math.round(cumulativeDelay / delaySampleCount) : 0;

  // Determine next up token
  const nextCandidate = sorted.find((a) => {
    const s = (a.queueStatus || a.status) as QueueStatus;
    return s === 'waiting' || s === 'scheduled';
  });

  const metrics: GlobalOPDQueueMetrics = {
    totalTokens: sorted.length,
    waitingCount,
    calledCount,
    inConsultationCount,
    completedCount,
    cancelledCount,
    noShowCount,
    scheduledCount,
    currentServingToken: inConsultationPatient?.tokenNumber || calledPatient?.tokenNumber || null,
    currentServingPatientName:
      inConsultationPatient?.patientName || calledPatient?.patientName || null,
    nextUpToken: nextCandidate?.tokenNumber || null,
    nextUpPatientName: nextCandidate?.patientName || null,
    overallDelayMinutes: avgDelay,
    opdStatus:
      sessionOperationalStatus === 'paused'
        ? 'session_paused'
        : sessionOperationalStatus === 'not_started'
        ? 'not_started'
        : avgDelay > 10
        ? 'delayed'
        : 'on_time',
  };

  return {
    estimations,
    metrics,
    sortedQueue: sorted,
  };
}
