import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeStringToMinutes,
  minutesToDisplayTime,
  validateAccountStep,
  validateProfessionalStep,
  validateClinicLocationStep,
  validateScheduleStep,
  calculateDailyCapacity,
  generateTentativeSlotPreview,
} from './validation.ts';
import type {
  DoctorAccountData,
  ProfessionalDetailsData,
  ClinicLocationData,
  ConsultationScheduleData,
} from './types.ts';

test('timeStringToMinutes converts 24h strings accurately', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('09:30'), 570);
  assert.equal(timeStringToMinutes('13:00'), 780);
  assert.equal(timeStringToMinutes('23:59'), 1439);
});

test('minutesToDisplayTime formats minutes into 12hr AM/PM string', () => {
  assert.equal(minutesToDisplayTime(540), '9:00 AM');
  assert.equal(minutesToDisplayTime(780), '1:00 PM');
  assert.equal(minutesToDisplayTime(1020), '5:00 PM');
});

test('validateAccountStep checks all required fields and formats', () => {
  const validData: DoctorAccountData = {
    fullName: 'Dr. Suresh Rao',
    email: 'dr.suresh@example.com',
    countryCode: '+91',
    mobile: '9820112233',
    password: 'Password123',
    confirmPassword: 'Password123',
    agreeTerms: true,
  };

  assert.deepEqual(validateAccountStep(validData), {});

  // Invalid email
  const badEmail = { ...validData, email: 'not-an-email' };
  assert.ok(validateAccountStep(badEmail).email);

  // Invalid mobile
  const badMobile = { ...validData, mobile: '12345' };
  assert.ok(validateAccountStep(badMobile).mobile);

  // Weak password
  const weakPassword = { ...validData, password: 'short', confirmPassword: 'short' };
  assert.ok(validateAccountStep(weakPassword).password);

  // Password mismatch
  const mismatch = { ...validData, confirmPassword: 'DifferentPassword123' };
  assert.ok(validateAccountStep(mismatch).confirmPassword);

  // Unchecked terms
  const noTerms = { ...validData, agreeTerms: false };
  assert.ok(validateAccountStep(noTerms).agreeTerms);
});

test('validateProfessionalStep validates qualifications, council, reg number, and custom specialization', () => {
  const validData: ProfessionalDetailsData = {
    qualifications: 'MBBS, MD (Pediatrics)',
    specialization: 'Pediatrician',
    registrationCouncil: 'Karnataka Medical Council',
    registrationNumber: 'KMC-45129',
    experienceYears: '12',
    languages: ['English', 'Kannada'],
  };

  assert.deepEqual(validateProfessionalStep(validData), {});

  // Missing qualifications
  const noQual = { ...validData, qualifications: '' };
  assert.ok(validateProfessionalStep(noQual).qualifications);

  // 'Other' specialization requires custom description
  const otherWithoutText: ProfessionalDetailsData = {
    ...validData,
    specialization: 'Other',
    customSpecialization: '',
  };
  assert.ok(validateProfessionalStep(otherWithoutText).customSpecialization);

  // Missing reg number
  const missingReg: ProfessionalDetailsData = { ...validData, registrationNumber: '' };
  assert.ok(validateProfessionalStep(missingReg).registrationNumber);
});

test('validateClinicLocationStep validates clinic name, city, locality, and 6-digit PIN', () => {
  const validData: ClinicLocationData = {
    clinicName: 'Rao Health Care',
    practiceType: 'independent_clinic',
    city: 'Bengaluru',
    state: 'Karnataka',
    locality: 'Indiranagar',
    addressLine: '12, Indiranagar 100ft Road',
    pincode: '560038',
    consultationFee: '600',
    followUpDays: 7,
    followUpFee: '0',
  };

  assert.deepEqual(validateClinicLocationStep(validData), {});

  // Missing locality
  const noLocality = { ...validData, locality: '' };
  assert.ok(validateClinicLocationStep(noLocality).locality);

  // Invalid PIN code
  const badPin = { ...validData, pincode: '5600' };
  assert.ok(validateClinicLocationStep(badPin).pincode);

  // Missing city
  const noCity = { ...validData, city: '' };
  assert.ok(validateClinicLocationStep(noCity).city);

  // Invalid fee
  const zeroFee = { ...validData, consultationFee: '0' };
  assert.ok(validateClinicLocationStep(zeroFee).consultationFee);
});

