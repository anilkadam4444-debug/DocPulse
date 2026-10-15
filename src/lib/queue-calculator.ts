/**
 * Pure queue timing and tentative estimate calculation logic.
 * Decoupled from React UI components for testability.
 */

export interface TimeComponents {
  hours: number;
  minutes: number;
}

/**
 * Parses time string like "09:30", "9:30 AM", "17:00" into 24-hr hours and minutes
 */
export function parseTimeString(timeStr: string): TimeComponents {
  if (!timeStr) {
    return { hours: 9, minutes: 0 };
  }

  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const timeOnly = cleaned.replace(/[A-Z]/g, '').trim();
  const [hStr, mStr] = timeOnly.split(':');

  let hours = parseInt(hStr, 10);
  const minutes = mStr ? parseInt(mStr, 10) : 0;

  if (isNaN(hours)) hours = 9;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Formats 24hr hours & minutes into "hh:mm AM/PM"
 */
export function formatAmPm(hours: number, minutes: number): string {
  const normHours = ((hours % 24) + 24) % 24;
  const period = normHours >= 12 ? 'PM' : 'AM';
  const displayHours = normHours % 12 === 0 ? 12 : normHours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Adds minutes to an initial time components object
 */
export function addMinutesToTime(time: TimeComponents, minutesToAdd: number): TimeComponents {
  const totalMinutes = time.hours * 60 + time.minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return { hours: newHours, minutes: newMinutes };
}

export interface EstimatedQueueSlotResult {
  tokenNumber: number;
  formattedToken: string;
  tentativeTime: string;
  windowStart: string;
  windowEnd: string;
  minutesFromStart: number;
  tokensAhead: number;
}

/**
 * Calculates the tentative consultation time and realistic arrival window for a patient's queue token.
 * 
 * @param sessionStartTime Time string e.g. "09:30" or "09:30 AM"
 * @param tokenNumber 1-based token number (e.g. 5)
 * @param currentServingToken Currently serving token (defaults to 1)
 * @param avgMinutesPerPatient Doctor's designated average consultation duration in minutes
 * @param windowBufferMinutes Arrival tolerance window around tentative time (default 10 mins)
 */
export function calculateQueueSlotEstimate(
  sessionStartTime: string,
  tokenNumber: number,
  currentServingToken: number = 1,
  avgMinutesPerPatient: number = 15,
  windowBufferMinutes: number = 10
): EstimatedQueueSlotResult {
  const validToken = Math.max(1, Math.floor(tokenNumber));
  const validServing = Math.max(1, Math.floor(currentServingToken));
  const validDuration = Math.max(5, Math.floor(avgMinutesPerPatient));

  const baseTime = parseTimeString(sessionStartTime);
  const minutesFromStart = (validToken - 1) * validDuration;

  const tentativeComponents = addMinutesToTime(baseTime, minutesFromStart);
  const windowStartComponents = addMinutesToTime(
    tentativeComponents,
    -Math.min(windowBufferMinutes, minutesFromStart)
  );
  const windowEndComponents = addMinutesToTime(tentativeComponents, windowBufferMinutes);

  const tokensAhead = Math.max(0, validToken - validServing);

  return {
    tokenNumber: validToken,
    formattedToken: formatQueueToken(validToken),
    tentativeTime: formatAmPm(tentativeComponents.hours, tentativeComponents.minutes),
    windowStart: formatAmPm(windowStartComponents.hours, windowStartComponents.minutes),
    windowEnd: formatAmPm(windowEndComponents.hours, windowEndComponents.minutes),
    minutesFromStart,
    tokensAhead,
  };
}

/**
 * Formats a raw number into a clean token ID string, e.g. 7 -> "T-07"
 */
export function formatQueueToken(tokenNumber: number): string {
  const num = Math.max(1, Math.floor(tokenNumber));
  return num < 10 ? `T-0${num}` : `T-${num}`;
}

/**
 * Standard suggested consultation durations for doctors in India
 */
export const CONSULTATION_DURATIONS = [10, 15, 20, 30] as const;