test('validateScheduleStep catches invalid times and overlaps', () => {
  const validSchedule: ConsultationScheduleData = {
    avgDurationMinutes: 15,
    isCustomDuration: false,
    workingDays: ['Mon', 'Tue'],
    session1: {
      openTime: '09:00',
      closeTime: '13:00',
      hasBreak: false,
    },
    hasSession2: false,
    acceptsWalkIns: true,
  };

  assert.deepEqual(validateScheduleStep(validSchedule), {});

  // Closing before opening
  const badTimes: ConsultationScheduleData = {
    ...validSchedule,
    session1: { openTime: '14:00', closeTime: '11:00', hasBreak: false },
  };
  assert.ok(validateScheduleStep(badTimes).session1_closeTime);

  // Break end before break start
  const badBreak: ConsultationScheduleData = {
    ...validSchedule,
    session1: {
      openTime: '09:00',
      closeTime: '13:00',
      hasBreak: true,
      breakStart: '12:00',
      breakEnd: '11:00',
    },
  };
  assert.ok(validateScheduleStep(badBreak).session1_breakEnd);

  // Session 2 overlapping Session 1
  const overlappingSessions: ConsultationScheduleData = {
    ...validSchedule,
    hasSession2: true,
    session2: { openTime: '12:00', closeTime: '16:00', hasBreak: false },
  };
  assert.ok(validateScheduleStep(overlappingSessions).session2_openTime);
});

test('calculateDailyCapacity calculates theoretical capacity accurately', () => {
  // Test prompt example: 4-hour session (09:00 - 13:00 = 240 mins)
  // with 10-minute average consultation duration and no breaks = 24 consultations
  const singleSession10m: ConsultationScheduleData = {
    avgDurationMinutes: 10,
    isCustomDuration: false,
    workingDays: ['Mon'],
    session1: {
      openTime: '09:00',
      closeTime: '13:00',
      hasBreak: false,
    },
    hasSession2: false,
    acceptsWalkIns: true,
  };

  const result1 = calculateDailyCapacity(singleSession10m);
  assert.equal(result1.availableMinutes, 240);
  assert.equal(result1.theoreticalCapacity, 24);

  // With a 30-minute break: available minutes = 240 - 30 = 210 mins
  // Capacity = floor(210 / 10) = 21
  const singleSessionWithBreak: ConsultationScheduleData = {
    ...singleSession10m,
    session1: {
      openTime: '09:00',
      closeTime: '13:00',
      hasBreak: true,
      breakStart: '11:00',
      breakEnd: '11:30',
    },
  };

  const result2 = calculateDailyCapacity(singleSessionWithBreak);
  assert.equal(result2.availableMinutes, 210);
  assert.equal(result2.theoreticalCapacity, 21);

  // Two sessions: Session 1 (09:00 - 13:00 = 240m) + Session 2 (17:00 - 20:00 = 180m)
  // Total available = 420 mins. At 15m duration = floor(420 / 15) = 28 consultations
  const twoSessions15m: ConsultationScheduleData = {
    avgDurationMinutes: 15,
    isCustomDuration: false,
    workingDays: ['Mon'],
    session1: { openTime: '09:00', closeTime: '13:00', hasBreak: false },
    hasSession2: true,
    session2: { openTime: '17:00', closeTime: '20:00', hasBreak: false },
    acceptsWalkIns: true,
  };

  const result3 = calculateDailyCapacity(twoSessions15m);
  assert.equal(result3.availableMinutes, 420);
  assert.equal(result3.theoreticalCapacity, 28);
});

test('generateTentativeSlotPreview computes sequential slots with arrival estimates', () => {
  const slots = generateTentativeSlotPreview('09:00', '11:00', 15, undefined, undefined, 4);

  assert.equal(slots.length, 4);
  assert.equal(slots[0].formattedToken, 'T-01');
  assert.equal(slots[0].startTime, '9:00 AM');
  assert.equal(slots[0].endTime, '9:15 AM');
  assert.equal(slots[0].arrivalWindow, '9:00 AM – 9:00 AM');

  assert.equal(slots[1].formattedToken, 'T-02');
  assert.equal(slots[1].startTime, '9:15 AM');
  assert.equal(slots[1].endTime, '9:30 AM');
  assert.equal(slots[1].arrivalWindow, '9:05 AM – 9:15 AM');

  assert.equal(slots[2].formattedToken, 'T-03');
  assert.equal(slots[2].startTime, '9:30 AM');
  assert.equal(slots[2].endTime, '9:45 AM');
  assert.equal(slots[2].arrivalWindow, '9:20 AM – 9:30 AM');
});
